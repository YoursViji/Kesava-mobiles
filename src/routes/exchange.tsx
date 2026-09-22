import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Repeat, CheckCircle2, IndianRupee } from 'lucide-react'
import { useAction } from '@/lib/actions'
import { claimExchangeEstimate } from '@/server/exchange'
import { EXCHANGE_BRANDS, EXCHANGE_CONDITIONS, estimateExchangeValue, type ExchangeCondition } from '@/lib/exchangeEstimate'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/exchange')({ component: ExchangePage })

const YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)

function ExchangePage() {
  const { t } = useLang()
  const [brand, setBrand] = useState<string>('Apple')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(YEARS[2])
  const [condition, setCondition] = useState<ExchangeCondition>('Good')
  const [claimForm, setClaimForm] = useState({ customerName: '', phone: '' })
  const [claimed, setClaimed] = useState<{ claimCode: string; estimatedValue: number } | null>(null)

  const estimate = useMemo(() => estimateExchangeValue(brand, model, year, condition), [brand, model, year, condition])

  const claim = useAction(claimExchangeEstimate, {
    onSuccess: (data) => setClaimed(data),
  })

  if (claimed) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{t('exchange_claimed_title')}</h1>
        <p className="mt-2 text-neutral-600">{t('exchange_claimed_text').replace('{store}', STORE.name)}</p>
        <p className="mt-5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 py-4">
          <span className="block text-xs font-semibold uppercase tracking-wide text-brand-600">{t('exchange_bonus_label')}</span>
          <span className="text-2xl font-extrabold text-brand-800">₹{claimed.estimatedValue.toLocaleString('en-IN')}</span>
        </p>
        <p className="mt-3 text-sm font-medium text-neutral-700">
          {t('claim_code_label')}: <span className="font-bold tracking-wide text-brand-700">{claimed.claimCode}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/mobiles" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
            {t('home_find_mobile')}
          </Link>
          <Link to="/contact" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-neutral-700">
            {t('nav_contact')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        <Repeat size={13} /> {t('exchange_badge_label')}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-neutral-900">{t('exchange_title')}</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{t('exchange_subtitle')}</p>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('exchange_field_brand')}</span>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input">
                {EXCHANGE_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('exchange_field_model')}</span>
              <input value={model} onChange={(e) => setModel(e.target.value)} className="input" placeholder="e.g. Galaxy M31" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('exchange_field_year')}</span>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input">
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <span className="mb-2 block text-sm font-medium text-neutral-700">{t('exchange_field_condition')}</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EXCHANGE_CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    'rounded-xl border-2 px-3 py-2.5 text-sm font-semibold',
                    condition === c ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-brand-300',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-neutral-900 p-5 text-center text-white">
            <p className="flex items-center justify-center gap-1 text-xs font-medium text-neutral-300">
              <IndianRupee size={13} /> {t('exchange_estimate_label')}
            </p>
            <p className="mt-1 text-3xl font-extrabold">₹{estimate.toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-neutral-400">{t('exchange_disclaimer')}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-bold text-neutral-900">{t('exchange_claim_title')}</h2>
          <p className="mt-1 text-sm text-neutral-500">{t('exchange_claim_text')}</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              claim.run({
                data: {
                  customerName: claimForm.customerName,
                  phone: claimForm.phone,
                  oldBrand: brand as (typeof EXCHANGE_BRANDS)[number],
                  oldModel: model || 'Not specified',
                  purchaseYear: year,
                  condition,
                },
              })
            }}
          >
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('field_name')}</span>
              <input required value={claimForm.customerName} onChange={(e) => setClaimForm({ ...claimForm, customerName: e.target.value })} className="input" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">{t('field_phone')}</span>
              <input required value={claimForm.phone} onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })} className="input" placeholder="10-digit mobile" />
            </label>
            {claim.error ? <p className="text-sm font-medium text-red-600">{claim.error}</p> : null}
            <button type="submit" className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">
              {claim.pending ? t('claiming') : t('claim_estimate_btn')}
            </button>
            <p className="text-center text-xs text-neutral-400">{t('claim_valid_note')}</p>
          </form>
        </div>
      </div>
    </main>
  )
}
