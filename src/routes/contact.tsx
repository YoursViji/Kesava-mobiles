import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { MapPin, Clock, Phone, MessageCircle, Navigation } from 'lucide-react'
import { Map } from '@/lib/monstarx/map'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'

export const Route = createFileRoute('/contact')({ component: ContactPage })

function ContactPage() {
  const { t } = useLang()
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">{t('contact_title')} {STORE.name}</h1>
      <p className="mt-1 max-w-2xl text-neutral-600">
        {STORE.name} {t('contact_subtitle')}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <InfoRow icon={<MapPin size={18} />} label={t('label_address')} value={STORE.address} />
          <InfoRow icon={<Clock size={18} />} label={t('label_hours')} value={STORE.hours} />
          <InfoRow
            icon={<Phone size={18} />}
            label={t('label_phone')}
            value={STORE.phoneDisplay}
            href={`tel:${STORE.phone}`}
          />
          <InfoRow
            icon={<MessageCircle size={18} />}
            label={t('label_whatsapp')}
            value={t('whatsapp_chat')}
            href={STORE.whatsapp}
            external
          />

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`tel:${STORE.phone}`}
              className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700"
            >
              <Phone size={16} /> {t('call_store_btn')}
            </a>
            <a
              href={STORE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-neutral-300 px-5 py-3 text-sm font-bold text-neutral-700 hover:border-brand-400"
            >
              <Navigation size={16} /> {t('get_directions_btn')}
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
          <Map
            center={STORE.coordinates}
            zoom={15}
            style="streets"
            markers={[{ id: 'store', lat: STORE.coordinates.lat, lon: STORE.coordinates.lon, label: STORE.name }]}
            className="h-[26rem] w-full"
          />
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-lg font-bold text-neutral-900">{t('contact_buying_title')}</h2>
        <p className="mt-2 text-sm text-neutral-600">{t('contact_buying_text')}</p>
      </section>
    </main>
  )
}

function InfoRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: ReactNode
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>
      <div>
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <p className="font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  )
  if (!href) return content
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block hover:opacity-90">
      {content}
    </a>
  )
}
