import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListExchangeLeads, adminUpdateExchangeStatus, EXCHANGE_LEAD_STATUSES } from '@/server/exchange'
import { AdminNav } from '@/components/AdminNav'
import { useOptimisticAction } from '@/lib/actions'
import type { ExchangeLead } from '@/db/schema'

export const Route = createFileRoute('/admin/exchanges')({
  component: AdminExchangesPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ leads: await adminListExchangeLeads() }),
})

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  contacted: 'bg-blue-100 text-blue-700',
  converted: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-neutral-100 text-neutral-500',
}

function AdminExchangesPage() {
  const { leads } = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/exchanges" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Old phone exchange leads</h1>
        <p className="mt-1 text-neutral-500">Customers who claimed an instant exchange estimate. Follow up before it goes cold.</p>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Old phone</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Estimate</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leads.map((l) => (
                <ExchangeRow key={l.id} lead={l} />
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">No exchange claims yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function ExchangeRow({ lead }: { lead: ExchangeLead }) {
  const update = useOptimisticAction({
    value: { status: lead.status },
    update: (_, status: string) => ({ status }),
    action: (status: string) => adminUpdateExchangeStatus({ data: { id: lead.id, status: status as (typeof EXCHANGE_LEAD_STATUSES)[number] } }),
  })

  return (
    <tr>
      <td className="px-4 py-3 font-bold text-brand-700">{lead.claimCode}</td>
      <td className="px-4 py-3 text-neutral-800">{lead.oldBrand} {lead.oldModel} · {lead.purchaseYear} · {lead.condition}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-neutral-900">{lead.customerName}</p>
        <p className="text-xs text-neutral-500">{lead.phone}</p>
      </td>
      <td className="px-4 py-3 font-semibold text-neutral-900">₹{lead.estimatedValue.toLocaleString('en-IN')}</td>
      <td className="px-4 py-3">
        <select
          value={update.value.status}
          onChange={(e) => update.run(e.target.value)}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[update.value.status] ?? 'bg-neutral-100 text-neutral-600'}`}
        >
          {EXCHANGE_LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
    </tr>
  )
}
