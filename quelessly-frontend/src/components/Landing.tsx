'use client'

import { useEffect, useRef, useState } from 'react'
import { BRAND, FONT_SERIF, FONT_SANS, FONT_MONO, type Aesthetic } from './brand'
import { useHaptic } from './hooks'
import { Chip, TrustItem, burstConfetti } from './primitives'
import { ScrollHeroScene } from './ScrollHero'

export default function Landing({ aesthetic = 'editorial' }: { aesthetic?: Aesthetic }) {
  void aesthetic
  const [scrollY, setScrollY] = useState(0)
  const [revealMap, setRevealMap] = useState<Record<string, boolean>>({})
  const [liveCount, setLiveCount] = useState(2847)
  const [tab, setTab] = useState<'customer' | 'owner'>('customer')
  const haptic = useHaptic()

  useEffect(() => {
    const t = setInterval(() => setLiveCount((c) => c + (Math.random() < 0.7 ? 1 : 0)), 1600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const k = (e.target as HTMLElement).dataset.reveal
            if (k) setRevealMap((m) => ({ ...m, [k]: true }))
          }
        })
      },
      { threshold: 0.15 },
    )
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((x) => io.observe(x))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  return (
    <div style={{ width: '100%', background: BRAND.cream, fontFamily: FONT_SANS, color: BRAND.charcoal, position: 'relative' }}>
      <style>{`
        @keyframes qless-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes qless-pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
        [data-reveal] { opacity:0; transform: translateY(24px); transition: opacity .8s, transform .8s cubic-bezier(.2,.7,.3,1); }
        [data-reveal].r-in { opacity:1; transform: translateY(0); }
      `}</style>

      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 30, padding: '14px 36px',
          background: 'rgba(249,246,241,0.85)', backdropFilter: 'blur(18px)',
          borderBottom: scrollY > 20 ? `1px solid ${BRAND.border2}` : '1px solid transparent',
          display: 'flex', alignItems: 'center', gap: 20, transition: 'border-color .3s',
        }}
      >
        <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>
          quelessly<span style={{ color: BRAND.orange }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: 18, marginLeft: 24 }}>
          {['How it works', 'For owners', 'Pricing', 'Live map'].map((x) => (
            <a key={x} href="#" style={{ textDecoration: 'none', color: BRAND.charcoal, fontSize: 13, fontWeight: 500, opacity: 0.7 }}>{x}</a>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, fontFamily: FONT_MONO, color: BRAND.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          {liveCount.toLocaleString('en-IN')} ORDERS TODAY
        </div>
        <button style={{
          background: 'transparent', border: `1.5px solid ${BRAND.charcoal}`, color: BRAND.charcoal,
          padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>Vendor login</button>
      </nav>

      {/* HERO — pinned scroll scene */}
      <section style={{ position: 'relative', height: '400vh' }}>
        <ScrollHeroScene />
      </section>

      {/* Hero info band */}
      <section style={{ padding: '60px 36px 40px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            background: BRAND.orangeDim, border: `1px solid ${BRAND.orangeBorder}`, borderRadius: 20,
            fontSize: 10, color: BRAND.orange, fontWeight: 700, letterSpacing: 2, fontFamily: FONT_MONO,
            marginBottom: 18,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND.orange, animation: 'qless-pulse-dot 1.4s infinite' }} />
            ⚡ 18-SEC AVERAGE ORDER
          </div>
          <h2 style={{
            fontFamily: FONT_SERIF, fontWeight: 700, fontStyle: 'italic',
            fontSize: 'clamp(36px, 4.5vw, 64px)', lineHeight: 1, letterSpacing: -2, margin: 0,
            color: BRAND.charcoal,
          }}>
            Skip the line, <span style={{ color: BRAND.orange }}>not the food.</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: BRAND.muted, marginTop: 16, maxWidth: 480 }}>
            Scan the counter&apos;s QR. Pick your food. Pay via UPI. Walk up when it&apos;s ready — no app, no cash, no queue.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button onClick={(e) => haptic(e.currentTarget)} style={{
              background: BRAND.orange, color: '#fff', border: 'none', padding: '14px 22px', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 10px 24px -6px rgba(255,107,0,0.5)',
            }}>Try a live demo ↓</button>
            <button onClick={(e) => haptic(e.currentTarget)} style={{
              background: BRAND.teal, color: '#fff', border: 'none', padding: '14px 22px', borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>For business owners</button>
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12, color: BRAND.muted, fontFamily: FONT_MONO, letterSpacing: 1 }}>
            <TrustItem>NO APP DOWNLOAD</TrustItem>
            <TrustItem>UPI ONLY</TrustItem>
            <TrustItem>LIVE TRACKING</TrustItem>
          </div>
        </div>
        <HeroReceipt />
      </section>

      {/* Marquee */}
      <div style={{ padding: '14px 0', borderTop: `1px solid ${BRAND.border}`, borderBottom: `1px solid ${BRAND.border}`, overflow: 'hidden', background: BRAND.cream2 }}>
        <div style={{ display: 'flex', gap: 40, animation: 'qless-marquee 30s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[0, 1].map((k) => (
            <div key={k} style={{ display: 'flex', gap: 40 }}>
              {['CANTEENS & CAFES', 'WORKS ON ANY PHONE', 'NO APP NEEDED', 'UPI PAYMENTS', 'REAL-TIME TRACKING', 'ZERO QUEUE', 'ALWAYS OPEN', 'SUB-60S ORDERS'].map((x, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40, fontSize: 13, fontFamily: FONT_MONO, letterSpacing: 2, color: BRAND.charcoal }}>
                  <span>{x}</span>
                  <span style={{ color: BRAND.orange }}>✦</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 36px' }}>
        <div data-reveal="hero-how" className={revealMap['hero-how'] ? 'r-in' : ''} style={{ textAlign: 'center', marginBottom: 50 }}>
          <Chip color="orange">HOW IT WORKS</Chip>
          <h2 style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 56, fontWeight: 700, margin: '16px 0 0', letterSpacing: -2, lineHeight: 1, color: BRAND.charcoal }}>
            Simple for diners.<br />
            <span style={{ color: BRAND.orange }}>Smart for owners.</span>
          </h2>
          <div style={{ display: 'inline-flex', marginTop: 24, background: '#fff', border: `1.5px solid ${BRAND.border}`, borderRadius: 24, padding: 4 }}>
            {([['customer', 'For customers'], ['owner', 'For business owners']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} style={{
                background: tab === v ? BRAND.charcoal : 'transparent', color: tab === v ? '#fff' : BRAND.muted,
                border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .2s',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div data-reveal="how-cards" className={revealMap['how-cards'] ? 'r-in' : ''} style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1100, margin: '0 auto',
        }}>
          {(tab === 'customer'
            ? [
                { n: '01', t: 'Scan the QR', b: 'Every counter has one. Point your phone camera — no app download, no account, no hassle.', icon: '📱' },
                { n: '02', t: 'Pick & pay', b: 'Browse the menu, build your cart, pay instantly via any UPI app. Under 60 seconds.', icon: '💳' },
                { n: '03', t: 'Walk up when ready', b: 'Your phone pulses green when the food is up. Show the ID at the counter. Done.', icon: '🎉' },
              ]
            : [
                { n: '01', t: 'Print a QR sticker', b: 'We send you a QR kit. Stick it on your counter. That is literally the hardware setup.', icon: '🖨️' },
                { n: '02', t: 'Accept orders instantly', b: 'UPI hits your account directly. We take 0%. Kitchen dashboard pings you for each order.', icon: '⚡' },
                { n: '03', t: 'Focus on the food', b: 'No queue management, no cash counting, no app downloads to push. Just cook.', icon: '🍳' },
              ]
          ).map((s, i) => (
            <div key={i} style={{
              background: '#fff', border: `1px solid ${BRAND.border2}`, borderRadius: 20, padding: 28, position: 'relative',
              transition: 'all .3s', minHeight: 210,
            }}>
              <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 28 }}>{s.icon}</div>
              <div style={{ color: BRAND.orange, fontWeight: 700, fontSize: 10, fontFamily: FONT_MONO, letterSpacing: 2, marginBottom: 10 }}>#{s.n}</div>
              <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{s.t}</div>
              <div style={{ fontSize: 14, color: BRAND.muted, marginTop: 8, lineHeight: 1.55 }}>{s.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section data-reveal="stats" className={revealMap['stats'] ? 'r-in' : ''} style={{ background: BRAND.teal, color: '#fff', padding: '80px 36px' }}>
        <div style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          <Chip color="orange" style={{ background: 'rgba(255,107,0,0.15)' }}>BY THE NUMBERS</Chip>
          <h2 style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 50, fontWeight: 700, margin: '14px 0 40px', letterSpacing: -1.5, lineHeight: 1.05 }}>
            The queue, <span style={{ color: BRAND.orange }}>statistically busted.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(255,255,255,0.1)', maxWidth: 1100, margin: '0 auto', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { n: '18', u: 'SEC', l: 'Average tap → pay' },
            { n: '0%', u: '', l: 'Platform commission' },
            { n: '2.4k', u: '+', l: 'Orders per day' },
            { n: '94%', u: '', l: 'Skip return rate' },
          ].map((s, i) => (
            <div key={i} style={{ background: BRAND.teal, padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 72, lineHeight: 1, color: BRAND.orange, letterSpacing: -3 }}>
                {s.n}<span style={{ fontSize: 32 }}>{s.u}</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: FONT_MONO, letterSpacing: 1, marginTop: 10 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section data-reveal="testi" className={revealMap['testi'] ? 'r-in' : ''} style={{ padding: '90px 36px', background: BRAND.cream2 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Chip color="orange">WHAT PEOPLE SAY</Chip>
          <h2 style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 44, fontWeight: 700, margin: '14px 0 0', letterSpacing: -1.5, color: BRAND.charcoal }}>
            From the cafes, to the counters.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { q: 'The lunch rush was a nightmare. Now my students scan, pay, and I just cook. Revenue up 32%.', a: 'Shankar', r: 'Owner, Shan da Stall · FC Rd', c: BRAND.orange },
            { q: 'I genuinely haven\u2019t queued for chai in a month. Scan, tap, done. Feels illegal.', a: 'Priya', r: 'Student · SPPU', c: BRAND.teal },
            { q: 'The dashboard is the best part. I can see my ops from the kitchen phone while stirring the karahi.', a: 'Nadia', r: 'Owner, Caffeine Court', c: '#10b981' },
          ].map((t, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 18, padding: 24, position: 'relative' }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 56, color: BRAND.orange, lineHeight: 1, position: 'absolute', top: 10, right: 16, opacity: 0.3 }}>&ldquo;</div>
              <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, margin: 0, letterSpacing: -0.3, color: BRAND.charcoal }}>
                &ldquo;{t.q}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{t.a[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.charcoal }}>{t.a}</div>
                  <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO }}>{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section data-reveal="cta" className={revealMap['cta'] ? 'r-in' : ''} style={{ padding: '110px 36px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 72, fontWeight: 700, margin: 0, letterSpacing: -3, lineHeight: 1, color: BRAND.charcoal }}>
          Your line <span style={{ color: BRAND.orange }}>is costing you.</span>
        </h2>
        <p style={{ fontSize: 17, color: BRAND.muted, marginTop: 18, maxWidth: 520, margin: '18px auto 0', lineHeight: 1.6 }}>
          Every minute someone waits is a minute they could&apos;ve ordered more. Every queue is a sale that didn&apos;t happen.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
          <button onClick={(e) => haptic(e.currentTarget)} style={{
            background: BRAND.charcoal, color: '#fff', border: 'none', padding: '16px 26px', borderRadius: 16,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: -0.2,
          }}>Get a QR kit → ₹0/month</button>
          <button onClick={(e) => haptic(e.currentTarget)} style={{
            background: 'transparent', color: BRAND.charcoal, border: `1.5px solid ${BRAND.charcoal}`, padding: '16px 26px', borderRadius: 16,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Book a demo</button>
        </div>
        <div style={{ marginTop: 20, fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO, letterSpacing: 1 }}>
          NO CARD · SETUP IN 10 MIN · FIRST 100 ORDERS ON US
        </div>
      </section>

      <footer style={{ padding: '40px 36px 36px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', gap: 24, alignItems: 'center', fontSize: 12, color: BRAND.muted }}>
        <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 20, color: BRAND.charcoal }}>quelessly<span style={{ color: BRAND.orange }}>.</span></div>
        <div>© 2026 · Made in Pune</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: FONT_MONO, letterSpacing: 1 }}>BUILT ON UPI · RAZORPAY · SUPABASE</div>
      </footer>
    </div>
  )
}

