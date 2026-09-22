import { useState } from 'react'
import { CalendarClock, CheckCircle2 } from 'lucide-react'
import { useAction } from '@/lib/actions'
import { createDemoBooking } from '@/server/demo'
import { useLang } from '@/lib/i18n'

export function DemoBookingForm({ productId, productName }: { productId: string; productName: string }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customerName: '', phone: '', preferredDate: '', preferredTime: '' })
  const [confirmed, setConfirmed] = useState<{ bookingCode: string } | null>(null)

  const book = useAction(createDemoBooking, {
    onSuccess: (data) => setConfirmed({ bookingCode: data.bookingCode }),
  })

  if (confirmed) {
    return (
      <div className="mt-4 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-5 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
        <p className="mt-2 font-bold text-neutral-900">{t('demo_confirm_title')}</p>
        <p className="mt-1 text-sm text-neutral-600">{t('demo_confirm_text')}</p>
        <p className="mt-3 text-xl font-extrabold tracking-widest text-brand-700">{confirmed.bookingCode}</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border-2 border-neutral-300 px-5 py-3 text-sm font-bold text-neutral-700 hover:border-brand-400"
      >
        <CalendarClock size={16} /> {t('demo_book_btn')}
      </button>
    )
  }

  return (
    <div className="mt-4 w-full rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="font-bold text-neutral-900">{t('demo_book_title')}</p>
      <p className="mt-1 text-sm text-neutral-500">{t('demo_book_text')}</p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          book.run({ data: { productId, productName, ...form } })
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">{t('field_name')}</span>
          <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">{t('field_phone')}</span>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="10-digit mobile" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">{t('field_date')}</span>
          <input required type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="input" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">{t('field_time')}</span>
          <input required type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="input" />
        </label>
        {book.error ? <p className="col-span-2 text-sm font-medium text-red-600">{book.error}</p> : null}
        <div className="col-span-2 flex gap-2">
          <button type="submit" className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            {book.pending ? t('demo_booking_pending') : t('demo_book_btn')}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-neutral-300 px-4 text-sm font-semibold text-neutral-600">
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
