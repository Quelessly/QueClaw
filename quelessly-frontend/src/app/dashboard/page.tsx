'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { Toaster, useToast } from '@/components/Toast'
import { SkeletonOrderCard } from '@/components/Skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor { id: string; name: string; email: string }

interface OrderItem {
  id: string
  quantity: number
  price: string
  menu_item: { name: string }
}

interface Order {
  id: string
  status: string
  total_amount: string
  created_at: string
  order_items: OrderItem[]
}

interface MenuItem {
  id: string
  name: string
  price: string
  category: string
  is_available: boolean
}

type Tab = 'orders' | 'menu' | 'qr'

const STATUS_FLOW: Record<string, string> = {
  paid: 'preparing',
  preparing: 'ready',
  ready: 'completed',
}

const ACTION_LABEL: Record<string, { label: string; style: string }> = {
  paid:      { label: 'Start Cooking',  style: 'bg-zinc-800 text-white hover:bg-zinc-700' },
  preparing: { label: 'Mark Ready ✓',  style: 'bg-lime-400 text-black hover:bg-lime-300' },
  ready:     { label: 'Mark Completed', style: 'bg-zinc-800 text-white hover:bg-zinc-700' },
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  paid:      'bg-blue-500/15  text-blue-400  border border-blue-500/20',
  preparing: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  ready:     'bg-lime-500/15  text-lime-400  border border-lime-500/20',
  completed: 'bg-zinc-800     text-zinc-500  border border-zinc-700',
  cancelled: 'bg-rose-500/15  text-rose-400  border border-rose-500/20',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', paid: 'Paid', preparing: 'Preparing',
  ready: 'Ready', completed: 'Done', cancelled: 'Cancelled',
}

