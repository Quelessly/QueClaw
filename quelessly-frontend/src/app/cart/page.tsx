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

            // ✅ Clear active order when done
            if (data.status === 'completed' || data.status === 'cancelled') {
              localStorage.removeItem('active_order')
            }
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
      <span className="text-6xl">😕</span>
      <p className="text-zinc-400 font-display font-bold text-xl tracking-tighter">Order not found</p>
      <button onClick={() => router.push('/')} className="text-lime-400 font-semibold text-sm">
        Go home →
      </button>
    </div>
  )

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
    </div>
  )

  if (order.status === 'completed') {
    if (typeof window !== 'undefined') localStorage.removeItem('active_order')
    return (
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
      </div>
    )
  }

  if (order.status === 'cancelled') {
    if (typeof window !== 'undefined') localStorage.removeItem('active_order')
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 gap-5">
        <span className="text-6xl">❌</span>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white tracking-tighter">Order cancelled</h2>
          <p className="text-zinc-500 text-sm mt-1">Contact the canteen for help</p>
        </div>
      </div>
    )
  }

  const currentStepIndex = STATUS_ORDER.indexOf(order.status)
  const isPreparing = order.status === 'preparing'
  const isPaid = order.status === 'paid'
  const isPending = order.status === 'pending'

  return (
    <div className="min-h-screen bg-zinc-950 pb-8">
      {/* rest unchanged */}
    </div>
  )
}