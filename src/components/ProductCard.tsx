import { Link } from '@tanstack/react-router'
import { Smartphone, Scale, Package, ShoppingBag, Check } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/db/schema'
import { useCompareList } from '@/lib/compare'
import { useCart } from '@/lib/cart'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const compare = useCompareList()
  const cart = useCart()
  const { t } = useLang()
  const [added, setAdded] = useState(false)
  const inCompare = compare.has(product.id)
  const isAccessory = product.category === 'Accessory'
  const detailTo = isAccessory ? '/accessories/$id' : '/mobiles/$id'
  const variantLine = isAccessory
    ? product.subcategory
    : `(${product.ram}-${product.storage})`

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
    <div className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md">
      <Link to={detailTo} params={{ id: product.id }} className="block">
        <div className="relative flex h-52 items-center justify-center bg-white px-4 pt-4">
          {product.discountPercent > 0 ? (
            <span className="absolute right-2 top-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
              {product.discountPercent}% OFF
            </span>
          ) : null}
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
          ) : isAccessory ? (
            <Package className="text-neutral-300" size={56} strokeWidth={1.25} />
          ) : (
            <Smartphone className="text-neutral-300" size={64} strokeWidth={1.25} />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
        <Link
          to={detailTo}
          params={{ id: product.id }}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-neutral-900 hover:text-brand-700"
        >
          {product.brand} {product.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{variantLine}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-bold text-emerald-600">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice > product.price ? (
            <span className="text-xs text-neutral-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={addToCart}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold',
              added ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-600 text-white hover:bg-brand-700',
            )}
          >
            {added ? <Check size={14} /> : <ShoppingBag size={14} />} {added ? t('added_short') : t('add_to_cart')}
          </button>
          {!isAccessory ? (
            <button
              onClick={() => compare.toggle(product.id)}
              className={cn(
                'flex items-center justify-center rounded-md border px-2 py-1.5 text-xs font-semibold',
                inCompare ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-brand-300',
              )}
              aria-label={t('add_to_compare')}
            >
              <Scale size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
