'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Toaster, useToast } from '@/components/Toast'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const { toasts, toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    const savedVendorId = localStorage.getItem('vendorId')
    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedVendorId) setVendorId(savedVendorId)
  }, [])

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  const placeOrder = async () => {
    setLoading(true)
    try {
      const orderRes = await api.post('/orders', {
        vendor_id: vendorId,
        items: cart.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
      })
      if (!orderRes.success) throw new Error(orderRes.message)
      const orderId = orderRes.data.id

      const payRes = await api.post('/payments/initiate', { order_id: orderId })
      if (!payRes.success) throw new Error(payRes.message)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payRes.data.amount,
        currency: payRes.data.currency,
        order_id: payRes.data.razorpay_order_id,
        name: 'QueLessly',
        description: `Order #${orderId.slice(0, 8).toUpperCase()}`,
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          if (verifyRes.success) {
            localStorage.removeItem('cart')
            localStorage.removeItem('vendorId')
            router.push(`/order/${orderId}`)
          } else {
            toast('Payment verification failed', 'error')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled', 'warning')
          },
        },
        theme: { color: '#a3e635' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', () => {
        toast('Payment failed. Try again.', 'error')
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      toast(err.message || 'Something went wrong', 'error')
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-24 h-24 glass rounded-4xl flex items-center justify-center">
        <span className="text-5xl">🛒</span>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-white tracking-tighter">Cart is empty</h2>
        <p className="text-zinc-500 text-sm mt-1">Add items from the menu first</p>
      </div>
      <button
        onClick={() => router.back()}
        className="px-6 py-3 bg-lime-400 text-black rounded-full font-bold text-sm glow-lime-sm active:scale-95 transition-all"
      >
        ← Back to Menu
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 pb-36">
      <Toaster toasts={toasts} />

      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 text-sm font-medium mb-4 flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
        >
          ← back
        </button>
        <h1 className="text-3xl font-display font-bold text-white tracking-tighter">
          your order.
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        {/* Receipt card */}
        <div className="glass rounded-4xl p-6">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Order Summary</p>

          <div className="space-y-0">
            {cart.map((item, i) => (
              <div key={item.id}>
                <div className="flex justify-between items-center py-3.5">
                  <div>
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5 font-mono">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-white tabular-nums font-mono">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
                {i < cart.length - 1 && (
                  <div className="border-t border-dashed border-zinc-800" />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 mt-1 pt-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Item total</span>
              <span className="text-white font-mono text-sm tabular-nums">₹{total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Convenience fee</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-xs line-through font-mono">₹5</span>
                <span className="text-lime-400 font-bold text-sm">FREE</span>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
              <span className="text-white font-bold text-base">Total</span>
              <span className="text-white font-black text-xl font-mono tabular-nums">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 glass rounded-3xl px-4 py-3.5">
          <span className="text-lime-400 mt-0.5 shrink-0">⚡</span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Keep this page open after payment — you'll see live order status updates from the canteen.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-linear-to-t from-zinc-950 via-zinc-950/90 to-transparent">
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-lime-400 text-black py-4 rounded-full font-bold text-base disabled:opacity-50 glow-lime flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-300"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            `Proceed to Payment — ₹${total}`
          )}
        </button>
        <p className="text-center text-xs text-zinc-600 mt-2.5">Secured by Razorpay</p>
      </div>
    </div>
  )
}
