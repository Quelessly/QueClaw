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
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#27272a" strokeWidth="4" />
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="#a3e635"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="138 138"
          className="animate-spin-ring origin-center"
          style={{ transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-5xl">👨‍🍳</span>
        <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">cooking</span>
      </div>
    </div>
  )
}

function ConfirmedIcon() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div className="w-full h-full rounded-full glass border border-lime-400/30 flex items-center justify-center glow-lime-sm">
        <span className="text-6xl">💳</span>
      </div>
    </div>
  )
}

// Progress stepper steps
const STEPPER_STEPS = [
  { key: 'paid',      label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Cooking',   icon: '👨‍🍳' },
  { key: 'ready',     label: 'Ready',     icon: '✓' },
  { key: 'completed', label: 'Done',      icon: '✓' },
]

export default function OrderPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusPulse, setStatusPulse] = useState(false)

  const triggerPulse = () => {
    setStatusPulse(true)
    setTimeout(() => setStatusPulse(false), 1200)
  }

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then((res) => { if (res.success) setOrder(res.data) })
      .finally(() => setLoading(false))

    let socket: ReturnType<typeof getSocket> | null = null

    try {
      socket = getSocket()
      if (socket) {
        socket.emit('join_order', orderId)

        socket.on('order_status_updated', (data: { order_id: string; status: string }) => {
          if (data.order_id === orderId) {
            setOrder((prev) => prev ? { ...prev, status: data.status } : prev)
            triggerPulse()
          }
        })

        socket.on('payment_success', (data: { order_id: string }) => {
          if (data.order_id === orderId) {
            setOrder((prev) => prev ? { ...prev, status: 'paid', payment_status: 'captured' } : prev)
            triggerPulse()
          }
        })
      }
    } catch (err) {
      console.error('Socket init failed on order page:', err)
    }

    return () => {
      if (socket) {
        socket.off('order_status_updated')
        socket.off('payment_success')
      }
    }
  }, [orderId])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Fetching your order…</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5 px-6">
      <p className="text-zinc-400 font-display font-bold text-xl tracking-tighter">Order not found</p>
      <a href="https://quelessly.com" className="text-lime-400 font-semibold text-sm">Go home →</a>
    </div>
  )

  // Ready state — full screen green with animation
  if (order.status === 'ready') return (
    <div className="fixed inset-0 bg-lime-400 flex flex-col items-center justify-center px-6 animate-ready-in z-50">
      <p className="text-black/50 text-xs font-bold uppercase tracking-[0.3em] mb-8">
        Ready for Pickup
      </p>
      <h1 className="text-black font-display font-black tracking-tighter text-center"
          style={{ fontSize: 'clamp(4rem, 20vw, 9rem)', lineHeight: 1 }}>
        #{order.id.slice(0, 6).toUpperCase()}
      </h1>
      <p className="text-black/60 text-base mt-8 text-center font-medium">
        Show this code at the counter
      </p>
      <div className="mt-10 bg-black/10 rounded-3xl p-5 w-full max-w-sm">
        <div className="space-y-1.5">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-black/70">
              <span>{item.menu_item?.name} ×{item.quantity}</span>
              <span className="font-mono font-bold text-black">₹{Number(item.price) * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
      <a href="https://quelessly.com" className="mt-8 text-xs text-black/30 hover:text-black/50 transition-colors">
        powered by quelessly.
      </a>
    </div>
  )

  if (order.status === 'completed') return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 gap-6 animate-fade-in">
      <div className="w-24 h-24 glass border border-white/10 rounded-full flex items-center justify-center">
        <span className="text-5xl">✅</span>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white tracking-tighter">Order complete</h2>
        <p className="text-zinc-500 text-sm mt-1">Hope you enjoyed it!</p>
      </div>
      <div className="glass rounded-3xl p-5 w-full max-w-sm space-y-1.5">
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-zinc-400">{item.menu_item?.name} ×{item.quantity}</span>
            <span className="text-white font-mono">₹{Number(item.price) * item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold">
          <span className="text-white">Total paid</span>
          <span className="text-lime-400 font-mono">₹{Number(order.total_amount)}</span>
        </div>
      </div>
      <a href="https://quelessly.com" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
        powered by quelessly.
      </a>
    </div>
  )

  if (order.status === 'cancelled') return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 gap-5">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white tracking-tighter">Order cancelled</h2>
        <p className="text-zinc-500 text-sm mt-1">Contact the canteen for help</p>
      </div>
      <a href="https://quelessly.com" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
        powered by quelessly.
      </a>
    </div>
  )

  const currentStepIndex = STATUS_ORDER.indexOf(order.status)
  const isPreparing = order.status === 'preparing'
  const isPaid = order.status === 'paid'
  const isPending = order.status === 'pending'

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      <div className="px-5 pt-12 pb-6">
        <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest mb-1">Order</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-black text-white tracking-tighter">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          {!isPending && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-xs text-zinc-500">Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Main status card */}
        <div className={`glass rounded-4xl py-10 flex flex-col items-center gap-4 border transition-all duration-500 ${statusPulse ? 'border-lime-400/50 shadow-[0_0_30px_rgba(163,230,53,0.15)]' : 'border-white/8'}`}>
          {isPreparing ? <PulsingRing /> : <ConfirmedIcon />}
          <div className="text-center px-6">
            <p className="text-xl font-display font-bold text-white tracking-tighter mt-2">
              {isPending && 'Waiting for payment'}
              {isPaid && 'Order confirmed'}
              {isPreparing && 'Preparing your order'}
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              {isPending && 'Complete payment to confirm your order'}
              {isPaid && 'The kitchen has received your order'}
              {isPreparing && "We'll notify you when it's ready"}
            </p>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4">Progress</p>
          <div className="flex items-center">
            {STEPPER_STEPS.map((step, i, arr) => {
              const stepIdx = STATUS_ORDER.indexOf(step.key)
              const done    = currentStepIndex >= stepIdx
              const active  = order.status === step.key
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                      done ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-600'
                    } ${active ? 'ring-2 ring-lime-400/40 ring-offset-2 ring-offset-zinc-950' : ''}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold transition-colors duration-500 text-center leading-tight ${done ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-px mx-1.5 mb-5 transition-colors duration-700 ${
                      currentStepIndex > stepIdx ? 'bg-lime-400/50' : 'bg-zinc-800'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Items */}
        <div className="glass rounded-3xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your Items</p>
          </div>
          <div className="divide-y divide-white/5">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-5 py-3 text-sm">
                <span className="text-zinc-300">{item.menu_item?.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 font-mono">×{item.quantity}</span>
                  <span className="text-white font-bold font-mono">₹{Number(item.price) * item.quantity}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center px-5 py-4 bg-white/2">
              <span className="font-bold text-white">Total</span>
              <span className="font-black text-lime-400 font-mono text-lg">₹{Number(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center py-4">
          <a href="https://quelessly.com" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            powered by quelessly.
          </a>
        </div>
      </div>
    </div>
  )
}