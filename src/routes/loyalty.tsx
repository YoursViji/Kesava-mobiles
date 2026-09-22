import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Gift, Copy, Check } from 'lucide-react'
import { getLoyaltyStatus, redeemReferralCode } from '@/server/loyalty'
import { useAction } from '@/lib/actions'
import { useLang } from '@/lib/i18n'

export const Route = createFileRoute('/loyalty')({ component: LoyaltyPage })

type Status = { points: number; referralCode: string; usedReferralCode: string | null; redeemableRupees: number }

function LoyaltyPage() {
  const { t } = useLang()
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<Status | null>(null)
  const [referralInput, setReferralInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [redeemResult, setRedeemResult] = useState<{ ok: boolean; message?: string } | null>(null)

  const check = useAction(() => getLoyaltyStatus({ data: phone }), {
    onSuccess: (data) => setStatus(data),
  })

  const redeem = useAction(redeemReferralCode, {
    onSuccess: (result) => {
      setRedeemResult(result)
      if (result.ok && status) setStatus({ ...status, usedReferralCode: referralInput.trim().toUpperCase() })
      if (result.ok) setReferralInput('')
    },
  })

  const copyCode = () => {
    if (!status) return
    navigator.clipboard?.writeText(status.referralCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        <Gift size={13} /> {t('nav_loyalty')}
      </span>
      <h1 className="mt-3 text-2xl font-bold text-neutral-900">{t('loyalty_title')}</h1>
      <p className="mt-2 text-neutral-600">{t('loyalty_subtitle')}</p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-bold text-neutral-900">{t('loyalty_check_title')}</h2>
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            check.run()
          }}
        >
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input flex-1"
            placeholder={t('field_phone')}
          />
          <button type="submit" className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            {check.pending ? t('loyalty_checking') : t('loyalty_check_btn')}
          </button>
        </form>
        {check.error ? <p className="mt-2 text-sm font-medium text-red-600">{check.error}</p> : null}

        {status ? (
          <div className="mt-5 space-y-4 border-t border-neutral-100 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand-50 p-4">
              <div>
                <p className="text-xs font-medium text-brand-600">{t('loyalty_points_label')}</p>
                <p className="text-3xl font-extrabold text-brand-800">{status.points}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-brand-600">{t('loyalty_worth_label')}</p>
                <p className="text-xl font-bold text-brand-800">₹{status.redeemableRupees.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <p className="text-xs font-medium text-neutral-500">{t('loyalty_your_code_label')}</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-lg font-extrabold tracking-widest text-neutral-900">{status.referralCode}</p>
                <button onClick={copyCode} className="rounded-full border border-neutral-200 p-1.5 text-neutral-500 hover:border-brand-400 hover:text-brand-600">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-500">{t('loyalty_your_code_note')}</p>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <p className="font-semibold text-neutral-900">{t('loyalty_redeem_title')}</p>
              <p className="mt-1 text-sm text-neutral-500">{t('loyalty_redeem_text')}</p>
              {status.usedReferralCode ? (
                <p className="mt-3 text-sm font-medium text-neutral-500">{t('loyalty_already_used')}</p>
              ) : redeemResult?.ok ? (
                <p className="mt-3 text-sm font-medium text-emerald-600">{t('loyalty_success')}</p>
              ) : (
                <form
                  className="mt-3 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    redeem.run({ data: { phone, referralCode: referralInput } })
                  }}
                >
                  <input
                    required
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="input flex-1 uppercase"
                    placeholder={t('loyalty_referral_field')}
                  />
                  <button type="submit" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                    {redeem.pending ? t('loyalty_redeeming') : t('loyalty_redeem_btn')}
                  </button>
                </form>
              )}
              {redeemResult && !redeemResult.ok ? <p className="mt-2 text-sm font-medium text-red-600">{redeemResult.message}</p> : null}
              {redeem.error ? <p className="mt-2 text-sm font-medium text-red-600">{redeem.error}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
