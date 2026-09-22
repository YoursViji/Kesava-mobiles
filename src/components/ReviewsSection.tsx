import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Review } from '@/db/schema'
import { useAction } from '@/lib/actions'
import { addReview } from '@/server/reviews'
import { useLang } from '@/lib/i18n'

export function ReviewsSection({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const { t } = useLang()
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '' })
  const [showForm, setShowForm] = useState(false)

  const submit = useAction(addReview, {
    onSuccess: () => {
      setForm({ customerName: '', rating: 5, comment: '' })
      setShowForm(false)
    },
  })

  const average = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">{t('reviews_title')}</h2>
          {average ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
              <Star size={15} className="fill-amber-400 text-amber-400" /> {average.toFixed(1)} · {reviews.length} {t('reviews_count_label')}
            </p>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">{t('no_reviews_yet')}</p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border-2 border-brand-600 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50"
        >
          {t('write_review')}
        </button>
      </div>

      {showForm ? (
        <form
          className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit.run({ data: { productId, customerName: form.customerName, rating: form.rating, comment: form.comment } })
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">{t('field_name')}</span>
            <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input" />
          </label>
          <div className="mt-3">
            <span className="mb-1 block text-sm font-medium text-neutral-700">{t('your_rating')}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                  <Star size={22} className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'} />
                </button>
              ))}
            </div>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">{t('your_review')}</span>
            <textarea
              required
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="input resize-none"
              placeholder={t('review_placeholder')}
            />
          </label>
          {submit.error ? <p className="mt-2 text-sm font-medium text-red-600">{submit.error}</p> : null}
          <button type="submit" className="mt-3 w-full rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            {submit.pending ? t('submitting') : t('submit_review')}
          </button>
        </form>
      ) : null}

      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-neutral-900">{r.customerName}</p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={13} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'} />
                ))}
              </div>
            </div>
            <p className="mt-1.5 text-sm text-neutral-600">{r.comment}</p>
            <p className="mt-2 text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
