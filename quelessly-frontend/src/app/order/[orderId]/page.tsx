'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'

interface OrderItem {
  id: string
  quantity: number
  price: string
  menu_item: { name: string }
}

interface Order {
  id: string
  status: string
  payment_status: string
  total_amount: string
  created_at: string
  order_items: OrderItem[]
}

const STATUS_ORDER = ['pending', 'paid', 'preparing', 'ready', 'completed']

function PulsingRing() {
  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
      <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(26,23,20,0.08)" strokeWidth="4" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ff6b00" strokeWidth="4"
          strokeLinecap="round" strokeDasharray="138 138"
          style={{ animation: 'spin-ring 2s linear infinite', transformOrigin: '50% 50%' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontSize: 44 }}>👨‍🍳</span>
        <span style={{ fontSize: 10, color: '#8a7f72', fontFamily: 'var(--font-dm-mono), monospace', letterSpacing: 2, textTransform: 'uppercase' }}>cooking</span>
      </div>
    </div>
  )
}

function ConfirmedIcon() {
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#F2EDE4', border: '1px solid rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 56 }}>💳</span>
      </div>
    </div>
  )
}

const STEPPER_STEPS = [
  { key: 'paid',      label: 'Confirmed' },
  { key: 'preparing', label: 'Cooking'   },
  { key: 'ready',     label: 'Ready'     },
  { key: 'completed', label: 'Done'      },
]

