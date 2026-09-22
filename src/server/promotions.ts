import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { promotions } from '@/db/schema'
import { requireAdmin } from '@/server/admin'

export const PROMO_ICONS = ['repeat', 'landmark', 'badge-percent', 'sparkles', 'shield-check'] as const

export const listActivePromotions = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  return db.select().from(promotions).where(eq(promotions.active, true)).orderBy(asc(promotions.sortOrder))
})

export const adminListPromotions = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const db = await getDb()
  return db.select().from(promotions).orderBy(asc(promotions.sortOrder))
})

const promoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Description is required'),
  icon: z.enum(PROMO_ICONS),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const adminSavePromotion = createServerFn({ method: 'POST' })
  .validator(promoSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await getDb()
    if (data.id) {
      await db
        .update(promotions)
        .set({ title: data.title, text: data.text, icon: data.icon, active: data.active, sortOrder: data.sortOrder })
        .where(eq(promotions.id, data.id))
      return { id: data.id }
    }
    const id = crypto.randomUUID()
    await db.insert(promotions).values({
      id,
      title: data.title,
      text: data.text,
      icon: data.icon,
      active: data.active,
      sortOrder: data.sortOrder,
      createdAt: new Date().toISOString(),
    })
    return { id }
  })

export const adminDeletePromotion = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin()
    const db = await getDb()
    await db.delete(promotions).where(eq(promotions.id, id))
    return { ok: true }
  })
