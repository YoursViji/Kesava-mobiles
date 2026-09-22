import { createServerFn } from '@tanstack/react-start'
import { eq, isNull } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { products } from '@/db/schema'
import { ai } from '@/lib/ai'

/** Fills a real catalog photo for every product still missing one.
 *  Loops every NULL row and keeps going if a single generation fails. */
export const seedProductImages = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  const rows = await db.select().from(products).where(isNull(products.imageUrl))

  let updated = 0
  const failed: string[] = []
  for (const row of rows) {
    try {
      const kind =
        row.category === 'Accessory'
          ? `${row.brand} ${row.name} ${row.subcategory ?? 'mobile accessory'}`
          : `${row.brand} ${row.name} smartphone, front and back view standing upright`
      const { url } = await ai.generateImage({
        prompt: `Professional e-commerce product photograph of a ${kind}, centered on a clean plain white studio background, realistic retail catalog photo like an electronics store listing, high detail, no text, no watermark, no packaging box, no people`,
      })
      await db.update(products).set({ imageUrl: url }).where(eq(products.id, row.id))
      updated++
    } catch {
      failed.push(row.id)
    }
  }
  return { updated, remaining: rows.length - updated, total: rows.length, failed }
})
