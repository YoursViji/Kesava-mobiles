import type { ReactNode } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { Smartphone, Star, Scale, ShieldCheck, Truck, RefreshCw, ShoppingBag, Check } from 'lucide-react'
import { getProduct, listMobiles } from '@/server/products'
import { listReviews } from '@/server/reviews'
import { ProductCard } from '@/components/ProductCard'
import { EmiCalculator } from '@/components/EmiCalculator'
import { ReviewsSection } from '@/components/ReviewsSection'
import { useCompareList } from '@/lib/compare'
import { useCart } from '@/lib/cart'
import { getSpecFields } from '@/lib/productSpecs'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { DemoBookingForm } from '@/components/DemoBookingForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export const Route = createFileRoute('/mobiles/$id')({
  component: ProductDetail,
  loader: async ({ params }) => {
    const [product, all] = await Promise.all([getProduct({ data: params.id }), listMobiles()])
    if (!product || product.category !== 'Smartphone') throw notFound()
    const related = all.filter((p) => p.brand === product.brand && p.id !== product.id).slice(0, 4)
    const reviews = await listReviews({ data: product.id })
    return { product, related, reviews }
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">We couldn't find that phone</h1>
      <p className="mt-2 text-neutral-500">It may have been sold out or the link is incorrect.</p>
      <Link to="/mobiles" className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
        Browse all mobiles
      </Link>
    </main>
  ),
  head: ({ loaderData }) => ({ meta: loaderData ? [{ title: `${loaderData.product.name} — Kesava Mobiles` }] : [] }),
})

function ProductDetail() {
  const { product, related, reviews } = Route.useLoaderData()
  const compare = useCompareList()
  const cart = useCart()
  const { t } = useLang()
  const [added, setAdded] = useState(false)
  const SPECS = getSpecFields(product.category)
  const inCompare = compare.has(product.id)
  const savings = product.originalPrice - product.price

  const addToCart = () => {
    cart.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      colorFrom: product.colorFrom,
      colorTo: product.colorTo,
      imageUrl: product.imageUrl,
      category: product.category,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-neutral-500">
        <Link to="/mobiles" className="hover:text-brand-600">Mobiles</Link> / {product.brand} / {product.name}
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-8" />
          ) : (
            <Smartphone className="text-neutral-300" size={140} strokeWidth={1} />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-brand-600">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)} rating · {product.reviewsCount.toLocaleString('en-IN')} reviews
            {product.tag ? <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{product.tag}</span> : null}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-neutral-900">₹{product.price.toLocaleString('en-IN')}</span>
            {savings > 0 ? (
              <>
                <span className="text-lg text-neutral-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  Save ₹{savings.toLocaleString('en-IN')}
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-neutral-500">{t('in_stock_note')}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={addToCart}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold',
                added ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-600 text-white hover:bg-brand-700',
              )}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />} {added ? t('added_short') : t('add_to_cart')}
            </button>
            <a href="tel:9701661662" className="rounded-full border-2 border-neutral-300 px-5 py-3 text-sm font-bold text-neutral-700 hover:border-brand-400">
              {t('call_to_reserve')}
            </a>
            <button
              onClick={() => compare.toggle(product.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border-2 px-5 py-3 text-sm font-bold',
                inCompare ? 'border-brand-600 text-brand-700 bg-brand-50' : 'border-neutral-300 text-neutral-700 hover:border-brand-400',
              )}
            >
              <Scale size={16} /> {inCompare ? t('added_to_compare') : t('add_to_compare')}
            </button>
            <WhatsAppButton message={`Hi, I'd like to know more about the ${product.brand} ${product.name} (\u20b9${product.price.toLocaleString('en-IN')}).`} />
          </div>

          <DemoBookingForm productId={product.id} productName={`${product.brand} ${product.name}`} />

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <MiniBadge icon={<ShieldCheck size={15} />} text={t('warranty_badge')} />
            <MiniBadge icon={<Truck size={15} />} text={t('pickup_badge')} />
            <MiniBadge icon={<RefreshCw size={15} />} text={t('exchange_badge')} />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="text-xl font-bold text-neutral-900">{t('product_specifications')}</h2>
          <div className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
            {SPECS.map((s) => (
              <div key={s.key} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <span className="text-neutral-500">{s.label}</span>
                <span className="text-right font-medium text-neutral-900">{product[s.key]}</span>
              </div>
            ))}
          </div>
        </section>
        <EmiCalculator price={product.price} />
      </div>

      <ReviewsSection productId={product.id} reviews={reviews} />

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-neutral-900">{t('more_from')} {product.brand}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

function MiniBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600">
      {icon} {text}
    </span>
  )
}
