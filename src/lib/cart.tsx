// Client-side shopping cart shared across the app, same pattern as the compare list: the cart
// itself is a UI convenience kept in the browser, and only becomes real data (an order) once the
// customer checks out — at that point the server function saves it for good.
import { useEffect, useState } from 'react'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  colorFrom: string
  colorTo: string
  imageUrl: string | null
  category: string
}

const KEY = 'km-cart-items'
type Listener = () => void
const listeners = new Set<Listener>()

function read(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function write(items: CartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(items))
  listeners.forEach((l) => l())
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => read())
  const [loaded, setLoaded] = useState(() => typeof window !== 'undefined')

  useEffect(() => {
    setItems(read())
    setLoaded(true)
    const listener = () => setItems(read())
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const add = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const current = read()
    const existing = current.find((i) => i.productId === item.productId)
    const next = existing
      ? current.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { ...item, quantity }]
    write(next)
  }

  const setQuantity = (productId: string, quantity: number) => {
    const current = read()
    const next =
      quantity <= 0
        ? current.filter((i) => i.productId !== productId)
        : current.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    write(next)
  }

  const remove = (productId: string) => write(read().filter((i) => i.productId !== productId))
  const clear = () => write([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return { items, add, setQuantity, remove, clear, totalItems, totalPrice, loaded }
}
