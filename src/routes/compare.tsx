import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { Smartphone, X } from 'lucide-react'
import { getProductsByIds, listProducts } from '@/server/products'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const searchSchema = z.object({ ids: z.array(z.string()).optional() })

export const Route = createFileRoute('/compare')({
  component: ComparePage,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ ids: search.ids ?? [] }),
  loader: async ({ deps }) => {
    const [products, all] = await Promise.all([getProductsByIds({ data: deps.ids }), listProducts()])
    return { products, all }
  },
})

const SPECS = [
  { key: 'price', label: 'Price', fmt: (v: number) => `₹${v.toLocaleString('en-IN')}` },
  { key: 'display', label: 'Display' },
  { key: 'processor', label: 'Processor' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'camera', label: 'Camera' },
  { key: 'battery', label: 'Battery' },
  { key: 'os', label: 'Operating System' },
  { key: 'rating', label: 'Rating', fmt: (v: number) => `${v.toFixed(1)} / 5` },
] as const

function ComparePage() {
  const { products, all } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { t } = useLang()
  const ids = search.ids ?? []

  const remove = (id: string) => navigate({ search: { ids: ids.filter((x) => x !== id) } })
  const add = (id: string) => navigate({ search: { ids: [...ids, id] } })
  const remaining = all.filter((p) => !ids.includes(p.id)).slice(0, 6)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('compare_title')}</h1>
      <p className="mt-1 text-neutral-500">{t('compare_subtitle')}</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-lg font-semibold text-neutral-800">{t('compare_none_title')}</p>
          <p className="mt-1 text-sm text-neutral-500">{t('compare_none_sub')}</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="w-40 text-left text-sm text-neutral-500">Specification</th>
                {products.map((p) => (
                  <th key={p.id} className="min-w-[200px] rounded-xl bg-white p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', p.colorFrom, p.colorTo)}>
                        <Smartphone className="text-white" size={28} />
                      </div>
                      <button onClick={() => remove(p.id)} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                        <X size={16} />
                      </button>
                    </div>
                    <Link to="/mobiles/$id" params={{ id: p.id }} className="mt-2 block text-sm font-semibold text-neutral-900 hover:text-brand-600">
                      {p.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPECS.map((s) => (
                <tr key={s.key}>
                  <td className="px-2 text-sm font-medium text-neutral-500">{s.label}</td>
                  {products.map((p) => {
                    const raw = p[s.key as keyof typeof p] as string | number
                    const fmt = 'fmt' in s ? s.fmt : undefined
                    return (
                      <td key={p.id} className="rounded-lg bg-white px-3 py-2 text-sm text-neutral-800">
                        {fmt ? fmt(raw as number) : raw}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {remaining.length > 0 && ids.length < 4 ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-neutral-900">{t('compare_add_another')}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {remaining.map((p) => (
              <button key={p.id} onClick={() => add(p.id)} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:border-brand-400">
                + {p.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
