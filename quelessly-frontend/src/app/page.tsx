'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QuelesslyHero from '@/components/QuelesslyHero'

interface ActiveOrder {
  orderId: string
  vendorId: string
  total: number
  items: { name: string; quantity: number }[]
  timestamp: number
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const h = () => setY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return y
}

function useInView(threshold = 0.12) {
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const observer = useRef<IntersectionObserver | null>(null)

  const attach = useCallback(() => {
    observer.current?.disconnect()
    observer.current = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(p => new Set([...p, e.target.id]))
      }),
      { threshold }
    )
    document.querySelectorAll('[data-animate]').forEach(el => observer.current!.observe(el))
  }, [threshold])

  useEffect(() => { attach(); return () => observer.current?.disconnect() }, [attach])
  return { visible, reattach: attach }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const scrollY = useScrollY()
  const { visible, reattach } = useInView()
  const [activeTab, setActiveTab] = useState<'student' | 'owner'>('student')
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [phoneStep, setPhoneStep] = useState(0)
  // Cursor follower
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorPos = useRef({ x: -100, y: -100 })
  const rafId = useRef<number>(0)

  useEffect(() => {
    const stored = localStorage.getItem('active_order')
    if (stored) {
      const order = JSON.parse(stored) as ActiveOrder
      if (Date.now() - order.timestamp < 2 * 60 * 60 * 1000) setActiveOrder(order)
      else localStorage.removeItem('active_order')
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setPhoneStep(s => (s + 1) % 3), 2400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { const t = setTimeout(reattach, 60); return () => clearTimeout(t) }, [activeTab, reattach])

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorPos.current = { x: e.clientX, y: e.clientY }
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${cursorPos.current.x - 18}px,${cursorPos.current.y - 18}px)`
        }
      })
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const v = (id: string) => visible.has(id)

  const ticker = ['No app needed', 'UPI payments', 'Real-time tracking', 'Zero queue', 'Canteens & Cafes', 'Works on any phone']

  const phoneSteps = [
    {
      label: 'BROWSE MENU',
      title: 'Pick your order',
      items: [
        { name: 'Vada Pav', price: '₹20', emoji: '🫓' },
        { name: 'Masala Chai', price: '₹15', emoji: '🍵' },
        { name: 'Samosa ×2', price: '₹30', emoji: '🔺' },
      ],
      action: 'Add to cart →',
    },
    {
      label: 'PAY INSTANTLY',
      title: 'UPI in 1 tap',
      items: [
        { name: 'Total: ₹65', price: '', emoji: '🧾' },
        { name: 'Paying via GPay', price: '', emoji: '📱' },
        { name: '✓ Payment confirmed', price: '', emoji: '✅' },
      ],
      action: 'Paid!',
    },
    {
      label: 'ORDER READY',
      title: 'Walk up & collect',
      items: [
        { name: 'Order #247', price: '', emoji: '🎫' },
        { name: 'Counter 3', price: '', emoji: '📍' },
        { name: '✓ Ready to pick up!', price: '', emoji: '🟢' },
      ],
      action: 'Done ✓',
    },
  ]

  // Parallax helpers
  const parallax = (speed: number) => ({ transform: `translateY(${scrollY * speed}px)` })

  return (
    <div style={{ background: '#FAF7F2', color: '#1a1714', overflowX: 'hidden', fontFamily: "'Fraunces', serif" }}>

      {/* Custom cursor — desktop only */}
      <div ref={cursorRef} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 36, height: 36,
        borderRadius: '50%', border: '1.5px solid rgba(255,107,0,0.5)',
        pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'multiply',
        transition: 'width 0.2s, height 0.2s, opacity 0.2s',
        willChange: 'transform',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #FAF7F2; --cream2: #F2EDE4; --cream3: #E8E0D4;
          --orange: #ff6b00; --orange-hover: #e05e00; --orange-dim: rgba(255,107,0,0.09); --orange-border: rgba(255,107,0,0.22);
          --teal: #023341; --teal-dim: rgba(2,51,65,0.07); --teal-border: rgba(2,51,65,0.18);
          --charcoal: #1a1714; --charcoal2: #3d3830; --muted: #8a7f72;
          --border: rgba(26,23,20,0.1); --border2: rgba(26,23,20,0.06);
        }

        /* Paper grain */
        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.6;
        }

        /* ── SCROLL ANIMATIONS ── */

        /* Fade up — base */
        .fu { opacity:0; transform:translateY(32px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .fu.v { opacity:1; transform:translateY(0); }

        /* Fade up with slight scale */
        .fus { opacity:0; transform:translateY(24px) scale(0.97); transition:opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1); }
        .fus.v { opacity:1; transform:translateY(0) scale(1); }

        /* Slide in from left */
        .sl { opacity:0; transform:translateX(-40px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .sl.v { opacity:1; transform:translateX(0); }

        /* Slide in from right */
        .sr { opacity:0; transform:translateX(40px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .sr.v { opacity:1; transform:translateX(0); }

        /* Clip reveal (for section titles) */
        .clip-wrap { overflow: hidden; }
        .clip { opacity:0; transform:translateY(100%); display:block; transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .clip.v { opacity:1; transform:translateY(0); }

        /* Stagger delays */
        .d1{transition-delay:.06s} .d2{transition-delay:.13s} .d3{transition-delay:.20s}
        .d4{transition-delay:.27s} .d5{transition-delay:.34s} .d6{transition-delay:.41s}

        /* Line draw (for decorative lines) */
        .line-draw { transform:scaleX(0); transform-origin:left; transition:transform 0.9s cubic-bezier(0.16,1,0.3,1); }
        .line-draw.v { transform:scaleX(1); }

        /* Count-up shimmer */
        @keyframes shimmer-once {
          0% { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        .stat-shimmer.v {
          background: linear-gradient(90deg, var(--orange) 0%, #ffba7a 40%, var(--orange) 80%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-once 1.4s ease forwards;
        }

        /* Ticker */
        .t-wrap { overflow:hidden; mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent); -webkit-mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent); }
        .t-track { display:flex; width:max-content; animation:tick 28s linear infinite; }
        @keyframes tick { to { transform:translateX(-50%); } }

        /* Nav */
        .nav { position:fixed; top:0; left:0; right:0; z-index:50; height:62px; padding:0 24px; display:flex; align-items:center; justify-content:space-between; transition: background 0.4s, border-color 0.4s; }
        .nav-scrolled { background:rgba(250,247,242,0.93)!important; backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-bottom:1px solid var(--border2)!important; }

        /* Buttons */
        .btn-orange { background:var(--orange); color:#fff; font-weight:600; font-family:'DM Sans',sans-serif; font-size:15px; padding:12px 26px; border-radius:14px; border:none; cursor:pointer; transition:transform 0.15s,box-shadow 0.15s,background 0.15s; display:inline-flex; align-items:center; gap:8px; text-decoration:none; white-space:nowrap; }
        .btn-orange:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(255,107,0,0.32); background:var(--orange-hover); }
        .btn-orange:active { transform:translateY(0) scale(0.98); }

        .btn-teal { background:var(--teal); color:#fff; font-weight:500; font-family:'DM Sans',sans-serif; font-size:15px; padding:12px 26px; border-radius:14px; border:none; cursor:pointer; transition:transform 0.15s,box-shadow 0.15s,background 0.15s; display:inline-flex; align-items:center; gap:8px; text-decoration:none; white-space:nowrap; }
        .btn-teal:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(2,51,65,0.25); background:#034558; }

        .btn-outline { background:transparent; color:var(--teal); font-weight:500; font-family:'DM Sans',sans-serif; font-size:14px; padding:9px 18px; border-radius:12px; border:1.5px solid var(--teal-border); cursor:pointer; transition:all 0.15s; display:inline-flex; align-items:center; gap:6px; text-decoration:none; white-space:nowrap; }
        .btn-outline:hover { border-color:var(--teal); background:var(--teal-dim); }

        /* Phone */
        .phone { width:205px; height:410px; background:#0f1a1e; border-radius:34px; border:2px solid rgba(255,255,255,0.08); position:relative; overflow:hidden; box-shadow:0 48px 96px rgba(2,51,65,0.3),inset 0 1px 0 rgba(255,255,255,0.07); flex-shrink:0; }
        .phone-notch { position:absolute; top:10px; left:50%; transform:translateX(-50%); width:60px; height:4px; background:rgba(255,255,255,0.12); border-radius:2px; z-index:10; }
        .phone-step { position:absolute; inset:0; padding:30px 13px 14px; display:flex; flex-direction:column; gap:7px; transition:opacity 0.3s ease,transform 0.3s ease; }
        .phone-step.active { opacity:1; transform:translateY(0); }
        .phone-step.inactive { opacity:0; transform:translateY(8px); pointer-events:none; }

        .food-row { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:7px 9px; display:flex; align-items:center; gap:8px; }
        .food-thumb { width:28px; height:28px; border-radius:50%; background:rgba(255,107,0,0.15); border:1px solid rgba(255,107,0,0.2); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }

        /* Step cards */
        .step-card { background:#fff; border:1px solid var(--border2); border-radius:16px; padding:26px 22px; transition:border-color 0.25s,transform 0.25s,box-shadow 0.25s; position:relative; overflow:hidden; }
        .step-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--orange); transform:scaleX(0); transition:transform 0.25s; transform-origin:left; }
        .step-card:hover { border-color:var(--orange-border); transform:translateY(-4px); box-shadow:0 12px 28px rgba(26,23,20,0.08); }
        .step-card:hover::after { transform:scaleX(1); }

        /* Feat cards */
        .feat-card { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:24px; transition:all 0.25s; }
        .feat-card:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); transform:translateY(-3px); }

        /* Tab buttons */
        .tab-btn { font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:9px 20px; border-radius:10px; border:none; cursor:pointer; transition:all 0.2s; }
        .tab-active { background:var(--charcoal); color:#fff; }
        .tab-inactive { background:transparent; color:var(--muted); border:1.5px solid var(--border); }
        .tab-inactive:hover { color:var(--charcoal); border-color:var(--charcoal); }

        /* Tags */
        .tag-orange { display:inline-flex; font-size:9px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--orange); background:var(--orange-dim); border:1px solid var(--orange-border); border-radius:6px; padding:3px 8px; margin-bottom:12px; font-family:'DM Mono',monospace; }
        .tag-teal { display:inline-flex; font-size:9px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,0.7); background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:6px; padding:3px 8px; margin-bottom:12px; font-family:'DM Mono',monospace; }

        .slabel { font-size:10px; font-weight:500; letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; display:block; font-family:'DM Mono',monospace; }
        .slabel-orange { color:var(--orange); }
        .slabel-teal-light { color:rgba(255,255,255,0.5); }

        .receipt-border { border:2px dashed rgba(255,107,0,0.3); border-radius:12px; }

        /* ── HORIZONTAL SCROLL STRIP ── */
        .hscroll-track { display:flex; gap:16px; padding:0 max(24px,calc((100vw - 1100px)/2)); overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; cursor:grab; user-select:none; }
        .hscroll-track::-webkit-scrollbar { display:none; }
        .hscroll-track.grabbing { cursor:grabbing; }
        .hcard { flex:0 0 260px; background:#fff; border:1px solid var(--border2); border-radius:18px; padding:28px 22px; position:relative; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s; }
        .hcard:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(26,23,20,0.09); }
        .hcard-num { font-size:64px; font-weight:900; letter-spacing:-3px; color:rgba(255,107,0,0.08); position:absolute; right:-6px; bottom:-14px; line-height:1; font-style:italic; pointer-events:none; }

        /* ── MARQUEE WORD STRIP ── */
        .word-track { display:flex; width:max-content; gap:0; animation:word-tick 22s linear infinite; }
        @keyframes word-tick { to { transform:translateX(-50%); } }
        .word-item { padding:0 32px; font-size:clamp(52px,7vw,96px); font-weight:700; letter-spacing:-3px; white-space:nowrap; font-style:italic; color:transparent; -webkit-text-stroke:1.5px rgba(26,23,20,0.12); transition:color 0.3s,-webkit-text-stroke 0.3s; }
        .word-item:hover { color:var(--orange); -webkit-text-stroke:1.5px var(--orange); }

        /* ── COUNT STRIP ── */
        .count-card { flex:1; padding:32px 28px; border-right:1px solid var(--border2); }
        .count-card:last-child { border-right:none; }

        /* Receipt */
        .receipt-bg { background:var(--cream2); border:1px solid var(--border); border-radius:20px; padding:36px 32px; position:relative; }
        .receipt-bg::before { content:''; position:absolute; top:-1px; left:5%; right:5%; height:12px; background:radial-gradient(circle at 50% 100%,var(--cream2) 6px, transparent 6px) repeat-x; background-size:16px 12px; }

        /* Scanner */
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .order-banner { animation:slideDown 0.3s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .scanner-overlay { position:fixed; inset:0; z-index:100; background:rgba(2,51,65,0.75); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
        .scanner-box { background:var(--cream); border:1px solid var(--border); border-radius:22px; padding:28px 24px; width:100%; max-width:360px; animation:popIn 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes spin { to { transform:rotate(360deg); } }
        #qr-reader * { border:none!important; }
        #qr-reader img { display:none!important; }
        #qr-reader button { display:none!important; }

        /* ── HERO WORD ANIMATE ── */
        @keyframes heroWord { from{opacity:0;transform:translateY(24px) rotate(-1deg)} to{opacity:1;transform:translateY(0) rotate(0deg)} }
        .hero-w { display:inline-block; opacity:0; animation:heroWord 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* Float subtle */
        @keyframes float { 0%,100%{transform:translateY(0px) perspective(1000px) rotateY(-5deg) rotateX(2deg)} 50%{transform:translateY(-10px) perspective(1000px) rotateY(-5deg) rotateX(2deg)} }
        .phone-float { animation:float 5s ease-in-out infinite; }

        /* Blob pulse */
        @keyframes blobPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.08);opacity:1} }
        .blob { animation:blobPulse 7s ease-in-out infinite; }

        /* Nav transparent → solid */
        .nav-transparent { background:transparent; border-bottom:1px solid transparent; }

        /* Orange dot blink */
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .blink { animation:blink 2s ease-in-out infinite; }

        @media(max-width:768px){
          .hero-inner{flex-direction:column!important;padding-top:80px!important;gap:48px!important;}
          .phone-wrap{order:-1;} .phone{width:175px;height:350px;border-radius:28px;}
          .h1{font-size:44px!important;letter-spacing:-1.5px!important;}
          .hero-btns{flex-direction:column;} .hero-btns button,.hero-btns a{width:100%;justify-content:center;}
          .steps-grid{grid-template-columns:1fr!important;} .feat-grid{grid-template-columns:1fr!important;}
          .footer-row{flex-direction:column!important;align-items:flex-start!important;gap:16px!important;}
          .owners-head{flex-direction:column!important;align-items:flex-start!important;}
          .big-h{font-size:38px!important;letter-spacing:-1.5px!important;}
          .count-row{flex-direction:column!important;} .count-card{border-right:none!important;border-bottom:1px solid var(--border2);}
          .hcard{flex:0 0 220px;}
        }
        @media(min-width:769px){
          body:has(.cursor-active) *{cursor:none!important;}
        }
      `}</style>

      {scannerOpen && (
        <QRScannerModal
          onClose={() => setScannerOpen(false)}
          onScan={(vendorId) => { setScannerOpen(false); router.push(`/v/${vendorId}`) }}
        />
      )}

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className={`nav ${scrollY > 40 ? 'nav-scrolled' : 'nav-transparent'}`} style={{ position: 'fixed', zIndex: 50 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px', background: 'none', border: 'none', color: scrollY > 40 ? 'var(--teal)' : 'var(--teal)', cursor: 'pointer', fontFamily: "'Fraunces', serif", fontStyle: 'italic', transition: 'color 0.3s' }}>
          quelessly<span style={{ color: 'var(--orange)' }}>.</span>
        </button>
        <Link href="/dashboard" className="btn-outline" style={{ padding: '7px 16px', fontSize: 13 }}>Vendor login</Link>
      </nav>

      {/* ── ACTIVE ORDER BANNER ──────────────────────────────────────────────── */}
      {activeOrder && (
        <div className="order-banner" style={{ position: 'fixed', top: 62, left: 0, right: 0, zIndex: 49, padding: '10px 16px', background: 'rgba(250,247,242,0.97)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => router.push(`/order/${activeOrder.orderId}`)}
            className="receipt-border"
            style={{ width: '100%', maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,107,0,0.05)', padding: '10px 16px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="blink" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)', fontFamily: 'DM Sans' }}>Active Order</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, fontFamily: 'DM Mono' }}>₹{activeOrder.total} · {activeOrder.items.length} item{activeOrder.items.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)', fontFamily: 'DM Sans' }}>Track →</span>
          </button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'relative', overflow: 'hidden', background: 'var(--cream)', zIndex: 1 }}>

        {/* Parallax blobs */}
        <div className="blob" style={{ position: 'absolute', width: 700, height: 700, background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 65%)', borderRadius: '50%', top: -160, right: -140, pointerEvents: 'none', ...parallax(-0.06) }} />
        <div className="blob" style={{ position: 'absolute', width: 460, height: 460, background: 'radial-gradient(circle, rgba(2,51,65,0.06) 0%, transparent 65%)', borderRadius: '50%', bottom: -120, left: -80, pointerEvents: 'none', animationDelay: '3s', ...parallax(0.05) }} />

        {/* Decorative grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none', opacity: 0.5 }} />

        <div className="hero-inner" style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60, paddingTop: 62, position: 'relative', zIndex: 1 }}>

          {/* Text */}
          <div style={{ flex: '1 1 400px', maxWidth: 520 }}>
            {/* Live pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', borderRadius: 8, padding: '5px 12px', marginBottom: 28, animationDelay: '0.1s' }}
              className="hero-w">
              <div className="blink" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--orange)', fontFamily: 'DM Mono', letterSpacing: 1.5 }}>LIVE IN PUNE</span>
            </div>

            {/* Animated headline words */}
            <h1 className="h1" style={{ fontSize: 'clamp(46px,5.5vw,74px)', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-2px', marginBottom: 20, fontStyle: 'italic' }}>
              {['Skip', 'the', 'line,'].map((w, i) => (
                <span key={w + i} className="hero-w" style={{ animationDelay: `${0.18 + i * 0.09}s` }}>{w}{' '}</span>
              ))}<br />
              <span style={{ color: 'var(--orange)' }}>
                {['not', 'the', 'food.'].map((w, i) => (
                  <span key={w + i} className="hero-w" style={{ animationDelay: `${0.45 + i * 0.09}s` }}>{w}{' '}</span>
                ))}
              </span>
            </h1>

            <p className="hero-w" style={{ fontSize: 17, color: 'var(--charcoal2)', lineHeight: 1.8, marginBottom: 36, fontFamily: "'DM Sans',sans-serif", fontWeight: 300, maxWidth: 420, animationDelay: '0.75s' }}>
              Scan a QR code, pick your food, pay with UPI — walk up when it's ready. No app. No queue. No cash.
            </p>

            <div className="hero-btns hero-w" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.9s' }}>
              <button onClick={() => setScannerOpen(true)} className="btn-orange" style={{ fontSize: 15, padding: '13px 28px' }}>
                Scan &amp; Order
              </button>
              <button onClick={() => scrollTo('owners')} className="btn-teal" style={{ fontSize: 15, padding: '13px 28px' }}>
                For business owners
              </button>
            </div>

            <div className="hero-w" style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap', animationDelay: '1.05s' }}>
              {['No app download', 'Pay via UPI', 'Live order tracking'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--orange)', fontWeight: 800 }}>✓</div>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Sans' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone — parallax + float */}
          <div className="phone-wrap" style={{ flex: '0 0 auto', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', bottom: -48, left: '50%', transform: 'translateX(-50%)', width: 170, height: 48, background: 'rgba(2,51,65,0.18)', borderRadius: '50%', filter: 'blur(22px)' }} />
            <div style={{ position: 'absolute', bottom: -64, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {phoneSteps.map((_, i) => (
                <div key={i} onClick={() => setPhoneStep(i)} style={{ width: phoneStep === i ? 22 : 6, height: 6, borderRadius: 3, background: phoneStep === i ? 'var(--orange)' : 'var(--cream3)', transition: 'all 0.3s', cursor: 'pointer' }} />
              ))}
            </div>
            <div className="phone phone-float" style={{ '--float-offset': `${scrollY * 0.02}px` } as any}>
              <div className="phone-notch" />
              {phoneSteps.map((step, i) => (
                <div key={i} className={`phone-step ${phoneStep === i ? 'active' : 'inactive'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', fontFamily: "'Fraunces',serif", fontStyle: 'italic' }}>quelessly.</span>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono' }}>{step.label}</span>
                  </div>
                  <div style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.18)', borderRadius: 10, padding: '9px 11px', marginBottom: 6 }}>
                    <div style={{ fontSize: 8, color: 'rgba(255,107,0,0.6)', fontFamily: 'DM Mono', marginBottom: 3, letterSpacing: 1 }}>STEP {i + 1}/3</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>{step.title}</div>
                  </div>
                  {step.items.map((item, j) => (
                    <div key={j} className="food-row">
                      <div className="food-thumb"><span style={{ fontSize: 12 }}>{item.emoji}</span></div>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: j === step.items.length - 1 ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans' }}>{item.name}</span>
                        {item.price && <span style={{ fontSize: 10, color: 'rgba(255,107,0,0.8)', fontFamily: 'DM Mono' }}>{item.price}</span>}
                      </div>
                    </div>
                  ))}
                  <div style={{ flex: 1 }} />
                  <div style={{ background: 'var(--orange)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'DM Sans' }}>{step.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: scrollY > 80 ? 0 : 1, transition: 'opacity 0.4s', pointerEvents: 'none' }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'DM Mono', letterSpacing: 2 }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--muted), transparent)', animation: 'scrollCue 1.6s ease-in-out infinite' }} />
          <style>{`@keyframes scrollCue{0%,100%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}}`}</style>
        </div>
      </section>

       {/* ── CINEMATIC SCROLL HERO ─────────────────────────────────────────────── */}
      <QuelesslyHero />

      {/* ── TICKER ───────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border2)', borderBottom: '1px solid var(--border2)', padding: '14px 0', background: 'var(--cream2)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className="t-wrap">
          <div className="t-track">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, paddingRight: 24, fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', fontFamily: 'DM Mono', letterSpacing: 2, textTransform: 'uppercase' }}>
                {t} <span style={{ color: 'var(--orange)', fontSize: 5 }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── LARGE MARQUEE WORDS ──────────────────────────────────────────────── */}
      <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border2)', background: 'var(--cream)', padding: '28px 0', position: 'relative', zIndex: 1 }}>
        <div className="word-track">
          {['Scan', '& Order', 'Pay with UPI', 'Track Live', 'No Queue', 'Scan', '& Order', 'Pay with UPI', 'Track Live', 'No Queue'].map((w, i) => (
            <span key={i} className="word-item">{w}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section header with clip reveal */}
        <div id="hw0" data-animate style={{ textAlign: 'center', marginBottom: 52 }}>
          <span className={`slabel slabel-orange fu d1 ${v('hw0') ? 'v' : ''}`} style={{ display: 'inline-block' }}>How it works</span>
          <div className="clip-wrap" style={{ marginBottom: 28 }}>
            <h2 className={`clip ${v('hw0') ? 'v' : ''}`} style={{ fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 700, letterSpacing: '-1.5px', fontStyle: 'italic' }}>
              Simple for customers.<br />Smart for owners.
            </h2>
          </div>
          <div className={`fu d3 ${v('hw0') ? 'v' : ''}`} style={{ display: 'inline-flex', gap: 6, background: 'var(--cream2)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
            <button className={`tab-btn ${activeTab === 'student' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('student')}>For customers</button>
            <button className={`tab-btn ${activeTab === 'owner' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('owner')}>For business owners</button>
          </div>
        </div>

        {activeTab === 'student' && (
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { n: '01', title: 'Scan the QR', desc: 'Every counter has a QR code. Point your phone camera at it — no app download, no account needed.' },
              { n: '02', title: 'Pick & Pay', desc: 'Browse the menu, add items to cart, and pay instantly with any UPI app. Takes under 60 seconds.' },
              { n: '03', title: 'Walk up when ready', desc: 'Your phone shows live order status. Screen turns green when ready — just show it at the counter.' },
            ].map((s, i) => (
              <div key={s.n} id={`ss${i}`} data-animate className={`step-card fus d${i + 1} ${v(`ss${i}`) ? 'v' : ''}`}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--orange)', letterSpacing: 2, marginBottom: 18, opacity: 0.7 }}>{s.n}</div>
                <h3 style={{ fontSize: 19, fontWeight: 600, marginBottom: 10, letterSpacing: '-0.5px', fontStyle: 'italic' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--charcoal2)', lineHeight: 1.8, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'owner' && (
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { n: '01', title: 'Get onboarded', desc: 'We set you up personally — no forms, no waiting. Share your email and we handle the rest.' },
              { n: '02', title: 'Print your QR', desc: 'We generate your unique QR code. Stick it on your counter and customers can order in minutes.' },
              { n: '03', title: 'Manage & get paid', desc: 'Orders come in live on your dashboard. Track daily revenue and receive settlements to your UPI.' },
            ].map((s, i) => (
              <div key={s.n} id={`os${i}`} data-animate className={`step-card fus d${i + 1} ${v(`os${i}`) ? 'v' : ''}`}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--orange)', letterSpacing: 2, marginBottom: 18, opacity: 0.7 }}>{s.n}</div>
                <h3 style={{ fontSize: 19, fontWeight: 600, marginBottom: 10, letterSpacing: '-0.5px', fontStyle: 'italic' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--charcoal2)', lineHeight: 1.8, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────────── */}
      <div id="stats0" data-animate style={{ background: 'var(--cream2)', borderTop: '1px solid var(--border2)', borderBottom: '1px solid var(--border2)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }} className="count-row">
          {[
            { num: '< 60s', label: 'Time to order' },
            { num: '0 ₹', label: 'Upfront cost' },
            { num: '4-layer', label: 'Tracking reliability' },
            { num: '∞', label: 'Orders supported' },
          ].map((s, i) => (
            <div key={s.num} id={`stat${i}`} data-animate className={`count-card fu d${i + 1} ${v(`stat${i}`) ? 'v' : ''}`}>
              <div className={`stat-shimmer ${v(`stat${i}`) ? 'v' : ''}`}
                style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-2px', fontStyle: 'italic', lineHeight: 1.1, marginBottom: 8 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Mono', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HORIZONTAL SCROLL — FEATURE CARDS ───────────────────────────────── */}
      <div id="hs0" data-animate style={{ padding: '80px 0', background: 'var(--cream)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className={`fu ${v('hs0') ? 'v' : ''}`} style={{ padding: '0 max(24px,calc((100vw - 1100px)/2))', marginBottom: 32 }}>
          <span className="slabel slabel-orange">Everything included</span>
          <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, letterSpacing: '-1px', fontStyle: 'italic' }}>Built for the real world.</h2>
        </div>

        <HorizontalScroll />
      </div>

      {/* ── OWNERS — teal section ─────────────────────────────────────────────── */}
      <section id="owners" style={{ background: 'var(--teal)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,107,0,0.07) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.03) 0%, transparent 40%)', pointerEvents: 'none' }} />

        {/* Diagonal decorative line */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: '100%', background: 'rgba(255,255,255,0.06)', transform: 'skewX(-20deg) translateX(-80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px', position: 'relative' }}>
          <div id="of0" data-animate>
            <div className="owners-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 52 }}>
              <div>
                <span className={`slabel slabel-teal-light sl ${v('of0') ? 'v' : ''}`}>For business owners</span>
                <div className="clip-wrap">
                  <h2 className={`clip ${v('of0') ? 'v' : ''}`} style={{ fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.08, fontStyle: 'italic', color: '#fff' }}>
                    Run smarter.<br /><span style={{ color: 'var(--orange)' }}>Earn more.</span>
                  </h2>
                </div>
                <p className={`fu d2 ${v('of0') ? 'v' : ''}`} style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginTop: 16, fontFamily: "'DM Sans',sans-serif", fontWeight: 300, maxWidth: 420, lineHeight: 1.7 }}>
                  Whether you run a college canteen, a cafe, or a local food stall — Quelessly makes ordering effortless for your customers and your team.
                </p>
              </div>
              <a href="mailto:support@quelessly.com?subject=I want to join Quelessly" className={`btn-orange sr ${v('of0') ? 'v' : ''}`} style={{ flexShrink: 0 }}>Get started →</a>
            </div>
          </div>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { title: 'Live order dashboard', desc: 'Orders appear the moment a customer pays. No manual refresh, no missed orders — ever.', tag: 'Real-time', i: 0 },
              { title: 'Daily UPI settlements', desc: 'Every rupee tracked. Settled directly to your UPI ID at end of day — no middleman.', tag: 'Automated', i: 1 },
              { title: 'Menu in your hands', desc: 'Add items, change prices, toggle availability. Self-serve, no technical skills needed.', tag: 'Self-serve', i: 2 },
              { title: 'QR code in 2 minutes', desc: 'We generate your unique QR. Print it, stick it. Customers can order within 5 minutes.', tag: 'Simple', i: 3 },
              { title: 'Zero upfront cost', desc: 'No hardware, no setup fee. No monthly charge to start. We grow only when you grow.', tag: 'Free to start', i: 4 },
              { title: 'Smart SLA alerts', desc: 'Orders idle for 5+ minutes are flagged automatically so you never leave a customer waiting.', tag: 'Smart', i: 5 },
            ].map(c => (
              <div key={c.title} id={`fc${c.i}`} data-animate className={`feat-card fus d${(c.i % 3) + 1} ${v(`fc${c.i}`) ? 'v' : ''}`}>
                <div className="tag-teal">{c.tag}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.3px', color: '#fff' }}>{c.title}</h3>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>

          <div id="of1" data-animate className={`fu ${v('of1') ? 'v' : ''}`} style={{ marginTop: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#fff' }}>Ready to get started?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans',sans-serif" }}>We personally onboard every business. No forms, no waiting.</div>
            </div>
            <a href="mailto:support@quelessly.com?subject=I want to join Quelessly" className="btn-orange" style={{ fontSize: 14, padding: '11px 22px', flexShrink: 0 }}>Email us to join →</a>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', textAlign: 'center', background: 'var(--cream)', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        {/* Decorative circle */}
        <div style={{ position: 'absolute', width: 320, height: 320, border: '1px solid rgba(255,107,0,0.1)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, border: '1px solid rgba(255,107,0,0.06)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        <div id="cta" data-animate style={{ position: 'relative' }}>
          <span className={`slabel slabel-orange fu ${v('cta') ? 'v' : ''}`} style={{ marginBottom: 20, display: 'block' }}>The bottom line</span>
          <div className="clip-wrap" style={{ marginBottom: 36 }}>
            <h2 className={`clip big-h ${v('cta') ? 'v' : ''}`} style={{ fontSize: 'clamp(40px,6vw,78px)', fontWeight: 700, letterSpacing: '-3px', lineHeight: 1.04, maxWidth: 680, margin: '0 auto', fontStyle: 'italic' }}>
              Less time waiting.<br /><span style={{ color: 'var(--orange)' }}>More time eating.</span>
            </h2>
          </div>
          <button onClick={() => setScannerOpen(true)} className={`btn-orange fu d2 ${v('cta') ? 'v' : ''}`} style={{ fontSize: 16, padding: '14px 36px' }}>
            Scan &amp; Order
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '26px 24px', background: 'var(--teal)', position: 'relative', zIndex: 1 }}>
        <div className="footer-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'Fraunces',serif", fontStyle: 'italic' }}>
            quelessly<span style={{ color: 'var(--orange)' }}>.</span>
          </button>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[['About', '/about'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Refunds', '/refunds'], ['Contact', '/contact']].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontFamily: 'DM Sans', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                {l}
              </Link>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono' }}>© 2026 Quelessly</span>
        </div>
      </footer>
    </div>
  )
}

// ─── Horizontal Scroll Strip ─────────────────────────────────────────────────

function HorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onDown = (e: React.MouseEvent) => {
    isDown.current = true
    ref.current?.classList.add('grabbing')
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0)
    scrollLeft.current = ref.current?.scrollLeft ?? 0
  }
  const onLeave = () => { isDown.current = false; ref.current?.classList.remove('grabbing') }
  const onUp = () => { isDown.current = false; ref.current?.classList.remove('grabbing') }
  const onMove = (e: React.MouseEvent) => {
    if (!isDown.current || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startX.current) * 1.4
    ref.current.scrollLeft = scrollLeft.current - walk
  }

  const cards = [
    { icon: '⚡', title: 'Instant payments', body: 'UPI, GPay, PhonePe — any app works. Payment confirmed in under 3 seconds.' },
    { icon: '📡', title: 'Real-time tracking', body: '4-layer reliability: socket + polling + reconnect + visibility refresh.' },
    { icon: '🧾', title: 'Auto receipts', body: 'Every order gets a unique code. No paper, no confusion at pickup.' },
    { icon: '📱', title: 'No app needed', body: 'Works entirely in the browser. Students scan and order in seconds.' },
    { icon: '🏪', title: 'Any food stall', body: "Canteen, cafe, dhaba — if you have a counter, we'll make it Quelessly." },
    { icon: '🔐', title: 'Secure by design', body: 'Razorpay-verified payments, HMAC webhook validation, rate limiting.' },
  ]

  return (
    <div
      ref={ref}
      className="hscroll-track"
      onMouseDown={onDown}
      onMouseLeave={onLeave}
      onMouseUp={onUp}
      onMouseMove={onMove}
    >
      {cards.map((c, i) => (
        <div key={c.title} className="hcard">
          <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 8, fontStyle: 'italic' }}>{c.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--charcoal2)', lineHeight: 1.75, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>{c.body}</p>
          <div className="hcard-num">{String(i + 1).padStart(2, '0')}</div>
        </div>
      ))}
    </div>
  )
}

// ─── QR Scanner Modal ─────────────────────────────────────────────────────────

function QRScannerModal({ onClose, onScan }: { onClose: () => void; onScan: (vendorId: string) => void }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const scannerRef = useRef<any>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!mountedRef.current) return
        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            try {
              const url = new URL(decodedText)
              const match = url.pathname.match(/^\/v\/(.+)$/)
              if (match?.[1]) { onScan(match[1]) }
              else { setError('Not a Quelessly QR code. Try again.') }
            } catch {
              if (decodedText.trim()) { onScan(decodedText.trim()) }
              else { setError('Invalid QR code.') }
            }
          },
          () => { }
        )
        if (mountedRef.current) setLoading(false)
      } catch (err: any) {
        if (mountedRef.current) {
          setLoading(false)
          setError(err?.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and try again.'
            : 'Could not start camera. Please try again.')
        }
      }
    }
    initScanner()
    return () => {
      mountedRef.current = false
      if (scannerRef.current) { scannerRef.current.stop().catch(() => { }); scannerRef.current = null }
    }
  }, [])

  const handleClose = () => {
    if (scannerRef.current) { scannerRef.current.stop().catch(() => { }); scannerRef.current = null }
    onClose()
  }

  return (
    <div className="scanner-overlay" onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="scanner-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.3px', fontStyle: 'italic', color: 'var(--teal)' }}>Scan QR Code</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontFamily: 'DM Sans' }}>Point camera at the QR code</div>
          </div>
          <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--cream2)', border: '1px solid var(--border)', color: 'var(--charcoal)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ background: 'var(--teal)', borderRadius: 14, minHeight: 260, position: 'relative', overflow: 'hidden' }}>
          <div id="qr-reader" style={{ width: '100%' }} />
          {loading && !error && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--teal)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid rgba(255,107,0,0.3)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono' }}>Starting camera…</span>
            </div>
          )}
        </div>
        {error && (
          <div style={{ marginTop: 12, background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, color: 'var(--orange)', fontFamily: 'DM Sans' }}>{error}</p>
          </div>
        )}
        {!error && (
          <p style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', textAlign: 'center', fontFamily: 'DM Mono', letterSpacing: 1 }}>
            SCAN A QUELESSLY QR TO ORDER
          </p>
        )}
      </div>
    </div>
  )
}