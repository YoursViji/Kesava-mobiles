import { createServerFn } from '@tanstack/react-start'
import { inArray } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { products } from '@/db/schema'

// Curated combo bundles: each references real accessory ids seeded in the database, so the
// bundle's price always reflects the store's current pricing rather than a hard-coded total.
const BUNDLE_DEFS = [
  { id: 'combo-essentials', name: 'Essentials Combo', discountPercent: 15, itemIds: ['a6', 'a4', 'a12'] },
  { id: 'combo-power', name: 'Power Combo', discountPercent: 12, itemIds: ['a10', 'a12', 'a9'] },
  { id: 'combo-audio', name: 'Audio Combo', discountPercent: 10, itemIds: ['a2', 'a12'] },
] as const

export const listComboBundles = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  const allIds = BUNDLE_DEFS.flatMap((b) => b.itemIds)
  const rows = await db.select().from(products).where(inArray(products.id, allIds))
  const byId = new Map(rows.map((r) => [r.id, r]))

  return BUNDLE_DEFS.map((bundle) => {
    const items = bundle.itemIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
    const total = items.reduce((sum, p) => sum + p.price, 0)
    const bundlePrice = Math.round((total * (100 - bundle.discountPercent)) / 100)
    return {
      id: bundle.id,
      name: bundle.name,
      discountPercent: bundle.discountPercent,
      items,
      total,
      bundlePrice,
      savings: total - bundlePrice,
      complete: items.length === bundle.itemIds.length,
    }
  }).filter((b) => b.complete)
})