// ─── Root ─────────────────────────────────────────────────────────────────────

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
    setToken(t)
    setVendor(v)
  }

  const handleLogout = () => {
    localStorage.removeItem('vendor_token')
    localStorage.removeItem('vendor_info')
    setToken(null)
    setVendor(null)
  }

  return (
    <>
      <Toaster toasts={toasts} />
      {!token
        ? <LoginScreen onLogin={handleLogin} toast={toast} />
        : <DashboardShell token={token} vendor={vendor} onLogout={handleLogout} toast={toast} />
      }
    </>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({
  onLogin, toast,
}: {
  onLogin: (t: string, v: Vendor) => void
  toast: (m: string, type?: any) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.success) {
        onLogin(res.data.token, res.data.vendor)
        toast('Welcome back!', 'success')
      } else {
        toast(res.message || 'Invalid credentials', 'error')
      }
    } catch {
      toast('Could not reach server', 'error')
    } finally {
      setLoading(false)
    }
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
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@canteen.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-lime-400 text-black py-3.5 rounded-full font-bold disabled:opacity-50 glow-lime-sm active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Signing in…</>
                : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function DashboardShell({
  token, vendor, onLogout, toast,
}: {
  token: string
  vendor: Vendor | null
  onLogout: () => void
  toast: (m: string, type?: any) => void
}) {
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.get('/orders', token)
      .then((res) => { if (res.success) setOrders(res.data) })
      .finally(() => setOrdersLoading(false))

    try {
      const socket = getSocket()
      if (vendor?.id) socket.emit('join_vendor', vendor.id)

        socket.on('new_order', (data: Order) => {
          setOrders((prev) => [data, ...prev])
          setNewOrderIds((prev) => new Set([...prev, data.id]))
          toast(`New order #${data.id.slice(0, 8).toUpperCase()}!`, 'info')
          setTimeout(() => setNewOrderIds((prev) => {
            const next = new Set(prev); next.delete(data.id); return next
          }) , 5000)
        })
        socket.on('order_updated', (data: { order_id: string; status: string }) => {
          setOrders((prev) => prev.map((o) =>
            o.id === data.order_id ? { ...o, status: data.status } : o
        ))
      })

      return () => {
        try {
          const s = getSocket()
          s.off('new_order')
          s.off('order_updated')
          } catch {}
      }
      } catch (err) {
        console.error('Socket init failed:', err)
      }  
    }
    

    socket.on('new_order', (data: Order) => {
      setOrders((prev) => [data, ...prev])
      setNewOrderIds((prev) => new Set([...prev, data.id]))
      toast(`New order #${data.id.slice(0, 8).toUpperCase()}!`, 'info')
      setTimeout(() => setNewOrderIds((prev) => {
        const next = new Set(prev); next.delete(data.id); return next
      }), 5000)
    })

    socket.on('order_updated', (data: { order_id: string; status: string }) => {
      setOrders((prev) => prev.map((o) =>
        o.id === data.order_id ? { ...o, status: data.status } : o
      ))
    })

    return () => { socket.off('new_order'); socket.off('order_updated') }
  }, [token, vendor?.id])

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus }, token)
    if (res.success) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
      toast(`Marked as ${newStatus}`, 'success')
    } else {
      toast(res.message || 'Update failed', 'error')
    }
  }

  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status))
  const pastOrders   = orders.filter((o) => ['completed', 'cancelled'].includes(o.status))

  const TABS: { key: Tab; icon: string; label: string; badge?: number }[] = [
    { key: 'orders', icon: '◈', label: 'Orders', badge: activeOrders.length || undefined },
    { key: 'menu',   icon: '⊞', label: 'Menu'   },
    { key: 'qr',     icon: '⊟', label: 'QR'     },
  ]

  return (
    <div className="min-h-screen bg-black flex">

      {/* ── Desktop left sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-zinc-950 border-r border-zinc-900 flex-col items-center py-8 gap-2 z-40">
        <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6 glow-lime-sm">
          <span className="text-black font-black text-lg font-display">Q</span>
        </div>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            title={t.label}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-200 ${
              tab === t.key
                ? 'bg-lime-400/10 text-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            {t.icon}
            {t.badge !== undefined && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-lime-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onLogout}
          title="Logout"
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-700 hover:text-rose-400 hover:bg-zinc-900 transition-all"
        >
          ⏻
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-20 pb-24 md:pb-0 min-h-screen bg-black">
        {/* Header strip */}
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-lg border-b border-zinc-900 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-white tracking-tighter">
              {tab === 'orders' ? 'orders.' : tab === 'menu' ? 'menu.' : 'qr code.'}
            </h2>
            {tab === 'orders' && (
              <p className="text-zinc-600 text-xs mt-0.5">
                {activeOrders.length} active · {pastOrders.length} past
              </p>
            )}
            {vendor && tab !== 'orders' && (
              <p className="text-zinc-600 text-xs mt-0.5 lowercase">{vendor.name}</p>
            )}
          </div>
          {tab === 'orders' && activeOrders.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-xs text-zinc-500">Live</span>
            </div>
          )}
          {/* Mobile logout */}
          <button onClick={onLogout} className="md:hidden text-zinc-600 text-xs border border-zinc-800 px-3 py-1.5 rounded-full hover:text-zinc-300 transition-colors">
            Logout
          </button>
        </div>

        {/* Tab panels */}
        <div className="px-4 py-4">
          {tab === 'orders' && (
            <OrdersTab
              activeOrders={activeOrders}
              pastOrders={pastOrders}
              loading={ordersLoading}
              newOrderIds={newOrderIds}
              onUpdateStatus={updateStatus}
            />
          )}
          {tab === 'menu' && <MenuTab token={token} toast={toast} />}
          {tab === 'qr' && <QRTab vendorId={vendor?.id} vendorName={vendor?.name} />}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-all duration-200 ${
              tab === t.key ? 'text-lime-400' : 'text-zinc-600'
            }`}
          >
            {tab === t.key && (
              <span className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-lime-400 rounded-full" />
            )}
            <span className="text-lg">{t.icon}</span>
            <span className="text-[10px] font-semibold">{t.label}</span>
            {t.badge !== undefined && (
              <span className="absolute top-2 right-1/4 w-3.5 h-3.5 bg-lime-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({
  activeOrders, pastOrders, loading, newOrderIds, onUpdateStatus,
}: {
  activeOrders: Order[]
  pastOrders: Order[]
  loading: boolean
  newOrderIds: Set<string>
  onUpdateStatus: (id: string, status: string) => void
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleUpdate = async (id: string, status: string) => {
    setUpdatingId(id)
    await onUpdateStatus(id, status)
    setUpdatingId(null)
  }

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Active */}
      <section>
        {activeOrders.length === 0 ? (
          <div className="glass rounded-4xl p-12 text-center">
            <p className="text-4xl mb-4">🤝</p>
            <p className="text-zinc-400 font-display font-bold text-lg tracking-tighter">All quiet</p>
            <p className="text-zinc-600 text-sm mt-1">New orders appear here in real time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isNew={newOrderIds.has(order.id)}
                updating={updatingId === order.id}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {pastOrders.length > 0 && (
        <section>
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest mb-3">Past Orders</p>
          <div className="space-y-3">
            {pastOrders.slice(0, 15).map((order) => (
              <OrderCard key={order.id} order={order} isNew={false} updating={false} onUpdate={handleUpdate} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function useSLA(createdAt: string, status: string): boolean {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(createdAt).getTime())
  useEffect(() => {
    if (!['paid', 'preparing'].includes(status)) return
    const t = setInterval(() => setElapsed(Date.now() - new Date(createdAt).getTime()), 15_000)
    return () => clearInterval(t)
  }, [createdAt, status])
  return ['paid', 'preparing'].includes(status) && elapsed > 5 * 60 * 1000
}

function OrderCard({
  order, isNew, updating, onUpdate,
}: {
  order: Order
  isNew: boolean
  updating: boolean
  onUpdate: (id: string, status: string) => void
}) {
  const sla = useSLA(order.created_at, order.status)
  const next = STATUS_FLOW[order.status]
  const action = next ? ACTION_LABEL[order.status] : null
  const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`bg-zinc-900 rounded-3xl overflow-hidden border transition-all duration-300 ${
      isNew ? 'border-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.1)]'
      : sla  ? 'sla-alert border-rose-500'
      :        'border-zinc-800'
    }`}>
      {isNew && (
        <div className="bg-lime-400 text-black text-xs font-black text-center py-1.5 tracking-widest uppercase">
          ✦ New Order
        </div>
      )}
      {sla && !isNew && (
        <div className="bg-rose-500/10 text-rose-400 text-xs font-bold text-center py-1.5 tracking-widest uppercase border-b border-rose-500/20">
          ⚠ Waiting {Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)}m
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-display font-bold text-white text-lg tracking-tighter">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-zinc-600 text-xs font-mono mt-0.5">{time}</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] ?? STATUS_BADGE.pending}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* Items block — dense monospace */}
        <div className="bg-zinc-800/50 rounded-xl p-3 mb-4 font-mono text-sm space-y-0.5">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-zinc-300">
                <span className="text-zinc-500">×{item.quantity}</span> {item.menu_item?.name}
              </span>
              <span className="text-zinc-400">₹{Number(item.price) * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-zinc-700/50 mt-1.5 pt-1.5 flex justify-between font-bold">
            <span className="text-zinc-400">total</span>
            <span className="text-lime-400">₹{Number(order.total_amount)}</span>
          </div>
        </div>

        {/* Action button */}
        {action && (
          <button
            onClick={() => onUpdate(order.id, next!)}
            disabled={updating}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 ${action.style}`}
          >
            {updating
              ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Updating…</>
              : action.label
            }
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

