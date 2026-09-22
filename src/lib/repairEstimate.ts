// A simple, transparent lookup for an upfront repair price range: a base range per issue type,
// scaled by a brand tier multiplier. Deliberately simple and deterministic (no server round trip)
// so the range on screen updates immediately as the customer changes brand or issue, matching the
// pattern used by the exchange estimator.
const ISSUE_BASE_RANGE: Record<string, [number, number]> = {
  'Screen Repair': [1800, 6500],
  'Battery Replacement': [900, 2800],
  'Charging Port Issue': [500, 1500],
  'Water Damage': [1200, 5000],
  'Software / OS Issue': [300, 900],
  'Camera Repair': [1000, 3500],
  'Speaker / Mic Issue': [500, 1800],
  Other: [400, 2000],
}

const BRAND_TIER: Record<string, number> = {
  Apple: 1.8,
  Samsung: 1.15,
  OnePlus: 1.1,
  Xiaomi: 0.85,
  realme: 0.8,
  vivo: 0.85,
  iQOO: 0.9,
  POCO: 0.8,
  Other: 0.9,
}

export function estimateRepairRange(brand: string, issueType: string): { min: number; max: number } {
  const [baseMin, baseMax] = ISSUE_BASE_RANGE[issueType] ?? ISSUE_BASE_RANGE.Other
  const tier = BRAND_TIER[brand] ?? BRAND_TIER.Other
  const round50 = (n: number) => Math.round(n / 50) * 50
  return { min: round50(baseMin * tier), max: round50(baseMax * tier) }
}
