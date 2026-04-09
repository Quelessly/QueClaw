'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { SkeletonMenuCard } from '@/components/Skeleton'
import Footer from '@/components/Footer'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image_url: string | null
  is_available: boolean
}

interface CartItem extends MenuItem { quantity: number }

const CAT_GRADIENT: Record<string, string> = {
  Breakfast: 'from-amber-400 to-orange-500',
  Drinks:    'from-cyan-400 to-blue-500',
  Snacks:    'from-lime-400 to-emerald-500',
  Lunch:     'from-rose-400 to-pink-600',
  Dinner:    'from-violet-400 to-purple-600',
  Desserts:  'from-pink-300 to-rose-500',
}

const CAT_ICON: Record<string, string> = {
  Breakfast: '🌅', Drinks: '☕', Snacks: '🍟',
  Lunch: '🍱', Dinner: '🍽️', Desserts: '🍰',
}

function getGradient(cat: string) {
  return CAT_GRADIENT[cat] ?? 'from-zinc-600 to-zinc-700'
}

export default function MenuPage() {
  const { vendorId } = useParams()
  const router = useRouter()

  const [items, setItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [vendorName, setVendorName] = useState('the canteen.')

  // ✅ NEW: active order state
  const [activeOrder, setActiveOrder] = useState<{orderId: string, total: number} | null>(null)

  useEffect(() => {
    api.get(`/menu/public/${vendorId}`)
      .then((res) => {
        if (res.success) {
          setItems(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [vendorId])

  // ✅ NEW: check active order
  useEffect(() => {
    const stored = localStorage.getItem('active_order')
    if (stored) {
      const order = JSON.parse(stored)
      if (
        order.vendorId === vendorId &&
        Date.now() - order.timestamp < 2 * 60 * 60 * 1000
      ) {
        setActiveOrder({ orderId: order.orderId, total: order.total })
      }
    }
  }, [vendorId])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  )

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory)
    if (search.trim()) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    return list.filter((i) => i.is_available)
  }, [items, activeCategory, search])

  const addToCart = (item: MenuItem) =>
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id)
      return ex
        ? prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { ...item, quantity: 1 }]
    })

  const removeFromCart = (itemId: string) =>
    setCart((prev) => {
      const ex = prev.find((c) => c.id === itemId)
      if (ex && ex.quantity > 1) return prev.map((c) => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c)
      return prev.filter((c) => c.id !== itemId)
    })

  const getQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0)
  const totalAmount = cart.reduce((s, c) => s + c.price * c.quantity, 0)

  const goToCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart))
    localStorage.setItem('vendorId', vendorId as string)
    router.push('/cart')
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 pb-36">

        {/* Header */}
        <div className="fixed top-4 left-4 right-4 z-50 glass rounded-full px-5 py-3 flex items-center justify-between">
          <span className="font-display font-bold text-white tracking-tighter text-base lowercase">
            {vendorName}
          </span>
        </div>

        {/* Search */}
        <div className="pt-24 px-4 pb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 text-sm text-white"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* ✅ NEW: Active Order Banner */}
        {activeOrder && (
          <div className="px-4 pb-2">
            <button
              onClick={() => router.push(`/order/${activeOrder.orderId}`)}
              className="w-full bg-lime-400/10 border border-lime-400/30 rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <p className="text-lime-400 font-bold text-sm">
                  You have an active order · ₹{activeOrder.total}
                </p>
              </div>
              <span className="text-lime-400 text-xs font-bold">Track →</span>
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="px-4 pt-3 grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>

        {/* Cart */}
        {totalItems > 0 && (
          <button onClick={goToCart}>
            View Cart ₹{totalAmount}
          </button>
        )}
      </div>
      <Footer />
    </>
  )
}