function MenuTab({ token, toast }: { token: string; toast: (m: string, t?: any) => void }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/menu', token)
      .then((res) => { if (res.success) setItems(res.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast('Item deleted', 'success')
    } else {
      toast(res.message || 'Delete failed', 'error')
    }
  }

  const handleToggle = async (item: MenuItem) => {
    const res = await api.patch(`/menu/${item.id}`, { is_available: !item.is_available }, token)
    if (res.success) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
      toast(`${item.name} ${!item.is_available ? 'available' : 'unavailable'}`, 'success')
    } else {
      toast(res.message || 'Failed', 'error')
    }
  }

  const handleInlineEdit = async (item: MenuItem, field: 'name' | 'price', value: string) => {
    const body = field === 'price' ? { price: Number(value) } : { name: value.trim() }
    if (field === 'price' && Number(value) <= 0) { toast('Price must be > 0', 'warning'); return }
    if (field === 'name' && !value.trim()) { toast('Name cannot be empty', 'warning'); return }
    const res = await api.patch(`/menu/${item.id}`, body, token)
    if (res.success) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, ...body, price: String(body.price ?? i.price) } : i))
      toast('Saved', 'success')
    } else {
      toast(res.message || 'Failed', 'error')
    }
  }

  const categories = Array.from(new Set(items.map((i) => i.category)))

  return (
    <div className="pb-24 md:pb-4 space-y-4">
      {/* Add form */}
      {showForm && (
        <MenuItemForm
          token={token}
          editItem={editItem}
          onClose={() => { setShowForm(false); setEditItem(null) }}
          onSave={() => { setShowForm(false); setEditItem(null); load(); toast(editItem ? 'Updated' : 'Item added', 'success') }}
          toast={toast}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-4xl p-12 text-center">
          <p className="text-4xl mb-4">🍴</p>
          <p className="text-zinc-400 font-display font-bold text-lg tracking-tighter">No items yet</p>
          <p className="text-zinc-600 text-sm mt-1">Tap + to add your first item</p>
        </div>
      ) : (
        categories.map((cat) => (
          <section key={cat}>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">{cat}</p>
            <div className="space-y-2">
              {items.filter((i) => i.category === cat).map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={(i) => { setEditItem(i); setShowForm(true) }}
                  onInlineEdit={handleInlineEdit}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* FAB */}
      <button
        onClick={() => { setEditItem(null); setShowForm(!showForm) }}
        className={`fixed bottom-24 md:bottom-8 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg active:scale-90 transition-all duration-200 z-30 ${
          showForm
            ? 'bg-zinc-700 text-white rotate-45'
            : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
        }`}
      >
        +
      </button>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${
        checked ? 'bg-lime-400 glow-lime-sm' : 'bg-zinc-700'
      }`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all duration-300 shadow-sm ${
        checked ? 'left-6' : 'left-1'
      }`} />
    </button>
  )
}

function InlineField({
  value, type = 'text', prefix = '', onSave,
}: {
  value: string
  type?: string
  prefix?: string
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  const commit = () => {
    setEditing(false)
    if (val !== value) onSave(val)
  }

  if (editing) return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-zinc-400 text-sm">{prefix}</span>}
      <input
        autoFocus
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setVal(value); setEditing(false) }
        }}
        className="bg-zinc-800 border border-lime-400/50 rounded-lg px-2 py-0.5 text-sm text-white outline-none w-28 font-mono"
      />
    </div>
  )

  return (
    <span
      onClick={() => { setVal(value); setEditing(true) }}
      className="cursor-text hover:text-lime-400 transition-colors group"
      title="Click to edit"
    >
      {prefix}{value}
      <span className="opacity-0 group-hover:opacity-100 text-zinc-600 text-xs ml-1 transition-opacity">✎</span>
    </span>
  )
}

