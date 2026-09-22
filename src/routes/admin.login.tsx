import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAction } from '@/lib/actions'
import { getSessionUser } from '@/lib/session'
import { ensureAdminAccount, checkIsAdmin } from '@/server/admin'
import { ADMIN_EMAIL } from '@/data/options'

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (user) {
      const { isAdmin } = await checkIsAdmin()
      if (isAdmin) throw redirect({ to: '/admin' })
    }
  },
  loader: async () => {
    await ensureAdminAccount()
    return null
  },
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useAction(() => authClient.signIn.email({ email, password }), {
    onSuccess: () => navigate({ to: '/admin' }),
  })

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldCheck size={22} />
          </span>
          <h1 className="mt-3 text-xl font-bold text-neutral-900">Kesava Mobiles Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to manage the store's catalogue, orders and bookings.</p>
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            login.run()
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ADMIN_EMAIL}
              className="input"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">Password</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </label>
          {login.error ? <p className="text-sm font-medium text-red-600">{login.error}</p> : null}
          <button type="submit" className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">
            {login.pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-neutral-400">Store staff access only.</p>
      </div>
    </main>
  )
}
