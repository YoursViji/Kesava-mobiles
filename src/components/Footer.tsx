import { Link } from '@tanstack/react-router'
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Kesava Mobiles logo" className="h-9 w-9 rounded-lg object-cover" />
            <h2 className="text-lg font-bold text-white">{STORE.name}</h2>
          </div>
          <p className="mt-2 text-sm text-neutral-400">{STORE.tagline}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/mobiles" className="hover:text-white">{t('nav_mobiles')}</Link></li>
            <li><Link to="/accessories" className="hover:text-white">{t('nav_accessories')}</Link></li>
            <li><Link to="/offers" className="hover:text-white">{t('nav_offers')}</Link></li>
            <li><Link to="/launches" className="hover:text-white">{t('nav_launches')}</Link></li>
            <li><Link to="/compare" className="hover:text-white">{t('nav_compare')}</Link></li>
            <li><Link to="/exchange" className="hover:text-white">{t('nav_exchange')}</Link></li>
            <li><Link to="/cart" className="hover:text-white">{t('cart_title')}</Link></li>
            <li><Link to="/loyalty" className="hover:text-white">{t('nav_loyalty')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Service</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/service" className="hover:text-white">{t('nav_service')}</Link></li>
            <li><Link to="/service/track" className="hover:text-white">{t('nav_track')}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="text-sm font-semibold text-white">Visit us</h3>
          <p className="mt-3 flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {STORE.address}</p>
          <p className="mt-2 flex items-center gap-2"><Clock size={16} className="shrink-0" /> {STORE.hours}</p>
          <a href={`tel:${STORE.phone}`} className="mt-2 flex items-center gap-2 hover:text-white">
            <Phone size={16} className="shrink-0" /> {STORE.phoneDisplay}
          </a>
          <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 hover:text-white">
            <MessageCircle size={16} className="shrink-0" /> WhatsApp us
          </a>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {STORE.name}, Nagari. All rights reserved.
      </div>
    </footer>
  )
}
