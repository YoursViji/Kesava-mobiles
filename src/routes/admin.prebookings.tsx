import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListPreBookings, adminUpdatePreBookingStatus, PRE_BOOKING_STATUSES } from '@/server/launches'
import { AdminNav } from '@/components/AdminNav'
import { useOptimisticAction } from '@/lib/actions'
import type { PreBooking } from '@/db/schema'

export const Route = createFileRoute('/admin/prebookings')({
  component: AdminPreBookingsPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ bookings: await adminListPreBookings() }),
})

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  notified: 'bg-blue-100 text-blue-700',
  converted: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

function AdminPreBookingsPage() {
  const { bookings } = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/prebookings" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">New launch pre-bookings</h1>
        <p className="mt-1 text-neutral-500">Follow up when stock arrives, or mark a token as converted into a sale.</p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Launch</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Booked</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.map((b) => (
                <PreBookingRow key={b.id} booking={b} />
              ))}
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">No pre-bookings yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function PreBookingRow({ booking }: { booking: PreBooking }) {
  const update = useOptimisticAction({
    value: { status: booking.status },
    update: (_, status: string) => ({ status }),
    action: (status: string) => adminUpdatePreBookingStatus({ data: { id: booking.id, status: status as (typeof PRE_BOOKING_STATUSES)[number] } }),
  })

  return (
    <tr>
      <td className="px-4 py-3 font-bold text-brand-700">{booking.bookingCode}</td>
      <td className="px-4 py-3 text-neutral-800">{booking.launchName}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-neutral-900">{booking.customerName}</p>
        <p className="text-xs text-neutral-500">{booking.phone}{booking.email ? ` · ${booking.email}` : ''}</p>
      </td>
      <td className="px-4 py-3 font-semibold text-neutral-900">₹{booking.tokenAmount.toLocaleString('en-IN')}</td>
      <td className="px-4 py-3 text-neutral-500">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</td>
      <td className="px-4 py-3">
        <select
          value={update.value.status}
          onChange={(e) => update.run(e.target.value)}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[update.value.status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
          {PRE_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
    </tr>
  )
}
