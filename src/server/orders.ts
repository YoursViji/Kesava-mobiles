import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { orderItems, orders } from '@/db/schema'
import { sendEmail } from '@/lib/email'
import { requireAdmin } from '@/server/admin'

function makeOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `KM-ORD-${code}`
}

const itemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
})

const orderSchema = z.object({
  customerName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15),
  items: z.array(itemSchema).min(1, 'Your cart is empty'),
})

export const createOrder = createServerFn({ method: 'POST' })
  .validator(orderSchema)
  .handler(async ({ data }) => {
    const db = await getDb()
    const totalAmount = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
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
        subject: `New pickup order ${orderCode}`,
        text: `${data.customerName} (${data.phone}) placed an order for ₹${totalAmount.toLocaleString('en-IN')}.\n\n${data.items
          .map((i) => `${i.quantity} x ${i.name} — ₹${i.price.toLocaleString('en-IN')}`)
          .join('\n')}`,
      })
    } catch {
      // The order is already saved; a notification failure should not fail the checkout.
    }

    return { id, orderCode, totalAmount }
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
