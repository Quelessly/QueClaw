'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ActiveOrder {
  orderId: string
  vendorId: string
  total: number
  items: { name: string; quantity: number }[]
  timestamp: number
}

export default function HomePage() {
  const router = useRouter()
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'student' | 'owner'>('student')
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('active_order')
    if (stored) {
      const order = JSON.parse(stored) as ActiveOrder
      if (Date.now() - order.timestamp < 2 * 60 * 60 * 1000) setActiveOrder(order)
      else localStorage.removeItem('active_order')
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const attachObserver = () => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) setVisible(prev => new Set([...prev, e.target.id]))
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('[data-animate]').forEach(el => observerRef.current!.observe(el))
  }

  useEffect(() => {
    attachObserver()
    return () => observerRef.current?.disconnect()
  }, [])

  useEffect(() => {
    const t = setTimeout(attachObserver, 50)
    return () => clearTimeout(t)
  }, [activeTab])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const v = (id: string) => visible.has(id)
  const ticker = ['No app needed', 'UPI payments', 'Real-time tracking', 'Zero queue', 'Instant notifications', 'Works on any phone']

  return (
    <div style={{ background: '#050505', color: '#fff', overflowX: 'hidden', fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --lime: #a3e635; --lime-dim: rgba(163,230,53,0.10); --lime-border: rgba(163,230,53,0.2);
          --surface: #0d0d0d; --border: rgba(255,255,255,0.06); --dim: #555;
        }
        .fu { opacity:0; transform:translateY(22px); transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .fu.v { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.08s} .d2{transition-delay:.16s} .d3{transition-delay:.24s}
        .t-wrap { overflow:hidden; mask-image:linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image:linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
        .t-track { display:flex; width:max-content; animation:tick 30s linear infinite; }
        .t-track:hover { animation-play-state:paused; }
        @keyframes tick { to { transform:translateX(-50%); } }
        .orb { position:absolute; border-radius:50%; pointer-events:none; filter:blur(100px); }
        .nav { position:fixed; top:0; left:0; right:0; z-index:50; height:58px; padding:0 20px; display:flex; align-items:center; justify-content:space-between; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); background:rgba(5,5,5,0.88); border-bottom:1px solid var(--border); }
        .btn-lime { background:var(--lime); color:#000; font-weight:700; font-family:'Syne',sans-serif; font-size:14px; padding:10px 22px; border-radius:100px; border:none; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; display:inline-flex; align-items:center; gap:6px; text-decoration:none; letter-spacing:-0.2px; white-space:nowrap; }
        .btn-lime:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(163,230,53,0.28); }
        .btn-ghost { background:transparent; color:rgba(255,255,255,0.65); font-weight:500; font-family:'Syne',sans-serif; font-size:14px; padding:10px 22px; border-radius:100px; border:1px solid rgba(255,255,255,0.1); cursor:pointer; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; text-decoration:none; white-space:nowrap; }
        .btn-ghost:hover { border-color:var(--lime-border); color:#fff; background:var(--lime-dim); }
        .phone { width:210px; height:420px; background:#080808; border-radius:36px; border:1px solid rgba(255,255,255,0.07); position:relative; overflow:hidden; box-shadow:0 60px 120px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06); flex-shrink:0; }
        .notch { position:absolute; top:12px; left:50%; transform:translateX(-50%); width:64px; height:5px; background:#1a1a1a; border-radius:3px; z-index:10; }
        @keyframes flt1 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(-2deg)} }
        @keyframes flt2 { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(-13px) rotate(1.5deg)} }
        .b1{animation:flt1 3.2s ease-in-out infinite;} .b2{animation:flt2 4s ease-in-out infinite 0.4s;}
        .step-card { background:var(--surface); border:1px solid rgba(255,255,255,0.05); border-radius:22px; padding:28px 24px; position:relative; overflow:hidden; transition:border-color 0.3s, transform 0.3s; }
        .step-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(to right, transparent, var(--lime), transparent); opacity:0; transition:opacity 0.3s; }
        .step-card:hover { border-color:var(--lime-border); transform:translateY(-4px); }
        .step-card:hover::before { opacity:1; }
        .feat-card { background:var(--surface); border:1px solid rgba(255,255,255,0.05); border-radius:18px; padding:22px; transition:all 0.3s; }
        .feat-card:hover { border-color:var(--lime-border); background:#0f0f0f; }
        .tab-btn { font-family:'Syne',sans-serif; font-size:13px; font-weight:600; padding:8px 18px; border-radius:100px; border:none; cursor:pointer; transition:all 0.22s; letter-spacing:-0.2px; }
        .tab-active { background:var(--lime); color:#000; } .tab-inactive { background:transparent; color:#555; border:1px solid rgba(255,255,255,0.07); }
        .tab-inactive:hover { color:#fff; border-color:rgba(255,255,255,0.15); }
        .tag { display:inline-flex; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--lime); background:var(--lime-dim); border:1px solid var(--lime-border); border-radius:100px; padding:3px 10px; margin-bottom:12px; font-family:'DM Mono',monospace; }
        .slabel { font-size:10px; font-weight:500; letter-spacing:3px; text-transform:uppercase; color:var(--lime); margin-bottom:14px; display:block; font-family:'DM Mono',monospace; }
        @keyframes pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
        @keyframes shimmer { from{background-position:200% center} to{background-position:-200% center} }
        .shimmer { background:linear-gradient(90deg,#fff 0%,var(--lime) 40%,#fff 60%,var(--lime) 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 4s linear infinite; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .order-banner { animation:slideDown 0.4s cubic-bezier(0.16,1,0.3,1); }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        .scanner-overlay { position:fixed; inset:0; z-index:100; background:rgba(0,0,0,0.92); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
        .scanner-box { background:#0d0d0d; border:1px solid rgba(255,255,255,0.08); border-radius:28px; padding:28px 24px; width:100%; max-width:380px; animation:scaleIn 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes spin { to { transform: rotate(360deg); } }
        #qr-reader * { border: none !important; }
        #qr-reader img { display: none !important; }
        #qr-reader button { display: none !important; }
        @media(max-width:768px){
          .hero-inner{flex-direction:column!important;padding-top:72px!important;gap:40px!important;}
          .phone-wrap{order:-1;} .phone{width:160px;height:320px;border-radius:28px;} .b1,.b2{display:none;}
          .h1{font-size:40px!important;letter-spacing:-1.5px!important;}
          .hero-btns{flex-direction:column;} .hero-btns button{width:100%;justify-content:center;}
          .steps-grid{grid-template-columns:1fr!important;} .feat-grid{grid-template-columns:1fr!important;}
          .footer-row{flex-direction:column!important;align-items:flex-start!important;gap:16px!important;}
          .big-h{font-size:36px!important;letter-spacing:-1.5px!important;}
          .owners-head{flex-direction:column!important;align-items:flex-start!important;}
        }
      `}</style>

      {scannerOpen && (
        <QRScannerModal
          onClose={() => setScannerOpen(false)}
          onScan={(vendorId) => { setScannerOpen(false); router.push(`/v/${vendorId}`) }}
        />
      )}

      {/* NAV */}
      <nav className="nav">
        <span style={{ fontWeight:800, fontSize:18, letterSpacing:'-0.5px' }}>
          quelessly<span style={{ color:'var(--lime)' }}>.</span>
        </span>
        <Link href="/dashboard" className="btn-ghost" style={{ padding:'7px 16px', fontSize:13 }}>Vendor login</Link>
      </nav>

      {/* ACTIVE ORDER BANNER */}
      {activeOrder && (
        <div className="order-banner" style={{ position:'fixed', top:58, left:0, right:0, zIndex:49, padding:'8px 16px', background:'rgba(5,5,5,0.95)', borderBottom:'1px solid var(--lime-border)' }}>
          <button onClick={() => router.push(`/order/${activeOrder.orderId}`)} style={{ width:'100%', maxWidth:560, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--lime-dim)', border:'1px solid var(--lime-border)', borderRadius:12, padding:'9px 16px', cursor:'pointer' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--lime)', animation:'pdot 1.5s ease-in-out infinite', flexShrink:0 }} />
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--lime)', fontFamily:'Syne' }}>Active Order</div>
                <div style={{ fontSize:11, color:'#666', marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>₹{activeOrder.total} · {activeOrder.items.length} item{activeOrder.items.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--lime)', fontFamily:'Syne' }}>Track →</span>
          </button>
        </div>
      )}

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'0 20px', position:'relative', overflow:'hidden' }}>
        <div className="orb" style={{ width:700, height:700, background:'rgba(163,230,53,0.055)', top:-200, left:-200 }} />
        <div className="orb" style={{ width:400, height:400, background:'rgba(163,230,53,0.03)', bottom:-100, right:-100 }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />
        <div className="hero-inner" style={{ maxWidth:1100, margin:'0 auto', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:48, paddingTop:58 }}>
          <div style={{ flex:'1 1 400px', maxWidth:540 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--lime-dim)', border:'1px solid var(--lime-border)', borderRadius:100, padding:'5px 13px', marginBottom:26 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--lime)', animation:'pdot 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize:10, fontWeight:600, color:'var(--lime)', fontFamily:'DM Mono', letterSpacing:1 }}>LIVE IN PUNE</span>
            </div>
            <h1 className="h1" style={{ fontSize:'clamp(44px,5.5vw,72px)', fontWeight:800, lineHeight:1.04, letterSpacing:'-2.5px', marginBottom:20 }}>
              Your canteen,<br /><span className="shimmer">instantly.</span>
            </h1>
            <p style={{ fontSize:16, color:'#666', lineHeight:1.85, marginBottom:34, fontFamily:"'DM Sans',sans-serif", fontWeight:300, maxWidth:400 }}>
              Scan a QR code, pick your food, pay with UPI — and walk up when it's ready. No app. No queue. No cash.
            </p>
            <div className="hero-btns" style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={() => setScannerOpen(true)} className="btn-lime" style={{ fontSize:15, padding:'12px 26px' }}>📷 Scan & Order</button>
              <button onClick={() => scrollTo('owners')} className="btn-ghost" style={{ fontSize:15, padding:'12px 26px' }}>For business owners</button>
            </div>
          </div>
          <div className="phone-wrap" style={{ flex:'0 0 auto', position:'relative', display:'flex', justifyContent:'center' }}>
            <div style={{ position:'absolute', width:260, height:260, background:'radial-gradient(circle, rgba(163,230,53,0.09) 0%, transparent 70%)', borderRadius:'50%', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
            <div className="b1" style={{ position:'absolute', top:-18, right:-52, background:'#0c1a00', border:'1px solid var(--lime-border)', borderRadius:14, padding:'10px 14px', zIndex:10, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize:9, color:'#4a6000', fontFamily:'DM Mono', marginBottom:3, letterSpacing:1 }}>ORDER #247</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--lime)' }}>✓ Ready to pick up</div>
            </div>
            <div className="b2" style={{ position:'absolute', bottom:24, left:-56, background:'var(--surface)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'10px 14px', zIndex:10, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize:9, color:'#444', fontFamily:'DM Mono', marginBottom:3, letterSpacing:1 }}>PAYMENT</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>⚡ Paid via UPI</div>
            </div>
            <div className="phone" style={{ transform:`translateY(${scrollY * 0.035}px)` }}>
              <div className="notch" />
              <div style={{ height:'100%', padding:'30px 12px 12px', display:'flex', flexDirection:'column', gap:7 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:800, color:'var(--lime)', fontFamily:'Syne' }}>quelessly.</span>
                  <span style={{ fontSize:9, color:'#2a2a2a', fontFamily:'DM Mono' }}>DHole Canteen</span>
                </div>
                <div style={{ background:'linear-gradient(135deg,#0e1f00,#172c00)', border:'1px solid rgba(163,230,53,0.22)', borderRadius:12, padding:'10px 11px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:8, color:'#3d5c00', fontFamily:'DM Mono', marginBottom:3, letterSpacing:0.5 }}>ORDER STATUS</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--lime)' }}>Ready to pick up!</div>
                  </div>
                  <div style={{ width:28, height:28, background:'var(--lime)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#000' }}>✓</div>
                </div>
                {[{name:'Vada Pav',price:'₹20'},{name:'Masala Chai',price:'₹15'},{name:'Samosa ×2',price:'₹30'}].map(item=>(
                  <div key={item.name} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.04)', borderRadius:10, padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--lime)', animation:'pdot 1.5s ease-in-out infinite', flexShrink:0 }} />
                      <span style={{ fontSize:10, fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize:10, color:'#444', fontFamily:'DM Mono' }}>{item.price}</span>
                  </div>
                ))}
                <div style={{ flex:1 }} />
                <div style={{ background:'rgba(163,230,53,0.06)', border:'1px solid var(--lime-border)', borderRadius:10, padding:'10px 11px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:10, color:'#555', fontFamily:"'DM Sans',sans-serif" }}>Total paid</span>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--lime)', fontFamily:'DM Mono' }}>₹65</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'13px 0' }}>
        <div className="t-wrap">
          <div className="t-track">
            {[...ticker,...ticker,...ticker,...ticker].map((t,i)=>(
              <span key={i} style={{ display:'flex', alignItems:'center', gap:22, paddingRight:22, fontSize:10, color:'#2e2e2e', whiteSpace:'nowrap', fontFamily:'DM Mono', letterSpacing:1.5, textTransform:'uppercase' }}>
                {t} <span style={{ color:'var(--lime)', fontSize:4 }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section style={{ padding:'96px 20px', maxWidth:1100, margin:'0 auto' }}>
        <div id="hw0" data-animate className={`fu ${v('hw0')?'v':''}`} style={{ textAlign:'center', marginBottom:48 }}>
          <span className="slabel">How it works</span>
          <h2 style={{ fontSize:'clamp(28px,3.5vw,46px)', fontWeight:800, letterSpacing:'-1.5px', marginBottom:28 }}>Built for everyone at the canteen</h2>
          <div style={{ display:'inline-flex', gap:6, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:100, padding:4 }}>
            <button className={`tab-btn ${activeTab==='student'?'tab-active':'tab-inactive'}`} onClick={()=>setActiveTab('student')}>For customers</button>
            <button className={`tab-btn ${activeTab==='owner'?'tab-active':'tab-inactive'}`} onClick={()=>setActiveTab('owner')}>For business owners</button>
          </div>
        </div>
        {activeTab==='student' && (
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              {n:'01',title:'Scan the QR',desc:'Every counter has a QR code. Point your phone camera at it — no app download, no account needed.'},
              {n:'02',title:'Pick & Pay',desc:'Browse the menu, add items to cart, and pay instantly with any UPI app. Takes under 60 seconds.'},
              {n:'03',title:'Walk up when ready',desc:'Your phone shows live order status. Screen turns green when ready — just show it at the counter.'},
            ].map((s,i)=>(
              <div key={s.n} id={`ss${i}`} data-animate className={`step-card fu d${i+1} ${v(`ss${i}`)?'v':''}`}>
                <div style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--lime)', letterSpacing:2, marginBottom:20 }}>{s.n}</div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10, letterSpacing:'-0.4px' }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'var(--dim)', lineHeight:1.8, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab==='owner' && (
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              {n:'01',title:'Get onboarded',desc:'We set you up personally — no forms, no waiting. Share your email and we handle the rest.'},
              {n:'02',title:'Print your QR',desc:'We generate your unique QR code. Stick it on your counter and customers can order in minutes.'},
              {n:'03',title:'Manage & get paid',desc:'Orders come in live on your dashboard. Track daily revenue and receive settlements to your UPI.'},
            ].map((s,i)=>(
              <div key={s.n} id={`os${i}`} data-animate className={`step-card fu d${i+1} ${v(`os${i}`)?'v':''}`}>
                <div style={{ fontFamily:'DM Mono', fontSize:10, color:'var(--lime)', letterSpacing:2, marginBottom:20 }}>{s.n}</div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10, letterSpacing:'-0.4px' }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'var(--dim)', lineHeight:1.8, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ height:1, background:'linear-gradient(to right,transparent,rgba(255,255,255,0.05),transparent)', maxWidth:1100, margin:'0 auto' }} />

      {/* OWNERS */}
      <section id="owners" style={{ padding:'96px 20px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div id="of0" data-animate className={`fu ${v('of0')?'v':''}`} style={{ marginBottom:48 }}>
            <div className="owners-head" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:20 }}>
              <div>
                <span className="slabel">For business owners</span>
                <h2 style={{ fontSize:'clamp(28px,3.5vw,46px)', fontWeight:800, letterSpacing:'-1.5px', lineHeight:1.1 }}>
                  Run smarter.<br /><span style={{ color:'var(--lime)' }}>Earn more.</span>
                </h2>
              </div>
              <a href="mailto:support@quelessly.com?subject=I want to join Quelessly" className="btn-lime">Get started →</a>
            </div>
          </div>
          <div className="feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              {title:'Live order dashboard',desc:'Orders appear the moment a customer pays. No manual refresh, no missed orders — ever.',tag:'Real-time',i:0},
              {title:'Daily UPI settlements',desc:'Every rupee tracked. Settled directly to your UPI ID at end of day — no middleman.',tag:'Automated',i:1},
              {title:'Menu in your hands',desc:'Add items, change prices, toggle availability. Self-serve, no technical skills needed.',tag:'Self-serve',i:2},
              {title:'QR code in 2 minutes',desc:'We generate your unique QR. Print it, stick it. Customers can order within 5 minutes.',tag:'Simple',i:3},
              {title:'Zero upfront cost',desc:'No hardware, no setup fee. No monthly charge to start. We grow only when you grow.',tag:'Free to start',i:4},
              {title:'Smart SLA alerts',desc:'Orders idle for 5+ minutes are flagged automatically so you never leave a customer waiting.',tag:'Smart',i:5},
            ].map(c=>(
              <div key={c.title} id={`fc${c.i}`} data-animate className={`feat-card fu d${(c.i%3)+1} ${v(`fc${c.i}`)?'v':''}`}>
                <div className="tag">{c.tag}</div>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:8, letterSpacing:'-0.3px' }}>{c.title}</h3>
                <p style={{ fontSize:12.5, color:'var(--dim)', lineHeight:1.8, fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div id="of1" data-animate className={`fu ${v('of1')?'v':''}`} style={{ marginTop:28, background:'var(--surface)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:18, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Ready to get started?</div>
              <div style={{ fontSize:13, color:'var(--dim)', fontFamily:"'DM Sans',sans-serif" }}>We personally onboard every business. No forms, no waiting.</div>
            </div>
            <a href="mailto:support@quelessly.com?subject=I want to join Quelessly" className="btn-lime" style={{ fontSize:14, padding:'11px 22px', flexShrink:0 }}>Email us to join →</a>
          </div>
        </div>
      </section>

      <div style={{ height:1, background:'linear-gradient(to right,transparent,rgba(255,255,255,0.05),transparent)', maxWidth:1100, margin:'0 auto' }} />

      {/* CLOSING CTA */}
      <section style={{ padding:'120px 20px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div className="orb" style={{ width:700, height:350, background:'rgba(163,230,53,0.04)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        <div id="cta" data-animate className={`fu ${v('cta')?'v':''}`}>
          <span className="slabel" style={{ marginBottom:20, display:'block' }}>The bottom line</span>
          <h2 className="big-h" style={{ fontSize:'clamp(38px,6vw,76px)', fontWeight:800, letterSpacing:'-3px', lineHeight:1.05, maxWidth:700, margin:'0 auto 36px' }}>
            Less time waiting.<br /><span style={{ color:'var(--lime)' }}>More time eating.</span>
          </h2>
          <button onClick={() => setScannerOpen(true)} className="btn-lime" style={{ fontSize:16, padding:'14px 32px' }}>
            📷 Scan & Order
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'22px 20px' }}>
        <div className="footer-row" style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:'-0.3px' }}>quelessly<span style={{ color:'var(--lime)' }}>.</span></span>
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            {[['About','/about'],['Terms','/terms'],['Privacy','/privacy'],['Refunds','/refunds'],['Contact','/contact']].map(([l,h])=>(
              <Link key={l} href={h} style={{ fontSize:12, color:'#333', textDecoration:'none', transition:'color 0.2s', fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
                onMouseLeave={e=>(e.currentTarget.style.color='#333')}
              >{l}</Link>
            ))}
          </div>
          <span style={{ fontSize:11, color:'#1f1f1f', fontFamily:'DM Mono' }}>© 2026 Quelessly</span>
        </div>
      </footer>
    </div>
  )
}

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
          () => {}
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
      if (scannerRef.current) { scannerRef.current.stop().catch(() => {}); scannerRef.current = null }
    }
  }, [])

  const handleClose = () => {
    if (scannerRef.current) { scannerRef.current.stop().catch(() => {}); scannerRef.current = null }
    onClose()
  }

  return (
    <div className="scanner-overlay" onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="scanner-box">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.5px' }}>Scan QR Code</div>
            <div style={{ fontSize:12, color:'#555', marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>Point camera at the canteen QR</div>
          </div>
          <button onClick={handleClose} style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ background:'#000', borderRadius:16, minHeight:260, position:'relative', overflow:'hidden' }}>
          <div id="qr-reader" style={{ width:'100%' }} />
          {loading && !error && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'#000' }}>
              <div style={{ width:32, height:32, border:'2px solid rgba(163,230,53,0.3)', borderTopColor:'#a3e635', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <span style={{ fontSize:12, color:'#555', fontFamily:'DM Mono' }}>Starting camera…</span>
            </div>
          )}
        </div>
        {error && (
          <div style={{ marginTop:14, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'10px 14px' }}>
            <p style={{ fontSize:12, color:'#f87171', fontFamily:"'DM Sans',sans-serif" }}>{error}</p>
          </div>
        )}
        {!error && (
          <p style={{ marginTop:14, fontSize:11, color:'#333', textAlign:'center', fontFamily:'DM Mono', letterSpacing:0.5 }}>
            SCAN A QUELESSLY QR TO ORDER
          </p>
        )}
      </div>
    </div>
  )
}