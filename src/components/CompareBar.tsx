import { Link } from '@tanstack/react-router'
import { Scale, X } from 'lucide-react'
import { useCompareList } from '@/lib/compare'
import { useLang } from '@/lib/i18n'

/** A floating bar that appears once the visitor has picked at least one phone to compare. */
export function CompareBar() {
  const compare = useCompareList()
  const { t } = useLang()
  if (compare.ids.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <Scale size={16} className="text-brand-600" />
          {compare.ids.length} {t('compare_selected')}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={compare.clear} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100">
            <X size={14} /> {t('clear')}
          </button>
          <Link
            to="/compare"
            search={{ ids: compare.ids }}
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t('compare_now')}
          </Link>
        </div>
      </div>
    </div>
  )
}
