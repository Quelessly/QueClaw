'use client'

import type { CSSProperties, ReactNode } from 'react'
import { BRAND, FONT_MONO } from './brand'

// ——— Chip ———
type ChipColor = 'teal' | 'orange' | 'green' | 'red' | 'dark'

const CHIP_COLORS: Record<ChipColor, { bg: string; border: string; fg: string }> = {
  teal:   { bg: BRAND.orangeDim, border: BRAND.orangeBorder, fg: BRAND.orange },
  orange: { bg: BRAND.orangeDim, border: BRAND.orangeBorder, fg: BRAND.orange },
  green:  { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.35)', fg: '#047857' },
  red:    { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.35)', fg: '#b91c1c' },
  dark:   { bg: BRAND.charcoal, border: BRAND.charcoal, fg: '#fff' },
}

export function Chip({
  color = 'orange',
  children,
  style,
}: {
  color?: ChipColor
  children: ReactNode
  style?: CSSProperties
}) {
  const c = CHIP_COLORS[color]
  return (
    <span
      style={{
        display: 'inline-block',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.fg,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1.5,
        fontFamily: FONT_MONO,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

// ——— VegDot ———
export function VegDot({ veg }: { veg: boolean }) {
  const color = veg ? '#10b981' : '#ef4444'
  return (
    <div
      style={{
        width: 14,
        height: 14,
        border: `1.5px solid ${color}`,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
    </div>
  )
}

// ——— TrustItem ———
export function TrustItem({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: BRAND.orange, fontWeight: 700 }}>✓</span>
      {children}
    </div>
  )
}

// ——— Confetti burst ———
export function burstConfetti(parent: HTMLElement | null) {
  if (!parent) return
  const colors = [BRAND.orange, '#FFD166', '#10b981', '#F9F6F1', '#FF9F5A']
  for (let i = 0; i < 40; i++) {
    const dot = document.createElement('div')
    const size = 6 + Math.random() * 8
    dot.style.cssText = `
      position:absolute; top:40%; left:50%;
      width:${size}px; height:${size * 0.4}px;
      background:${colors[i % colors.length]};
      transform: translate(-50%,-50%) rotate(${Math.random() * 360}deg);
      pointer-events:none; z-index:999; border-radius:1px;
    `
    parent.appendChild(dot)
    const angle = Math.random() * Math.PI * 2
    const velocity = 80 + Math.random() * 120
    dot.animate(
      [
        { transform: dot.style.transform, opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% + ${
            Math.sin(angle) * velocity
          }px)) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' },
    )
    setTimeout(() => dot.remove(), 1600)
  }
}

// ——— Placeholder ———
export function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `repeating-linear-gradient(45deg, ${BRAND.cream2} 0, ${BRAND.cream2} 6px, ${BRAND.cream} 6px, ${BRAND.cream} 12px)`,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 6,
      }}
    >
      <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: BRAND.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

// ——— Ticket ———
export function Ticket({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: '#fff',
        position: 'relative',
        padding: 14,
        borderRadius: 4,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 10px 30px -15px rgba(0,0,0,0.15)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute', top: -6, left: 0, right: 0, height: 6,
          background: 'radial-gradient(circle at 6px 6px, transparent 4px, #fff 4.5px) 0 0 / 12px 12px',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: -6, left: 0, right: 0, height: 6,
          background: 'radial-gradient(circle at 6px 0px, transparent 4px, #fff 4.5px) 0 0 / 12px 12px',
        }}
      />
      {children}
    </div>
  )
}

// ——— Food primitives (used in scroll hero) ———
export function Samosa({ size = 60 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size * 0.85,
        background: 'linear-gradient(180deg, #D18B3A, #A35F1F)',
        clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
        position: 'relative',
        filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.06))',
      }}
    >
      <div style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%, 0)', width: '60%', height: 2, background: 'rgba(0,0,0,0.2)' }} />
      <div style={{ position: 'absolute', left: '20%', top: '60%', width: 4, height: 4, background: 'rgba(0,0,0,0.2)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', right: '22%', top: '70%', width: 3, height: 3, background: 'rgba(0,0,0,0.3)', borderRadius: '50%' }} />
    </div>
  )
}

export function ChaiCup({ size = 80 }: { size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size * 0.9 }}>
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%',
          background: BRAND.cream, border: `3px solid ${BRAND.charcoal}`,
          borderRadius: '6px 6px 30px 30px',
        }}
      >
        <div style={{ position: 'absolute', top: 4, left: 4, right: 4, height: 10, background: '#8A4A1F', borderRadius: 4 }} />
      </div>
      <div
        style={{
          position: 'absolute', right: -14, top: '18%', width: 20, height: '50%',
          border: `3px solid ${BRAND.charcoal}`, borderLeft: 'none',
          borderRadius: '0 14px 14px 0',
        }}
      />
    </div>
  )
}
