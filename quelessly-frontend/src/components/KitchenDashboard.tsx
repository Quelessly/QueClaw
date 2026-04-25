'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { BRAND, FONT_SERIF, FONT_MONO, type Aesthetic } from './brand'
import { makeOrder, type Order, type OrderStatus } from './data'
import { useHaptic, useNow } from './hooks'

export default function KitchenDashboard({ aesthetic = 'editorial' }: { aesthetic?: Aesthetic }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const list = Array.from({ length: 6 }, () => makeOrder())
    list[0].status = 'ready';   list[0].placedAt = Date.now() - 88 * 1000
    list[1].status = 'cooking'; list[1].placedAt = Date.now() - 55 * 1000
    list[2].status = 'cooking'; list[2].placedAt = Date.now() - 30 * 1000
    list[3].status = 'pending'; list[3].placedAt = Date.now() - 12 * 1000
    list[4].status = 'pending'; list[4].placedAt = Date.now() - 5 * 1000
    list[5].status = 'ready';   list[5].placedAt = Date.now() - 120 * 1000
    return list
  })
  const [justPulse, setJustPulse] = useState<string | null>(null)
  const [stats, setStats] = useState({ today: 247, revenue: 18420, avgMs: 94 * 1000 })
  const now = useNow(500)
  const haptic = useHaptic()

  const isBright = aesthetic !== 'tech'
  const bg = isBright ? BRAND.cream : BRAND.charcoal
  const fg = isBright ? BRAND.charcoal : '#fff'
  const cardBg = isBright ? '#fff' : 'rgba(255,255,255,0.03)'
  const cardBorder = isBright ? BRAND.border : 'rgba(255,255,255,0.08)'

  useEffect(() => {
    const t = setInterval(() => {
      setOrders((prev) => {
        const copy = [...prev]
        const idx = copy.findIndex((o) => o.status === 'cooking')
        if (idx >= 0 && Math.random() < 0.35) copy[idx] = { ...copy[idx], status: 'ready', readyAt: Date.now() }
        return copy
      })
    }, 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      const o = makeOrder()
      o.placedAt = Date.now()
      setOrders((prev) => [o, ...prev].slice(0, 10))
      setJustPulse(o.id)
      setStats((s) => ({ ...s, today: s.today + 1, revenue: s.revenue + o.total }))
      setTimeout(() => setJustPulse(null), 2000)
    }, 11000)
    return () => clearInterval(t)
  }, [])

  const advance = (id: string, toStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: toStatus, readyAt: toStatus === 'ready' ? Date.now() : o.readyAt } : o)))
  }
  const dismiss = (id: string) => setOrders((prev) => prev.filter((o) => o.id !== id))

  const byStatus = {
    pending: orders.filter((o) => o.status === 'pending'),
    cooking: orders.filter((o) => o.status === 'cooking'),
    ready: orders.filter((o) => o.status === 'ready'),
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bg,
        color: fg,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes ko-slide-in { from { transform: translateY(-10px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes ko-pulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(255,107,0,0.6); } 50%{ box-shadow: 0 0 0 14px rgba(255,107,0,0); } }
        @keyframes ko-ring { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.03); } }
        @keyframes ko-pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
        .ko-col { display:flex; flex-direction:column; gap:10px; padding:14px; border-right:1px solid ${cardBorder}; overflow-y:auto; min-height:0; }
        .ko-col:last-child { border-right:none; }
      `}</style>

      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SERIF, fontWeight: 800, fontStyle: 'italic', fontSize: 20 }}>q</div>
        <div>
          <div style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>orders.</div>
          <div style={{ fontSize: 11, color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)', fontFamily: FONT_MONO, letterSpacing: 1 }}>
            KITCHEN · SHAN DA STALL · {new Date(now).toLocaleTimeString('en-IN', { hour12: false })}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <StatCell label="TODAY" value={stats.today} isBright={isBright} />
        <StatCell label="REVENUE" value={'₹' + stats.revenue.toLocaleString('en-IN')} isBright={isBright} />
        <StatCell label="AVG WAIT" value={Math.round(stats.avgMs / 1000) + 's'} isBright={isBright} accent />
        <div style={{ width: 1, height: 32, background: cardBorder }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: FONT_MONO, color: '#10b981' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          LIVE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', minHeight: 0 }}>
        <Column title="Incoming" count={byStatus.pending.length} color={BRAND.orange} isBright={isBright} cardBorder={cardBorder}>
          {byStatus.pending.map((o) => (
            <OrderCard key={o.id} order={o} now={now} isBright={isBright} justNew={justPulse === o.id}
              cardBg={cardBg} cardBorder={cardBorder}
              primary={{ label: '✓ Start cooking', onClick: () => { haptic(document.activeElement); advance(o.id, 'cooking') } }}
              secondary={{ label: '✕', onClick: () => dismiss(o.id) }}
              aesthetic={aesthetic} />
          ))}
          {byStatus.pending.length === 0 && <Empty text="No incoming orders" isBright={isBright} />}
        </Column>

        <Column title="Cooking" count={byStatus.cooking.length} color="#f59e0b" isBright={isBright} cardBorder={cardBorder}>
          {byStatus.cooking.map((o) => (
            <OrderCard key={o.id} order={o} now={now} isBright={isBright}
              cardBg={cardBg} cardBorder={cardBorder}
              primary={{ label: '🔔 Mark ready', onClick: () => { haptic(document.activeElement); advance(o.id, 'ready') } }}
              aesthetic={aesthetic} />
          ))}
          {byStatus.cooking.length === 0 && <Empty text="Kitchen idle" isBright={isBright} />}
        </Column>

        <Column title="Ready" count={byStatus.ready.length} color="#10b981" isBright={isBright} cardBorder={cardBorder}>
          {byStatus.ready.map((o) => (
            <OrderCard key={o.id} order={o} now={now} isBright={isBright} readyMode
              cardBg={cardBg} cardBorder={cardBorder}
              primary={{ label: '✓ Picked up', onClick: () => { haptic(document.activeElement); dismiss(o.id) } }}
              aesthetic={aesthetic} />
          ))}
          {byStatus.ready.length === 0 && <Empty text="Nothing waiting" isBright={isBright} />}
        </Column>
      </div>

      <KitchenTicker orders={orders} isBright={isBright} />
    </div>
  )
}

function Column({
  title,
  count,
  color,
  isBright,
  cardBorder,
  children,
}: {
  title: string
  count: number
  color: string
  isBright: boolean
  cardBorder: string
  children: ReactNode
}) {
  return (
    <div className="ko-col">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px 10px', borderBottom: `1px dashed ${isBright ? BRAND.border : 'rgba(255,255,255,0.1)'}` }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: FONT_MONO }}>{title}</div>
        <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, fontFamily: FONT_MONO, color }}>{count}</div>
      </div>
      <div style={{ display: 'none' }}>{cardBorder /* satisfy unused */}</div>
      {children}
    </div>
  )
}

interface ActionDef { label: string; onClick: () => void }

function OrderCard({
  order,
  now,
  isBright,
  justNew,
  primary,
  secondary,
  readyMode,
  aesthetic,
  cardBg,
  cardBorder,
}: {
  order: Order
  now: number
  isBright: boolean
  justNew?: boolean
  primary?: ActionDef
  secondary?: ActionDef
  readyMode?: boolean
  aesthetic: Aesthetic
  cardBg: string
  cardBorder: string
}) {
  const elapsed = Math.max(0, now - order.placedAt)
  const mins = Math.floor(elapsed / 60000)
  const secs = Math.floor((elapsed % 60000) / 1000)
  const pct = Math.min(1, elapsed / order.sla)
  const isSlaBreach = elapsed > order.sla
  const isSlaWarn = elapsed > order.sla * 0.75

  const timerColor = readyMode ? '#10b981' : isSlaBreach ? BRAND.red : isSlaWarn ? '#f59e0b' : BRAND.orange

  return (
    <div style={{
      background: readyMode ? (isBright ? '#ECFDF5' : 'rgba(16,185,129,0.08)') : cardBg,
      border: `1.5px solid ${readyMode ? 'rgba(16,185,129,0.5)' : justNew ? BRAND.orange : cardBorder}`,
      borderRadius: 14,
      padding: '12px 14px',
      cursor: 'pointer',
      animation: justNew ? 'ko-slide-in .4s, ko-pulse 1.5s 2' : readyMode ? 'ko-slide-in .4s, ko-ring 2s infinite' : 'ko-slide-in .4s',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <div style={{ fontFamily: FONT_SERIF, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>#{order.shortId}</div>
        <div style={{ fontSize: 11, color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)', fontFamily: FONT_MONO }}>{order.customer}</div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: timerColor,
            animation: isSlaBreach && !readyMode ? 'ko-pulse-dot 1s infinite' : 'none',
          }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {!readyMode && (
        <div style={{ height: 3, background: isBright ? BRAND.cream2 : 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: timerColor, transition: 'width .4s' }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {order.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: isBright ? BRAND.cream2 : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>
              {aesthetic === 'playful' ? it.emoji : <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: BRAND.orange, fontSize: 11 }}>{it.qty}×</span>}
            </div>
            {aesthetic === 'playful' && <span style={{ fontFamily: FONT_MONO, color: BRAND.orange, fontWeight: 700, fontSize: 12 }}>{it.qty}×</span>}
            <span style={{ fontWeight: 500, flex: 1 }}>{it.name}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)' }}>₹{it.price * it.qty}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: `1px dashed ${isBright ? BRAND.border : 'rgba(255,255,255,0.1)'}`, marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)', fontFamily: FONT_MONO, letterSpacing: 1.2 }}>TOTAL</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 800, fontSize: 18, color: BRAND.orange }}>₹{order.total}</span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {primary && (
          <button onClick={primary.onClick} style={{
            flex: 1, background: readyMode ? '#10b981' : BRAND.charcoal, color: '#fff',
            border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{primary.label}</button>
        )}
        {secondary && (
          <button onClick={secondary.onClick} style={{
            background: 'transparent', color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)',
            border: `1px solid ${isBright ? BRAND.border : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 10, padding: '10px 12px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{secondary.label}</button>
        )}
      </div>
    </div>
  )
}

