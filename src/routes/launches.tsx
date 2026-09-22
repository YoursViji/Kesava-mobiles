import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Sparkles, CalendarClock, CheckCircle2, Smartphone } from 'lucide-react'
import { listUpcomingLaunches, createPreBooking } from '@/server/launches'
import { useAction } from '@/lib/actions'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { PreLaunch } from '@/db/schema'

export const Route = createFileRoute('/launches')({
  component: LaunchesPage,
  loader: async () => ({ launches: await listUpcomingLaunches() }),
})

function LaunchesPage() {
  const { launches } = Route.useLoaderData()
  const { t } = useLang()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        <Sparkles size={13} /> {t('nav_launches')}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-neutral-900">{t('launches_title')}</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{t('launches_subtitle')}</p>

      {launches.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-lg font-semibold text-neutral-800">{t('no_launches_title')}</p>
          <p className="mt-1 text-sm text-neutral-500">{t('no_launches_sub')}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      )}
    </main>
  )
}

function LaunchCard({ launch }: { launch: PreLaunch }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customerName: '', phone: '', email: '' })
  const [confirmed, setConfirmed] = useState<{ bookingCode: string } | null>(null)

  const prebook = useAction(createPreBooking, {
    onSuccess: (data) => setConfirmed({ bookingCode: data.bookingCode }),
  })

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className={cn('flex h-32 items-center justify-center rounded-xl bg-gradient-to-br', launch.colorFrom, launch.colorTo)}>
        {launch.imageUrl ? (
          <img src={launch.imageUrl} alt={launch.name} className="h-full w-full object-contain p-4" />
        ) : (
          <Smartphone className="text-white/80" size={48} strokeWidth={1.25} />
        )}
      </div>
      <p className="mt-3 text-xs font-semibold text-brand-600">{launch.brand} · {launch.expectedDate}</p>
      <h2 className="mt-0.5 text-lg font-bold text-neutral-900">{launch.name}</h2>
      <p className="mt-1 text-sm text-neutral-500">{launch.description}</p>
      <p className="mt-3 text-sm text-neutral-600">
        {t('launches_expected_price')}: <span className="font-semibold text-neutral-900">{launch.expectedPrice}</span>
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        {t('launches_token_label')}: <span className="font-semibold text-brand-700">₹{launch.tokenAmount.toLocaleString('en-IN')}</span>
      </p>

      {confirmed ? (
        <div className="mt-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 p-4 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={24} />
          <p className="mt-1 text-sm font-bold text-neutral-900">{t('prebook_confirm_title')}</p>
          <p className="mt-1 text-xs text-neutral-600">{t('prebook_confirm_text')}</p>
          <p className="mt-2 text-lg font-extrabold tracking-widest text-brand-700">{confirmed.bookingCode}</p>
        </div>
      ) : open ? (
        <form
          className="mt-4 space-y-2 border-t border-neutral-100 pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            prebook.run({ data: { launchId: launch.id, ...form } })
          }}
        >
          <p className="text-sm font-semibold text-neutral-800">{t('prebook_title')}</p>
          <input required placeholder={t('field_name')} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input" />
          <input required placeholder={t('field_phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          <input type="email" placeholder={t('field_email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          {prebook.error ? <p className="text-sm font-medium text-red-600">{prebook.error}</p> : null}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
              {prebook.pending ? t('prebook_pending') : t('launches_token_label')}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-600">
              {t('cancel')}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          <CalendarClock size={15} /> {t('prebook_btn')}
        </button>
      )}
    </div>
  )
}
