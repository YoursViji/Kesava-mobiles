// Shared spec-field definitions used by product cards, detail pages and the compare table.
// Mobiles and accessories store their attributes in the same columns, but the columns mean
// something different for each — this maps each category to the right labels.
export type SpecKey = 'display' | 'processor' | 'ram' | 'storage' | 'camera' | 'battery' | 'os'
export type SpecField = { key: SpecKey; label: string }

export const MOBILE_SPEC_FIELDS: SpecField[] = [
  { key: 'display', label: 'Display' },
  { key: 'processor', label: 'Processor' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'camera', label: 'Camera' },
  { key: 'battery', label: 'Battery' },
  { key: 'os', label: 'Operating System' },
]

export const ACCESSORY_SPEC_FIELDS: SpecField[] = [
  { key: 'processor', label: 'Type' },
  { key: 'display', label: 'Compatibility' },
  { key: 'ram', label: 'Connectivity' },
  { key: 'camera', label: 'Colour / Material' },
  { key: 'battery', label: 'Battery / Output' },
  { key: 'storage', label: 'Warranty' },
  { key: 'os', label: "What's in the box" },
]

export function getSpecFields(category: string): SpecField[] {
  return category === 'Accessory' ? ACCESSORY_SPEC_FIELDS : MOBILE_SPEC_FIELDS
}

export const ACCESSORY_SUBCATEGORIES = [
  'Earphones',
  'Earbuds',
  'Mobile Cover',
  'Tempered Glass',
  'Battery',
  'Power Bank',
  'Cables',
  'Charger',
] as const
