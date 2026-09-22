import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListOrders } from '@/server/orders'
import { AdminNav } from '@/components/AdminNav'

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
            <div key={order.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-brand-600">{order.orderCode}</p>
                  <p className="mt-0.5 font-semibold text-neutral-900">{order.customerName} · {order.phone}</p>
                  <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <p className="text-lg font-extrabold text-neutral-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.quantity} × {item.name}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {orders.length === 0 ? <p className="text-neutral-400">No pickup orders yet.</p> : null}
        </div>
      </div>
    </main>
  )
}
