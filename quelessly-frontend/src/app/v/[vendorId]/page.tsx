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
  const [activeOrder, setActiveOrder] = useState<{ orderId: string; total: number } | null>(null)

  useEffect(() => {
    api.get(`/menu/public/${vendorId}`)
      .then((res) => { if (res.success) setItems(res.data) })
      .finally(() => setLoading(false))
  }, [vendorId])

  useEffect(() => {
    const stored = localStorage.getItem('active_order')
    if (stored) {
      const order = JSON.parse(stored)
      if (order.vendorId === vendorId && Date.now() - order.timestamp < 2 * 60 * 60 * 1000) {
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

        {/* Floating glass header */}
        <div className="fixed top-4 left-4 right-4 z-50 glass rounded-full px-5 py-3 flex items-center justify-between">
          <span className="font-display font-bold text-white tracking-tighter text-base lowercase">
            {vendorName}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-xs text-zinc-400 tabular-nums">
              {loading ? '…' : `${items.filter(i => i.is_available).length} items`}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="pt-24 px-4 pb-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-5 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-lime-400/50 transition-colors"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                activeCategory === cat
                  ? 'bg-lime-400 text-black border-transparent'
                  : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {cat !== 'All' && <span className="text-xs">{CAT_ICON[cat] ?? '🍴'}</span>}
              {cat}
            </button>
          ))}
        </div>

        {/* Active order banner */}
        {activeOrder && (
          <div className="px-4 pb-2">
            <button
              onClick={() => router.push(`/order/${activeOrder.orderId}`)}
              className="w-full bg-lime-400/10 border border-lime-400/30 rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <p className="text-lime-400 font-bold text-sm">Active order · ₹{activeOrder.total}</p>
              </div>
              <span className="text-lime-400 text-xs font-bold">Track →</span>
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="px-4 pt-3 grid grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonMenuCard key={i} />)
            : filtered.length === 0
            ? (
              <div className="col-span-2 text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-zinc-400 font-medium">Nothing found</p>
              </div>
            )
            : filtered.map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                qty={getQty(item.id)}
                fullWidth={i === 0 && filtered.length > 2}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))
          }
        </div>

        {/* Cart floating pill */}
        {totalItems > 0 && (
          <button
            onClick={goToCart}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-lime-400 text-black px-6 py-4 rounded-full glow-lime font-bold text-sm whitespace-nowrap flex items-center gap-4 active:scale-95 transition-all duration-300"
          >
            <span className="bg-black/15 text-black font-black text-xs px-2.5 py-0.5 rounded-full">
              {totalItems}
            </span>
            View Cart
            <span className="font-black">₹{totalAmount}</span>
          </button>
        )}
      </div>
      <Footer />
    </>
  )
}

function MenuCard({
  item, qty, fullWidth, onAdd, onRemove,
}: {
  item: MenuItem
  qty: number
  fullWidth: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  const grad = getGradient(item.category)

  return (
    <div className={`bg-zinc-900 rounded-4xl overflow-hidden border border-zinc-800 flex flex-col animate-slide-up ${fullWidth ? 'col-span-2' : ''}`}>
      <div className={`bg-linear-to-br ${grad} ${fullWidth ? 'h-40' : 'h-28'} flex items-center justify-center relative`}>
        <span className="text-4xl">{CAT_ICON[item.category] ?? '🍴'}</span>
        <div className="absolute inset-0 bg-linear-to-t from-zinc-900/60 to-transparent" />
      </div>
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-white text-sm leading-tight">{item.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{item.category}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-white">₹{item.price}</span>
          {qty > 0 ? (
            <div className="flex items-center gap-2 bg-zinc-800 border border-lime-400/50 rounded-full px-2.5 py-1">
              <button
                onClick={onRemove}
                className="w-5 h-5 flex items-center justify-center text-lime-400 font-black text-base leading-none active:scale-90 transition-transform"
              >−</button>
              <span className="text-white font-bold text-sm tabular-nums w-4 text-center">{qty}</span>
              <button
                onClick={onAdd}
                className="w-5 h-5 flex items-center justify-center text-lime-400 font-black text-base leading-none active:scale-90 transition-transform"
              >+</button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white font-bold text-lg active:scale-90 transition-all duration-200 border border-zinc-700"
            >+</button>
          )}
        </div>
      </div>
    </div>
  )
}