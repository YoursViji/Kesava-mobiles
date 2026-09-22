// Small client-side "compare list" shared across the app. It is a UI convenience (which phones you
// are looking at side by side), not app data, so it lives in the browser's storage, not the database.
import { useEffect, useState } from 'react'

const KEY = 'km-compare-ids'
const MAX = 4
type Listener = () => void
const listeners = new Set<Listener>()

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function write(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(ids))
  listeners.forEach((l) => l())
}

export function useCompareList() {
  const [ids, setIds] = useState<string[]>([])
  useEffect(() => {
    setIds(read())
    const listener = () => setIds(read())
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    ids,
    isFull: ids.length >= MAX,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => {
      const current = read()
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length >= MAX
          ? current
          : [...current, id]
      write(next)
    },
    remove: (id: string) => write(read().filter((x) => x !== id)),
    clear: () => write([]),
  }
}