function MenuItemRow({
  item, onToggle, onDelete, onEdit, onInlineEdit,
}: {
  item: MenuItem
  onToggle: (i: MenuItem) => void
  onDelete: (id: string) => void
  onEdit: (i: MenuItem) => void
  onInlineEdit: (i: MenuItem, field: 'name' | 'price', value: string) => void
}) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-opacity ${!item.is_available ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          <InlineField
            value={item.name}
            onSave={(v) => onInlineEdit(item, 'name', v)}
          />
        </p>
        <p className="text-sm mt-0.5 text-zinc-400 font-mono">
          <InlineField
            value={item.price}
            type="number"
            prefix="₹"
            onSave={(v) => onInlineEdit(item, 'price', v)}
          />
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Toggle checked={item.is_available} onChange={() => onToggle(item)} />
        <button
          onClick={() => onDelete(item.id)}
          className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm hover:bg-rose-500/20 transition-colors active:scale-90"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function MenuItemForm({
  token, editItem, onClose, onSave, toast,
}: {
  token: string
  editItem: MenuItem | null
  onClose: () => void
  onSave: () => void
  toast: (m: string, t?: any) => void
}) {
  const [name, setName] = useState(editItem?.name ?? '')
  const [price, setPrice] = useState(editItem?.price ?? '')
  const [category, setCategory] = useState(editItem?.category ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price || !category.trim()) { toast('Fill all fields', 'warning'); return }
    if (Number(price) <= 0) { toast('Price must be > 0', 'warning'); return }
    setLoading(true)
    try {
      const body = { name: name.trim(), price: Number(price), category: category.trim() }
      const res = editItem
        ? await api.patch(`/menu/${editItem.id}`, body, token)
        : await api.post('/menu', body, token)
      if (res.success) onSave()
      else toast(res.message || 'Failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display font-bold text-white tracking-tighter">
          {editItem ? 'Edit item' : 'New item'}
        </p>
        <button onClick={onClose} className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-500 text-sm flex items-center justify-center hover:bg-zinc-700 transition-colors">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ₹"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            list="cat-opts"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
          />
          <datalist id="cat-opts">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks', 'Desserts'].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime-400 text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving…</>
            : editItem ? 'Save Changes' : 'Add to Menu'}
        </button>
      </form>
    </div>
  )
}

