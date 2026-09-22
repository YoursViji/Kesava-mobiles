import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { demoBookings } from '@/db/schema'

function makeBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-DEMO-${code}`
}

const demoSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  customerName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
  preferredDate: z.string().min(1, 'Please pick a date'),
  preferredTime: z.string().min(1, 'Please pick a time'),
})

export const createDemoBooking = createServerFn({ method: 'POST' })
  .validator(demoSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    let bookingCode = makeBookingCode()
    let clash = await db.select().from(demoBookings).where(eq(demoBookings.bookingCode, bookingCode)).get()
    let attempts = 0
    while (clash && attempts < 10) {
      bookingCode = makeBookingCode()
      clash = await db.select().from(demoBookings).where(eq(demoBookings.bookingCode, bookingCode)).get()
      attempts++
    }
    const id = crypto.randomUUID()
    await db.insert(demoBookings).values({
      id,
      bookingCode,
      productId: data.productId,
      productName: data.productName,
      customerName: data.customerName,
      phone: data.phone,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    })
    return { id, bookingCode }
  })
