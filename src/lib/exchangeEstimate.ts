// A simple, transparent formula for an instant trade-in estimate: a base value per brand tier,
// reduced for each year of age and by condition. Deliberately simple and deterministic so the
// number on screen updates immediately as the customer changes an answer, with no server round trip.
export const EXCHANGE_BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'realme', 'vivo', 'iQOO', 'POCO', 'Other'] as const
export const EXCHANGE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const
export type ExchangeCondition = (typeof EXCHANGE_CONDITIONS)[number]

const BRAND_BASE: Record<string, number> = {
  Apple: 32000,
  Samsung: 16000,
  OnePlus: 14000,
  Xiaomi: 9000,
  realme: 8000,
  vivo: 8500,
  iQOO: 9500,
  POCO: 8500,
  Other: 6000,
}

const CONDITION_MULTIPLIER: Record<ExchangeCondition, number> = {
  Excellent: 1,
  Good: 0.8,
  Fair: 0.55,
  Poor: 0.3,
}

/** A small, deterministic nudge from the model name so two different models of the same brand,
 * year and condition don't land on the exact same number — without needing a full model catalogue. */
function modelFactor(model: string): number {
  const cleaned = model.trim().toLowerCase()
  if (!cleaned) return 1
  let hash = 0
  for (let i = 0; i < cleaned.length; i++) hash = (hash * 31 + cleaned.charCodeAt(i)) % 1000
  // Maps the hash to a modest ±10% range around 1.
  return 0.9 + (hash / 1000) * 0.2
}

export function estimateExchangeValue(brand: string, model: string, purchaseYear: number, condition: ExchangeCondition): number {
  const base = BRAND_BASE[brand] ?? BRAND_BASE.Other
  const age = Math.max(0, new Date().getFullYear() - purchaseYear)
  const ageFactor = Math.max(0.2, 1 - age * 0.16)
  const raw = base * ageFactor * CONDITION_MULTIPLIER[condition] * modelFactor(model)
  return Math.max(500, Math.round(raw / 50) * 50)
}