// ─── QR Tab ───────────────────────────────────────────────────────────────────

function QRTab({ vendorId, vendorName }: { vendorId?: string; vendorName?: string }) {
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const menuUrl = vendorId && typeof window !== 'undefined'
    ? `${window.location.origin}/v/${vendorId}`
    : ''

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `quelessly-qr.svg`,
    })
    a.click()
    URL.revokeObjectURL(url)
    toast('QR downloaded', 'success')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(menuUrl)
    toast('Link copied!', 'success')
  }

  if (!vendorId) return (
    <div className="text-center py-20 text-zinc-600">Loading…</div>
  )

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* QR card */}
      <div className="glass rounded-4xl p-8 flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scan to Order</p>
          <p className="font-display font-bold text-white text-2xl tracking-tighter mt-1 lowercase">
            {vendorName ?? 'your menu'}
          </p>
        </div>

        {/* QR */}
        <div ref={qrRef} className="p-5 bg-white rounded-3xl shadow-[0_0_40px_rgba(163,230,53,0.15)]">
          <QRCodeSVG
            value={menuUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#09090b"
            level="H"
            includeMargin={false}
          />
        </div>

        <p className="text-xs text-zinc-600 font-mono break-all text-center px-2">{menuUrl}</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadSVG}
          className="glass rounded-3xl py-4 font-bold text-sm flex items-center justify-center gap-2 text-white active:scale-95 transition-all duration-200 hover:bg-zinc-800"
        >
          ⬇ Download
        </button>
        <button
          onClick={copyLink}
          className="bg-lime-400 text-black rounded-3xl py-4 font-bold text-sm flex items-center justify-center gap-2 glow-lime-sm active:scale-95 transition-all duration-200"
        >
          🔗 Copy Link
        </button>
      </div>

      {/* How-to */}
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
              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <span className="text-white text-xs font-semibold">{title} </span>
                <span className="text-zinc-500 text-xs">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
