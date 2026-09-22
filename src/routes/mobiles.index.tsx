import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { z } from 'zod'
import { listMobiles } from '@/server/products'
import { ProductCard } from '@/components/ProductCard'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const searchSchema = z.object({
  q: z.string().optional(),
  brand: z.string().optional(),
  max: z.coerce.number().optional(),
  sort: z.enum(['popular', 'price-asc', 'price-desc', 'rating']).optional(),
})

export const Route = createFileRoute('/mobiles')({
  component: MobilesPage,
  validateSearch: searchSchema,
  loader: async () => {
    const products = await listMobiles()
    return { products }
  },
})

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'realme', 'vivo', 'iQOO', 'POCO']
const PRICE_STEPS = [
  { label: 'Any price', value: undefined },
  { label: 'Under ₹15,000', value: 15000 },
  { label: 'Under ₹25,000', value: 25000 },
  { label: 'Under ₹40,000', value: 40000 },
  { label: 'Under ₹70,000', value: 70000 },
]

function MobilesPage() {
  const { products } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { t } = useLang()
  const urlQ = search.q ?? ''
  const [q, setQ] = useState(urlQ)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastWritten = useRef(urlQ)

  useEffect(() => {
    if (urlQ === lastWritten.current) return
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    lastWritten.current = urlQ
    setQ(urlQ)
  }, [urlQ])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const filtered = products
    .filter((p) => !search.brand || p.brand === search.brand)
    .filter((p) => !search.max || p.price <= search.max)
    .filter((p) => !q || `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (search.sort === 'price-asc') return a.price - b.price
      if (search.sort === 'price-desc') return b.price - a.price
      if (search.sort === 'rating') return b.rating - a.rating
      return b.reviewsCount - a.reviewsCount
    })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('mobiles_title')}</h1>
      <p className="mt-1 text-neutral-500">
        {products.length} phones from every major brand, in stock at {`Kesava Mobiles, Nagari`}.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="relative flex-1" onSubmit={(e) => e.preventDefault()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            value={q}
            onChange={(e) => {
              const next = e.target.value
              setQ(next)
              if (debounceRef.current) clearTimeout(debounceRef.current)
              debounceRef.current = setTimeout(() => {
                lastWritten.current = next
                debounceRef.current = null
                navigate({ search: (prev) => ({ ...prev, q: next || undefined }), replace: true })
              }, 300)
            }}
            placeholder={t('search_placeholder')}
            className="w-full rounded-full border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </form>
        <select
          value={search.sort ?? 'popular'}
          onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value as typeof search.sort }) })}
          className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm"
        >
          <option value="popular">{t('sort_popular')}</option>
          <option value="price-asc">{t('sort_price_asc')}</option>
          <option value="price-desc">{t('sort_price_desc')}</option>
          <option value="rating">{t('sort_rating')}</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={15} className="text-neutral-400" />
        <FilterChip active={!search.brand} onClick={() => navigate({ search: (prev) => ({ ...prev, brand: undefined }) })}>
          {t('all_brands')}
        </FilterChip>
        {BRANDS.map((b) => (
          <FilterChip key={b} active={search.brand === b} onClick={() => navigate({ search: (prev) => ({ ...prev, brand: b }) })}>
            {b}
          </FilterChip>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {PRICE_STEPS.map((step) => (
          <FilterChip
            key={step.label}
            active={search.max === step.value}
            onClick={() => navigate({ search: (prev) => ({ ...prev, max: step.value }) })}
          >
            {step.label}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-lg font-semibold text-neutral-800">{t('no_match_title')}</p>
          <p className="mt-1 text-sm text-neutral-500">{t('no_match_sub')}</p>
          <Link
            to="/mobiles"
            search={{ q: undefined, brand: undefined, max: undefined, sort: undefined }}
            className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {t('reset_filters')}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-semibold',
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-200 text-neutral-600 hover:border-brand-300',
      )}
    >
      {children}
    </button>
  )
}
