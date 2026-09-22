import { createFileRoute, redirect } from '@tanstack/react-router'
import { Star, Trash2 } from 'lucide-react'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListReviews, adminDeleteReview } from '@/server/reviews'
import { AdminNav } from '@/components/AdminNav'
import { useAction } from '@/lib/actions'

export const Route = createFileRoute('/admin/reviews')({
  component: AdminReviewsPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ reviews: await adminListReviews() }),
})

function AdminReviewsPage() {
  const { reviews } = Route.useLoaderData()
  const remove = useAction(adminDeleteReview)

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/reviews" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Reviews</h1>
        <p className="mt-1 text-neutral-500">Remove a review that is spam, abusive or off-topic.</p>

        <div className="mt-6 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-neutral-900">{r.customerName}</p>
                  <span className="text-xs text-neutral-400">on {r.productName}</span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'} />
                  ))}
                </div>
                <p className="mt-1.5 text-sm text-neutral-600">{r.comment}</p>
                <p className="mt-1 text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <button
                onClick={() => remove.run({ data: r.id })}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={13} /> {remove.pending ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))}
          {reviews.length === 0 ? <p className="text-neutral-400">No reviews yet.</p> : null}
        </div>
      </div>
    </main>
  )
}
