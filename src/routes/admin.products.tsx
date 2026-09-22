import { createFileRoute, redirect } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Plus, Pencil, PackageX, PackageCheck, X } from 'lucide-react'
import { getSessionUser } from '@/lib/session'
import { checkIsAdmin } from '@/server/admin'
import { adminListAllProducts, adminSaveProduct, adminSetProductStock } from '@/server/products'
import { AdminNav } from '@/components/AdminNav'
import { useAction, useOptimisticAction } from '@/lib/actions'
import type { Product } from '@/db/schema'

export const Route = createFileRoute('/admin/products')({
  component: AdminProductsPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/admin/login' })
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) throw redirect({ to: '/admin/login' })
  },
  loader: async () => ({ products: await adminListAllProducts() }),
})

type FormState = {
  id?: string
  name: string
  brand: string
  category: 'Smartphone' | 'Accessory'
  subcategory: string
  tag: string
  price: string
  originalPrice: string
  ram: string
  storage: string
  display: string
  camera: string
  battery: string
  processor: string
  os: string
  colorFrom: string
  colorTo: string
  inStock: boolean
  imageUrl: string
}

const BLANK: FormState = {
  name: '',
  brand: '',
  category: 'Smartphone',
  subcategory: '',
  tag: '',
  price: '',
  originalPrice: '',
  ram: '',
  storage: '',
  display: '',
  camera: '',
  battery: '',
  processor: '',
  os: '',
  colorFrom: 'from-brand-500',
  colorTo: 'to-brand-700',
  inStock: true,
  imageUrl: '',
}

function toForm(p: Product): FormState {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category === 'Accessory' ? 'Accessory' : 'Smartphone',
    subcategory: p.subcategory ?? '',
    tag: p.tag ?? '',
    price: String(p.price),
    originalPrice: String(p.originalPrice),
    ram: p.ram,
    storage: p.storage,
    display: p.display,
    camera: p.camera,
    battery: p.battery,
    processor: p.processor,
    os: p.os,
    colorFrom: p.colorFrom,
    colorTo: p.colorTo,
    inStock: p.inStock,
    imageUrl: p.imageUrl ?? '',
  }
}

function AdminProductsPage() {
  const { products } = Route.useLoaderData()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(BLANK)
  const [filter, setFilter] = useState<'all' | 'Smartphone' | 'Accessory'>('all')

  const save = useAction(adminSaveProduct, {
    onSuccess: () => {
      setFormOpen(false)
      setForm(BLANK)
    },
  })

  const openNew = () => {
    setForm(BLANK)
    setFormOpen(true)
  }
  const openEdit = (p: Product) => {
    setForm(toForm(p))
    setFormOpen(true)
  }

  const filtered = products.filter((p) => filter === 'all' || p.category === filter)

  return (
    <main className="min-h-screen bg-neutral-50">
      <AdminNav active="/admin/products" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Mobiles & Accessories</h1>
            <p className="mt-1 text-neutral-500">Add new items, update price, specs or mark something sold out.</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
            <Plus size={16} /> Add new
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {(['all', 'Smartphone', 'Accessory'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                filter === f ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => (
                <ProductRow key={p.id} product={p} onEdit={() => openEdit(p)} />
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-400">
                    No products in this category yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{form.id ? 'Update product' : 'Add new product'}</h2>
              <button onClick={() => setFormOpen(false)} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
                <X size={18} />
              </button>
            </div>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                save.run({
                  data: {
                    id: form.id,
                    name: form.name,
                    brand: form.brand,
                    category: form.category,
                    subcategory: form.subcategory || undefined,
                    tag: form.tag || undefined,
                    price: Number(form.price),
                    originalPrice: Number(form.originalPrice),
                    ram: form.ram,
                    storage: form.storage,
                    display: form.display,
                    camera: form.camera,
                    battery: form.battery,
                    processor: form.processor,
                    os: form.os,
                    colorFrom: form.colorFrom,
                    colorTo: form.colorTo,
                    inStock: form.inStock,
                    imageUrl: form.imageUrl || undefined,
                  },
                })
              }}
            >
              <Field label="Name" span2>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </Field>
              <Field label="Brand">
                <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as FormState['category'] })}
                  className="input"
                >
                  <option value="Smartphone">Smartphone</option>
                  <option value="Accessory">Accessory</option>
                </select>
              </Field>
              <Field label="Subcategory (accessories, e.g. Earbuds)">
                <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="input" />
              </Field>
              <Field label="Tag (e.g. Bestseller)">
                <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="input" />
              </Field>
              <Field label="Selling price (₹)">
                <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
              </Field>
              <Field label="MRP / original price (₹)">
                <input
                  required
                  type="number"
                  min={0}
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="RAM / Type">
                <input required value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} className="input" />
              </Field>
              <Field label="Storage / Warranty">
                <input required value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} className="input" />
              </Field>
              <Field label="Display / Compatibility">
                <input required value={form.display} onChange={(e) => setForm({ ...form, display: e.target.value })} className="input" />
              </Field>
              <Field label="Camera / Colour">
                <input required value={form.camera} onChange={(e) => setForm({ ...form, camera: e.target.value })} className="input" />
              </Field>
              <Field label="Battery / Output">
                <input required value={form.battery} onChange={(e) => setForm({ ...form, battery: e.target.value })} className="input" />
              </Field>
              <Field label="Processor / Connectivity">
                <input required value={form.processor} onChange={(e) => setForm({ ...form, processor: e.target.value })} className="input" />
              </Field>
              <Field label="OS / Box contents">
                <input required value={form.os} onChange={(e) => setForm({ ...form, os: e.target.value })} className="input" />
              </Field>
              <Field label="Image URL (optional)" span2>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://…" />
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="h-4 w-4" />
                In stock
              </label>
              {save.error ? <p className="text-sm font-medium text-red-600 sm:col-span-2">{save.error}</p> : null}
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="flex-1 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                  {save.pending ? 'Saving…' : form.id ? 'Save changes' : 'Add product'}
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

function Field({ label, children, span2 }: { label: string; children: ReactNode; span2?: boolean }) {
  return (
    <label className={`block text-sm ${span2 ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  )
}

function ProductRow({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const stock = useOptimisticAction({
    value: { inStock: product.inStock },
    update: (_current, next: boolean) => ({ inStock: next }),
    action: (next: boolean) => adminSetProductStock({ data: { id: product.id, inStock: next } }),
  })

  return (
    <tr>
      <td className="px-4 py-3">
        <p className="font-semibold text-neutral-900">{product.brand} {product.name}</p>
        <p className="text-xs text-neutral-400">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}</p>
      </td>
      <td className="px-4 py-3 text-neutral-600">{product.category}</td>
      <td className="px-4 py-3 font-semibold text-neutral-900">₹{product.price.toLocaleString('en-IN')}</td>
      <td className="px-4 py-3 text-neutral-500">₹{product.originalPrice.toLocaleString('en-IN')}</td>
      <td className="px-4 py-3 text-emerald-600">{product.discountPercent}%</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            stock.value.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {stock.value.inStock ? 'In stock' : 'Sold out'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onEdit} className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:border-brand-400 hover:text-brand-600" aria-label="Edit">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => stock.run(!stock.value.inStock)}
            className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-2 text-xs font-semibold text-neutral-600 hover:border-brand-400"
          >
            {stock.value.inStock ? <PackageX size={14} /> : <PackageCheck size={14} />}
            {stock.value.inStock ? 'Mark sold out' : 'Mark in stock'}
          </button>
        </div>
      </td>
    </tr>
  )
}
