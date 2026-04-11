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

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

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
        name: 'Quelessly',
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
            localStorage.setItem('active_order', JSON.stringify({ orderId, vendorId, total, items: cart, timestamp: Date.now() }))
            localStorage.removeItem('cart')
            localStorage.removeItem('vendorId')
            router.push(`/order/${orderId}`)
          } else {
            toast('Payment verification failed', 'error')
            setLoading(false)
          }
        },
        modal: { ondismiss: () => { setLoading(false); toast('Payment cancelled', 'warning') } },
        theme: { color: '#ff6b00' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', () => { toast('Payment failed. Try again.', 'error'); setLoading(false) })
      rzp.open()
    } catch (err: any) {
      toast(err.message || 'Something went wrong', 'error')
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <div style={{ width: 96, height: 96, background: '#F2EDE4', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🛒</div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: '#1a1714', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Cart is empty</h2>
        <p style={{ color: '#8a7f72', fontSize: 14, margin: 0 }}>Add items from the menu first</p>
      </div>
      <button onClick={() => router.back()}
        style={{ padding: '12px 28px', background: '#ff6b00', color: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
        ← Back to Menu
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 120, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <Toaster toasts={toasts} />

      {/* Header */}
      <div style={{ padding: '56px 20px 24px' }}>
        <button onClick={() => router.back()}
          style={{ fontSize: 14, color: '#8a7f72', fontWeight: 500, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          ← back
        </button>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 32, color: '#1a1714', letterSpacing: '-1px', margin: '0 0 4px' }}>your order.</h1>
        <p style={{ color: '#8a7f72', fontSize: 14, margin: 0, fontFamily: "'DM Mono', monospace" }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Receipt card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid rgba(26,23,20,0.07)', boxShadow: '0 2px 12px rgba(26,23,20,0.04)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8a7f72', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>Order Summary</p>

          <div>
            {cart.map((item, i) => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
                  <div>
                    <p style={{ color: '#1a1714', fontWeight: 500, fontSize: 14, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{item.name}</p>
                    <p style={{ color: '#8a7f72', fontSize: 12, margin: 0, fontFamily: "'DM Mono', monospace" }}>₹{item.price} × {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: '#1a1714', fontFamily: "'DM Mono', monospace", fontSize: 15, margin: 0 }}>₹{item.price * item.quantity}</p>
                </div>
                {i < cart.length - 1 && <div style={{ borderTop: '1px dashed rgba(26,23,20,0.1)' }} />}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(26,23,20,0.08)', marginTop: 4, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#8a7f72', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Item total</span>
              <span style={{ color: '#1a1714', fontFamily: "'DM Mono', monospace", fontSize: 14 }}>₹{total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#8a7f72', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Convenience fee</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#c9c2b8', fontSize: 12, textDecoration: 'line-through', fontFamily: "'DM Mono', monospace" }}>₹5</span>
                <span style={{ color: '#ff6b00', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>FREE</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(26,23,20,0.08)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1a1714', fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>Total</span>
              <span style={{ color: '#1a1714', fontWeight: 800, fontSize: 22, fontFamily: "'DM Mono', monospace" }}>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(255,107,0,0.05)', border: '1px solid rgba(255,107,0,0.15)', borderRadius: 14, padding: '14px 16px' }}>
          <span style={{ color: '#ff6b00', flexShrink: 0, marginTop: 1, fontSize: 16 }}>⚡</span>
          <p style={{ fontSize: 13, color: '#8a7f72', lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
            Keep this page open after payment — you'll see live order status updates from the canteen.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(to top, #FAF7F2 60%, transparent)' }}>
        <button onClick={placeOrder} disabled={loading}
          style={{ width: '100%', background: '#ff6b00', color: '#fff', padding: '16px 0', borderRadius: 16, fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(255,107,0,0.3)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              Processing…
            </>
          ) : `Proceed to Payment — ₹${total}`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7f72', marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Secured by Razorpay</p>
      </div>
    </div>
  )
}
