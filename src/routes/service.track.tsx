import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import {
  Search,
  PackageCheck,
  Stethoscope,
  FileText,
  Wrench,
  Sparkles,
  CheckCircle2,
  CreditCard,
} from 'lucide-react'
import { getBookingByCode, payServiceBooking } from '@/server/service'
import { useAction } from '@/lib/actions'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const searchSchema = z.object({ code: z.string().optional() })

export const Route = createFileRoute('/service/track')({
  component: TrackPage,
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ deps }) => {
    if (!deps.code) return { result: null }
    const result = await getBookingByCode({ data: deps.code })
    return { result }
  },
})

const STEPS = [
  { key: 'received', label: 'Received', icon: PackageCheck },
  { key: 'diagnosed', label: 'Diagnosed', icon: Stethoscope },
  { key: 'quoted', label: 'Quoted', icon: FileText },
  { key: 'repairing', label: 'Repairing', icon: Wrench },
  { key: 'ready', label: 'Ready', icon: Sparkles },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
] as const

function TrackPage() {
  const { result } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [code, setCode] = useState(search.code ?? '')

  const searched = Boolean(search.code)
  const stepIndex = result ? STEPS.findIndex((s) => s.key === result.booking.status) : -1
  const { t } = useLang()

  const pay = useAction(payServiceBooking, {})

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('track_title')}</h1>
      <p className="mt-1 text-neutral-500">{t('track_subtitle')}</p>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          navigate({ search: { code: code.trim() || undefined } })
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. KM-AB12CD"
            className="w-full rounded-full border border-neutral-300 bg-white py-3 pl-10 pr-4 text-sm uppercase tracking-wide outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button type="submit" className="rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">
          {t('track_btn')}
        </button>
      </form>

      {searched && !result ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 py-14 text-center">
          <p className="text-lg font-semibold text-neutral-800">{t('track_notfound_title')}</p>
          <p className="mt-1 text-sm text-neutral-500">{t('track_notfound_sub')}</p>
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{result.booking.trackingCode}</p>
                <p className="mt-0.5 text-lg font-bold text-neutral-900">
                  {result.booking.deviceBrand} {result.booking.deviceModel}
                </p>
                <p className="text-sm text-neutral-500">{result.booking.serviceType} · booked by {result.booking.customerName}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold capitalize',
                  result.booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700',
                )}
              >
                {result.booking.status}
              </span>
            </div>
            <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">"{result.booking.issueDescription}"</p>

            <div className="mt-6 flex items-center overflow-x-auto pb-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const done = i <= stepIndex
                return (
                  <div key={s.key} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-full border-2',
                          done ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-200 bg-white text-neutral-400',
                        )}
                      >
                        <Icon size={16} />
                      </span>
                      <span className={cn('text-[11px] font-medium', done ? 'text-brand-700' : 'text-neutral-400')}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 ? (
                      <span className={cn('mx-1 h-0.5 flex-1', i < stepIndex ? 'bg-brand-600' : 'bg-neutral-200')} />
                    ) : null}
                  </div>
                )
              })}
            </div>

            {result.booking.quoteAmount ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div>
                  <p className="text-sm text-neutral-500">Repair quote</p>
                  <p className="text-2xl font-extrabold text-neutral-900">₹{result.booking.quoteAmount.toLocaleString('en-IN')}</p>
                </div>
                {result.booking.paymentStatus === 'paid' ? (
                  <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                    <CheckCircle2 size={16} /> Paid
                  </span>
                ) : (
                  <button
                    onClick={() => pay.run({ data: result.booking.trackingCode })}
                    className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
                  >
                    <CreditCard size={16} /> {pay.pending ? t('pay_processing') : t('pay_btn')}
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{t('no_quote_yet')}</p>
            )}
            {pay.error ? <p className="mt-3 text-sm font-medium text-red-600">{pay.error}</p> : null}

            <h2 className="mt-8 text-sm font-semibold text-neutral-900">{t('status_history')}</h2>
            <ul className="mt-3 space-y-3 border-l-2 border-neutral-100 pl-4">
              {result.updates.map((u) => (
                <li key={u.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <p className="font-medium capitalize text-neutral-800">{u.status}</p>
                  {u.note ? <p className="text-neutral-500">{u.note}</p> : null}
                  <p className="text-xs text-neutral-400">{new Date(u.createdAt).toLocaleString('en-IN')}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {!searched ? (
        <EmptyHint />
      ) : null}
    </main>
  )
}

function EmptyHint(): ReactNode {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
      Just booked a service? Your confirmation page showed a tracking code starting with{' '}
      <span className="font-semibold text-neutral-700">KM-</span>. Enter it above to follow your repair from
      received to completed, and pay online the moment a quote is ready.
    </div>
  )
}
