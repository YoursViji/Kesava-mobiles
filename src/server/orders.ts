import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { orderItems, orders } from '@/db/schema'
import { sendEmail } from '@/lib/email'
import { requireAdmin } from '@/server/admin'
import { awardLoyaltyPoints } from '@/server/loyalty'

function makeOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-ORD-${code}`
}

export const DELIVERY_STATUSES = ['processing', 'shipped', 'delivered'] as const
export const HOME_DELIVERY_FEE = 99

const itemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
})

const orderSchema = z
  .object({
    customerName: z.string().min(2, 'Please enter your name'),
    phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
    items: z.array(itemSchema).min(1, 'Your cart is empty'),
    deliveryMode: z.enum(['pickup', 'delivery']).default('pickup'),
    deliveryAddress: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.deliveryMode !== 'delivery' || (data.deliveryAddress && data.deliveryAddress.trim().length > 4), {
    message: 'Please enter your delivery address',
    path: ['deliveryAddress'],
  })

export const createOrder = createServerFn({ method: 'POST' })
  .validator(orderSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const itemsTotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const deliveryFee = data.deliveryMode === 'delivery' ? HOME_DELIVERY_FEE : 0
    const totalAmount = itemsTotal + deliveryFee
    let orderCode = makeOrderCode()
    let clash = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).get()
    let attempts = 0
    while (clash && attempts < 10) {
      orderCode = makeOrderCode()
      clash = await db.select().from(orders).where(eq(orders.orderCode, orderCode)).get()
      attempts++
    }
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await db.insert(orders).values({
      id,
      orderCode,
      customerName: data.customerName,
      phone: data.phone,
      totalAmount,
      status: 'pending',
      createdAt: now,
      deliveryMode: data.deliveryMode,
      deliveryAddress: data.deliveryMode === 'delivery' ? data.deliveryAddress || null : null,
      deliveryFee,
      deliveryStatus: data.deliveryMode === 'delivery' ? 'processing' : null,
    })
    await db.insert(orderItems).values(
      data.items.map((item) => ({
        id: crypto.randomUUID(),
        orderId: id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    )

    try {
      await sendEmail({
        to: 'store@kesavamobiles.local',
        subject: `New ${data.deliveryMode === 'delivery' ? 'home delivery' : 'pickup'} order ${orderCode}`,
        text: `${data.customerName} (${data.phone}) placed an order for ₹${totalAmount.toLocaleString('en-IN')}.\n${
          data.deliveryMode === 'delivery' ? `Deliver to: ${data.deliveryAddress}\n` : ''
        }\n${data.items.map((i) => `${i.quantity} x ${i.name} — ₹${i.price.toLocaleString('en-IN')}`).join('\n')}`,
      })
    } catch {
      // The order is already saved; a notification failure should not fail the checkout.
    }

    try {
      await awardLoyaltyPoints(data.phone, totalAmount)
    } catch {
      // Loyalty points are a bonus; never let this fail a successful order.
    }

    return { id, orderCode, totalAmount, deliveryMode: data.deliveryMode, deliveryFee }
  })

// --- Admin: sales ----------------------------------------------------------------------------

export const adminListOrders = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const db = await getDb()
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt))
  const allItems = await db.select().from(orderItems)
  const itemsByOrder = new Map<string, typeof allItems>()
  for (const item of allItems) {
    const list = itemsByOrder.get(item.orderId) ?? []
    list.push(item)
    itemsByOrder.set(item.orderId, list)
  }
  return allOrders.map((order) => ({ ...order, items: itemsByOrder.get(order.id) ?? [] }))
})

export const adminUpdateDeliveryStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), deliveryStatus: z.enum(DELIVERY_STATUSES) }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await getDb()
    await db.update(orders).set({ deliveryStatus: data.deliveryStatus }).where(eq(orders.id, data.id))
    return { ok: true }
  })
