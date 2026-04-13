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
  'Veg':       'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Non-Veg':   'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'Breakfast': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Lunch':     'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Dinner':    'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'Snacks':    'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'Drinks':    'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'Desserts':  'bg-pink-500/10 text-pink-500 border-pink-500/20',
}

const getPillStyle = (cat: string) => CAT_PILL[cat] ?? 'bg-stone-100 text-stone-500 border-stone-200'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

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

  // ── Single API call — returns { items, vendor } ──
  useEffect(() => {
    api.get(`/menu/public/${vendorId}`).then(res => {
      if (res.success) {
        setItems(res.data.items)
        if (res.data.vendor?.name) setVendorName(res.data.vendor.name.toLowerCase())
      }
    }).finally(() => setLoading(false))
  }, [vendorId])

  useEffect(() => {
    const stored = localStorage.getItem('active_order')
    if (!stored) return
    const order = JSON.parse(stored)
    if (order.vendorId !== vendorId) return
    if (Date.now() - order.timestamp >= 2 * 60 * 60 * 1000) { localStorage.removeItem('active_order'); return }
    api.get(`/orders/${order.orderId}`).then(res => {
      if (res.success) {
        const status = res.data?.status
        if (status === 'completed' || status === 'cancelled') { localStorage.removeItem('active_order'); setActiveOrder(null) }
        else setActiveOrder({ orderId: order.orderId, total: order.total })
      }
    }).catch(() => setActiveOrder({ orderId: order.orderId, total: order.total }))
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
    <div style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 144, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .menu-card { background:#fff; border:1px solid rgba(26,23,20,0.07); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition:all 0.2s; }
        .menu-card:hover { border-color:rgba(255,107,0,0.2); box-shadow:0 4px 16px rgba(26,23,20,0.08); }
        .menu-card:active { transform:scale(0.98); }
        .cat-pill { padding:6px 16px; border-radius:20px; font-size:13px; font-weight:600; white-space:nowrap; border:1.5px solid; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
        .cat-pill:active { transform:scale(0.95); }
        .qty-btn { width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; line-height:1; cursor:pointer; background:none; border:none; color:#ff6b00; transition:transform 0.15s; }
        .qty-btn:active { transform:scale(0.85); }

        /* ── RESPONSIVE GRID ── */
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 4px 16px 0;
        }
        @media (min-width: 640px)  { .menu-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 900px)  { .menu-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1200px) { .menu-grid { grid-template-columns: repeat(5, 1fr); } }

        /* ── CAP IMAGE HEIGHT ON DESKTOP ── */
        .card-image { aspect-ratio: 1; background: #F2EDE4; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        @media (min-width: 640px) { .card-image { aspect-ratio: unset; height: 160px; } }

        /* ── CONSTRAIN PAGE WIDTH ON DESKTOP ── */
        .menu-inner { max-width: 1280px; margin: 0 auto; }
      `}</style>

      {/* Fixed header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'transform 0.3s', transform: headerHidden ? 'translateY(-100%)' : 'translateY(0)' }}>
        <div style={{ margin: '12px 16px 0', background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 40, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(26,23,20,0.08)', boxShadow: '0 4px 20px rgba(26,23,20,0.06)' }}>
          <a href="https://quelessly.com" style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, color: '#023341', fontSize: 16, textDecoration: 'none', letterSpacing: '-0.3px' }}>
            {vendorName}
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff6b00', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: '#8a7f72', fontFamily: "'DM Mono', monospace" }}>
              {loading ? '…' : `${items.filter(i => i.is_available).length} items`}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />

      <div className="menu-inner">
        {/* Search */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8a7f72', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu…"
              style={{ width: '100%', background: '#fff', border: '1.5px solid rgba(26,23,20,0.1)', borderRadius: 40, padding: '12px 20px 12px 42px', fontSize: 14, color: '#1a1714', outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(26,23,20,0.1)'} />
          </div>
        </div>

        {/* Category pills */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: '4px 16px 12px', overflowX: 'auto' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className="cat-pill"
              style={{
                background: activeCategory === cat ? '#ff6b00' : 'transparent',
                color: activeCategory === cat ? '#fff' : '#8a7f72',
                borderColor: activeCategory === cat ? 'transparent' : 'rgba(26,23,20,0.12)',
                fontFamily: "'DM Sans', sans-serif",
              }}>
              {cat !== 'All' && <span style={{ fontSize: 14 }}>{CAT_ICON[cat] ?? '🍴'}</span>}
              {cat}
            </button>
          ))}
        </div>

        {/* Active order banner */}
        {activeOrder && (
          <div style={{ padding: '0 16px 12px' }}>
            <button onClick={() => router.push(`/order/${activeOrder.orderId}`)}
              style={{ width: '100%', background: 'rgba(255,107,0,0.05)', border: '2px dashed rgba(255,107,0,0.3)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,0,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,0,0.05)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff6b00', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <p style={{ color: '#ff6b00', fontWeight: 700, fontSize: 14, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Active order · ₹{activeOrder.total}</p>
              </div>
              <span style={{ color: '#ff6b00', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Track →</span>
            </button>
          </div>
        )}

        {/* Menu grid — responsive */}
        <div className="menu-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonMenuCard key={i} />)
            : filtered.length === 0
            ? <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}><p style={{ color: '#8a7f72', fontFamily: "'DM Sans', sans-serif" }}>Nothing found</p></div>
            : filtered.map(item => (
              <MenuCard key={item.id} item={item} qty={getQty(item.id)}
                onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)}
                showCategory={activeCategory === 'All'} />
            ))
          }
        </div>

        {/* Powered by */}
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <a href="https://quelessly.com" style={{ fontSize: 12, color: '#c9c2b8', textDecoration: 'none', fontFamily: "'DM Mono', monospace" }}>
            powered by quelessly.
          </a>
        </div>
      </div>

      {/* Cart pill */}
      {totalItems > 0 && (
        <button onClick={goToCart}
          style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#ff6b00', color: '#fff', padding: '16px 28px', borderRadius: 40, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(255,107,0,0.35)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>{totalItems}</span>
          View Cart
          <span style={{ fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>₹{totalAmount}</span>
        </button>
      )}
    </div>
  )
}

function MenuCard({ item, qty, onAdd, onRemove, showCategory }: {
  item: MenuItem; qty: number; onAdd: () => void; onRemove: () => void; showCategory: boolean
}) {
  const isVeg = (item.categories ?? []).includes('Veg')
  const isNonVeg = (item.categories ?? []).includes('Non-Veg')
  const displayCat = (item.categories ?? []).find(c => c !== 'Veg' && c !== 'Non-Veg')

  return (
    <div className="menu-card">
      <div className="card-image">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.25 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a7f72" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {(isVeg || isNonVeg) && (
          <div style={{ position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${isVeg ? '#10b981' : '#f43f5e'}`, background: 'rgba(250,247,242,0.9)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isVeg ? '#10b981' : '#f43f5e' }} />
          </div>
        )}
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div>
          <p style={{ fontWeight: 600, color: '#1a1714', fontSize: 13, lineHeight: 1.3, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</p>
          {showCategory && displayCat && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${getPillStyle(displayCat)}`} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{displayCat}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1714', fontFamily: "'DM Mono', monospace" }}>₹{item.price}</span>
          {qty > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FAF7F2', border: '1.5px solid rgba(255,107,0,0.3)', borderRadius: 20, padding: '2px 6px' }}>
              <button onClick={onRemove} className="qty-btn">−</button>
              <span style={{ color: '#1a1714', fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: 'center', fontFamily: "'DM Mono', monospace" }}>{qty}</span>
              <button onClick={onAdd} className="qty-btn">+</button>
            </div>
          ) : (
            <button onClick={onAdd}
              style={{ width: 30, height: 30, background: '#FAF7F2', border: '1.5px solid rgba(26,23,20,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00', fontWeight: 800, fontSize: 18, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ff6b00'; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#ff6b00' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAF7F2'; (e.currentTarget as HTMLElement).style.color = '#ff6b00'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,23,20,0.12)' }}>
              +
            </button>
          )}
        </div>
      </div>
    </div>
  )
}