// ——— Inline Hero Receipt mini-demo ———
function HeroReceipt() {
  const [qty, setQty] = useState<Record<string, number>>({ samosa: 2, chai: 1, vadapav: 1 })
  const [step, setStep] = useState<'build' | 'pay' | 'done'>('build')
  const [progress, setProgress] = useState(0)
  const doneRef = useRef<HTMLDivElement>(null)
  const haptic = useHaptic()
  const items = [
    { id: 'samosa',  name: 'Samosa',      price: 25, emoji: '🥟' },
    { id: 'vadapav', name: 'Vada Pav',    price: 30, emoji: '🍔' },
    { id: 'chai',    name: 'Masala Chai', price: 15, emoji: '🫖' },
    { id: 'jalebi',  name: 'Jalebi',      price: 40, emoji: '🍥' },
  ]
  const total = items.reduce((s, i) => s + (qty[i.id] || 0) * i.price, 0)

  useEffect(() => {
    if (step !== 'pay') return
    setProgress(0)
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t)
          setTimeout(() => setStep('done'), 300)
          return 100
        }
        return p + 5
      })
    }, 70)
    return () => clearInterval(t)
  }, [step])

  useEffect(() => {
    if (step === 'done' && doneRef.current) burstConfetti(doneRef.current)
  }, [step])

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <div ref={doneRef} style={{
        background: '#fff', width: '100%', maxWidth: 380,
        padding: '32px 24px', position: 'relative',
        boxShadow: '0 30px 60px -20px rgba(31,26,23,0.25), 0 10px 20px -10px rgba(31,26,23,0.1)',
        transform: 'rotate(1.5deg)',
      }}>
        <div style={{ textAlign: 'center', paddingBottom: 14, borderBottom: `1.5px dashed ${BRAND.border}` }}>
          <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 800, fontSize: 28, letterSpacing: -1, color: BRAND.teal }}>
            quelessly<span style={{ color: BRAND.orange }}>.</span>
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: BRAND.muted, marginTop: 4 }}>
            TRY IT · LIVE DEMO · NO SIGNUP
          </div>
        </div>

        {step === 'build' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
              {items.map((it) => {
                const q = qty[it.id] || 0
                return (
                  <div key={it.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px',
                    borderRadius: 6, background: q > 0 ? BRAND.orangeDim : 'transparent', transition: 'background .2s',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {it.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.charcoal }}>{it.name}</div>
                      <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO }}>₹{it.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={(e) => { haptic(e.currentTarget); setQty((qq) => ({ ...qq, [it.id]: Math.max(0, (qq[it.id] || 0) - 1) })) }} style={{
                        width: 24, height: 24, borderRadius: 6, border: `1px solid ${BRAND.border}`, background: '#fff', color: BRAND.orange, fontWeight: 800, cursor: 'pointer',
                      }}>−</button>
                      <div style={{ width: 20, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700 }}>{q}</div>
                      <button onClick={(e) => { haptic(e.currentTarget); setQty((qq) => ({ ...qq, [it.id]: (qq[it.id] || 0) + 1 })) }} style={{
                        width: 24, height: 24, borderRadius: 6, border: 'none', background: BRAND.orange, color: '#fff', fontWeight: 800, cursor: 'pointer',
                      }}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1.5px dashed ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: BRAND.muted, letterSpacing: 1.5 }}>TOTAL</span>
              <span style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 26, color: BRAND.orange }}>₹{total}</span>
            </div>
            <button onClick={(e) => { if (total > 0) { haptic(e.currentTarget); setStep('pay') } }} disabled={total === 0} style={{
              width: '100%', marginTop: 12, background: total > 0 ? BRAND.orange : BRAND.border, color: '#fff', border: 'none',
              padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: total > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}>
              {total > 0 ? `Pay ₹${total} via UPI →` : 'Add items to continue'}
            </button>
          </>
        )}

        {step === 'pay' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, margin: '10px auto', position: 'relative' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke={BRAND.cream2} strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={BRAND.orange} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset .07s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontWeight: 800, fontSize: 22, color: BRAND.orange }}>
                {progress}%
              </div>
            </div>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 22, fontWeight: 700, marginTop: 8, color: BRAND.charcoal }}>
              Paying ₹{total}
            </div>
            <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: FONT_MONO, letterSpacing: 1 }}>VIA UPI · GPAY · SIMULATED</div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 6 }}>🎉</div>
            <div style={{ color: '#10b981', fontFamily: FONT_MONO, letterSpacing: 2, fontSize: 10, fontWeight: 800 }}>● ORDER CONFIRMED</div>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 28, fontWeight: 700, marginTop: 6, letterSpacing: -1, color: BRAND.charcoal }}>
              See? That easy.
            </div>
            <div style={{ marginTop: 14, padding: 12, background: BRAND.cream, borderRadius: 10 }}>
              <div style={{ color: BRAND.muted, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5 }}>ORDER</div>
              <div style={{ fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>#Q-4721</div>
            </div>
            <button onClick={(e) => { haptic(e.currentTarget); setStep('build'); setQty({ samosa: 2, chai: 1, vadapav: 1 }) }} style={{
              marginTop: 12, background: 'transparent', border: `1.5px solid ${BRAND.border}`, padding: '10px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: BRAND.charcoal,
            }}>Try again ↻</button>
          </div>
        )}
      </div>
    </div>
  )
}
