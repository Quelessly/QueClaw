'use client'

/**
 * QuelesslyHero.tsx
 * Drop into src/components/QuelesslyHero.tsx
 * Usage in app/page.tsx:
 *   import QuelesslyHero from '@/components/QuelesslyHero'
 *   <QuelesslyHero />
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'

// ─── Palette ──────────────────────────────────────────────────────────────────
const CREAM    = '#F9F6F1'
const CHARCOAL = '#1F1A17'
const ORANGE   = '#FF6B00'
const TEAL     = '#0F3A3E'
const GREEN    = '#2F9E44'
const BORDER   = '#E4DED3'

// ─── Scene windows [start, end] ───────────────────────────────────────────────
const S1: [number, number] = [0.00, 0.22]
const S2: [number, number] = [0.18, 0.44]
const S3: [number, number] = [0.40, 0.64]
const S4: [number, number] = [0.60, 0.84]
const S5: [number, number] = [0.82, 1.00]

// ─── Math helpers ─────────────────────────────────────────────────────────────
const clamp  = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const lerp   = (a: number, b: number, t: number) => a + (b - a) * t
const remap  = (v: number, a: number, b: number, c = 0, d = 1) =>
  lerp(c, d, clamp((v - a) / (b - a || 1e-9)))
const easeOutCubic    = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic  = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// Seeded PRNG — stable across renders
const mulberry32 = (seed: number) => {
  let s = seed
  return () => {
    s += 0x6d2b79f5
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── QR grid builder (21×21) ──────────────────────────────────────────────────
const QR_N = 21

function buildQR(): boolean[][] {
  const rnd = mulberry32(7)
  const m: boolean[][] = Array.from({ length: QR_N }, () =>
    Array<boolean>(QR_N).fill(false)
  )
  const finder = (r: number, c: number, br: number, bc: number) => {
    const dr = r - br, dc = c - bc
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null
    if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true
    if (dr === 1 || dr === 5 || dc === 1 || dc === 5) return false
    return true
  }
  for (let r = 0; r < QR_N; r++) {
    for (let c = 0; c < QR_N; c++) {
      const a = finder(r, c, 0, 0)
      const b = finder(r, c, 0, 14)
      const d = finder(r, c, 14, 0)
      m[r][c] = a ?? b ?? d ?? rnd() < 0.48
    }
  }
  for (let i = 8; i < 13; i++) {
    m[6][i] = i % 2 === 0
    m[i][6] = i % 2 === 0
  }
  return m
}

type Dot = { r: number; c: number; sx: number; sy: number; rot: number; delay: number }

function buildDots(matrix: boolean[][]): Dot[] {
  const rnd = mulberry32(101)
  const out: Dot[] = []
  for (let r = 0; r < QR_N; r++) {
    for (let c = 0; c < QR_N; c++) {
      if (!matrix[r][c]) continue
      const ang  = rnd() * Math.PI * 2
      const dist = 700 + rnd() * 900
      out.push({ r, c, sx: Math.cos(ang) * dist, sy: Math.sin(ang) * dist, rot: (rnd() - 0.5) * 720, delay: rnd() * 0.55 })
    }
  }
  return out
}

// ─── Font loader ──────────────────────────────────────────────────────────────
function useGoogleFonts() {
  useEffect(() => {
    const id = 'quelessly-gfonts'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id   = id
    link.rel  = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500;1,9..144,700&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
  }, [])
}

// ─── Scroll progress hook ─────────────────────────────────────────────────────
function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = ref.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      const scrolled = clamp(-el.getBoundingClientRect().top / total)
      setP(scrolled)
      raf = 0
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
  return p
}

// ─── SCENE 1 · QR Assembly ───────────────────────────────────────────────────
function QRScene({ p, dots }: { p: number; dots: Dot[] }) {
  const t1   = remap(p, S1[0], S1[1])
  const t2   = remap(p, S2[0], S2[1])
  const fade = 1 - remap(p, S2[1] - 0.02, S2[1] + 0.06)

  const qrScale   = lerp(1, 0.42, easeInOutCubic(t2))
  const qrY       = lerp(0, -220, easeInOutCubic(t2))
  const qrOpacity = clamp(fade * lerp(1, 0, remap(t2, 0.85, 1)))

  const cell  = 14
  const gap   = 2
  const total = QR_N * cell + (QR_N - 1) * gap
  const bracketAlpha = easeOutCubic(clamp(remap(t1, 0.55, 1)))

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qrOpacity, transform: `translateY(${qrY}px) scale(${qrScale})` }}>
      <div style={{ position: 'relative', width: total, height: total }}>
        <Brackets size={total} alpha={bracketAlpha} />
        {dots.map((d, i) => {
          const local = clamp((t1 - d.delay) / (1 - d.delay))
          const e     = easeOutCubic(local)
          const x     = d.c * (cell + gap)
          const y     = d.r * (cell + gap)
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: cell, height: cell, background: CHARCOAL, borderRadius: 2, transform: `translate3d(${lerp(d.sx, 0, e)}px,${lerp(d.sy, 0, e)}px,0) rotate(${lerp(d.rot, 0, e)}deg)`, opacity: clamp(local * 2.4) }} />
          )
        })}
      </div>
    </div>
  )
}

function Brackets({ size, alpha }: { size: number; alpha: number }) {
  const len = 36, thick = 4, off = -14
  const s: React.CSSProperties = { position: 'absolute', background: ORANGE, opacity: alpha }
  return (
    <>
      <div style={{ ...s, left: off, top: off, width: len, height: thick }} />
      <div style={{ ...s, left: off, top: off, width: thick, height: len }} />
      <div style={{ ...s, right: off, top: off, width: len, height: thick }} />
      <div style={{ ...s, right: off, top: off, width: thick, height: len }} />
      <div style={{ ...s, left: off, bottom: off, width: len, height: thick }} />
      <div style={{ ...s, left: off, bottom: off, width: thick, height: len }} />
      <div style={{ ...s, right: off, bottom: off, width: len, height: thick }} />
      <div style={{ ...s, right: off, bottom: off, width: thick, height: len }} />
    </>
  )
}

// ─── SCENE 2 · Scan Beam ──────────────────────────────────────────────────────
function ScanScene({ p }: { p: number }) {
  const t       = remap(p, S2[0], S2[1])
  const sweep   = easeInOutCubic(clamp(remap(t, 0.05, 0.8)))
  const yVh     = lerp(-40, 80, sweep)
  const opacity = t < 0.05 ? remap(t, 0, 0.05) : t > 0.85 ? 1 - remap(t, 0.85, 1) : 1

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      <div style={{ position: 'absolute', left: '50%', top: `${yVh}vh`, width: '120vw', height: '60vh', transform: 'translate(-50%,-50%)', background: `radial-gradient(ellipse at center, ${ORANGE}55 0%, ${ORANGE}22 28%, transparent 60%)`, filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: `${yVh}vh`, height: 2, background: `linear-gradient(90deg,transparent,${ORANGE} 12%,#FFD9B5 50%,${ORANGE} 88%,transparent)`, boxShadow: `0 0 18px ${ORANGE},0 0 42px ${ORANGE}AA` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: `calc(${yVh}vh - 120px)`, height: 120, background: `linear-gradient(to bottom,transparent,${ORANGE}22)` }} />
    </div>
  )
}

// ─── SCENE 3 · Receipt Unroll ────────────────────────────────────────────────
const RECEIPT_LINES: { text: string; color?: string; bold?: boolean; gap?: number }[] = [
  { text: 'QUELESSLY · TABLE 07',   bold: true },
  { text: 'ORDER #Q-4721',          gap: 6 },
  { text: '—————————————————————',  gap: 10 },
  { text: '3×  Samosa Chaat    ₹180' },
  { text: '1×  Masala Chai      ₹60' },
  { text: '1×  Gulab Jamun     ₹120' },
  { text: '—————————————————————',  gap: 8 },
  { text: 'Subtotal            ₹360' },
  { text: 'Taxes (5%)           ₹18' },
  { text: 'TOTAL               ₹378', color: ORANGE, bold: true, gap: 10 },
  { text: 'PAID ✓  ·  UPI',          color: GREEN,  bold: true },
]

function ReceiptScene({ p }: { p: number }) {
  const t       = remap(p, S3[0], S3[1])
  const paperIn = easeOutCubic(clamp(remap(t, 0, 0.12)))
  const unroll  = easeInOutCubic(clamp(remap(t, 0.08, 0.9)))
  const fade    = t < 0.05 ? remap(t, 0, 0.05) : 1
  const paperH  = lerp(0, 460, unroll)
  const slotY   = lerp(-120, -10, paperIn)
  const step    = 0.75 / RECEIPT_LINES.length

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', opacity: fade }}>
      <div style={{ position: 'relative', width: 340, marginTop: 60 }}>

        {/* Printer slot */}
        <div style={{ position: 'absolute', top: slotY, left: '50%', transform: 'translateX(-50%)', width: 360, height: 42, background: CHARCOAL, borderRadius: 6, boxShadow: `0 10px 0 ${CHARCOAL},0 12px 22px rgba(0,0,0,0.22)`, opacity: paperIn }}>
          <div style={{ position: 'absolute', left: 18, right: 18, bottom: 6, height: 6, background: '#0b0807', borderRadius: 2 }} />
          <span style={{ position: 'absolute', left: 14, top: 12, fontFamily: "'DM Mono',monospace", fontSize: 10, color: ORANGE, letterSpacing: 1.5 }}>QUELESSLY · PRNTR-02</span>
          <div style={{ position: 'absolute', right: 14, top: 16, width: 8, height: 8, borderRadius: 999, background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
        </div>

        {/* Paper */}
        <div style={{ position: 'absolute', top: slotY + 38, left: '50%', transform: 'translateX(-50%)', width: 320, height: paperH, background: '#FFFDF8', boxShadow: '0 2px 0 rgba(0,0,0,0.06),0 18px 40px rgba(0,0,0,0.16)', overflow: 'hidden', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 6px),94% 100%,88% calc(100% - 4px),80% 100%,72% calc(100% - 5px),64% 100%,56% calc(100% - 3px),48% 100%,40% calc(100% - 5px),32% 100%,24% calc(100% - 4px),16% 100%,8% calc(100% - 3px),0 100%)' }}>
          <div style={{ padding: '22px 22px 14px' }}>
            {RECEIPT_LINES.map((ln, i) => {
              const start  = 0.08 + i * step
              const lineT  = clamp(remap(t, start, start + step * 0.9))
              const shown  = Math.floor(lineT * ln.text.length)
              return (
                <div key={i} style={{ fontFamily: "'DM Mono',monospace", fontSize: ln.bold ? 13 : 12, color: ln.color ?? CHARCOAL, fontWeight: ln.bold ? 600 : 400, letterSpacing: 0.3, marginTop: ln.gap ?? 2, whiteSpace: 'pre', opacity: lineT > 0 ? 1 : 0 }}>
                  {ln.text.slice(0, shown)}
                  {lineT > 0 && lineT < 1 && <span style={{ display: 'inline-block', width: 6, height: 12, background: CHARCOAL, marginLeft: 2, verticalAlign: 'middle' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SCENE 4 · Food Assembly ─────────────────────────────────────────────────
function FoodScene({ p }: { p: number }) {
  const t    = remap(p, S4[0], S4[1])
  const fade = t < 0.05 ? remap(t, 0, 0.05) : t > 0.92 ? 1 - remap(t, 0.92, 1) * 0.35 : 1

  const plate = easeOutBack(clamp(remap(t, 0.02, 0.25)))
  const samosa = (i: number) => easeOutCubic(clamp(remap(t, 0.12 + i * 0.08, 0.12 + i * 0.08 + 0.22)))
  const chut  = easeOutBack(clamp(remap(t, 0.42, 0.62)))
  const chai  = easeOutCubic(clamp(remap(t, 0.55, 0.82)))
  const steam = clamp(remap(t, 0.7, 1))

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: fade }}>
      <svg viewBox='-300 -220 600 440' style={{ width: 'min(680px,92vw)', height: 'auto', overflow: 'visible' }}>
        <SteamWisps progress={steam} />

        {/* Plate */}
        <g transform={`translate(0,70) scale(${plate})`} opacity={clamp(plate)}>
          <ellipse cx='0' cy='14' rx='210' ry='24' fill='rgba(0,0,0,0.18)' />
          <ellipse cx='0' cy='0'  rx='200' ry='48' fill='#FFFFFF' />
          <ellipse cx='0' cy='-2' rx='168' ry='38' fill='#F2ECE0' />
          <ellipse cx='0' cy='-4' rx='150' ry='32' fill='#FFFDF8' />
        </g>

        {/* Chutney dots */}
        {([[-120,58,10,GREEN],[120,58,10,'#C33A2A'],[-60,82,5,GREEN],[70,80,6,'#C33A2A'],[-150,78,4,GREEN],[150,78,4,'#C33A2A']] as [number,number,number,string][]).map(([x,y,r,c],i) => (
          <circle key={i} cx={x} cy={y} r={r * chut} fill={c} opacity={clamp(chut)} />
        ))}

        {/* Samosas */}
        {[0,1,2].map(i => {
          const e     = samosa(i)
          const baseX = -110 + i * 110
          const baseY = 40
          const y     = lerp(-420, baseY, e)
          const rot   = lerp((i-1)*140, (i-1)*14, e)
          return (
            <g key={i} transform={`translate(${baseX},${y}) rotate(${rot})`} opacity={clamp(e * 2)}>
              <SamosaShape />
            </g>
          )
        })}

        {/* Chai cup */}
        <g transform={`translate(${lerp(460, 210, chai)},${lerp(-60, 20, chai)}) rotate(${lerp(35,-6,chai)})`} opacity={clamp(chai * 1.4)}>
          <ChaiShape />
        </g>
      </svg>
    </div>
  )
}

function SamosaShape() {
  return (
    <g>
      <polygon points='-46,26 46,26 0,-52' fill='#C68A3E' stroke='#6E3F14' strokeWidth='2' strokeLinejoin='round' />
      <polygon points='-40,22 40,22 0,-44' fill='#D9A04E' opacity='0.9' />
      <line x1='0' y1='-44' x2='0' y2='22' stroke='#6E3F14' strokeWidth='1.5' />
      <line x1='-22' y1='0' x2='22' y2='0' stroke='#6E3F14' strokeWidth='1' opacity='0.4' />
      <ellipse cx='0' cy='30' rx='40' ry='4' fill='rgba(0,0,0,0.18)' />
    </g>
  )
}

function ChaiShape() {
  return (
    <g>
      <path d='M 46,-10 Q 86,-10 86,22 Q 86,54 46,54' stroke='#FFFFFF' strokeWidth='10' fill='none' strokeLinecap='round' />
      <path d='M 46,-4 Q 78,-4 78,22 Q 78,48 46,48' stroke={CHARCOAL} strokeWidth='2' fill='none' />
      <path d='M -52,-16 L 52,-16 L 46,62 Q 0,74 -46,62 Z' fill='#FFFFFF' stroke={CHARCOAL} strokeWidth='2' />
      <ellipse cx='0' cy='-16' rx='52' ry='10' fill='#9A5B2B' />
      <ellipse cx='0' cy='-18' rx='46' ry='7'  fill='#B67035' />
      <ellipse cx='0' cy='70'  rx='72' ry='10' fill='#FFFFFF' stroke={CHARCOAL} strokeWidth='2' />
      <ellipse cx='0' cy='68'  rx='60' ry='5'  fill='#F2ECE0' />
    </g>
  )
}

function SteamWisps({ progress }: { progress: number }) {
  return (
    <g>
      {([{ x: -30, d: 0.0 }, { x: 0, d: 0.2 }, { x: 30, d: 0.4 }]).map((w, i) => {
        const local = clamp((progress - w.d) / 0.6)
        const rise  = lerp(0, -140, local)
        const op    = Math.sin(local * Math.PI) * 0.55
        return (
          <path key={i} d={`M ${w.x},${-10 + rise} c -10,-20 20,-30 6,-52 c -10,-16 14,-28 -2,-48`} stroke='#B8B1A4' strokeWidth='4' strokeLinecap='round' fill='none' opacity={op} />
        )
      })}
    </g>
  )
}

// ─── SCENE 5 · Ready Stamp ────────────────────────────────────────────────────
function StampScene({ p }: { p: number }) {
  const t         = remap(p, S5[0], S5[1])
  const slam      = clamp(remap(t, 0, 0.28))
  const settle    = clamp(remap(t, 0.28, 0.55))
  const scale     = lerp(3.2, 1, easeOutBack(slam)) + (slam >= 1 ? Math.sin(settle * Math.PI) * 0.04 : 0)
  const opacity   = clamp(remap(t, 0, 0.2))
  const conf      = clamp(remap(t, 0.25, 0.9))

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity }}>
      <ConfettiBurst progress={conf} />
      <div style={{ transform: `rotate(-8deg) scale(${scale})`, willChange: 'transform' }}>
        <div style={{ border: `6px solid ${TEAL}`, padding: '22px 44px', background: 'transparent', boxShadow: `inset 0 0 0 3px ${CREAM},inset 0 0 0 9px ${TEAL}`, position: 'relative' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: TEAL, letterSpacing: 6, textAlign: 'center', opacity: 0.85 }}>ORDER</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontWeight: 700, fontSize: 72, color: TEAL, letterSpacing: -2, lineHeight: 1, textAlign: 'center' }}>READY</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, color: TEAL, letterSpacing: 3, textAlign: 'center', marginTop: 4 }}>· #Q-4721 ·</div>
        </div>
      </div>
    </div>
  )
}

