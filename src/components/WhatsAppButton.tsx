import { MessageCircle } from 'lucide-react'
import { STORE } from '@/data/store'
import { useLang } from '@/lib/i18n'

/** A WhatsApp link pre-filled with a message, so a shopper's question (about a phone, or a
 * repair's tracking code) reaches the store number instantly instead of a phone call.
 * `floating`: a round button fixed to the bottom-right corner, shown once for the whole site.
 * Otherwise: an inline pill button placed next to other actions on a page. */
export function WhatsAppButton({ message, floating, label }: { message: string; floating?: boolean; label?: string }) {
  const { t } = useLang()
  const href = `${STORE.whatsapp}?text=${encodeURIComponent(message)}`

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={t('whatsapp_float_label')}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-600"
      >
        <MessageCircle size={26} />
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-full border-2 border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 hover:border-emerald-400"
    >
      <MessageCircle size={16} /> {label ?? t('whatsapp_ask_phone')}
    </a>
  )
}
