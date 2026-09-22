import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { serviceBookings, serviceUpdates } from '@/db/schema'
import { sendEmail } from '@/lib/email'
import { currentUser } from '@/lib/session.server'

const SERVICE_TYPES = [
  'Screen Repair',
  'Battery Replacement',
  'Charging Port Issue',
  'Water Damage',
  'Software / OS Issue',
  'Camera Repair',
  'Speaker / Mic Issue',
  'Other',
] as const

export const serviceTypes = SERVICE_TYPES

function makeTrackingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-${code}`
}

const DELIVERY_MODES = ['store_dropoff', 'doorstep'] as const
export const deliveryModes = DELIVERY_MODES

const bookingSchema = z
  .object({
    customerName: z.string().min(2, 'Please enter your name'),
    phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
    email: z.string().email().optional().or(z.literal('')),
    deviceBrand: z.string().min(1, 'Please select the device brand'),
    deviceModel: z.string().min(1, 'Please enter the device model'),
    serviceType: z.enum(SERVICE_TYPES),
    issueDescription: z.string().min(5, 'Please describe the issue'),
    preferredDate: z.string().min(1, 'Please pick a date'),
    preferredTime: z.string().min(1, 'Please pick a time'),
    deliveryMode: z.enum(DELIVERY_MODES),
    pickupAddress: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.deliveryMode !== 'doorstep' || (data.pickupAddress && data.pickupAddress.trim().length > 4), {
    message: 'Please enter the address for doorstep pickup',
    path: ['pickupAddress'],
  })

export const createServiceBooking = createServerFn({ method: 'POST' })
  .validator(bookingSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const user = await currentUser()
    const now = new Date().toISOString()
    let trackingCode = makeTrackingCode()
    // keep generating and re-checking until a free code is found (astronomically unlikely to loop more than once)
    let clash = await db.select().from(serviceBookings).where(eq(serviceBookings.trackingCode, trackingCode)).get()
    let attempts = 0
    while (clash && attempts < 10) {
      trackingCode = makeTrackingCode()
      clash = await db.select().from(serviceBookings).where(eq(serviceBookings.trackingCode, trackingCode)).get()
      attempts++
    }
    const id = crypto.randomUUID()
    await db.insert(serviceBookings).values({
      id,
      trackingCode,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      deviceBrand: data.deviceBrand,
      deviceModel: data.deviceModel,
      serviceType: data.serviceType,
      issueDescription: data.issueDescription,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      status: 'received',
      quoteAmount: null,
      paymentStatus: 'unpaid',
      userId: user?.id ?? null,
      createdAt: now,
      updatedAt: now,
      deliveryMode: data.deliveryMode,
      pickupAddress: data.deliveryMode === 'doorstep' ? data.pickupAddress || null : null,
    })
    await db.insert(serviceUpdates).values({
      id: crypto.randomUUID(),
      bookingId: id,
      status: 'received',
      note:
        data.deliveryMode === 'doorstep'
          ? `Booking registered. Our technician will visit ${data.pickupAddress} to collect the device.`
          : 'Booking registered. Our team will inspect your device and share a quote soon.',
      createdAt: now,
    })

    if (data.email) {
      try {
        await sendEmail({
          to: data.email,
          subject: `Kesava Mobiles — service booking confirmed (${trackingCode})`,
          text: `Hi ${data.customerName},\n\nWe've registered your ${data.deviceBrand} ${data.deviceModel} for ${data.serviceType}.\nYour tracking code is ${trackingCode}. Track your service any time at our website under "Track Service".\n\n— Kesava Mobiles`,
        })
      } catch {
        // A booking must succeed even if the confirmation mail fails.
      }
    }

    return { id, trackingCode }
  })

export const getBookingByCode = createServerFn({ method: 'GET' })
  .validator((code: string) => code.trim().toUpperCase())
  .handler(async ({ data: code }) => {
    const db = await getDb()
    const booking = await db.select().from(serviceBookings).where(eq(serviceBookings.trackingCode, code)).get()
    if (!booking) return null
    const updates = await db
      .select()
      .from(serviceUpdates)
      .where(eq(serviceUpdates.bookingId, booking.id))
      .orderBy(serviceUpdates.createdAt)
    return { booking, updates }
  })

export const payServiceBooking = createServerFn({ method: 'POST' })
  .validator((trackingCode: string) => trackingCode.trim().toUpperCase())
  .handler(async ({ data: trackingCode }) => {
    const db = await getDb()
    const booking = await db.select().from(serviceBookings).where(eq(serviceBookings.trackingCode, trackingCode)).get()
    if (!booking) throw new Error('Booking not found')
    if (!booking.quoteAmount) throw new Error('No quote to pay yet')
    const now = new Date().toISOString()
    await db
      .update(serviceBookings)
      .set({ paymentStatus: 'paid', status: 'repairing', updatedAt: now })
      .where(eq(serviceBookings.id, booking.id))
    await db.insert(serviceUpdates).values({
      id: crypto.randomUUID(),
      bookingId: booking.id,
      status: 'repairing',
      note: `Payment of ₹${booking.quoteAmount} received. Repair started.`,
      createdAt: now,
    })
    return { ok: true }
  })