function ConfettiBurst({ progress }: { progress: number }) {
  const pieces = useMemo(() => {
    const rnd = mulberry32(9)
    return Array.from({ length: 44 }, (_, i) => {
      const ang  = rnd() * Math.PI * 2
      const dist = 160 + rnd() * 380
      return { i, x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 60, rot: (rnd() - 0.5) * 540, size: 6 + rnd() * 10, color: [ORANGE, TEAL, GREEN, CHARCOAL, '#E8B04B'][i % 5], delay: rnd() * 0.3 }
    })
  }, [])

  return (
    <>
      {pieces.map(pc => {
        const local = clamp((progress - pc.delay) / (1 - pc.delay))
        const e     = easeOutCubic(local)
        const op    = local < 0.85 ? 1 : 1 - remap(local, 0.85, 1)
        return (
          <div key={pc.i} style={{ position: 'absolute', left: '50%', top: '50%', width: pc.size, height: pc.size * 0.4, background: pc.color, transform: `translate(-50%,-50%) translate(${pc.x * e}px,${pc.y * e + 40 * local * local}px) rotate(${pc.rot * e}deg)`, opacity: op, borderRadius: 1 }} />
        )
      })}
    </>
  )
}

// ─── Morphing headline ────────────────────────────────────────────────────────
const PHRASES = ['Scan the line.', 'Skip the wait.', 'Your order, printed.', 'We cook.', 'You eat.'] as const
const PHRASE_WINDOWS: [number, number][] = [[0.00,0.22],[0.18,0.42],[0.38,0.64],[0.60,0.84],[0.82,1.00]]

