import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListServiceBookings, adminUpdateServiceStatus, SERVICE_STATUSES } from '@/server/service'
import { AdminNav } from '@/components/AdminNav'
import { useAction } from '@/lib/actions'
import type { ServiceBooking } from '@/db/schema'

export const Route = createFileRoute('/admin/services')({
  component: AdminServicesPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ bookings: await adminListServiceBookings() }),
})

const STATUS_STYLE: Record<string, string> = {
  received: 'bg-neutral-100 text-neutral-700',
  diagnosed: 'bg-blue-100 text-blue-700',
  quoted: 'bg-amber-100 text-amber-700',
  repairing: 'bg-brand-100 text-brand-700',
  ready: 'bg-purple-100 text-purple-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

function AdminServicesPage() {
  const { bookings } = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/services" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Service bookings</h1>
        <p className="mt-1 text-neutral-500">Move each repair through its steps and add the quote once it is ready.</p>

        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <ServiceRow key={b.id} booking={b} />
          ))}
          {bookings.length === 0 ? <p className="text-neutral-400">No service bookings yet.</p> : null}
        </div>
      </div>
    </main>
  )
}

function ServiceRow({ booking }: { booking: ServiceBooking }) {
  const [status, setStatus] = useState<(typeof SERVICE_STATUSES)[number]>(
    SERVICE_STATUSES.includes(booking.status as (typeof SERVICE_STATUSES)[number])
      ? (booking.status as (typeof SERVICE_STATUSES)[number])
      : 'received',
  )
  const [quote, setQuote] = useState(booking.quoteAmount ? String(booking.quoteAmount) : '')

  const update = useAction(adminUpdateServiceStatus)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-600">{booking.trackingCode}</p>
          <p className="mt-0.5 font-semibold text-neutral-900">
            {booking.deviceBrand} {booking.deviceModel} · {booking.serviceType}
          </p>
          <p className="text-sm text-neutral-500">
            {booking.customerName} · {booking.phone} · {booking.deliveryMode === 'doorstep' ? `Doorstep pickup: ${booking.pickupAddress}` : 'Store drop-off'}
          </p>
          <p className="mt-1 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">&quot;{booking.issueDescription}&quot;</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLE[booking.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Move to status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as (typeof SERVICE_STATUSES)[number])} className="input">
            {SERVICE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-neutral-700">Quote amount (₹)</span>
          <input type="number" min={0} value={quote} onChange={(e) => setQuote(e.target.value)} className="input w-36" placeholder="e.g. 1499" />
        </label>
        <button
          onClick={() =>
            update.run({
              data: { id: booking.id, status, quoteAmount: quote ? Number(quote) : undefined },
            })
          }
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          {update.pending ? 'Updating…' : 'Update booking'}
        </button>
        {booking.paymentStatus === 'paid' ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">Paid</span>
        ) : (
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-500">Unpaid</span>
        )}
      </div>
      {update.error ? <p className="mt-2 text-sm font-medium text-red-600">{update.error}</p> : null}
    </div>
  )
}
