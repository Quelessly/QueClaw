'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { SkeletonMenuCard } from '@/components/Skeleton'

interface MenuItem {
  id: string
  name: string
  price: number
  categories: string[]
  image_url: string | null
  is_available: boolean
}
interface CartItem extends MenuItem { quantity: number }

const CAT_ICON: Record<string, string> = {
  'Veg': '🥗', 'Non-Veg': '🍗', 'Breakfast': '🌅', 'Drinks': '☕',
  'Snacks': '🍟', 'Lunch': '🍱', 'Dinner': '🍽️', 'Desserts': '🍰',
}

const CAT_PILL: Record<string, string> = {
  'Veg':       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Non-Veg':   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Breakfast': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Lunch':     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Dinner':    'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Snacks':    'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Drinks':    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Desserts':  'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

const getPillStyle = (cat: string) => CAT_PILL[cat] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'

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
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY
      if (curr > lastScrollY.current && curr > 80) setHeaderHidden(true)
      else setHeaderHidden(false)
      lastScrollY.current = curr
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    api.get(`/menu/public/${vendorId}`).then(res => { if (res.success) setItems(res.data) }).finally(() => setLoading(false))
    api.get(`/auth/vendor/${vendorId}`).then(res => { if (res.success && res.data?.name) setVendorName(res.data.name.toLowerCase()) })
  }, [vendorId])

  useEffect(() => {
    const stored = localStorage.getItem('active_order')
    if (stored) {
      const order = JSON.parse(stored)
      if (order.vendorId === vendorId && Date.now() - order.timestamp < 2 * 60 * 60 * 1000)
        setActiveOrder({ orderId: order.orderId, total: order.total })
    }
  }, [vendorId])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.flatMap(i => i.categories ?? [])))], [items])

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? items : items.filter(i => (i.categories ?? []).includes(activeCategory))
    if (search.trim()) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    return list.filter(i => i.is_available)
  }, [items, activeCategory, search])

  const addToCart = (item: MenuItem) =>
    setCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) : [...prev, { ...item, quantity: 1 }] })

  const removeFromCart = (itemId: string) =>
    setCart(prev => { const ex = prev.find(c => c.id === itemId); if (ex && ex.quantity > 1) return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c); return prev.filter(c => c.id !== itemId) })

  const getQty = (id: string) => cart.find(c => c.id === id)?.quantity ?? 0
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0)
  const totalAmount = cart.reduce((s, c) => s + c.price * c.quantity, 0)

  const goToCart = () => { localStorage.setItem('cart', JSON.stringify(cart)); localStorage.setItem('vendorId', vendorId as string); router.push('/cart') }

  return (
    <div className="min-h-screen bg-zinc-950 pb-36">

      {/* Fixed header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${headerHidden ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="mx-4 mt-4 glass rounded-full px-5 py-3 flex items-center justify-between">
          {/* Home link — taps to quelessly.com */}
          <a
            href="https://quelessly.com"
            className="font-display font-bold text-white tracking-tighter text-base lowercase hover:text-lime-400 transition-colors"
          >
            {vendorName}
          </a>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-xs text-zinc-400 tabular-nums">
              {loading ? '…' : `${items.filter(i => i.is_available).length} items`}
            </span>
          </div>
        </div>
      </div>

      <div className="h-20" />

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-5 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-lime-400/50 transition-colors" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all duration-200 active:scale-95 ${activeCategory === cat ? 'bg-lime-400 text-black border-transparent' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
            {cat !== 'All' && <span style={{ fontSize: '14px' }}>{CAT_ICON[cat] ?? '🍴'}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Active order banner */}
      {activeOrder && (
        <div className="px-4 pb-2">
          <button onClick={() => router.push(`/order/${activeOrder.orderId}`)}
            className="w-full bg-lime-400/10 border border-lime-400/30 rounded-2xl px-4 py-3 flex items-center justify-between active:scale-[0.98] transition-all">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <p className="text-lime-400 font-bold text-sm">Active order · ₹{activeOrder.total}</p>
            </div>
            <span className="text-lime-400 text-xs font-bold">Track →</span>
          </button>
        </div>
      )}

      {/* Menu grid */}
      <div className="px-4 pt-3 grid grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonMenuCard key={i} />)
          : filtered.length === 0
          ? (
            <div className="col-span-2 text-center py-20">
              <p className="text-zinc-400 font-medium">Nothing found</p>
            </div>
          )
          : filtered.map(item => (
            <MenuCard
              key={item.id}
              item={item}
              qty={getQty(item.id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item.id)}
              showCategory={activeCategory === 'All'}
            />
          ))
        }
      </div>

      {/* Cart pill — Swiggy-style sticky bottom */}
      {totalItems > 0 && (
        <button onClick={goToCart}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-lime-400 text-black px-6 py-4 rounded-full glow-lime font-bold text-sm whitespace-nowrap flex items-center gap-4 active:scale-95 transition-all duration-300">
          <span className="bg-black/15 text-black font-black text-xs px-2.5 py-0.5 rounded-full">{totalItems}</span>
          View Cart
          <span className="font-black">₹{totalAmount}</span>
        </button>
      )}

      {/* Powered by footer */}
      <div className="text-center py-8 px-4">
        <a href="https://quelessly.com" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
          powered by quelessly.
        </a>
      </div>
    </div>
  )
}