function Headline({ p }: { p: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '11vh', textAlign: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'relative', height: '14vh' }}>
        {PHRASES.map((phrase, i) => {
          const [a, b] = PHRASE_WINDOWS[i]
          const mid    = (a + b) / 2
          const span   = (b - a) / 2
          const op     = clamp(1 - Math.abs(p - mid) / span)
          return (
            <h1 key={i} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(44px,8.5vw,136px)', lineHeight: 1, letterSpacing: '-0.03em', color: CHARCOAL, opacity: op, transform: `translateY(${lerp(26, 0, op)}px)`, margin: 0 }}>
              {phrase}
            </h1>
          )
        })}
      </div>
    </div>
  )
}

// ─── Chrome (progress bar + labels) ──────────────────────────────────────────
function Chrome({ p }: { p: number }) {
  const labels = ['01 · SCAN', '02 · UNLOCK', '03 · PRINT', '04 · COOK', '05 · READY']
  const idx    = p < 0.22 ? 0 : p < 0.44 ? 1 : p < 0.64 ? 2 : p < 0.84 ? 3 : 4
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: `${p * 100}%`, background: ORANGE, boxShadow: `0 0 14px ${ORANGE}`, zIndex: 50 }} />
      <div style={{ position: 'absolute', top: 28, left: 36, fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: CHARCOAL, letterSpacing: '-0.02em', zIndex: 30 }}>
        quelessly<span style={{ color: ORANGE }}>.</span>
      </div>
      <div style={{ position: 'absolute', top: 32, right: 36, fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 3, color: CHARCOAL, zIndex: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 6, height: 6, background: ORANGE, display: 'inline-block', borderRadius: 999, boxShadow: `0 0 8px ${ORANGE}` }} />
        {labels[idx]}
      </div>
      <div style={{ position: 'absolute', bottom: 28, left: 36, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2.5, color: CHARCOAL, opacity: 0.55, zIndex: 30 }}>SCROLL ↓</div>
      <div style={{ position: 'absolute', bottom: 28, right: 36, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2.5, color: CHARCOAL, opacity: 0.55, zIndex: 30 }}>{String(Math.round(p * 100)).padStart(3, '0')}%</div>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `radial-gradient(${CHARCOAL}0F 1px,transparent 1px)`, backgroundSize: '3px 3px', opacity: 0.35, zIndex: 1 }} />
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function QuelesslyHero() {
  useGoogleFonts()
  const wrapRef = useRef<HTMLElement>(null)
  const p       = useScrollProgress(wrapRef)
  const matrix  = useMemo(() => buildQR(), [])
  const dots    = useMemo(() => buildDots(matrix), [matrix])

  return (
    <section ref={wrapRef} style={{ position: 'relative', height: '500vh', background: CREAM, color: CHARCOAL }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', background: CREAM }}>
        <Chrome p={p} />
        <QRScene p={p} dots={dots} />
        <ScanScene p={p} />
        <ReceiptScene p={p} />
        <FoodScene p={p} />
        <StampScene p={p} />
        <Headline p={p} />
      </div>
    </section>
  )
}