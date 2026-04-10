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

const ACTION_LABEL: Record<string, { label: string; style: string }> = {
  paid:      { label: 'Start Cooking',  style: 'bg-zinc-800 text-white hover:bg-zinc-700' },
  preparing: { label: 'Mark Ready ✓',  style: 'bg-lime-400 text-black hover:bg-lime-300' },
  ready:     { label: 'Mark Completed', style: 'bg-zinc-800 text-white hover:bg-zinc-700' },
}

const STATUS_CONFIG: Record<string, { badge: string; bar: string; label: string }> = {
  pending:   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',    bar: 'bg-amber-500',  label: 'Pending'   },
  paid:      { badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',       bar: 'bg-blue-500',   label: 'Paid'      },
  preparing: { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', bar: 'bg-orange-500', label: 'Cooking'   },
  ready:     { badge: 'bg-lime-500/15 text-lime-400 border border-lime-500/20',        bar: 'bg-lime-400',   label: 'Ready ✓'  },
  completed: { badge: 'bg-zinc-800 text-zinc-500 border border-zinc-700',              bar: 'bg-zinc-700',   label: 'Done'      },
  cancelled: { badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',        bar: 'bg-rose-500',   label: 'Cancelled' },
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
  'Snacks':    'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Drinks':    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Desserts':  'bg-pink-500/10 text-pink-400 border-pink-500/20',
}
const getCatStyle = (cat: string) => CAT_COLOR[cat] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-lime-400 rounded-3xl mx-auto mb-5 flex items-center justify-center glow-lime">
            <span className="text-black font-black text-3xl font-display">Q</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tighter">quelessly.</h1>
          <p className="text-zinc-500 text-sm mt-1">Vendor Command Center</p>
        </div>
        <div className="glass rounded-4xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@canteen.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-lime-400 text-black py-3.5 rounded-full font-bold disabled:opacity-50 glow-lime-sm active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Signing in…</> : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
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
        if (vendor?.id) socket.emit('join_vendor', vendor.id)
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

  // Today's stats computed from orders
  const todayOrders = pastOrders.filter(o => formatDateLabel(o.created_at) === 'Today')
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0)

  const TABS: { key: Tab; icon: React.ReactNode; label: string; badge?: number }[] = [
    {
      key: 'orders', label: 'Orders', badge: activeOrders.length || undefined,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      key: 'menu', label: 'Menu',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2a7 7 0 017 7c0 3.5-2 6-4 8H9c-2-2-4-4.5-4-8a7 7 0 017-7z"/>
          <path d="M9 21h6M10 17v4M14 17v4"/>
        </svg>
      ),
    },
    {
      key: 'qr', label: 'QR',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <path d="M14 14h3v3M17 17h3M20 14v3"/>
        </svg>
      ),
    },
    {
      key: 'settings', label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-black flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-zinc-950 border-r border-zinc-900 flex-col items-center py-8 gap-2 z-40">
        <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6 glow-lime-sm">
          <span className="text-black font-black text-lg font-display">Q</span>
        </div>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} title={t.label}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${tab === t.key ? 'bg-lime-400/10 text-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.15)]' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'}`}>
            {t.icon}
            {t.badge !== undefined && <span className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">{t.badge > 9 ? '9+' : t.badge}</span>}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onLogout} title="Logout" className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-700 hover:text-rose-400 hover:bg-zinc-900 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </aside>

      <main className="flex-1 md:ml-20 pb-24 md:pb-0 min-h-screen bg-black">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-lg border-b border-zinc-900 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-white tracking-tighter">
              {tab === 'orders' ? 'orders.' : tab === 'menu' ? 'menu.' : tab === 'qr' ? 'qr code.' : 'settings.'}
            </h2>
            {tab === 'orders' && (
              <p className="text-zinc-600 text-xs mt-0.5">
                {activeOrders.length} active · {pastOrders.length} past
                {todayOrders.length > 0 && (
                  <span className="ml-2 text-lime-400/70">· Today: {todayOrders.length} orders · ₹{todayRevenue}</span>
                )}
              </p>
            )}
            {vendor && tab !== 'orders' && <p className="text-zinc-600 text-xs mt-0.5 lowercase">{vendor.name}</p>}
          </div>
          {tab === 'orders' && activeOrders.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-xs text-zinc-500">Live</span>
            </div>
          )}
          <button onClick={onLogout} className="md:hidden text-zinc-600 text-xs border border-zinc-800 px-3 py-1.5 rounded-full hover:text-zinc-300 transition-colors">Logout</button>
        </div>

        <div className="px-4 py-4">
          {tab === 'orders' && (
            <OrdersTab
              activeOrders={activeOrders}
              pastOrders={pastOrders}
              todayOrders={todayOrders}
              todayRevenue={todayRevenue}
              loading={ordersLoading}
              newOrderIds={newOrderIds}
              onUpdateStatus={updateStatus}
            />
          )}
          {tab === 'menu'     && <MenuTab token={token} toast={toast} />}
          {tab === 'qr'       && <QRTab vendorId={vendor?.id} vendorName={vendor?.name} />}
          {tab === 'settings' && <SettingsTab vendor={vendor} token={token} toast={toast} onLogout={onLogout} />}
        </div>
      </main>

      {/* Mobile bottom nav — now 4 tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 flex">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-all duration-200 ${tab === t.key ? 'text-lime-400' : 'text-zinc-600'}`}>
            {tab === t.key && <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-lime-400 rounded-full" />}
            {t.icon}
            <span className="text-[9px] font-semibold mt-0.5">{t.label}</span>
            {t.badge !== undefined && <span className="absolute top-2 right-1/4 w-3.5 h-3.5 bg-lime-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">{t.badge > 9 ? '9+' : t.badge}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────

function OrdersTab({ activeOrders, pastOrders, todayOrders, todayRevenue, loading, newOrderIds, onUpdateStatus }: {
  activeOrders: Order[]; pastOrders: Order[]; todayOrders: Order[]; todayRevenue: number;
  loading: boolean; newOrderIds: Set<string>; onUpdateStatus: (id: string, status: string) => void
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const handleUpdate = async (id: string, status: string) => { setUpdatingId(id); await onUpdateStatus(id, status); setUpdatingId(null) }

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => { const next = new Set(prev); next.has(label) ? next.delete(label) : next.add(label); return next })
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)}</div>

  const pastGroups = groupOrdersByDate(pastOrders)

  return (
    <div className="space-y-8">

      {/* Today's stats chips */}
      {todayOrders.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Today's orders</p>
            <p className="text-2xl font-black text-white font-mono">{todayOrders.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Today's revenue</p>
            <p className="text-2xl font-black text-lime-400 font-mono">₹{todayRevenue}</p>
          </div>
        </div>
      )}

      {/* Active orders */}
      <section>
        {activeOrders.length === 0 ? (
          <div className="glass rounded-4xl p-12 text-center">
            <p className="text-zinc-400 font-display font-bold text-lg tracking-tighter">All quiet</p>
            <p className="text-zinc-600 text-sm mt-1">New orders appear here in real time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} isNew={newOrderIds.has(order.id)} updating={updatingId === order.id} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </section>

      {/* Past orders grouped by date */}
      {pastGroups.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Past Orders</p>
          {pastGroups.map(({ label, orders }) => (
            <div key={label} className="bg-zinc-950 border border-zinc-800/60 rounded-2xl overflow-hidden">
              <button onClick={() => toggleGroup(label)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{label}</span>
                  <span className="text-xs text-zinc-600 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-zinc-600 font-mono">₹{orders.reduce((s, o) => s + Number(o.total_amount), 0)}</span>
                </div>
                <span className={`text-zinc-600 text-xs transition-transform duration-200 ${collapsedGroups.has(label) ? '' : 'rotate-180'}`}>▼</span>
              </button>
              {!collapsedGroups.has(label) && (
                <div className="px-3 pb-3 space-y-2">
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

// ─── Active Order Card ─────────────────────────────────────────────────────────

function useSLA(createdAt: string, status: string): boolean {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(createdAt).getTime())
  useEffect(() => {
    if (!['paid', 'preparing'].includes(status)) return
    const t = setInterval(() => setElapsed(Date.now() - new Date(createdAt).getTime()), 15_000)
    return () => clearInterval(t)
  }, [createdAt, status])
  return ['paid', 'preparing'].includes(status) && elapsed > 5 * 60 * 1000
}

function OrderCard({ order, isNew, updating, onUpdate }: {
  order: Order; isNew: boolean; updating: boolean; onUpdate: (id: string, status: string) => void
}) {
  const sla    = useSLA(order.created_at, order.status)
  const next   = STATUS_FLOW[order.status]
  const action = next ? ACTION_LABEL[order.status] : null
  const cfg    = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const time   = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0

  return (
    <div className={`bg-zinc-900 rounded-3xl overflow-hidden border transition-all duration-300 ${
      isNew ? 'border-lime-400/50 shadow-[0_0_24px_rgba(163,230,53,0.12)]' : sla ? 'border-rose-500/60' : 'border-zinc-800'
    }`}>
      <div className={`h-1 w-full ${cfg.bar}`} />
      {isNew && <div className="bg-lime-400 text-black text-xs font-black text-center py-1.5 tracking-widest uppercase">✦ New Order</div>}
      {sla && !isNew && (
        <div className="bg-rose-500/10 text-rose-400 text-xs font-bold text-center py-1.5 tracking-widest uppercase border-b border-rose-500/20">
          ⚠ Waiting {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)}m
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-zinc-600 font-mono text-sm">#</span>
              <p className="font-display font-black text-white text-2xl tracking-tighter leading-none">
                {order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-zinc-500 text-xs font-mono">{time}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-zinc-500 text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
        </div>

        <div className="bg-zinc-800/40 rounded-2xl overflow-hidden mb-4">
          {order.order_items?.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 ${idx !== 0 ? 'border-t border-zinc-800/60' : ''}`}>
              <span className="w-6 h-6 rounded-lg bg-zinc-700 text-white text-xs font-black flex items-center justify-center shrink-0">{item.quantity}</span>
              <span className="text-white text-sm font-medium flex-1">{item.menu_item?.name}</span>
              <span className="text-zinc-400 text-sm font-mono">₹{Number(item.price) * item.quantity}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-700/60 bg-zinc-800/40">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total</span>
            <span className="text-lime-400 font-black text-lg font-mono">₹{Number(order.total_amount)}</span>
          </div>
        </div>

        {action && (
          <button onClick={() => onUpdate(order.id, next!)} disabled={updating}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 ${action.style}`}>
            {updating ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Updating…</> : action.label}
          </button>
        )}
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
    <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/30 transition-colors">
        <div className={`w-1.5 h-8 rounded-full shrink-0 ${cfg.bar}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-mono">#</span>
            <span className="text-white font-bold text-sm font-mono tracking-tight">{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-zinc-600 text-xs">{time}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600 text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-white font-bold font-mono text-sm">₹{Number(order.total_amount)}</span>
          <span className={`text-zinc-600 text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-zinc-800/60">
          <div className="mt-2 space-y-1">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-1.5">
                <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-bold flex items-center justify-center shrink-0">{item.quantity}</span>
                <span className="text-zinc-300 text-xs flex-1">{item.menu_item?.name}</span>
                <span className="text-zinc-500 text-xs font-mono">₹{Number(item.price) * item.quantity}</span>
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
    <div className="pb-24 md:pb-4 space-y-6">
      {showForm && (
        <MenuItemForm token={token} editItem={editItem} existingCategories={allCats}
          onClose={() => { setShowForm(false); setEditItem(null) }}
          onSave={() => { setShowForm(false); setEditItem(null); load(); toast(editItem ? 'Updated' : 'Item added', 'success') }}
          toast={toast} />
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}</div>
      ) : items.length === 0 ? (
        <div className="glass rounded-4xl p-12 text-center">
          <p className="text-zinc-400 font-display font-bold text-lg tracking-tighter">No items yet</p>
          <p className="text-zinc-600 text-sm mt-1">Tap + to add your first item</p>
        </div>
      ) : (
        allCats.map(cat => (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: '16px' }}>{CAT_ICON[cat] ?? '🍴'}</span>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{cat}</p>
              <div className="flex-1 h-px bg-zinc-800/80" />
              <span className="text-[10px] text-zinc-700 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                {items.filter(i => (i.categories ?? []).includes(cat)).length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.filter(i => (i.categories ?? []).includes(cat)).map(item => (
                <MenuItemCard key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete}
                  onEdit={i => { setEditItem(i); setShowForm(true) }} onInlineEdit={handleInlineEdit} />
              ))}
            </div>
          </section>
        ))
      )}

      <button onClick={() => { setEditItem(null); setShowForm(!showForm) }}
        className={`fixed bottom-24 md:bottom-8 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg active:scale-90 transition-all duration-200 z-30 ${showForm ? 'bg-zinc-700 text-white rotate-45' : 'bg-lime-400 text-black glow-lime-sm'}`}>
        +
      </button>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-9 h-5 rounded-full transition-all duration-300 shrink-0 ${checked ? 'bg-lime-400' : 'bg-zinc-700'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  )
}

function InlineField({ value, type = 'text', prefix = '', onSave }: { value: string; type?: string; prefix?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const commit = () => { setEditing(false); if (val !== value) onSave(val) }

  if (editing) return (
    <div className="flex items-center gap-0.5">
      {prefix && <span className="text-zinc-400 text-xs">{prefix}</span>}
      <input autoFocus type={type} value={val} onChange={e => setVal(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
        className="bg-zinc-700 border border-lime-400/50 rounded px-1.5 py-0.5 text-xs text-white outline-none w-16 font-mono" />
    </div>
  )
  return (
    <span onClick={() => { setVal(value); setEditing(true) }} className="cursor-text hover:text-lime-400 transition-colors group" title="Click to edit">
      {prefix}{value}<span className="opacity-0 group-hover:opacity-40 text-zinc-500 text-[10px] ml-0.5 transition-opacity">✎</span>
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
    <div className={`relative bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-200 ${!item.is_available ? 'opacity-50 border-zinc-800' : 'border-zinc-800 hover:border-zinc-600'}`}>
      {/* Clean image area — no emoji, no colored backgrounds */}
      <div className="h-20 bg-zinc-800 flex items-center justify-center relative">
        {item.is_available === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Unavailable</span>
          </div>
        )}
        {/* Neutral placeholder */}
        <div className="flex flex-col items-center gap-1 opacity-25">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        {(isVeg || isNonVeg) && (
          <div className={`absolute top-2 left-2 w-4 h-4 rounded flex items-center justify-center border ${isVeg ? 'border-emerald-500 bg-zinc-900/80' : 'border-rose-500 bg-zinc-900/80'}`}>
            <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Toggle checked={item.is_available} onChange={() => onToggle(item)} />
        </div>
      </div>
      <div className="p-2.5">
        <p className="font-semibold text-white text-xs leading-tight truncate">
          <InlineField value={item.name} onSave={v => onInlineEdit(item, 'name', v)} />
        </p>
        <p className="text-lime-400 font-mono font-bold text-xs mt-0.5">
          <InlineField value={item.price} type="number" prefix="₹" onSave={v => onInlineEdit(item, 'price', v)} />
        </p>
        <div className="flex items-center justify-end gap-1 mt-2">
          <button onClick={() => onEdit(item)} className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center text-[10px] hover:bg-zinc-700 hover:text-white transition-all active:scale-90">✎</button>
          <button onClick={() => onDelete(item.id)} className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center text-[10px] hover:bg-rose-500/20 transition-all active:scale-90">✕</button>
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
  const toggleCat  = (cat: string) => setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  const addCustom  = () => { const val = customInput.trim(); if (!val) return; if (!selectedCats.includes(val)) setSelectedCats(prev => [...prev, val]); setCustomInput('') }

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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display font-bold text-white tracking-tighter">{editItem ? 'Edit item' : 'New item'}</p>
        <button onClick={onClose} className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-500 text-sm flex items-center justify-center hover:bg-zinc-700 transition-colors">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors" />
        <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price ₹"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors" />
        <div>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">Categories <span className="text-zinc-700 normal-case font-normal">(select all that apply)</span></p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {allOptions.map(c => (
              <button key={c} type="button" onClick={() => toggleCat(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95 ${selectedCats.includes(c) ? 'bg-lime-400 text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                {selectedCats.includes(c) ? '✓ ' : ''}{c}
              </button>
            ))}
          </div>
          {selectedCats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedCats.map(c => (
                <span key={c} className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getCatStyle(c)}`}>
                  {c}<button type="button" onClick={() => toggleCat(c)} className="hover:text-white transition-colors leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={customInput} onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
              placeholder="Type a custom category…"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors" />
            <button type="button" onClick={addCustom} className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold rounded-xl transition-colors">+ Add</button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-lime-400 text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          {loading ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Saving…</> : editItem ? 'Save Changes' : 'Add to Menu'}
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

  if (!vendorId) return <div className="text-center py-20 text-zinc-600">Loading…</div>

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="glass rounded-4xl p-8 flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scan to Order</p>
          <p className="font-display font-bold text-white text-2xl tracking-tighter mt-1 lowercase">{vendorName ?? 'your menu'}</p>
        </div>
        <div ref={qrRef} className="p-5 bg-white rounded-3xl shadow-[0_0_40px_rgba(163,230,53,0.15)]">
          <QRCodeSVG value={menuUrl} size={200} bgColor="#ffffff" fgColor="#09090b" level="H" includeMargin={false} />
        </div>
        <p className="text-xs text-zinc-600 font-mono break-all text-center px-2">{menuUrl}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={downloadSVG} className="glass rounded-3xl py-4 font-bold text-sm flex items-center justify-center gap-2 text-white active:scale-95 transition-all duration-200 hover:bg-zinc-800">⬇ Download</button>
        <button onClick={copyLink}    className="bg-lime-400 text-black rounded-3xl py-4 font-bold text-sm flex items-center justify-center gap-2 glow-lime-sm active:scale-95 transition-all duration-200">🔗 Copy Link</button>
      </div>
      <div className="glass rounded-3xl p-5 space-y-3">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">How it works</p>
        <div className="space-y-2.5">
          {[
            ['Print & place', 'on each table or the counter'],
            ['Student scans', 'with their phone camera — no app needed'],
            ['They order & pay', 'instantly via UPI / card'],
            ['You get notified', 'in real time on this dashboard'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">{i + 1}</span>
              <div><span className="text-white text-xs font-semibold">{title} </span><span className="text-zinc-500 text-xs">{desc}</span></div>
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
      } else {
        toast(res.message || 'Update failed', 'error')
      }
    } catch {
      toast('Could not reach server', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-sm space-y-4">
      {/* Profile card */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Canteen Profile</p>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Canteen Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your canteen name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
            />
            <p className="text-xs text-zinc-600 mt-1.5">This name is shown to students on the menu page.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
            <p className="text-sm text-zinc-400 px-1">{vendor?.email ?? '—'}</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-lime-400 text-black py-3 rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-3xl p-6 space-y-3 border border-rose-500/10">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Account</p>
        <button
          onClick={onLogout}
          className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/20 py-3 rounded-2xl font-bold text-sm hover:bg-rose-500/20 active:scale-[0.98] transition-all"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}