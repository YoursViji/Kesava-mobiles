import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { preLaunches, preBookings } from '@/db/schema'
import { sendEmail } from '@/lib/email'
import { requireAdmin } from '@/server/admin'

export const PRE_BOOKING_STATUSES = ['pending', 'notified', 'converted', 'cancelled'] as const

export const listUpcomingLaunches = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  return db.select().from(preLaunches).orderBy(desc(preLaunches.createdAt))
})

function makeBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-PRE-${code}`
}

const preBookSchema = z.object({
  launchId: z.string(),
  customerName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
  email: z.string().email().optional().or(z.literal('')),
})

export const createPreBooking = createServerFn({ method: 'POST' })
  .validator(preBookSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const launch = await db.select().from(preLaunches).where(eq(preLaunches.id, data.launchId)).get()
    if (!launch) throw new Error('This launch is no longer available')

    let bookingCode = makeBookingCode()
    let clash = await db.select().from(preBookings).where(eq(preBookings.bookingCode, bookingCode)).get()
    let attempts = 0
    while (clash && attempts < 10) {
      bookingCode = makeBookingCode()
      clash = await db.select().from(preBookings).where(eq(preBookings.bookingCode, bookingCode)).get()
      attempts++
    }

    const id = crypto.randomUUID()
    await db.insert(preBookings).values({
      id,
      bookingCode,
      launchId: launch.id,
      launchName: launch.name,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      tokenAmount: launch.tokenAmount,
      createdAt: new Date().toISOString(),
    })

    if (data.email) {
      try {
        await sendEmail({
          to: data.email,
          subject: `Kesava Mobiles — ${launch.name} pre-booking confirmed (${bookingCode})`,
          text: `Hi ${data.customerName},\n\nYour token of ₹${launch.tokenAmount} for the ${launch.name} is confirmed. We'll notify you the moment it arrives at our Nagari store — your booking code is ${bookingCode}.\n\n— Kesava Mobiles`,
        })
      } catch {
        // The pre-booking is already saved; a notification failure should not fail it.
      }
    }

    return { id, bookingCode, tokenAmount: launch.tokenAmount, launchName: launch.name }
  })

// --- Admin: pre-bookings -----------------------------------------------------------------------

export const adminListPreBookings = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const db = await getDb()
  return db.select().from(preBookings).orderBy(desc(preBookings.createdAt))
})

export const adminUpdatePreBookingStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), status: z.enum(PRE_BOOKING_STATUSES) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await getDb()
    await db.update(preBookings).set({ status: data.status }).where(eq(preBookings.id, data.id))
    return { ok: true }
  })
