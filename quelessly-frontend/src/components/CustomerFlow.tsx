'use client'

import { useEffect, useState } from 'react'
import { BRAND, FONT_SERIF, FONT_MONO, type Aesthetic } from './brand'
import { MENU, type OrderItem } from './data'
import { useHaptic, useLocalStorage } from './hooks'
import { Chip, Placeholder, Ticket, VegDot, burstConfetti } from './primitives'

type Stage = 'scan' | 'menu' | 'cart' | 'pay' | 'preparing' | 'ready'

export default function CustomerFlow({ aesthetic = 'editorial' }: { aesthetic?: Aesthetic }) {
  const [stage, setStage] = useLocalStorage<Stage>('qless-stage', 'scan')
  const [cart, setCart] = useLocalStorage<Record<string, number>>('qless-cart', {})
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [payProgress, setPayProgress] = useState(0)
  const [countdown, setCountdown] = useState(94)
  const [showToast, setShowToast] = useState<{ id: string; name: string } | null>(null)
  const haptic = useHaptic()
  const isPlayful = aesthetic === 'playful'

  useEffect(() => {
    if (stage !== 'pay') return
    setPayProgress(0)
    const t = setInterval(() => {
      setPayProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setStage('preparing')
          return 100
        }
        return p + 4
      })
    }, 80)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  useEffect(() => {
    if (stage !== 'preparing') return
    setCountdown(22)
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t)
          setStage('ready')
          return 0
        }
        return c - 1
      })
    }, 400)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  useEffect(() => {
    if (stage !== 'ready') return
    const el = document.querySelector<HTMLElement>('[data-ready-burst]')
    if (el) setTimeout(() => burstConfetti(el), 300)
  }, [stage])

  const addItem = (id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
    const m = MENU.find((x) => x.id === id)
    if (m) setShowToast({ id, name: m.name })
    setTimeout(() => setShowToast(null), 1200)
  }
  const removeItem = (id: string) =>
    setCart((c) => {
      const next = { ...c }
      if ((next[id] || 0) <= 1) delete next[id]
      else next[id] = next[id] - 1
      return next
    })

  const cartEntries: OrderItem[] = Object.entries(cart)
    .map(([id, qty]) => {
      const m = MENU.find((x) => x.id === id)
      return m ? { ...m, qty } : null
    })
    .filter((x): x is OrderItem => x !== null)
  const total = cartEntries.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cartEntries.reduce((s, i) => s + i.qty, 0)

  const cats = ['All', ...Array.from(new Set(MENU.map((m) => m.cat)))]
  const filtered = MENU.filter(
    (m) =>
      (cat === 'All' || m.cat === cat) &&
      (!search || m.name.toLowerCase().includes(search.toLowerCase())),
  )

  const reset = () => {
    setStage('scan')
    setCart({})
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: BRAND.cream,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        color: BRAND.charcoal,
      }}
    >
      <style>{`
        @keyframes qless-scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
        @keyframes qless-pulse-ring { 0% { transform:scale(.8); opacity:.8; } 100% { transform:scale(1.6); opacity:0; } }
        @keyframes qless-bouncein { 0% { transform:scale(.6); opacity:0 } 60% { transform:scale(1.08); } 100% { transform:scale(1); opacity:1 } }
        @keyframes qless-slideup { from { transform:translateY(12px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes qless-pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes qless-toast-in { from{transform:translate(-50%,8px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
        .cust-page { position:absolute; inset:0; transition: opacity .35s, transform .35s; }
        .cust-btn { background:${BRAND.orange}; color:#fff; border:none; padding:14px 22px; border-radius:14px; font-weight:700; font-size:15px; cursor:pointer; width:100%; font-family:inherit; transition:transform .15s; }
        .cust-btn:active { transform:scale(.97); }
      `}</style>

      {stage === 'scan' && (
        <div className="cust-page" style={{ background: BRAND.teal, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 26, fontWeight: 700 }}>
            quelessly<span style={{ color: BRAND.orange }}>.</span>
          </div>
          <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 2, fontFamily: FONT_MONO }}>POINT YOUR CAMERA</div>
          <div style={{ position: 'relative', width: 220, height: 220, marginTop: 40, borderRadius: 20, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
              <div key={i} style={{
                position: 'absolute', [y ? 'bottom' : 'top']: 12, [x ? 'right' : 'left']: 12,
                width: 26, height: 26,
                borderTop: !y ? `3px solid ${BRAND.orange}` : 'none',
                borderBottom: y ? `3px solid ${BRAND.orange}` : 'none',
                borderLeft: !x ? `3px solid ${BRAND.orange}` : 'none',
                borderRight: x ? `3px solid ${BRAND.orange}` : 'none',
              }} />
            ))}
            <div style={{ position: 'absolute', inset: 20, display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gridTemplateRows: 'repeat(12,1fr)', gap: 2 }}>
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} style={{ background: Math.random() > 0.55 ? 'rgba(255,255,255,0.8)' : 'transparent', borderRadius: 1 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${BRAND.orange}, transparent)`, animation: 'qless-scanline 2s ease-in-out infinite', boxShadow: `0 0 12px ${BRAND.orange}` }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: `2px solid ${BRAND.orange}`, animation: 'qless-pulse-ring 2s infinite' }} />
          </div>
          <p style={{ marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
            Each counter has its own QR. Scan once to open the menu — no app install.
          </p>
          <button className="cust-btn" style={{ marginTop: 24, width: 220 }} onClick={(e) => { haptic(e.currentTarget); setStage('menu') }}>
            Simulate scan →
          </button>
          <div style={{ marginTop: 24, color: 'rgba(255,255,255,0.3)', fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2 }}>
            ⚡ avg scan-to-order: 42s
          </div>
        </div>
      )}

      {stage === 'menu' && (
        <div className="cust-page" style={{ overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BRAND.border2}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: BRAND.teal }}>shan da stall</div>
                <div style={{ color: BRAND.muted, fontSize: 9, marginTop: 2, fontFamily: FONT_MONO, letterSpacing: 1.5 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: BRAND.orange, marginRight: 4, animation: 'qless-pulse-dot 1.4s infinite', verticalAlign: 'middle' }} />
                  OPEN NOW · 8 ITEMS
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO }}>avg wait</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.orange, fontFamily: FONT_MONO, letterSpacing: -0.5 }}>94<span style={{ fontSize: 10, color: BRAND.muted, fontWeight: 500 }}>s</span></div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu…" style={{
                width: '100%', background: '#fff', border: `1.5px solid ${BRAND.border}`, borderRadius: 12, padding: '10px 14px 10px 36px',
                fontSize: 13, outline: 'none', fontFamily: 'inherit', color: BRAND.charcoal,
              }} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: BRAND.muted, fontSize: 14 }}>⌕</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {cats.map((c) => (
                <button key={c} onClick={(e) => { haptic(e.currentTarget); setCat(c) }} style={{
                  background: cat === c ? BRAND.orange : 'transparent',
                  color: cat === c ? '#fff' : BRAND.muted,
                  border: `1.5px solid ${cat === c ? BRAND.orange : BRAND.border}`,
                  borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all .15s',
                }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 16px 0' }}>
            <div style={{
              background: BRAND.orangeDim, border: `1px solid ${BRAND.orangeBorder}`, borderRadius: 10, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: BRAND.orange, fontFamily: FONT_MONO, letterSpacing: 1.2,
            }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: BRAND.orange, animation: 'qless-pulse-dot 1.4s infinite' }} />
              <span style={{ fontWeight: 700 }}>12 PEOPLE</span>
              <span style={{ opacity: 0.8 }}>ordering right now · avg ticket ₹{Math.floor(80 + Math.random() * 40)}</span>
            </div>
          </div>

          <div style={{ padding: '12px 16px 120px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {filtered.map((item) => {
              const qty = cart[item.id] || 0
              return (
                <div key={item.id} style={{
                  background: '#fff', border: `1px solid ${qty > 0 ? BRAND.orangeBorder : BRAND.border2}`, borderRadius: 14,
                  overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all .2s',
                }}>
                  <div style={{ aspectRatio: '1', background: BRAND.cream2, position: 'relative', overflow: 'hidden' }}>
                    {isPlayful ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{item.emoji}</div>
                    ) : (
                      <Placeholder label={item.name.toLowerCase()} />
                    )}
                    <div style={{ position: 'absolute', top: 6, left: 6 }}>
                      <VegDot veg={item.veg} />
                    </div>
                    {item.tag && (
                      <div style={{ position: 'absolute', top: 6, right: 6 }}>
                        <span style={{
                          background: item.left <= 8 ? '#ef4444' : item.hot ? BRAND.orange : BRAND.teal,
                          color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 8, letterSpacing: 1, fontFamily: FONT_MONO, fontWeight: 700,
                        }}>{item.tag}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.charcoal, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, fontFamily: FONT_MONO, color: BRAND.charcoal }}>₹{item.price}</span>
                      {qty > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: BRAND.cream, border: `1.5px solid ${BRAND.orangeBorder}`, borderRadius: 16, padding: '2px 4px' }}>
                          <button onClick={(e) => { haptic(e.currentTarget); removeItem(item.id) }} style={{ width: 20, height: 20, border: 'none', background: 'none', color: BRAND.orange, fontWeight: 800, cursor: 'pointer' }}>−</button>
                          <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 12, minWidth: 12, textAlign: 'center' }}>{qty}</span>
                          <button onClick={(e) => { haptic(e.currentTarget); addItem(item.id) }} style={{ width: 20, height: 20, border: 'none', background: 'none', color: BRAND.orange, fontWeight: 800, cursor: 'pointer' }}>+</button>
                        </div>
                      ) : (
                        <button onClick={(e) => { haptic(e.currentTarget); addItem(item.id) }} style={{
                          width: 28, height: 28, borderRadius: '50%', background: BRAND.cream, border: `1.5px solid ${BRAND.border}`,
                          color: BRAND.orange, fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'all .15s',
                        }}>+</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {showToast && (
            <div style={{
              position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)',
              background: BRAND.charcoal, color: '#fff', borderRadius: 20, padding: '8px 16px',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 30, animation: 'qless-toast-in .2s',
            }}>
              <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
              {showToast.name} added
            </div>
          )}

          {count > 0 && (
            <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 30 }}>
              <button onClick={(e) => { haptic(e.currentTarget); setStage('cart') }} style={{
                width: '100%', background: BRAND.orange, color: '#fff', border: 'none', borderRadius: 16,
                padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 28px rgba(255,107,0,0.35)',
                fontFamily: 'inherit', animation: 'qless-slideup .3s',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontFamily: FONT_MONO }}>{count}</span>
                  View cart
                </span>
                <span style={{ fontFamily: FONT_MONO }}>₹{total}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 'cart' && (
        <div className="cust-page" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BRAND.border2}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={(e) => { haptic(e.currentTarget); setStage('menu') }} style={{ width: 32, height: 32, borderRadius: 10, background: BRAND.cream2, border: 'none', fontSize: 14, cursor: 'pointer' }}>←</button>
            <div>
              <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: BRAND.teal }}>Review order</div>
              <div style={{ color: BRAND.muted, fontSize: 9, fontFamily: FONT_MONO, letterSpacing: 1.5 }}>SHAN DA STALL · {count} ITEM{count !== 1 ? 'S' : ''}</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <Ticket>
              <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: `1.5px dashed ${BRAND.border}`, marginBottom: 12 }}>
                <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: BRAND.teal }}>
                  quelessly<span style={{ color: BRAND.orange }}>.</span>
                </div>
                <div style={{ color: BRAND.muted, marginTop: 3, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5 }}>
                  DRAFT #{Date.now().toString().slice(-6)}
                </div>
              </div>

              {cartEntries.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: BRAND.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {isPlayful ? item.emoji : <VegDot veg={item.veg} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.charcoal }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO }}>₹{item.price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: BRAND.cream, border: `1.5px solid ${BRAND.orangeBorder}`, borderRadius: 16, padding: '2px 4px' }}>
                    <button onClick={(e) => { haptic(e.currentTarget); removeItem(item.id) }} style={{ width: 22, height: 22, border: 'none', background: 'none', color: BRAND.orange, fontWeight: 800, cursor: 'pointer' }}>−</button>
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 12, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={(e) => { haptic(e.currentTarget); addItem(item.id) }} style={{ width: 22, height: 22, border: 'none', background: 'none', color: BRAND.orange, fontWeight: 800, cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: FONT_MONO, minWidth: 40, textAlign: 'right' }}>₹{item.price * item.qty}</div>
                </div>
              ))}

              <div style={{ borderTop: `1.5px dashed ${BRAND.border}`, marginTop: 10, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: BRAND.muted }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: FONT_MONO }}>₹{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: BRAND.muted }}>
                  <span>Platform fee</span>
                  <span style={{ fontFamily: FONT_MONO, color: '#10b981' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                  <span>TOTAL</span>
                  <span style={{ color: BRAND.orange, fontFamily: FONT_MONO }}>₹{total}</span>
                </div>
              </div>
            </Ticket>

            <div style={{
              marginTop: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.4 }}>
                <b>You&apos;ll earn a stamp.</b> 5 stamps = free chai.
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ color: BRAND.muted, marginBottom: 6, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5 }}>OFTEN ADDED WITH THIS</div>
              {MENU.filter((m) => !cart[m.id]).slice(0, 2).map((m) => (
                <div key={m.id} onClick={(e) => { haptic(e.currentTarget); addItem(m.id) }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff',
                  border: `1px solid ${BRAND.border2}`, borderRadius: 12, marginBottom: 6, cursor: 'pointer',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {isPlayful ? m.emoji : <VegDot veg={m.veg} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO }}>+₹{m.price}</div>
                  </div>
                  <span style={{ color: BRAND.orange, fontWeight: 800, fontSize: 16 }}>+</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 16, borderTop: `1px solid ${BRAND.border2}`, background: '#fff' }}>
            <button className="cust-btn" onClick={(e) => { haptic(e.currentTarget); setStage('pay') }}>
              Pay ₹{total} via UPI →
            </button>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: BRAND.muted, fontFamily: FONT_MONO, letterSpacing: 1 }}>
              🔒 SECURED BY RAZORPAY
            </div>
          </div>
        </div>
      )}

      {stage === 'pay' && (
        <div className="cust-page" style={{ background: BRAND.teal, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="70" cy="70" r="60" fill="none" stroke={BRAND.orange} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - payProgress / 100)}`}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset .08s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 32, fontWeight: 800, color: BRAND.orange }}>{payProgress}<span style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>%</span></div>
              <div style={{ color: 'rgba(255,255,255,.4)', fontFamily: FONT_MONO, marginTop: 4, fontSize: 9, letterSpacing: 2 }}>{payProgress < 50 ? 'CONNECTING…' : payProgress < 90 ? 'CHARGING…' : 'CONFIRMING…'}</div>
            </div>
          </div>
          <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 28, fontWeight: 700, marginTop: 32 }}>
            Paying ₹{total}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 6, fontFamily: FONT_MONO }}>
            via GPay · UPI
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            {[
              { t: 'Verifying UPI handle', on: payProgress > 20 },
              { t: 'Debiting from bank', on: payProgress > 60 },
              { t: 'Notifying vendor', on: payProgress > 95 },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: s.on ? '#fff' : 'rgba(255,255,255,.4)', fontFamily: FONT_MONO }}>
                {s.on ? <span style={{ color: BRAND.orange }}>✓</span> : <span>○</span>}
                {s.t}
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'preparing' && (
        <div className="cust-page" style={{ background: BRAND.cream, padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Chip color="orange">● ORDER PLACED</Chip>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: BRAND.charcoal, marginTop: 10, letterSpacing: -1 }}>
              Hang tight, chef&apos;s on it.
            </div>
          </div>

          <div style={{ margin: '24px auto', width: 200, height: 200, position: 'relative' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="#fff" stroke={BRAND.border2} strokeWidth="2" />
              <circle cx="100" cy="100" r="88" fill="none" stroke={BRAND.orange} strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (countdown / 22)}`}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset .4s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 56, fontWeight: 800, color: BRAND.orange, letterSpacing: -2, lineHeight: 1 }}>{countdown}</div>
              <div style={{ color: BRAND.muted, marginTop: 4, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2 }}>SECONDS</div>
            </div>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${BRAND.border2}`, borderRadius: 16, padding: 16, marginTop: 14 }}>
            {[
              { t: 'Paid', s: 'Payment confirmed · ₹' + total, done: true, active: false },
              { t: 'Cooking', s: isPlayful ? '🔥 Samosa sizzling' : 'Kitchen received order', done: countdown < 18, active: countdown >= 18 },
              { t: 'Almost ready', s: 'Plating now', done: countdown < 8, active: countdown < 18 && countdown >= 8 },
              { t: 'Pick up', s: 'Show this screen at the counter', done: false, active: countdown < 8 },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 3 ? `1px dashed ${BRAND.border2}` : 'none' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: step.done ? '#10b981' : step.active ? BRAND.orange : BRAND.cream2,
                  color: (step.done || step.active) ? '#fff' : BRAND.muted,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
                  animation: step.active ? 'qless-pulse-dot 1.4s infinite' : 'none',
                }}>{step.done ? '✓' : i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: (step.done || step.active) ? BRAND.charcoal : BRAND.muted }}>{step.t}</div>
                  <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO }}>{step.s}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, background: BRAND.teal, borderRadius: 14, padding: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: BRAND.orange }}>
              Q
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5 }}>YOUR ORDER ID</div>
              <div style={{ fontFamily: FONT_SERIF, fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>#Q-{((Math.random() * 9999) | 0).toString().padStart(4, '0')}</div>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: FONT_MONO, textAlign: 'right' }}>
              Position
              <br />
              <b style={{ color: '#fff', fontSize: 15 }}>#3</b>
            </div>
          </div>
        </div>
      )}

      {stage === 'ready' && (
        <div className="cust-page" data-ready-burst style={{
          background: '#10b981',
          color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 32, textAlign: 'center',
          animation: 'qless-bouncein .5s',
        }}>
          <div style={{ fontSize: 80, marginBottom: 8, animation: 'qless-bouncein .6s' }}>🎉</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2 }}>● ORDER READY</div>
          <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 40, letterSpacing: -1.5, lineHeight: 1.05, marginTop: 10 }}>
            It&apos;s hot.<br />Walk up now.
          </div>
          <div style={{ marginTop: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: 16, width: '100%', maxWidth: 280 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2 }}>SHOW AT COUNTER</div>
            <div style={{ fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 28, letterSpacing: -1 }}>#Q-4721</div>
            <div style={{ marginTop: 10, fontSize: 12, fontFamily: FONT_MONO, opacity: 0.8 }}>COUNTER 3 · SHAN DA STALL</div>
          </div>
          <button onClick={(e) => { haptic(e.currentTarget); reset() }} style={{
            marginTop: 24, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Restart demo ↻
          </button>
          <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: FONT_MONO, letterSpacing: 1 }}>
            ⭐ YOU EARNED 1 LOYALTY STAMP
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', top: 8, right: 8, zIndex: 50,
        display: 'flex', gap: 3, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: 3,
        backdropFilter: 'blur(10px)',
      }}>
        {(['scan', 'menu', 'cart', 'pay', 'preparing', 'ready'] as const).map((s) => (
          <button key={s} onClick={(e) => { haptic(e.currentTarget); setStage(s) }} style={{
            background: stage === s ? BRAND.orange : 'transparent',
            color: '#fff', border: 'none', padding: '3px 6px', borderRadius: 5,
            fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: FONT_MONO,
          }}>{s}</button>
        ))}
      </div>
    </div>
  )
}
