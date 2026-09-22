import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BadgePercent, Repeat, Landmark } from 'lucide-react'
import { listProducts } from '@/server/products'
import { ProductCard } from '@/components/ProductCard'
import { useLang } from '@/lib/i18n'

export const Route = createFileRoute('/offers')({
  component: OffersPage,
  loader: async () => ({ products: await listProducts() }),
})

function OffersPage() {
  const { products } = Route.useLoaderData()
  const { t } = useLang()
  const deals = products.filter((p) => p.discountPercent > 0).sort((a, b) => b.discountPercent - a.discountPercent)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('offers_title')}</h1>
      <p className="mt-1 text-neutral-500">{t('offers_subtitle')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <PromoCard
          icon={<Repeat size={20} />}
          title={t('offer_exchange_title')}
          text={t('offer_exchange_text')}
        />
        <PromoCard
          icon={<Landmark size={20} />}
          title={t('offer_bank_title')}
          text={t('offer_bank_text')}
        />
        <PromoCard
          icon={<BadgePercent size={20} />}
          title={t('offer_refer_title')}
          text={t('offer_refer_text')}
        />
      </div>

      <h2 className="mt-10 text-xl font-bold text-neutral-900">{t('offers_all_title')}</h2>
      {deals.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="font-semibold text-neutral-800">{t('offers_none_title')}</p>
          <p className="mt-1 text-sm text-neutral-500">{t('offers_none_sub')}</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <p className="mt-10 text-sm text-neutral-500">
        Looking for a specific model? <Link to="/mobiles" className="font-semibold text-brand-600 hover:underline">Browse all mobiles</Link> or{' '}
        <Link to="/contact" className="font-semibold text-brand-600 hover:underline">call the store</Link>.
      </p>
    </main>
  )
}

function PromoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-700">{icon}</span>
      <p className="mt-3 font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-600">{text}</p>
    </div>
  )
}
