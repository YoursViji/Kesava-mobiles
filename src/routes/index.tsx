import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Smartphone, Wrench, ShieldCheck, Truck, BadgePercent, Star, MapPin, Phone } from 'lucide-react'
import { listProducts } from '@/server/products'
import { ProductCard } from '@/components/ProductCard'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const products = await listProducts()
    return {
      mobiles: products.filter((p) => p.category === 'Smartphone'),
      accessories: products.filter((p) => p.category === 'Accessory'),
    }
  },
})

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'realme', 'vivo', 'iQOO', 'POCO']

function Home() {
  const { mobiles, accessories } = Route.useLoaderData()
  const { t } = useLang()
  const bestsellers = mobiles.slice(0, 8)
  const deals = mobiles.filter((p) => p.discountPercent >= 12).slice(0, 4)
  const popularAccessories = accessories.slice(0, 4)

  return (
    <main>
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <MapPin size={13} /> Nagari, Andhra Pradesh
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              {t('home_title').replace('{store}', STORE.name)}
            </h1>
            <p className="mt-4 max-w-md text-white/90">{t('home_subtitle')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/mobiles" className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50">
                <Smartphone size={17} /> {t('home_find_mobile')}
              </Link>
              <Link to="/service" className="flex items-center gap-2 rounded-full border-2 border-white/70 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                <Wrench size={17} /> {t('home_book_service')}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BRANDS.map((b) => (
              <Link
                key={b}
                to="/mobiles"
                search={{ brand: b }}
                className="rounded-xl bg-white/10 px-3 py-4 text-center text-sm font-semibold backdrop-blur hover:bg-white/20"
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature icon={<ShieldCheck size={20} />} title={t('feature_genuine_title')} text={t('feature_genuine_text')} />
          <Feature icon={<Truck size={20} />} title={t('feature_pickup_title')} text={t('feature_pickup_text')} />
          <Feature icon={<BadgePercent size={20} />} title={t('feature_exchange_title')} text={t('feature_exchange_text')} />
        </div>
      </section>

      {deals.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">{t('home_offers_title')}</h2>
            <Link to="/offers" className="text-sm font-semibold text-brand-600 hover:underline">{t('home_see_all_offers')}</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">{t('home_bestselling_title')}</h2>
          <Link to="/mobiles" className="text-sm font-semibold text-brand-600 hover:underline">{t('home_view_all_mobiles')}</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {popularAccessories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">{t('home_accessories_title')}</h2>
            <Link to="/accessories" className="text-sm font-semibold text-brand-600 hover:underline">{t('home_view_all_accessories')}</Link>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Earphones, earbuds, covers, tempered glass, power banks, chargers, cables and batteries — all in stock at {STORE.name}.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {popularAccessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900 text-white md:grid-cols-2">
          <div className="p-8 md:p-10">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              <Wrench size={13} /> {t('home_service_badge')}
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t('home_service_title')}</h2>
            <p className="mt-3 text-neutral-300">{t('home_service_text')}</p>
            <Link to="/service" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold hover:bg-brand-400">
              {t('home_service_cta')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10 p-px md:grid-cols-1">
            <div className="flex items-center gap-3 bg-neutral-900 p-6">
              <Star className="text-amber-400" size={22} />
              <div>
                <p className="font-semibold">{t('home_rating_text')}</p>
                <p className="text-sm text-neutral-400">{t('home_rating_sub')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-neutral-900 p-6">
              <ShieldCheck className="text-brand-400" size={22} />
              <div>
                <p className="font-semibold">{t('home_parts_title')}</p>
                <p className="text-sm text-neutral-400">{t('home_parts_sub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-neutral-900">{t('home_visit_title')}</h2>
          <p className="mt-2 max-w-2xl text-neutral-600">
            {STORE.name} is located on {STORE.address}. Walk in for hands-on demos, instant exchange valuation,
            or to drop off a device for service.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-700">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> {STORE.address}</span>
            <a href={`tel:${STORE.phone}`} className="flex items-center gap-2 font-semibold text-brand-700"><Phone size={16} /> {STORE.phoneDisplay}</a>
            <Link to="/contact" className="font-semibold text-brand-600 hover:underline">{t('home_directions')}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>
      <div>
        <p className="font-semibold text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-500">{text}</p>
      </div>
    </div>
  )
}
