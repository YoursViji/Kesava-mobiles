import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Smartphone, PackageX, ShoppingBag, Wrench, Sparkles, CalendarClock } from 'lucide-react'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin, adminDashboardStats } from '@/server/admin'
import { AdminNav } from '@/components/AdminNav'

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ stats: await adminDashboardStats() }),
})

function AdminDashboard() {
  const { stats } = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-neutral-500">A quick look at the store right now.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={<Smartphone size={18} />} label="Products in catalogue" value={stats.productCount} to="/admin/products" />
          <StatCard icon={<PackageX size={18} />} label="Marked sold out" value={stats.outOfStock} to="/admin/products" tone="warn" />
          <StatCard icon={<ShoppingBag size={18} />} label="Pickup orders" value={stats.orderCount} to="/admin/sales" />
          <StatCard icon={<Wrench size={18} />} label="Newly received repairs" value={stats.openServices} to="/admin/services" tone="warn" />
          <StatCard icon={<Sparkles size={18} />} label="Pending pre-bookings" value={stats.pendingPreBookings} to="/admin/prebookings" />
          <StatCard icon={<CalendarClock size={18} />} label="Upcoming demo visits" value={stats.upcomingDemos} to="/admin/demos" />
        </div>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-bold text-neutral-900">Where to go next</h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>• Add or update a phone or accessory, change its price, or mark it sold out under <Link to="/admin/products" className="font-semibold text-brand-600 hover:underline">Mobiles & Accessories</Link>.</li>
            <li>• Add a new promotional banner or edit/remove an existing one under <Link to="/admin/promotions" className="font-semibold text-brand-600 hover:underline">Promotions & Discounts</Link>.</li>
            <li>• Move a repair through received → diagnosed → quoted → repairing → ready → completed, and add the quote, under <Link to="/admin/services" className="font-semibold text-brand-600 hover:underline">Service Bookings</Link>.</li>
            <li>• Follow up on new launch reservations, in-store demo visits and old-phone exchange leads before they go cold.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  to,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  to: string
  tone?: 'warn'
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
          tone === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
    </Link>
  )
}