function CompletedScreen({ order, vendorId }: { order: Order; vendorId: string | undefined }) {
  useEffect(() => { localStorage.removeItem('active_order') }, [])

  const time = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`@keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <div style={{ width: '100%', maxWidth: 360, animation: 'fade-in 0.4s ease' }}>
        <div style={{ height: 16, background: '#fff', borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 12, background: '#FAF7F2', borderRadius: 20, margin: '0 2px' }} />
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '8px 24px 24px', border: '1px solid rgba(26,23,20,0.06)', borderTop: 'none', borderBottom: 'none' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, background: '#ff6b00', borderRadius: 14, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#1a1714', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Order complete</p>
            <p style={{ color: '#8a7f72', fontSize: 12, margin: 0, fontFamily: 'var(--font-dm-mono), monospace' }}>{date} · {time}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 20, borderBottom: '1px dashed rgba(26,23,20,0.12)' }}>
            <span style={{ color: '#8a7f72', fontSize: 11, fontFamily: 'var(--font-dm-mono), monospace', letterSpacing: 1, textTransform: 'uppercase' }}>Order</span>
            <span style={{ color: '#1a1714', fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 700, fontSize: 14 }}>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {order.order_items?.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: '#F2EDE4', color: '#8a7f72', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-dm-mono), monospace' }}>
                    {item.quantity}
                  </span>
                  <span style={{ color: '#3d3830', fontSize: 14, fontFamily: 'var(--font-dm-sans), sans-serif' }}>{item.menu_item?.name}</span>
                </div>
                <span style={{ color: '#1a1714', fontFamily: 'var(--font-dm-mono), monospace', fontSize: 14, fontWeight: 600 }}>₹{Number(item.price) * item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px dashed rgba(26,23,20,0.12)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ color: '#8a7f72', fontSize: 14, fontFamily: 'var(--font-dm-sans), sans-serif' }}>Total paid</span>
            <span style={{ color: '#ff6b00', fontWeight: 800, fontSize: 22, fontFamily: 'var(--font-dm-mono), monospace' }}>₹{Number(order.total_amount)}</span>
          </div>
          {vendorId && (
            <a href={`/v/${vendorId}`}
              style={{ display: 'block', width: '100%', background: '#ff6b00', color: '#fff', textAlign: 'center', padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Order again →
            </a>
          )}
        </div>
        <div style={{ height: 16, background: '#fff', borderRadius: '0 0 16px 16px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 12, background: '#FAF7F2', borderRadius: 20, margin: '0 2px' }} />
            ))}
          </div>
        </div>
      </div>
      <a href="https://quelessly.com" style={{ fontSize: 12, color: '#c9c2b8', marginTop: 32, textDecoration: 'none', fontFamily: 'var(--font-dm-mono), monospace' }}>
        powered by quelessly.
      </a>
    </div>
  )
}

export default function OrderPage() {
  const params = useParams()
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusPulse, setStatusPulse] = useState(false)

  const vendorId = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('active_order') ?? '{}')?.vendorId } catch { return undefined } })()
    : undefined

  const triggerPulse = () => { setStatusPulse(true); setTimeout(() => setStatusPulse(false), 1200) }

  useEffect(() => {
  if (!orderId) return

  // ✅ Initial fetch
  api.get(`/orders/${orderId}`)
    .then(res => { if (res.success) setOrder(res.data) })
    .finally(() => setLoading(false))

  // ✅ Polling
  const poll = setInterval(() => {
    api.get(`/orders/${orderId}`).then(res => {
      if (res.success && res.data.status !== order?.status) {
        setOrder(res.data)
      }
    })
  }, 10000)

  let socket: ReturnType<typeof getSocket> | null = null

  try {
    socket = getSocket()
    if (socket) {
      socket.emit('join_order', orderId)

      socket.on('connect', async () => {
        socket!.emit('join_order', orderId)

        const res = await api.get(`/orders/${orderId}`)
        if (res.success) setOrder(res.data)
      })

      socket.on('order_status_updated', (data) => {
        if (data.order_id === orderId) {
          setOrder(prev => prev ? { ...prev, status: data.status } : prev)
          triggerPulse()
        }
      })

      socket.on('payment_success', (data) => {
        if (data.order_id === orderId) {
          setOrder(prev => prev
            ? { ...prev, status: 'paid', payment_status: 'captured' }
            : prev
          )
          triggerPulse()
        }
      })
    }
  } catch (err) {
    console.error('Socket init failed:', err)
  }

  return () => {
    clearInterval(poll)

    if (socket) {
      socket.off('order_status_updated')
      socket.off('payment_success')
      socket.off('connect')
    }
  }

}, [orderId])

useEffect(() => {
  if (!orderId) return

  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      api.get(`/orders/${orderId}`).then(res => {
        if (res.success) setOrder(res.data)
      })
    }
  }

  document.addEventListener('visibilitychange', onVisible)

  return () => {
    document.removeEventListener('visibilitychange', onVisible)
  }
}, [orderId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#8a7f72', fontSize: 14, fontFamily: 'var(--font-dm-sans), sans-serif' }}>Fetching your order…</p>
      </div>
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 24px' }}>
      <p style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: '#1a1714', margin: 0 }}>Order not found</p>
      <a href="https://quelessly.com" style={{ color: '#ff6b00', fontWeight: 600, fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-dm-sans), sans-serif' }}>Go home →</a>
    </div>
  )

  if (order.status === 'ready') return (
    <div style={{ position: 'fixed', inset: 0, background: '#ff6b00', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`@keyframes ready-in { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} } * { box-sizing: border-box; }`}</style>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 32, fontFamily: 'var(--font-dm-mono), monospace' }}>Ready for Pickup</p>
      <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 900, color: '#fff', textAlign: 'center', fontSize: 'clamp(4rem, 20vw, 9rem)', lineHeight: 1, letterSpacing: '-4px', margin: '0 0 24px' }}>
        #{order.id.slice(0, 6).toUpperCase()}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', marginBottom: 40 }}>Show this code at the counter</p>
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 20, width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {order.order_items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{item.menu_item?.name} ×{item.quantity}</span>
              <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 700, color: '#fff' }}>₹{Number(item.price) * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
      <a href="https://quelessly.com" style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontFamily: 'var(--font-dm-mono), monospace' }}>
        powered by quelessly.
      </a>
    </div>
  )

  if (order.status === 'completed') return <CompletedScreen order={order} vendorId={vendorId} />

  if (order.status === 'cancelled') return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#1a1714', margin: '0 0 4px' }}>Order cancelled</h2>
        <p style={{ color: '#8a7f72', fontSize: 14, margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif' }}>Contact the canteen for help</p>
      </div>
      <a href="https://quelessly.com" style={{ fontSize: 12, color: '#c9c2b8', textDecoration: 'none', fontFamily: 'var(--font-dm-mono), monospace' }}>powered by quelessly.</a>
    </div>
  )

  const currentStepIndex = STATUS_ORDER.indexOf(order.status)
  const isPreparing = order.status === 'preparing'
  const isPaid = order.status === 'paid'
  const isPending = order.status === 'pending'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 32, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`
        @keyframes spin-ring { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ padding: '48px 20px 24px' }}>
        <p style={{ color: '#8a7f72', fontSize: 11, fontFamily: 'var(--font-dm-mono), monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Order</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 800, color: '#1a1714', fontSize: 32, letterSpacing: '-1px', margin: 0 }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          {!isPending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff6b00', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, color: '#8a7f72', fontFamily: 'var(--font-dm-mono), monospace' }}>Live</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: `1px solid ${statusPulse ? 'rgba(255,107,0,0.4)' : 'rgba(26,23,20,0.07)'}`, boxShadow: statusPulse ? '0 0 30px rgba(255,107,0,0.1)' : '0 2px 12px rgba(26,23,20,0.04)', transition: 'all 0.5s' }}>
          {isPreparing ? <PulsingRing /> : <ConfirmedIcon />}
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <p style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#1a1714', letterSpacing: '-0.5px', margin: '8px 0 4px' }}>
              {isPending && 'Waiting for payment'}
              {isPaid && 'Order confirmed'}
              {isPreparing && 'Preparing your order'}
            </p>
            <p style={{ color: '#8a7f72', fontSize: 14, margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              {isPending && 'Complete payment to confirm your order'}
              {isPaid && 'The kitchen has received your order'}
              {isPreparing && "We'll notify you when it's ready"}
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(26,23,20,0.07)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8a7f72', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-dm-mono), monospace' }}>Progress</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPPER_STEPS.map((step, i, arr) => {
              const stepIdx = STATUS_ORDER.indexOf(step.key)
              const done    = currentStepIndex >= stepIdx
              const active  = order.status === step.key
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'unset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.5s', background: done ? '#ff6b00' : '#F2EDE4', color: done ? '#fff' : '#8a7f72', boxShadow: active ? '0 0 0 3px rgba(255,107,0,0.2), 0 0 0 5px rgba(255,107,0,0.08)' : 'none', fontFamily: 'var(--font-dm-mono), monospace' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: done ? '#3d3830' : '#8a7f72', textAlign: 'center', lineHeight: 1.2, fontFamily: 'var(--font-dm-sans), sans-serif', transition: 'color 0.5s' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ flex: 1, height: 1, margin: '0 6px', marginBottom: 20, background: currentStepIndex > stepIdx ? 'rgba(255,107,0,0.4)' : 'rgba(26,23,20,0.1)', transition: 'background 0.7s' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(26,23,20,0.07)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(26,23,20,0.06)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#8a7f72', letterSpacing: 2, textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-dm-mono), monospace' }}>Your Items</p>
          </div>
          <div>
            {order.order_items?.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', fontSize: 14, borderTop: idx !== 0 ? '1px solid rgba(26,23,20,0.05)' : 'none' }}>
                <span style={{ color: '#3d3830', fontFamily: 'var(--font-dm-sans), sans-serif' }}>{item.menu_item?.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#8a7f72', fontFamily: 'var(--font-dm-mono), monospace' }}>×{item.quantity}</span>
                  <span style={{ color: '#1a1714', fontWeight: 700, fontFamily: 'var(--font-dm-mono), monospace' }}>₹{Number(item.price) * item.quantity}</span>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FAF7F2', borderTop: '1px solid rgba(26,23,20,0.06)' }}>
              <span style={{ fontWeight: 700, color: '#1a1714', fontFamily: 'var(--font-dm-sans), sans-serif' }}>Total</span>
              <span style={{ fontWeight: 800, color: '#ff6b00', fontFamily: 'var(--font-dm-mono), monospace', fontSize: 18 }}>₹{Number(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <a href="https://quelessly.com" style={{ fontSize: 12, color: '#c9c2b8', textDecoration: 'none', fontFamily: 'var(--font-dm-mono), monospace' }}>
            powered by quelessly.
          </a>
        </div>
      </div>
    </div>
  )
}