function StatCell({ label, value, isBright, accent }: { label: string; value: string | number; isBright: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1 }}>
      <div style={{ fontSize: 9, fontFamily: FONT_MONO, letterSpacing: 1.5, color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: FONT_MONO, color: accent ? BRAND.orange : 'inherit', marginTop: 4, letterSpacing: -1 }}>{value}</div>
    </div>
  )
}

function Empty({ text, isBright }: { text: string; isBright: boolean }) {
  return (
    <div style={{
      border: `1.5px dashed ${isBright ? BRAND.border : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 14, padding: '28px 14px', textAlign: 'center',
      color: isBright ? BRAND.muted : 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: FONT_MONO, letterSpacing: 1,
    }}>
      {text}
    </div>
  )
}

function KitchenTicker({ orders, isBright }: { orders: Order[]; isBright: boolean }) {
  const total = orders.reduce((s, o) => s + o.total, 0)
  const items = orders.flatMap((o) => o.items)
  const itemCount = items.reduce((s, i) => s + i.qty, 0)
  return (
    <div style={{
      padding: '10px 20px', borderTop: `1px solid ${isBright ? BRAND.border : 'rgba(255,255,255,0.08)'}`,
      display: 'flex', alignItems: 'center', gap: 22, fontSize: 11, fontFamily: FONT_MONO, letterSpacing: 1.2, color: isBright ? BRAND.muted : 'rgba(255,255,255,0.5)', overflow: 'hidden', whiteSpace: 'nowrap',
    }}>
      <span>📡 QUEUE VALUE <b style={{ color: BRAND.orange, fontSize: 13 }}>₹{total}</b></span>
      <span>·</span>
      <span>ITEMS ON FLOOR <b style={{ color: isBright ? BRAND.charcoal : '#fff', fontSize: 13 }}>{itemCount}</b></span>
      <span>·</span>
      <span>TOP SELLER <b style={{ color: isBright ? BRAND.charcoal : '#fff', fontSize: 13 }}>SAMOSA ×34</b></span>
      <span>·</span>
      <span>LONGEST WAIT <b style={{ color: '#f59e0b', fontSize: 13 }}>2:14</b></span>
    </div>
  )
}
