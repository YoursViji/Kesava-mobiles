import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2, CheckCircle2, Store } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useAction } from '@/lib/actions'
import { createOrder } from '@/server/orders'
import { HOME_DELIVERY_FEE } from '@/data/options'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/cart')({ component: CartPage })

function CartPage() {
  const cart = useCart()
  const { t } = useLang()
  const [form, setForm] = useState({ customerName: '', phone: '' })
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [confirmed, setConfirmed] = useState<{ orderCode: string; totalAmount: number; deliveryMode: 'pickup' | 'delivery'; deliveryFee: number } | null>(null)

  const place = useAction(createOrder, {
    onSuccess: (data) => {
      setConfirmed(data)
      cart.clear()
    },
  })

  const grandTotal = cart.totalPrice + (deliveryMode === 'delivery' ? HOME_DELIVERY_FEE : 0)

  if (!cart.loaded) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto text-neutral-300" size={56} />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{t('cart_title')}</h1>
        <p className="mt-2 text-neutral-500">Loading your cart…</p>
      </main>
    )
  }

  if (confirmed) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{t('order_confirm_title')}</h1>
        <p className="mt-2 text-neutral-600">{t('order_confirm_text').replace('{store}', STORE.name)}</p>
        <p className="mt-5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 py-4 text-2xl font-extrabold tracking-widest text-brand-700">
          {confirmed.orderCode}
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          {t('order_total_label')}: <span className="font-semibold text-neutral-800">₹{confirmed.totalAmount.toLocaleString('en-IN')}</span>
        </p>
        {confirmed.deliveryMode === 'delivery' ? (
          <p className="mt-2 text-sm text-neutral-500">{t('order_delivery_note')}</p>
        ) : null}
        <p className="mt-3 text-xs text-brand-600">{t('loyalty_points_earned_note')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/mobiles" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
            {t('continue_shopping')}
          </Link>
          <Link to="/" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-neutral-700">
            {t('back_home')}
          </Link>
        </div>
      </main>
    )
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto text-neutral-300" size={56} />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{t('cart_empty_title')}</h1>
        <p className="mt-2 text-neutral-500">{t('cart_empty_sub')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/mobiles" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
            {t('nav_mobiles')}
          </Link>
          <Link to="/accessories" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-neutral-700">
            {t('nav_accessories')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('cart_title')}</h1>
      <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
        <Store size={15} className="text-brand-600" /> {t('cart_pickup_note').replace('{store}', STORE.name)}
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl bg-neutral-50 object-contain p-2" />
              ) : (
                <div className={cn('h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br', item.colorFrom, item.colorTo)} />
              )}
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{item.name}</p>
                <p className="text-sm text-neutral-500">₹{item.price.toLocaleString('en-IN')} {t('each')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-neutral-300 text-neutral-600 hover:border-brand-400"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => cart.setQuantity(item.productId, item.quantity + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-neutral-300 text-neutral-600 hover:border-brand-400"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => cart.remove(item.productId)} className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-neutral-900">{t('order_summary')}</h2>
          <div className="mt-3 flex items-center justify-between text-sm text-neutral-600">
            <span>{cart.totalItems} {t('items_label')}</span>
            <span className="font-bold text-neutral-900">₹{cart.totalPrice.toLocaleString('en-IN')}</span>
          </div>
          {deliveryMode === 'delivery' ? (
            <div className="mt-1 flex items-center justify-between text-sm text-neutral-500">
              <span>{t('delivery_fee_label')}</span>
              <span>₹{HOME_DELIVERY_FEE}</span>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm font-bold text-neutral-900">
            <span>{t('order_total_label')}</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-neutral-700">{t('field_delivery_choice')}</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDeliveryMode('pickup')}
                className={cn(
                  'rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold',
                  deliveryMode === 'pickup' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-brand-300',
                )}
              >
                {t('delivery_pickup')}
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('delivery')}
                className={cn(
                  'rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold',
                  deliveryMode === 'delivery' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-brand-300',
                )}
              >
                {t('delivery_home')} (₹{HOME_DELIVERY_FEE})
              </button>
            </div>
            <p className="mt-1.5 text-xs text-neutral-400">{deliveryMode === 'pickup' ? t('delivery_free_note') : t('order_delivery_note')}</p>
          </div>

          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              place.run({
                data: {
                  customerName: form.customerName,
                  phone: form.phone,
                  items: cart.items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
                  deliveryMode,
                  deliveryAddress: deliveryMode === 'delivery' ? deliveryAddress : undefined,
                },
              })
            }}
          >
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('field_name')}</span>
              <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('field_phone')}</span>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="10-digit mobile" />
            </label>
            {deliveryMode === 'delivery' ? (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-700">{t('field_delivery_address')}</span>
                <input
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="input"
                  placeholder={t('delivery_address_placeholder')}
                />
              </label>
            ) : null}
            {place.error ? <p className="text-sm font-medium text-red-600">{place.error}</p> : null}
            <button type="submit" className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">
              {place.pending ? t('placing_order') : t('place_pickup_order')}
            </button>
            <p className="text-center text-xs text-neutral-400">{t('pay_at_store_note')}</p>
          </form>
        </div>
      </div>
    </main>
  )
}
