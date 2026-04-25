// Mock data + types

export interface MenuItem {
  id: string
  name: string
  cat: string
  price: number
  veg: boolean
  emoji: string
  tag?: string
  hot?: boolean
  left: number
}

export interface OrderItem extends MenuItem {
  qty: number
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'picked'

export interface Order {
  id: string
  shortId: string
  items: OrderItem[]
  total: number
  customer: string
  placedAt: number
  readyAt?: number
  status: OrderStatus
  sla: number
}

export const MENU: MenuItem[] = [
  { id: 'samosa',  name: 'Samosa',         cat: 'Snacks', price: 25,  veg: true,  emoji: '🥟', tag: 'HOT',    hot: true, left: 40 },
  { id: 'vadapav', name: 'Vada Pav',       cat: 'Snacks', price: 30,  veg: true,  emoji: '🍔', tag: '#1',                left: 22 },
  { id: 'chai',    name: 'Masala Chai',    cat: 'Drinks', price: 15,  veg: true,  emoji: '🫖', tag: 'STAPLE',            left: 99 },
  { id: 'coffee',  name: 'Filter Coffee',  cat: 'Drinks', price: 20,  veg: true,  emoji: '☕',                            left: 60 },
  { id: 'bhurji',  name: 'Chicken Bhurji', cat: 'Mains',  price: 120, veg: false, emoji: '🍳', tag: 'CHEF',              left: 12 },
  { id: 'burger',  name: 'Paneer Burger',  cat: 'Mains',  price: 90,  veg: true,  emoji: '🍔',                            left: 18 },
  { id: 'maggi',   name: 'Masala Maggi',   cat: 'Mains',  price: 60,  veg: true,  emoji: '🍜', tag: '8 LEFT',            left: 8 },
  { id: 'jalebi',  name: 'Jalebi',         cat: 'Sweets', price: 40,  veg: true,  emoji: '🍥',                            left: 50 },
]

export const CUSTOMER_NAMES = [
  'Arjun', 'Priya', 'Ravi', 'Neha', 'Kabir', 'Aisha',
  'Vikram', 'Sanya', 'Rohit', 'Meera', 'Karan', 'Divya',
]

export function makeOrder(): Order {
  const id = Math.random().toString(16).slice(2, 10).toUpperCase()
  const itemCount = 1 + Math.floor(Math.random() * 3)
  const items: OrderItem[] = []
  for (let j = 0; j < itemCount; j++) {
    const m = MENU[Math.floor(Math.random() * MENU.length)]
    items.push({ ...m, qty: 1 + Math.floor(Math.random() * 2) })
  }
  const total = items.reduce((s, it) => s + it.price * it.qty, 0)
  const now = Date.now()
  const elapsedMs = Math.random() * 240 * 1000
  return {
    id,
    shortId: id.slice(0, 6),
    items,
    total,
    customer: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
    placedAt: now - elapsedMs,
    status: 'pending',
    sla: 90 * 1000,
  }
}
