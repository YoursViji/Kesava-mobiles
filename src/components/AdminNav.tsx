import { Link, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Smartphone,
  BadgePercent,
  Sparkles,
  Wrench,
  ShoppingBag,
  CalendarClock,
  Repeat,
  Star,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAction } from '@/lib/actions'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Mobiles & Accessories', icon: Smartphone },
  { to: '/admin/promotions', label: 'Promotions & Discounts', icon: BadgePercent },
  { to: '/admin/prebookings', label: 'Pre-bookings', icon: Sparkles },
  { to: '/admin/services', label: 'Service Bookings', icon: Wrench },
  { to: '/admin/sales', label: 'Sales', icon: ShoppingBag },
  { to: '/admin/demos', label: 'Demo Bookings', icon: CalendarClock },
  { to: '/admin/exchanges', label: 'Exchange Leads', icon: Repeat },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
] as const

export function AdminNav({ active }: { active: string }) {
  const navigate = useNavigate()
  const signOut = useAction(() => authClient.signOut(), {
    onSuccess: () => navigate({ to: '/admin/login' }),
  })

  return (
    <div className="border-b border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/admin" className="flex items-center gap-2 font-bold">
          <img src="/logo.svg" alt="Kesava Mobiles logo" className="h-8 w-8 rounded-lg object-cover" />
          Kesava Mobiles — Admin
        </Link>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white">
            <ExternalLink size={14} /> View store
          </a>
          <button
            onClick={() => signOut.run()}
            className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"
          >
            <LogOut size={14} /> {signOut.pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
        {LINKS.map((l) => {
          const Icon = l.icon
          const isActive = active === l.to
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2 font-medium ${
                isActive ? 'bg-white text-neutral-900' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon size={14} /> {l.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
