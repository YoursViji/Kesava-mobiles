import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Wrench, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { useAction } from '@/lib/actions'
import { createServiceBooking, serviceTypes, deliveryModes } from '@/server/service'
import { estimateRepairRange } from '@/lib/repairEstimate'
import { useLang } from '@/lib/i18n'

export const Route = createFileRoute('/service/')({ component: ServicePage })

const DEVICE_BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'realme', 'vivo', 'iQOO', 'POCO', 'Other']

function ServicePage() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    deviceBrand: '',
    deviceModel: '',
    serviceType: serviceTypes[0] as (typeof serviceTypes)[number],
    issueDescription: '',
    preferredDate: '',
    preferredTime: '',
    deliveryMode: deliveryModes[0] as (typeof deliveryModes)[number],
    pickupAddress: '',
  })
  const [result, setResult] = useState<{ trackingCode: string } | null>(null)

  const { t } = useLang()
  const book = useAction(createServiceBooking, {
    onSuccess: (data) => setResult({ trackingCode: data.trackingCode }),
  })

  if (result) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={56} />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">{t('confirm_title')}</h1>
        <p className="mt-2 text-neutral-600">{t('confirm_text')}</p>
        <p className="mt-5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 py-4 text-2xl font-extrabold tracking-widest text-brand-700">
          {result.trackingCode}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/service/track" search={{ code: result.trackingCode }} className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
            {t('track_this')}
          </Link>
          <Link to="/" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold text-neutral-700">
            {t('back_home')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1.3fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Wrench size={13} /> {t('service_badge')}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-neutral-900">{t('service_book_title')}</h1>
          <p className="mt-2 text-neutral-600">{t('service_book_text')}</p>
          <ul className="mt-6 space-y-3 text-sm text-neutral-600">
            <li className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 text-brand-600" /> {t('service_li_warranty')}</li>
            <li className="flex gap-2"><Clock size={16} className="mt-0.5 text-brand-600" /> {t('service_li_time')}</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="font-semibold text-neutral-900">{t('repair_estimator_title')}</p>
            <p className="mt-1 text-sm text-neutral-500">{t('repair_estimator_text')}</p>
            <RepairEstimateCard brand={form.deviceBrand} serviceType={form.serviceType} />
          </div>
        </div>

        <form
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            book.run({
              data: {
                ...form,
                serviceType: form.serviceType as (typeof serviceTypes)[number],
                deliveryMode: form.deliveryMode,
              },
            })
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('field_name')}>
              <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input" />
            </Field>
            <Field label={t('field_phone')}>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="10-digit mobile" />
            </Field>
            <Field label={t('field_email')}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </Field>
            <Field label={t('field_brand')}>
              <select required value={form.deviceBrand} onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })} className="input">
                <option value="">Select brand</option>
                {DEVICE_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label={t('field_model')}>
              <input required value={form.deviceModel} onChange={(e) => setForm({ ...form, deviceModel: e.target.value })} className="input" placeholder="e.g. Galaxy M31" />
            </Field>
            <Field label={t('field_type')}>
              <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value as (typeof serviceTypes)[number] })} className="input">
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label={t('field_date')}>
              <input required type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="input" />
            </Field>
            <Field label={t('field_time')}>
              <input required type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label={t('field_issue')} className="mt-4">
            <textarea
              required
              rows={3}
              value={form.issueDescription}
              onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
              className="input resize-none"
              placeholder="e.g. Screen cracked, battery drains fast, phone won't switch on…"
            />
          </Field>

          <div className="mt-4">
            <span className="mb-2 block text-sm font-medium text-neutral-700">{t('field_delivery_mode')}</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {deliveryModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm({ ...form, deliveryMode: mode })}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold ${
                    form.deliveryMode === mode ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                  }`}
                >
                  {mode === 'doorstep' ? t('delivery_doorstep') : t('delivery_store_dropoff')}
                </button>
              ))}
            </div>
          </div>

          {form.deliveryMode === 'doorstep' ? (
            <Field label={t('field_pickup_address')} className="mt-4">
              <input
                required
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                className="input"
                placeholder={t('pickup_address_placeholder')}
              />
            </Field>
          ) : null}

          {book.error ? <p className="mt-3 text-sm font-medium text-red-600">{book.error}</p> : null}

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {book.pending ? t('booking_pending') : t('book_btn')}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm ${className ?? ''}`}>
      <span className="mb-1 block font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  )
}

function RepairEstimateCard({ brand, serviceType }: { brand: string; serviceType: string }) {
  const { t } = useLang()
  const { min, max } = estimateRepairRange(brand || 'Other', serviceType)
  return (
    <div className="mt-4 rounded-xl bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{t('repair_estimate_label')}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand-700">
        ₹{min.toLocaleString('en-IN')} – ₹{max.toLocaleString('en-IN')}
      </p>
      <p className="mt-1 text-xs text-neutral-400">{t('repair_estimate_note')}</p>
    </div>
  )
}
