import { createServerFn } from '@tanstack/react-start'
import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { products } from '@/db/schema'

export const listProducts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  return db.select().from(products).orderBy(desc(products.reviewsCount))
})

export const listMobiles = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  return db.select().from(products).where(eq(products.category, 'Smartphone')).orderBy(desc(products.reviewsCount))
})

export const listAccessories = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  return db.select().from(products).where(eq(products.category, 'Accessory')).orderBy(desc(products.reviewsCount))
})

export const getProduct = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const db = await getDb()
    const row = await db.select().from(products).where(eq(products.id, id)).get()
    return row ?? null
  })

export const getProductsByIds = createServerFn({ method: 'GET' })
  .validator(z.array(z.string()))
  .handler(async ({ data: ids }) => {
    if (ids.length === 0) return []
    const db = await getDb()
    const all = await db.select().from(products)
    const byId = new Map(all.map((p) => [p.id, p]))
    return ids.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
  })

export const listBrands = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  const rows = await db.select({ brand: products.brand }).from(products).orderBy(asc(products.brand))
  return Array.from(new Set(rows.map((r) => r.brand)))
})
