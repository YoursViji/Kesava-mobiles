import { createServerFn } from '@tanstack/react-start'
import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { products } from '@/db/schema'
import { requireAdmin } from '@/server/admin'

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

// --- Admin: catalogue management -----------------------------------------------------------

export const adminListAllProducts = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAdmin()
  const db = await getDb()
  return db.select().from(products).orderBy(desc(products.createdAt))
})

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.enum(['Smartphone', 'Accessory']),
  subcategory: z.string().optional(),
  tag: z.string().optional(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  ram: z.string().min(1),
  storage: z.string().min(1),
  display: z.string().min(1),
  camera: z.string().min(1),
  battery: z.string().min(1),
  processor: z.string().min(1),
  os: z.string().min(1),
  colorFrom: z.string().min(1).default('from-brand-500'),
  colorTo: z.string().min(1).default('to-brand-700'),
  inStock: z.boolean().default(true),
  imageUrl: z.string().optional(),
})

function computeDiscount(price: number, originalPrice: number) {
  if (originalPrice <= price || originalPrice <= 0) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

/** Creates a new product when no id is given, otherwise updates the existing one — covers both
 * "Add new mobile/accessory" and "Update mobile/accessory" (price, stock status, specs) in one call. */
export const adminSaveProduct = createServerFn({ method: 'POST' })
  .validator(productSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await getDb()
    const discountPercent = computeDiscount(data.price, data.originalPrice)
    const values = {
      name: data.name,
      brand: data.brand,
      category: data.category,
      subcategory: data.subcategory || null,
      tag: data.tag || null,
      price: data.price,
      originalPrice: data.originalPrice,
      discountPercent,
      ram: data.ram,
      storage: data.storage,
      display: data.display,
      camera: data.camera,
      battery: data.battery,
      processor: data.processor,
      os: data.os,
      colorFrom: data.colorFrom,
      colorTo: data.colorTo,
      inStock: data.inStock,
      imageUrl: data.imageUrl || null,
    }
    if (data.id) {
      await db.update(products).set(values).where(eq(products.id, data.id))
      return { id: data.id }
    }
    const id = crypto.randomUUID()
    await db.insert(products).values({
      id,
      ...values,
      rating: 4.3,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    })
    return { id }
  })

export const adminSetProductStock = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), inStock: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const db = await getDb()
    await db.update(products).set({ inStock: data.inStock }).where(eq(products.id, data.id))
    return { ok: true }
  })
