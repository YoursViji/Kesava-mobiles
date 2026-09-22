import { useMemo, useState } from 'react'
import { Landmark } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const TENURES = [3, 6, 9, 12, 18, 24]
const ANNUAL_RATE = 13 // flat indicative rate for no-cost/standard EMI comparison shown in-store

export function EmiCalculator({ price }: { price: number }) {
  const { t } = useLang()
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.2))
  const [tenure, setTenure] = useState(9)

  const emi = useMemo(() => {
    const principal = Math.max(price - downPayment, 0)
    if (principal <= 0) return 0
    const monthlyRate = ANNUAL_RATE / 12 / 100
    const factor = Math.pow(1 + monthlyRate, tenure)
    const value = (principal * monthlyRate * factor) / (factor - 1)
    return Math.round(value)
  }, [price, downPayment, tenure])

  const maxDown = Math.max(price - 1000, 0)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Landmark size={16} />
        </span>
        <h3 className="font-bold text-neutral-900">{t('emi_title')}</h3>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">{t('emi_down_payment')}</span>
          <span className="font-semibold text-neutral-900">₹{downPayment.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxDown}
          step={500}
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          className="mt-2 w-full accent-brand-600"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm text-neutral-500">{t('emi_tenure')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TENURES.map((m) => (
            <button
              key={m}
              onClick={() => setTenure(m)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                tenure === m ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
              }`}
            >
              {m} {t('months')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-brand-50 p-4 text-center">
        <p className="text-xs font-medium text-brand-700">{t('emi_monthly_estimate')}</p>
        <p className="mt-1 text-2xl font-extrabold text-brand-800">₹{emi.toLocaleString('en-IN')} <span className="text-sm font-medium">/ {t('month')}</span></p>
        <p className="mt-1 text-xs text-neutral-500">{t('emi_disclaimer')}</p>
      </div>
    </div>
  )
}
