import { createFileRoute, redirect } from '@tanstack/react-router'
import { Truck } from 'lucide-react'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListOrders, adminUpdateDeliveryStatus } from '@/server/orders'
import { DELIVERY_STATUSES } from '@/data/options'
import { AdminNav } from '@/components/AdminNav'
import { useOptimisticAction } from '@/lib/actions'
import type { Order, OrderItem } from '@/db/schema'

export const Route = createFileRoute('/admin/sales')({
  component: AdminSalesPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ orders: await adminListOrders() }),
})

const DELIVERY_STATUS_STYLE: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
}

function OrderRow({ order }: { order: Order & { items: OrderItem[] } }) {
  const delivery = useOptimisticAction({
    value: { deliveryStatus: order.deliveryStatus ?? 'processing' },
    update: (_, status: string) => ({ deliveryStatus: status }),
    action: (status: string) =>
      adminUpdateDeliveryStatus({ data: { id: order.id, deliveryStatus: status as (typeof DELIVERY_STATUSES)[number] } }),
  })

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-600">{order.orderCode}</p>
          <p className="mt-0.5 font-semibold text-neutral-900">{order.customerName} · {order.phone}</p>
          <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${order.deliveryMode === 'delivery' ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600'}`}>
            {order.deliveryMode === 'delivery' ? 'Home delivery' : 'Store pickup'}
          </span>
        </div>
        <p className="text-lg font-extrabold text-neutral-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
      </div>
      {order.deliveryMode === 'delivery' ? (
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-xl bg-neutral-50 p-3">
          <div className="flex items-start gap-2 text-sm text-neutral-600">
            <Truck size={15} className="mt-0.5 shrink-0 text-brand-600" />
            <span>{order.deliveryAddress} <span className="text-neutral-400">(delivery fee ₹{order.deliveryFee})</span></span>
          </div>
          <select
            value={delivery.value.deliveryStatus}
            onChange={(e) => delivery.run(e.target.value)}
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold ${DELIVERY_STATUS_STYLE[delivery.value.deliveryStatus] ?? 'bg-neutral-100 text-neutral-600'}`}
          >
            {DELIVERY_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ) : null}
      <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>{item.quantity} × {item.name}</span>
            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AdminSalesPage() {
  const { orders } = Route.useLoaderData()
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/sales" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Sales</h1>
            <p className="mt-1 text-neutral-500">Every pickup order placed from the cart, newest first.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-right">
            <p className="text-xs text-neutral-500">Total value</p>
            <p className="text-xl font-extrabold text-neutral-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
          {orders.length === 0 ? <p className="text-neutral-400">No orders yet.</p> : null}
        </div>
      </div>
    </main>
  )
}
