import { Link } from '@tanstack/react-router'
import { Wrench, Phone, Menu, X, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'
import { useCart } from '@/lib/cart'

export function Header() {
  const [open, setOpen] = useState(false)
  const { lang, setLang, t } = useLang()
  const cart = useCart()

  const links = [
    { to: '/mobiles', label: t('nav_mobiles') },
    { to: '/accessories', label: t('nav_accessories') },
    { to: '/offers', label: t('nav_offers') },
    { to: '/launches', label: t('nav_launches') },
    { to: '/exchange', label: t('nav_exchange') },
    { to: '/compare', label: t('nav_compare') },
    { to: '/service', label: t('nav_service') },
    { to: '/service/track', label: t('nav_track') },
    { to: '/contact', label: t('nav_contact') },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="Kesava Mobiles logo" className="h-10 w-10 rounded-xl object-cover ring-1 ring-brand-200" />
          <span className="text-lg font-bold text-neutral-900 leading-tight">
            {STORE.name}
            <span className="block text-[11px] font-medium text-brand-600">Sales & Service</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-brand-600"
              activeProps={{ className: 'whitespace-nowrap text-sm font-semibold text-brand-600' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LangSwitch lang={lang} setLang={setLang} />
          <Link to="/cart" className="relative rounded-full border border-neutral-200 p-2.5 text-neutral-700 hover:border-brand-400 hover:text-brand-600">
            <ShoppingBag size={18} />
            {cart.totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cart.totalItems}
              </span>
            ) : null}
          </Link>
          <a
            href={`tel:${STORE.phone}`}
            className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Phone size={15} /> {STORE.phoneDisplay}
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LangSwitch lang={lang} setLang={setLang} compact />
          <Link to="/cart" className="relative rounded-lg border border-neutral-200 p-2 text-neutral-700">
            <ShoppingBag size={18} />
            {cart.totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                {cart.totalItems}
              </span>
            ) : null}
          </Link>
          <button
            aria-label="Toggle menu"
            className="rounded-lg border border-neutral-200 p-2"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={`tel:${STORE.phone}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Phone size={15} /> Call {STORE.phoneDisplay}
            </a>
            <Link
              to="/service"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-2 rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600"
            >
              <Wrench size={15} /> {t('nav_book_service_short')}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

function LangSwitch({
  lang,
  setLang,
  compact,
}: {
  lang: 'en' | 'te'
  setLang: (l: 'en' | 'te') => void
  compact?: boolean
}) {
  return (
    <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-0.5 text-xs font-bold">
      <button
        onClick={() => setLang('en')}
        aria-label="Switch to English"
        className={`rounded-full px-2.5 py-1 ${lang === 'en' ? 'bg-brand-600 text-white' : 'text-neutral-500'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('te')}
        aria-label="తెలుగుకు మారండి"
        className={`rounded-full px-2.5 py-1 ${lang === 'te' ? 'bg-brand-600 text-white' : 'text-neutral-500'}`}
      >
        {compact ? 'తె' : 'తెలుగు'}
      </button>
    </div>
  )
}
