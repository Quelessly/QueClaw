'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { Toaster, useToast } from '@/components/Toast'
import { SkeletonOrderCard } from '@/components/Skeleton'

interface Vendor { id: string; name: string; email: string }
interface OrderItem { id: string; quantity: number; price: string; menu_item: { name: string } }
interface Order { id: string; status: string; total_amount: string; created_at: string; order_items: OrderItem[] }
interface MenuItem { id: string; name: string; price: string; categories: string[]; is_available: boolean }
type Tab = 'orders' | 'menu' | 'qr' | 'settings'

const STATUS_FLOW: Record<string, string> = { paid: 'preparing', preparing: 'ready', ready: 'completed' }

const ACTION_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  paid:      { label: 'Start Cooking',  bg: '#27272a', color: '#fff' },
  preparing: { label: 'Mark Ready ✓',  bg: '#ff6b00', color: '#fff' },
  ready:     { label: 'Mark Completed', bg: '#27272a', color: '#fff' },
}

const STATUS_CONFIG: Record<string, { badge: string; bar: string; label: string }> = {
  pending:   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',    bar: 'bg-amber-500',  label: 'Pending'   },
  paid:      { badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',       bar: 'bg-blue-500',   label: 'Paid'      },
  preparing: { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', bar: 'bg-orange-500', label: 'Cooking'   },
  ready:     { badge: 'bg-orange-400/15 text-orange-300 border border-orange-400/20', bar: 'bg-orange-400', label: 'Ready ✓'  },
  completed: { badge: 'bg-zinc-800 text-zinc-500 border border-zinc-700',             bar: 'bg-zinc-700',   label: 'Done'      },
  cancelled: { badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',       bar: 'bg-rose-500',   label: 'Cancelled' },
}

const SUGGESTED_CATEGORIES = ['Veg', 'Non-Veg', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks', 'Desserts']

const CAT_ICON: Record<string, string> = {
  'Veg': '🥗', 'Non-Veg': '🍗', 'Breakfast': '🌅', 'Drinks': '☕',
  'Snacks': '🍟', 'Lunch': '🍱', 'Dinner': '🍽️', 'Desserts': '🍰',
}
const CAT_COLOR: Record<string, string> = {
  'Veg':       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Non-Veg':   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Breakfast': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Lunch':     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Dinner':    'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Snacks':    'bg-orange-400/10 text-orange-300 border-orange-400/20',
  'Drinks':    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Desserts':  'bg-pink-500/10 text-pink-400 border-pink-500/20',
}
const getCatStyle = (cat: string) => CAT_COLOR[cat] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function groupOrdersByDate(orders: Order[]): { label: string; orders: Order[] }[] {
  const groups: Record<string, Order[]> = {}
  for (const order of orders) {
    const label = formatDateLabel(order.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(order)
  }
  return Object.entries(groups).map(([label, orders]) => ({ label, orders }))
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { toasts, toast } = useToast()
  const [token, setToken] = useState<string | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('vendor_token')
    const v = localStorage.getItem('vendor_info')
    if (t) setToken(t)
    if (v) setVendor(JSON.parse(v))
  }, [])

  const handleLogin = (t: string, v: Vendor) => {
    localStorage.setItem('vendor_token', t)
    localStorage.setItem('vendor_info', JSON.stringify(v))
    setToken(t); setVendor(v)
  }
  const handleLogout = () => {
    localStorage.removeItem('vendor_token'); localStorage.removeItem('vendor_info')
    setToken(null); setVendor(null)
  }

  return (
    <>
      <Toaster toasts={toasts} />
      {!token
        ? <LoginScreen onLogin={handleLogin} toast={toast} />
        : <DashboardShell token={token} vendor={vendor} onLogout={handleLogout} toast={toast} />}
    </>
  )
}

// ─── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, toast }: { onLogin: (t: string, v: Vendor) => void; toast: (m: string, type?: any) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.success) { onLogin(res.data.token, res.data.vendor); toast('Welcome back!', 'success') }
      else toast(res.message || 'Invalid credentials', 'error')
    } catch { toast('Could not reach server', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: '#ff6b00', borderRadius: 16, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: '#fff', letterSpacing: '-1px', margin: 0 }}>quelessly.</h1>
          <p style={{ color: '#52525b', fontSize: 13, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>Vendor Command Center</p>
        </div>
        <div style={{ background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 20, padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@canteen.com"
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                onBlur={e => e.target.style.borderColor = '#27272a'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••"
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                onBlur={e => e.target.style.borderColor = '#27272a'} />
            </div>
            <button type="submit" disabled={loading}
              style={{ marginTop: 4, background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, transition: 'all 0.15s' }}>
              {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Signing in…</> : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Shell ─────────────────────────────────────────────────────────────────────

function DashboardShell({ token, vendor, onLogout, toast }: {
  token: string; vendor: Vendor | null; onLogout: () => void; toast: (m: string, type?: any) => void
}) {
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.get('/orders', token).then(res => { if (res.success) setOrders(res.data) }).finally(() => setOrdersLoading(false))
    let socket: ReturnType<typeof getSocket> | null = null
    try {
      socket = getSocket()
      if (socket) {
        if (vendor?.id) {
          socket.emit('join_vendor', vendor.id)
          // ✅ Rejoin room on every reconnect (handles Railway restarts, network drops)
          socket.on('connect', () => {
            socket!.emit('join_vendor', vendor.id)
            })
            }

        socket.on('new_order', (data: Order) => {
          if (!data?.id) return
          setOrders(prev => [data, ...prev])
          setNewOrderIds(prev => new Set([...prev, data.id]))
          toast(`New order #${data.id.slice(0, 8).toUpperCase()}!`, 'info')
          setTimeout(() => setNewOrderIds(prev => { const n = new Set(prev); n.delete(data.id); return n }), 5000)
        })
        socket.on('order_updated', (data: { order_id: string; status: string }) => {
          if (!data?.order_id) return
          setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, status: data.status } : o))
        })
      }
    } catch (err) { console.error('Socket init failed:', err) }
    return () => { if (socket) { socket.off('new_order'); socket.off('order_updated') } }
  }, [token, vendor?.id])

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus }, token)
    if (res.success) { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)); toast(`Marked as ${newStatus}`, 'success') }
    else toast(res.message || 'Update failed', 'error')
  }

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const pastOrders   = orders.filter(o => ['completed', 'cancelled'].includes(o.status))
  const todayOrders  = pastOrders.filter(o => formatDateLabel(o.created_at) === 'Today')
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0)

  const TABS: { key: Tab; icon: React.ReactNode; label: string; badge?: number }[] = [
    {
      key: 'orders', label: 'Orders', badge: activeOrders.length || undefined,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
    },
    {
      key: 'menu', label: 'Menu',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a7 7 0 017 7c0 3.5-2 6-4 8H9c-2-2-4-4.5-4-8a7 7 0 017-7z"/><path d="M9 21h6M10 17v4M14 17v4"/></svg>,
    },
    {
      key: 'qr', label: 'QR',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M17 17h3M20 14v3"/></svg>,
    },
    {
      key: 'settings', label: 'Settings',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    },
  ]

  const tabLabel = tab === 'orders' ? 'orders.' : tab === 'menu' ? 'menu.' : tab === 'qr' ? 'qr code.' : 'settings.'

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        ${FONTS}
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .dash-sidebar-btn { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:all 0.2s; }
        .dash-sidebar-btn:hover { background:#18181b !important; color:#d4d4d8 !important; }
      `}</style>

      {/* Desktop sidebar */}
      <aside style={{ display: 'none' }} className="md-sidebar">
        <style>{`
          @media(min-width:768px){
            .md-sidebar { display:flex !important; position:fixed; left:0; top:0; bottom:0; width:80px; background:#0a0a0a; borderRight:1px solid #18181b; flexDirection:column; alignItems:center; padding:32px 0; gap:8px; zIndex:40; }
            .md-main { margin-left:80px !important; }
            .md-bottomnav { display:none !important; }
            .md-logout-mobile { display:none !important; }
          }
        `}</style>
        {/* Logo */}
        <div style={{ width: 40, height: 40, background: '#ff6b00', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: '#fff' }}>Q</span>
        </div>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} title={t.label} className="dash-sidebar-btn"
            style={{ background: tab === t.key ? 'rgba(255,107,0,0.12)' : 'transparent', color: tab === t.key ? '#ff6b00' : '#52525b', position: 'relative' }}>
            {t.icon}
            {t.badge !== undefined && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#ff6b00', color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace" }}>
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={onLogout} title="Logout" className="dash-sidebar-btn" style={{ background: 'transparent', color: '#3f3f46' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </aside>

      {/* Main */}
      <main className="md-main" style={{ flex: 1, paddingBottom: 96, minHeight: '100vh', background: '#000' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #18181b', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>{tabLabel}</h2>
            {tab === 'orders' && (
              <p style={{ color: '#52525b', fontSize: 12, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                {activeOrders.length} active · {pastOrders.length} past
                {todayOrders.length > 0 && <span style={{ color: 'rgba(255,107,0,0.7)', marginLeft: 8 }}>· Today: {todayOrders.length} orders · ₹{todayRevenue}</span>}
              </p>
            )}
            {vendor && tab !== 'orders' && <p style={{ color: '#52525b', fontSize: 12, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{vendor.name}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {tab === 'orders' && activeOrders.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b00', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, color: '#52525b', fontFamily: "'DM Mono', monospace" }}>Live</span>
              </div>
            )}
            <button onClick={onLogout} className="md-logout-mobile"
              style={{ fontSize: 12, color: '#52525b', border: '1px solid #27272a', padding: '6px 12px', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          {tab === 'orders' && <OrdersTab activeOrders={activeOrders} pastOrders={pastOrders} todayOrders={todayOrders} todayRevenue={todayRevenue} loading={ordersLoading} newOrderIds={newOrderIds} onUpdateStatus={updateStatus} />}
          {tab === 'menu'     && <MenuTab token={token} toast={toast} />}
          {tab === 'qr'       && <QRTab vendorId={vendor?.id} vendorName={vendor?.name} />}
          {tab === 'settings' && <SettingsTab vendor={vendor} token={token} toast={toast} onLogout={onLogout} />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md-bottomnav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #18181b', display: 'flex' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: tab === t.key ? '#ff6b00' : '#52525b', position: 'relative', transition: 'color 0.2s' }}>
            {tab === t.key && <span style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: '#ff6b00', borderRadius: '0 0 2px 2px' }} />}
            {t.icon}
            <span style={{ fontSize: 9, fontWeight: 600, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{t.label}</span>
            {t.badge !== undefined && (
              <span style={{ position: 'absolute', top: 8, right: '25%', width: 14, height: 14, background: '#ff6b00', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────

function OrdersTab({ activeOrders, pastOrders, todayOrders, todayRevenue, loading, newOrderIds, onUpdateStatus }: {
  activeOrders: Order[]; pastOrders: Order[]; todayOrders: Order[]; todayRevenue: number
  loading: boolean; newOrderIds: Set<string>; onUpdateStatus: (id: string, status: string) => void
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [dismissingId, setDismissingId] = useState<string | null>(null)

  const handleUpdate = async (id: string, status: string) => { setUpdatingId(id); await onUpdateStatus(id, status); setUpdatingId(null) }
  const handleDismiss = async (id: string) => {
    setDismissingId(id)
    await new Promise(r => setTimeout(r, 320))
    await onUpdateStatus(id, 'cancelled')
    setDismissingId(null)
  }
  const toggleGroup = (label: string) => setCollapsedGroups(prev => { const next = new Set(prev); next.has(label) ? next.delete(label) : next.add(label); return next })

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)}</div>

  const pastGroups = groupOrdersByDate(pastOrders)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {todayOrders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 16, padding: 16 }}>
            <p style={{ fontSize: 10, color: '#52525b', marginBottom: 4, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: 'uppercase' }}>Today's orders</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: "'DM Mono', monospace", margin: 0 }}>{todayOrders.length}</p>
          </div>
          <div style={{ background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 16, padding: 16 }}>
            <p style={{ fontSize: 10, color: '#52525b', marginBottom: 4, fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: 'uppercase' }}>Today's revenue</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#ff6b00', fontFamily: "'DM Mono', monospace", margin: 0 }}>₹{todayRevenue}</p>
          </div>
        </div>
      )}

      <section>
        {activeOrders.length === 0 ? (
          <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: '#52525b', margin: '0 0 4px' }}>All quiet</p>
            <p style={{ color: '#3f3f46', fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>New orders appear here in real time</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} isNew={newOrderIds.has(order.id)} updating={updatingId === order.id} dismissing={dismissingId === order.id} onUpdate={handleUpdate} onDismiss={handleDismiss} />
            ))}
          </div>
        )}
      </section>

      {pastGroups.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#3f3f46', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", margin: 0 }}>Past Orders</p>
          {pastGroups.map(({ label, orders }) => (
            <div key={label} style={{ background: '#0a0a0a', border: '1px solid #1c1c1c', borderRadius: 16, overflow: 'hidden' }}>
              <button onClick={() => toggleGroup(label)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                  <span style={{ fontSize: 11, color: '#52525b', fontFamily: "'DM Mono', monospace", background: '#18181b', padding: '2px 8px', borderRadius: 20, border: '1px solid #27272a' }}>
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 11, color: '#52525b', fontFamily: "'DM Mono', monospace" }}>₹{orders.reduce((s, o) => s + Number(o.total_amount), 0)}</span>
                </div>
                <span style={{ color: '#52525b', fontSize: 11, display: 'inline-block', transform: collapsedGroups.has(label) ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {!collapsedGroups.has(label) && (
                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {orders.map(order => <PastOrderCard key={order.id} order={order} />)}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

// ─── Order Card ────────────────────────────────────────────────────────────────

function useSLA(createdAt: string, status: string): boolean {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(createdAt).getTime())
  useEffect(() => {
    if (!['paid', 'preparing'].includes(status)) return
    const t = setInterval(() => setElapsed(Date.now() - new Date(createdAt).getTime()), 15_000)
    return () => clearInterval(t)
  }, [createdAt, status])
  return ['paid', 'preparing'].includes(status) && elapsed > 5 * 60 * 1000
}

function OrderCard({ order, isNew, updating, dismissing, onUpdate, onDismiss }: {
  order: Order; isNew: boolean; updating: boolean; dismissing: boolean
  onUpdate: (id: string, status: string) => void; onDismiss: (id: string) => void
}) {
  const sla       = useSLA(order.created_at, order.status)
  const next      = STATUS_FLOW[order.status]
  const action    = next ? ACTION_LABEL[order.status] : null
  const cfg       = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const time      = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const isPending = order.status === 'pending'

  const touchStartX = useRef<number | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const DISMISS_THRESHOLD = 80

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; setSwiping(true) }
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.touches[0].clientX - touchStartX.current
    if (isPending && delta < 0) setSwipeX(Math.max(delta, -DISMISS_THRESHOLD - 20))
  }
  const onTouchEnd = () => {
    setSwiping(false)
    if (swipeX < -DISMISS_THRESHOLD) { onDismiss(order.id) } else { setSwipeX(0) }
    touchStartX.current = null
  }
  const revealed = swipeX < -DISMISS_THRESHOLD / 2

  const borderColor = isNew ? 'rgba(255,107,0,0.4)' : sla ? 'rgba(239,68,68,0.5)' : '#27272a'
  const boxShadow = isNew ? '0 0 24px rgba(255,107,0,0.1)' : 'none'

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
      {isPending && (
        <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 16px 16px 0', background: revealed ? 'rgb(239,68,68)' : 'rgba(239,68,68,0.6)', transition: 'background 0.2s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Dismiss</span>
          </div>
        </div>
      )}
      <div
        style={{
          background: '#111', border: `1px solid ${borderColor}`, borderRadius: 16, overflow: 'hidden',
          boxShadow, opacity: dismissing ? 0 : 1,
          transform: dismissing ? 'translateX(-100%)' : `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        <div className={`h-1 w-full ${cfg.bar}`} />
        {isNew && (
          <div style={{ background: '#ff6b00', color: '#fff', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: '6px 0', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
            ✦ New Order
          </div>
        )}
        {sla && !isNew && (
          <div style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '6px 0', letterSpacing: 2, textTransform: 'uppercase', borderBottom: '1px solid rgba(239,68,68,0.2)', fontFamily: "'DM Mono', monospace" }}>
            ⚠ Waiting {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)}m
          </div>
        )}

        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: '#52525b', fontFamily: "'DM Mono', monospace", fontSize: 14 }}>#</span>
                <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 800, color: '#fff', fontSize: 24, letterSpacing: '-1px', margin: 0 }}>
                  {order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{time}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3f3f46', display: 'inline-block' }} />
                <span style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{cfg.label}</span>
              {isPending && (
                <button onClick={() => onDismiss(order.id)} title="Dismiss order"
                  style={{ width: 28, height: 28, borderRadius: 8, background: '#1c1c1c', border: 'none', color: '#52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#f87171' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1c1c1c'; (e.currentTarget as HTMLElement).style.color = '#52525b' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            {order.order_items?.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: idx !== 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: '#27272a', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>{item.quantity}</span>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>{item.menu_item?.name}</span>
                <span style={{ color: '#71717a', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>₹{Number(item.price) * item.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#52525b', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>Total</span>
              <span style={{ color: '#ff6b00', fontWeight: 800, fontSize: 18, fontFamily: "'DM Mono', monospace" }}>₹{Number(order.total_amount)}</span>
            </div>
          </div>

          {isPending && (
            <p style={{ color: '#3f3f46', fontSize: 12, textAlign: 'center', marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              Waiting for payment · swipe left to dismiss
            </p>
          )}

          {action && (
            <button onClick={() => onUpdate(order.id, next!)} disabled={updating}
              style={{ width: '100%', padding: '14px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: action.bg, color: action.color, fontFamily: "'DM Sans', sans-serif", opacity: updating ? 0.6 : 1, transition: 'all 0.15s' }}>
              {updating ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Updating…</> : action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Past Order Card ───────────────────────────────────────────────────────────

function PastOrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const cfg       = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.completed
  const time      = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <div style={{ background: '#111', border: '1px solid #1c1c1c', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setExpanded(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div className={`w-1.5 h-8 rounded-full shrink-0 ${cfg.bar}`} style={{ width: 4, height: 28, borderRadius: 4, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>#</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ color: '#52525b', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{time}</span>
            <span style={{ color: '#3f3f46' }}>·</span>
            <span style={{ color: '#52525b', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>₹{Number(order.total_amount)}</span>
          <span style={{ color: '#52525b', fontSize: 11, display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 12px', borderTop: '1px solid #1c1c1c' }}>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {order.order_items?.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: '#1c1c1c', color: '#71717a', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>{item.quantity}</span>
                <span style={{ color: '#a1a1aa', fontSize: 12, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>{item.menu_item?.name}</span>
                <span style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>₹{Number(item.price) * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Menu Tab ──────────────────────────────────────────────────────────────────

function MenuTab({ token, toast }: { token: string; toast: (m: string, t?: any) => void }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/menu', token).then(res => { if (res.success) setItems(res.data) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    if (res.success) { setItems(prev => prev.filter(i => i.id !== id)); toast('Item deleted', 'success') }
    else toast(res.message || 'Delete failed', 'error')
  }

  const handleToggle = async (item: MenuItem) => {
    const res = await api.patch(`/menu/${item.id}`, { is_available: !item.is_available }, token)
    if (res.success) { setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i)); toast(`${item.name} ${!item.is_available ? 'available' : 'unavailable'}`, 'success') }
    else toast(res.message || 'Failed', 'error')
  }

  const handleInlineEdit = async (item: MenuItem, field: 'name' | 'price', value: string) => {
    const body = field === 'price' ? { price: Number(value) } : { name: value.trim() }
    if (field === 'price' && Number(value) <= 0) { toast('Price must be > 0', 'warning'); return }
    if (field === 'name' && !value.trim()) { toast('Name cannot be empty', 'warning'); return }
    const res = await api.patch(`/menu/${item.id}`, body, token)
    if (res.success) { setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...body, price: String((body as any).price ?? i.price) } : i)); toast('Saved', 'success') }
    else toast(res.message || 'Failed', 'error')
  }

  const allCats = Array.from(new Set(items.flatMap(i => i.categories ?? [])))

  return (
    <div style={{ paddingBottom: 96, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {showForm && (
        <MenuItemForm token={token} editItem={editItem} existingCategories={allCats}
          onClose={() => { setShowForm(false); setEditItem(null) }}
          onSave={() => { setShowForm(false); setEditItem(null); load(); toast(editItem ? 'Updated' : 'Item added', 'success') }}
          toast={toast} />
      )}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}</div>
      ) : items.length === 0 ? (
        <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: '#52525b', margin: '0 0 4px' }}>No items yet</p>
          <p style={{ color: '#3f3f46', fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>Tap + to add your first item</p>
        </div>
      ) : (
        allCats.map(cat => (
          <section key={cat}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{CAT_ICON[cat] ?? '🍴'}</span>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#71717a', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", margin: 0 }}>{cat}</p>
              <div style={{ flex: 1, height: 1, background: '#1c1c1c' }} />
              <span style={{ fontSize: 10, color: '#3f3f46', fontFamily: "'DM Mono', monospace", background: '#111', padding: '2px 8px', borderRadius: 20, border: '1px solid #1c1c1c' }}>
                {items.filter(i => (i.categories ?? []).includes(cat)).length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {items.filter(i => (i.categories ?? []).includes(cat)).map(item => (
                <MenuItemCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete}
                  onEdit={i => { setEditItem(i); setShowForm(true) }} onInlineEdit={handleInlineEdit} />
              ))}
            </div>
          </section>
        ))
      )}
      <button onClick={() => { setEditItem(null); setShowForm(!showForm) }}
        style={{ position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, border: 'none', cursor: 'pointer', zIndex: 30, color: '#fff', background: showForm ? '#27272a' : '#ff6b00', transform: showForm ? 'rotate(45deg)' : 'none', transition: 'all 0.2s' }}>
        +
      </button>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      style={{ position: 'relative', width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0, background: checked ? '#ff6b00' : '#3f3f46', transition: 'background 0.3s' }}>
      <span style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', left: checked ? 18 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

function InlineField({ value, type = 'text', prefix = '', onSave }: { value: string; type?: string; prefix?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const commit = () => { setEditing(false); if (val !== value) onSave(val) }
  if (editing) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {prefix && <span style={{ color: '#71717a', fontSize: 12 }}>{prefix}</span>}
      <input autoFocus type={type} value={val} onChange={e => setVal(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
        style={{ background: '#27272a', border: '1px solid rgba(255,107,0,0.5)', borderRadius: 4, padding: '2px 6px', fontSize: 12, color: '#fff', outline: 'none', width: 64, fontFamily: "'DM Mono', monospace" }} />
    </span>
  )
  return (
    <span onClick={() => { setVal(value); setEditing(true) }} style={{ cursor: 'text', fontFamily: "'DM Sans', sans-serif" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff6b00'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = ''}>
      {prefix}{value}
    </span>
  )
}

function MenuItemCard({ item, onToggle, onDelete, onEdit, onInlineEdit }: {
  item: MenuItem; onToggle: (i: MenuItem) => void; onDelete: (id: string) => void
  onEdit: (i: MenuItem) => void; onInlineEdit: (i: MenuItem, field: 'name' | 'price', value: string) => void
}) {
  const isVeg    = (item.categories ?? []).includes('Veg')
  const isNonVeg = (item.categories ?? []).includes('Non-Veg')
  return (
    <div style={{ background: '#111', border: '1px solid #1c1c1c', borderRadius: 16, overflow: 'hidden', opacity: item.is_available ? 1 : 0.5, transition: 'all 0.2s' }}>
      <div style={{ height: 80, background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {!item.is_available && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#52525b', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>Unavailable</span>
          </div>
        )}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1.5" style={{ opacity: 0.3 }}>
          <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
        </svg>
        {(isVeg || isNonVeg) && (
          <div style={{ position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isVeg ? '#10b981' : '#f43f5e'}`, background: 'rgba(0,0,0,0.7)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isVeg ? '#10b981' : '#f43f5e' }} />
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <Toggle checked={item.is_available} onChange={() => onToggle(item)} />
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <p style={{ fontWeight: 600, color: '#fff', fontSize: 12, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>
          <InlineField value={item.name} onSave={v => onInlineEdit(item, 'name', v)} />
        </p>
        <p style={{ color: '#ff6b00', fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 12, margin: 0 }}>
          <InlineField value={item.price} type="number" prefix="₹" onSave={v => onInlineEdit(item, 'price', v)} />
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 8 }}>
          <button onClick={() => onEdit(item)} style={{ width: 24, height: 24, borderRadius: 6, background: '#1c1c1c', border: 'none', color: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, cursor: 'pointer' }}>✎</button>
          <button onClick={() => onDelete(item.id)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(244,63,94,0.1)', border: 'none', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, cursor: 'pointer' }}>✕</button>
        </div>
      </div>
    </div>
  )
}

// ─── Menu Item Form ────────────────────────────────────────────────────────────

function MenuItemForm({ token, editItem, existingCategories, onClose, onSave, toast }: {
  token: string; editItem: MenuItem | null; existingCategories: string[]
  onClose: () => void; onSave: () => void; toast: (m: string, t?: any) => void
}) {
  const [name, setName] = useState(editItem?.name ?? '')
  const [price, setPrice] = useState(editItem?.price ?? '')
  const [selectedCats, setSelectedCats] = useState<string[]>(editItem?.categories ?? [])
  const [customInput, setCustomInput] = useState('')
  const [loading, setLoading] = useState(false)

  const allOptions = Array.from(new Set([...SUGGESTED_CATEGORIES, ...existingCategories]))
  const toggleCat = (cat: string) => setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  const addCustom = () => { const val = customInput.trim(); if (!val) return; if (!selectedCats.includes(val)) setSelectedCats(prev => [...prev, val]); setCustomInput('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast('Enter item name', 'warning'); return }
    if (!price || Number(price) <= 0) { toast('Price must be > 0', 'warning'); return }
    if (selectedCats.length === 0) { toast('Select at least one category', 'warning'); return }
    setLoading(true)
    try {
      const body = { name: name.trim(), price: Number(price), categories: selectedCats }
      const res  = editItem ? await api.patch(`/menu/${editItem.id}`, body, token) : await api.post('/menu', body, token)
      if (res.success) onSave()
      else toast(res.message || 'Failed', 'error')
    } finally { setLoading(false) }
  }

  const inputStyle = { width: '100%', background: '#1c1c1c', border: '1px solid #27272a', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as const }

  return (
    <div style={{ background: '#111', border: '1px solid #27272a', borderRadius: 20, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: '#fff', margin: 0 }}>{editItem ? 'Edit item' : 'New item'}</p>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: '#1c1c1c', border: 'none', color: '#71717a', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name" style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'} onBlur={e => e.target.style.borderColor = '#27272a'} />
        <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price ₹" style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'} onBlur={e => e.target.style.borderColor = '#27272a'} />
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
            Categories <span style={{ color: '#3f3f46', textTransform: 'none', fontWeight: 400, letterSpacing: 0, fontFamily: "'DM Sans', sans-serif" }}>(select all that apply)</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {allOptions.map(c => (
              <button key={c} type="button" onClick={() => toggleCat(c)}
                style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: 'none', background: selectedCats.includes(c) ? '#ff6b00' : '#1c1c1c', color: selectedCats.includes(c) ? '#fff' : '#71717a', fontFamily: "'DM Sans', sans-serif" }}>
                {selectedCats.includes(c) ? '✓ ' : ''}{c}
              </button>
            ))}
          </div>
          {selectedCats.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {selectedCats.map(c => (
                <span key={c} className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getCatStyle(c)}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {c}<button type="button" onClick={() => toggleCat(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
              placeholder="Custom category…"
              style={{ flex: 1, background: '#1c1c1c', border: '1px solid #27272a', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'} onBlur={e => e.target.style.borderColor = '#27272a'} />
            <button type="button" onClick={addCustom}
              style={{ padding: '8px 12px', background: '#27272a', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Add</button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#ff6b00', color: '#fff', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.6 : 1 }}>
          {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Saving…</> : editItem ? 'Save Changes' : 'Add to Menu'}
        </button>
      </form>
    </div>
  )
}

// ─── QR Tab ────────────────────────────────────────────────────────────────────

function QRTab({ vendorId, vendorName }: { vendorId?: string; vendorName?: string }) {
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const menuUrl = vendorId && typeof window !== 'undefined' ? `${window.location.origin}/v/${vendorId}` : ''

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'quelessly-qr.svg' })
    a.click(); URL.revokeObjectURL(url); toast('QR downloaded', 'success')
  }
  const copyLink = () => { navigator.clipboard.writeText(menuUrl); toast('Link copied!', 'success') }

  if (!vendorId) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#52525b' }}>Loading…</div>

  return (
    <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", margin: '0 0 4px' }}>Scan to Order</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, color: '#fff', fontSize: 22, letterSpacing: '-0.5px', margin: 0 }}>{vendorName ?? 'your menu'}</p>
        </div>
        <div ref={qrRef} style={{ padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 0 40px rgba(255,107,0,0.12)' }}>
          <QRCodeSVG value={menuUrl} size={200} bgColor="#ffffff" fgColor="#09090b" level="H" includeMargin={false} />
        </div>
        <p style={{ fontSize: 11, color: '#3f3f46', fontFamily: "'DM Mono', monospace", wordBreak: 'break-all', textAlign: 'center', padding: '0 8px' }}>{menuUrl}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={downloadSVG}
          style={{ background: '#111', border: '1px solid #27272a', borderRadius: 14, padding: '16px 0', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
          ⬇ Download
        </button>
        <button onClick={copyLink}
          style={{ background: '#ff6b00', border: 'none', borderRadius: 14, padding: '16px 0', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
          🔗 Copy Link
        </button>
      </div>
      <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", margin: 0 }}>How it works</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Print & place', 'on each table or the counter'],
            ['Customer scans', 'with their phone camera — no app needed'],
            ['They order & pay', 'instantly via UPI / card'],
            ['You get notified', 'in real time on this dashboard'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#ff6b00', flexShrink: 0, marginTop: 1, fontFamily: "'DM Mono', monospace" }}>{i + 1}</span>
              <div>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{title} </span>
                <span style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ vendor, token, toast, onLogout }: {
  vendor: Vendor | null; token: string; toast: (m: string, t?: any) => void; onLogout: () => void
}) {
  const [name, setName] = useState(vendor?.name ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast('Name cannot be empty', 'warning'); return }
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile', { name: name.trim() }, token)
      if (res.success) {
        const updated = { ...vendor, name: name.trim() }
        localStorage.setItem('vendor_info', JSON.stringify(updated))
        toast('Canteen name updated!', 'success')
      } else { toast(res.message || 'Update failed', 'error') }
    } catch { toast('Could not reach server', 'error') }
    finally { setSaving(false) }
  }

  const inputStyle = { width: '100%', background: '#1c1c1c', border: '1px solid #27272a', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 8, fontFamily: "'DM Mono', monospace" }

  return (
    <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", margin: 0 }}>Canteen Profile</p>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Canteen Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your canteen name" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'} onBlur={e => e.target.style.borderColor = '#27272a'} />
            <p style={{ fontSize: 12, color: '#3f3f46', marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>This name is shown to customers on the menu page.</p>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <p style={{ fontSize: 14, color: '#71717a', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{vendor?.email ?? '—'}</p>
          </div>
          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#ff6b00', color: '#fff', fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.6 : 1 }}>
            {saving ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(244,63,94,0.12)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", margin: 0 }}>Account</p>
        <button onClick={onLogout}
          style={{ width: '100%', background: 'rgba(244,63,94,0.08)', color: '#f87171', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
