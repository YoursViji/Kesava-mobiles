import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Repeat, Landmark, BadgePercent, Sparkles, ShieldCheck } from 'lucide-react'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListPromotions, adminSavePromotion, adminDeletePromotion, PROMO_ICONS } from '@/server/promotions'
import { AdminNav } from '@/components/AdminNav'
import { useAction } from '@/lib/actions'
import type { Promotion } from '@/db/schema'

export const Route = createFileRoute('/admin/promotions')({
  component: AdminPromotionsPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ promotions: await adminListPromotions() }),
})

const ICONS = { repeat: Repeat, landmark: Landmark, 'badge-percent': BadgePercent, sparkles: Sparkles, 'shield-check': ShieldCheck } as const

type FormState = { id?: string; title: string; text: string; icon: (typeof PROMO_ICONS)[number]; active: boolean; sortOrder: string }
const BLANK: FormState = { title: '', text: '', icon: 'badge-percent', active: true, sortOrder: '0' }

function AdminPromotionsPage() {
  const { promotions } = Route.useLoaderData()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(BLANK)

  const save = useAction(adminSavePromotion, {
    onSuccess: () => {
      setFormOpen(false)
      setForm(BLANK)
    },
  })

  const openNew = () => {
    setForm(BLANK)
    setFormOpen(true)
  }
  const openEdit = (p: Promotion) => {
    setForm({ id: p.id, title: p.title, text: p.text, icon: p.icon as FormState['icon'], active: p.active, sortOrder: String(p.sortOrder) })
    setFormOpen(true)
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/promotions" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Promotions & Discounts</h1>
            <p className="mt-1 text-neutral-500">
              These banners show on the Offers page. Per-product prices and discounts are edited from Mobiles & Accessories.
            </p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            <Plus size={16} /> Add promotion
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {promotions.map((p) => (
            <PromotionCard key={p.id} promotion={p} onEdit={() => openEdit(p)} />
          ))}
          {promotions.length === 0 ? <p className="text-neutral-400">No promotions yet. Add one to show it on the Offers page.</p> : null}
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{form.id ? 'Edit promotion' : 'Add promotion'}</h2>
              <button onClick={() => setFormOpen(false)} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
                <X size={18} />
              </button>
            </div>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                save.run({
                  data: {
                    id: form.id,
                    title: form.title,
                    text: form.text,
                    icon: form.icon,
                    active: form.active,
                    sortOrder: Number(form.sortOrder) || 0,
                  },
                })
              }}
            >
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-700">Title</span>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-700">Description</span>
                <textarea required rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="input resize-none" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-700">Icon</span>
                  <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value as FormState['icon'] })} className="input">
                    {PROMO_ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-700">Order</span>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="input" />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4" />
                Active (visible on the Offers page)
              </label>
              {save.error ? <p className="text-sm font-medium text-red-600">{save.error}</p> : null}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                  {save.pending ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  )
}

function PromotionCard({ promotion, onEdit }: { promotion: Promotion; onEdit: () => void }) {
  const Icon = ICONS[promotion.icon as keyof typeof ICONS] ?? BadgePercent
  const remove = useAction(adminDeletePromotion)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
          <Icon size={18} />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${promotion.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
          {promotion.active ? 'Active' : 'Hidden'}
        </span>
      </div>
      <p className="mt-3 font-semibold text-neutral-900">{promotion.title}</p>
      <p className="mt-1 text-sm text-neutral-600">{promotion.text}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand-400">
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => remove.run({ data: promotion.id })}
          className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <Trash2 size={13} /> {remove.pending ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </div>
  )
}