function MenuCard({ item, qty, onAdd, onRemove, showCategory }: {
  item: MenuItem; qty: number; onAdd: () => void; onRemove: () => void; showCategory: boolean
}) {
  const isVeg = (item.categories ?? []).includes('Veg')
  const isNonVeg = (item.categories ?? []).includes('Non-Veg')
  // Show first non-veg/non-diet category as badge (only on "All" view)
  const displayCat = (item.categories ?? []).find(c => c !== 'Veg' && c !== 'Non-Veg')

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 flex flex-col transition-all duration-200 hover:border-zinc-700 active:scale-[0.98]">
      {/* Image area — neutral dark, no random colors */}
      <div className="aspect-square bg-zinc-800 flex items-center justify-center relative">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          // Clean placeholder — no emoji, no random color
          <div className="flex flex-col items-center gap-1.5 opacity-30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {/* Veg / Non-Veg dot — top-left on image (FSSAI standard) */}
        {(isVeg || isNonVeg) && (
          <div className={`absolute top-2 left-2 w-4 h-4 rounded flex items-center justify-center border ${isVeg ? 'border-emerald-500 bg-black/70' : 'border-rose-500 bg-black/70'}`}>
            <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-semibold text-white text-sm leading-tight line-clamp-2">{item.name}</p>
          {/* Only show category badge when viewing "All" — hidden when already filtered */}
          {showCategory && displayCat && (
            <div className="mt-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${getPillStyle(displayCat)}`}>
                {displayCat}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-sm text-white">₹{item.price}</span>
          {qty > 0 ? (
            <div className="flex items-center gap-1.5 bg-zinc-800 border border-lime-400/40 rounded-full px-2 py-0.5">
              <button onClick={onRemove} className="w-4 h-4 flex items-center justify-center text-lime-400 font-black text-sm leading-none active:scale-90 transition-transform">−</button>
              <span className="text-white font-bold text-xs tabular-nums w-3 text-center">{qty}</span>
              <button onClick={onAdd} className="w-4 h-4 flex items-center justify-center text-lime-400 font-black text-sm leading-none active:scale-90 transition-transform">+</button>
            </div>
          ) : (
            <button onClick={onAdd} className="w-7 h-7 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white font-bold text-sm active:scale-90 transition-all border border-zinc-700 hover:border-lime-400/30">+</button>
          )}
        </div>
      </div>
    </div>
  )
}