import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, SlidersHorizontal } from 'lucide-react'
import { z } from 'zod'
import { listAccessories } from '@/server/products'
import { listComboBundles } from '@/server/combos'
import { ProductCard } from '@/components/ProductCard'
import { ComboBundles } from '@/components/ComboBundles'
import { ACCESSORY_SUBCATEGORIES } from '@/lib/productSpecs'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  max: z.coerce.number().optional(),
  sort: z.enum(['popular', 'price-asc', 'price-desc', 'rating']).optional(),
})

export const Route = createFileRoute('/accessories')({
  component: AccessoriesPage,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async () => {
    const [products, bundles] = await Promise.all([listAccessories(), listComboBundles()])
    return { products, bundles }
  },
})

const PRICE_STEPS = [
  { label: 'Any price', value: undefined },
  { label: 'Under ₹300', value: 300 },
  { label: 'Under ₹800', value: 800 },
  { label: 'Under ₹1,500', value: 1500 },
  { label: 'Under ₹3,000', value: 3000 },
]

function AccessoriesPage() {
  const { products, bundles } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { t } = useLang()
  const q = search.q ?? ''

  const filtered = products
    .filter((p) => !search.type || p.subcategory === search.type)
    .filter((p) => !search.max || p.price <= search.max)
    .filter((p) => !q || `${p.name} ${p.brand} ${p.subcategory}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (search.sort === 'price-asc') return a.price - b.price
      if (search.sort === 'price-desc') return b.price - a.price
      if (search.sort === 'rating') return b.rating - a.rating
      return b.reviewsCount - a.reviewsCount
    })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('accessories_title')}</h1>
      <p className="mt-1 text-neutral-500">{t('accessories_subtitle')}</p>

      <div className="mt-6">
        <ComboBundles bundles={bundles} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="relative flex-1" onSubmit={(e) => e.preventDefault()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            value={q}
            onChange={(e) => navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined }), replace: true })}
            placeholder="Search earphones, covers, chargers…"
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
        <FilterChip active={!search.type} onClick={() => navigate({ search: (prev) => ({ ...prev, type: undefined }) })}>
          {t('all_categories')}
        </FilterChip>
        {ACCESSORY_SUBCATEGORIES.map((c) => (
          <FilterChip key={c} active={search.type === c} onClick={() => navigate({ search: (prev) => ({ ...prev, type: c }) })}>
            {c}
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
          <p className="text-lg font-semibold text-neutral-800">{t('no_accessory_match_title')}</p>
          <p className="mt-1 text-sm text-neutral-500">{t('no_match_sub')}</p>
          <Link
            to="/accessories"
            search={{ q: undefined, type: undefined, max: undefined, sort: undefined }}
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
