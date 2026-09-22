import { useState } from 'react'
import { Package, ShoppingBag, Check, Sparkles } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type ComboItem = {
  id: string
  name: string
  price: number
  colorFrom: string
  colorTo: string
  imageUrl: string | null
  category: string
}

export type ComboBundle = {
  id: string
  name: string
  discountPercent: number
  items: ComboItem[]
  total: number
  bundlePrice: number
  savings: number
}

export function ComboBundles({ bundles }: { bundles: ComboBundle[] }) {
  const { t } = useLang()
  if (bundles.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-brand-600" />
        <h2 className="text-xl font-bold text-neutral-900">{t('combos_title')}</h2>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{t('combos_subtitle')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {bundles.map((bundle) => (
          <ComboCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </section>
  )
}

function ComboCard({ bundle }: { bundle: ComboBundle }) {
  const cart = useCart()
  const { t } = useLang()
  const [added, setAdded] = useState(false)

  const addBundle = () => {
    for (const item of bundle.items) {
      cart.add({
        productId: item.id,
        name: item.name,
        price: item.price,
        colorFrom: item.colorFrom,
        colorTo: item.colorTo,
        imageUrl: item.imageUrl,
        category: item.category,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-neutral-900">{bundle.name}</p>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{bundle.discountPercent}% OFF</span>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-neutral-600">
        {bundle.items.map((item) => (
          <li key={item.id} className="flex items-center gap-1.5">
            <Package size={12} className="text-neutral-400" /> {item.name}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-lg font-extrabold text-neutral-900">₹{bundle.bundlePrice.toLocaleString('en-IN')}</span>
        <span className="text-xs text-neutral-400 line-through">₹{bundle.total.toLocaleString('en-IN')}</span>
      </div>
      <p className="text-xs font-semibold text-emerald-700">{t('combo_you_save')} ₹{bundle.savings.toLocaleString('en-IN')}</p>
      <button
        onClick={addBundle}
        className={cn(
          'mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold',
          added ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-600 text-white hover:bg-brand-700',
        )}
      >
        {added ? <Check size={15} /> : <ShoppingBag size={15} />} {added ? t('combo_added') : t('combo_add_btn')}
      </button>
    </div>
  )
}
