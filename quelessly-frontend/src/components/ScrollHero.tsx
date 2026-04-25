'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { BRAND, FONT_SERIF, FONT_MONO } from './brand'
import { burstConfetti, Samosa, ChaiCup } from './primitives'

// ——————————————————————————————————————————————————————————————
// Pinned, scroll-driven hero. The parent provides ~400vh of scroll
// distance. Inside, we map scroll progress (0..1) to 5 sub-scenes.
// ——————————————————————————————————————————————————————————————

export function ScrollHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const parent = el.parentElement // tall wrapper section
    if (!parent) return

    const onScroll = () => {
      const rect = parent.getBoundingClientRect()
      const totalScroll = parent.offsetHeight - el.offsetHeight
      const scrolled = Math.min(Math.max(0, -rect.top), totalScroll)
      const p = totalScroll > 0 ? scrolled / totalScroll : 0
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (progress > 0.88 && !burst) {
      setBurst(true)
      const stage = containerRef.current?.querySelector<HTMLElement>('[data-burst-anchor]')
      if (stage) setTimeout(() => burstConfetti(stage), 150)
    }
    if (progress < 0.75 && burst) setBurst(false)
  }, [progress, burst])

  const sub = (start: number, end: number) => {
    const v = (progress - start) / (end - start)
    return Math.max(0, Math.min(1, v))
  }

  const qrP = sub(0.0, 0.22)
  const scanP = sub(0.18, 0.36)
  const receiptP = sub(0.3, 0.55)
  const foodP = sub(0.5, 0.82)
  const doneP = sub(0.78, 0.98)

  const sceneIndex =
    progress < 0.22 ? 0 : progress < 0.4 ? 1 : progress < 0.58 ? 2 : progress < 0.8 ? 3 : 4
  const sceneLabels = ['01 · SCAN', '02 · UNLOCK', '03 · ORDER', '04 · COOK', '05 · READY']

  return (
    <div
      ref={containerRef}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: BRAND.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(${BRAND.border} 1px, transparent 1px) 0 0 / 22px 22px`,
          opacity: 0.35 + 0.25 * progress,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.05)', zIndex: 50 }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: BRAND.orange, transition: 'width .1s' }} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 40,
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: 2,
          color: BRAND.muted,
          fontWeight: 700,
        }}
      >
        <div style={{ color: BRAND.orange }}>● SCROLL TO COOK</div>
        <div style={{ marginTop: 4 }}>SCENE {sceneLabels[sceneIndex]}</div>
      </div>

      <HeroMorphHeadline progress={progress} />
      <QRAssembly p={qrP} scanP={scanP} />
      <ScanBeam p={scanP} />
      <ReceiptUnroll p={receiptP} />
      <FoodAssembly p={foodP} />
      <ReadyStamp p={doneP} />

      {progress < 0.04 && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: 2,
            color: BRAND.muted,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: 1 - progress * 20,
          }}
        >
          <div>SCROLL TO BEGIN</div>
          <div style={{ animation: 'qless-bounce 1.2s ease-in-out infinite' }}>↓</div>
        </div>
      )}

      <div data-burst-anchor style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }} />

      <style>{`
        @keyframes qless-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        @keyframes qless-fade-up { from{opacity:0; transform:translateY(18px);} to{opacity:1; transform:translateY(0);} }
        @keyframes qless-receipt-line { from{opacity:0;transform:translateY(-3px);} to{opacity:1;transform:translateY(0);} }
        @keyframes qless-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes qless-steam-0 { 0%,100%{transform:translate(0,0); opacity:.9} 50%{transform:translate(-6px,-16px); opacity:.3} }
        @keyframes qless-steam-1 { 0%,100%{transform:translate(0,0); opacity:.7} 50%{transform:translate(4px,-18px); opacity:.2} }
        @keyframes qless-steam-2 { 0%,100%{transform:translate(0,0); opacity:.6} 50%{transform:translate(-3px,-20px); opacity:.2} }
        @keyframes qless-steam-3 { 0%,100%{transform:translate(0,0); opacity:.5} 50%{transform:translate(6px,-14px); opacity:.2} }
      `}</style>
    </div>
  )
}

function HeroMorphHeadline({ progress }: { progress: number }) {
  const lines = [
    { t: 'Scan the line.',       accent: 'the line.', at: 0.0 },
    { t: 'Skip the wait.',       accent: 'the wait.', at: 0.22 },
    { t: 'Your order, printed.', accent: 'printed.',  at: 0.4 },
    { t: 'We cook.',             accent: 'cook.',     at: 0.58 },
    { t: 'You eat.',             accent: 'eat.',      at: 0.82 },
  ]
  let activeIdx = 0
  for (let i = 0; i < lines.length; i++) if (progress >= lines[i].at) activeIdx = i
  const active = lines[activeIdx]
  const nonAccent = active.t.replace(active.accent, '').trim()

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: '14%', textAlign: 'center', zIndex: 20, pointerEvents: 'none' }}>
      <div
        key={activeIdx}
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(42px, 6vw, 84px)',
          letterSpacing: -2,
          lineHeight: 1,
          animation: 'qless-fade-up .6s cubic-bezier(.2,.7,.3,1) both',
          color: BRAND.charcoal,
        }}
      >
        <span>{nonAccent} </span>
        <span style={{ color: BRAND.orange }}>{active.accent}</span>
      </div>
    </div>
  )
}

interface QRDot { x: number; y: number; ang: number; dist: number; delay: number }

function useQRPattern() {
  return useMemo<{ N: number; grid: QRDot[] }>(() => {
    const N = 17
    const grid: QRDot[] = []
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const isCorner = (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7)
        const inCornerRing =
          ((x === 0 || x === 6 || y === 0 || y === 6) && x < 7 && y < 7) ||
          ((x === N - 1 || x === N - 7 || y === 0 || y === 6) && x >= N - 7 && y < 7) ||
          ((x === 0 || x === 6 || y === N - 1 || y === N - 7) && x < 7 && y >= N - 7)
        const inCornerCenter =
          (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= N - 5 && x <= N - 3 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= N - 5 && y <= N - 3)

        let on: boolean
        if (isCorner) on = inCornerRing || inCornerCenter
        else {
          const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
          on = h - Math.floor(h) > 0.52
        }
        if (on) {
          grid.push({ x, y, ang: Math.random() * Math.PI * 2, dist: 300 + Math.random() * 400, delay: Math.random() })
        }
      }
    }
    return { N, grid }
  }, [])
}

function QRAssembly({ p, scanP }: { p: number; scanP: number }) {
  const { N, grid } = useQRPattern()
  const cell = 16
  const size = N * cell
  const shrink = 1 - scanP * 0.85
  const translateY = -scanP * 80

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${shrink})`,
        width: size,
        height: size,
        transition: 'transform .3s cubic-bezier(.2,.7,.3,1)',
        zIndex: 10,
      }}
    >
      {[
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ].map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 28,
            height: 28,
            [y ? 'bottom' : 'top']: -12,
            [x ? 'right' : 'left']: -12,
            borderTop: !y ? `3px solid ${BRAND.orange}` : 'none',
            borderBottom: y ? `3px solid ${BRAND.orange}` : 'none',
            borderLeft: !x ? `3px solid ${BRAND.orange}` : 'none',
            borderRight: x ? `3px solid ${BRAND.orange}` : 'none',
            opacity: Math.min(1, p * 2),
            transition: 'opacity .3s',
          }}
        />
      ))}

      {grid.map((d, i) => {
        const start = d.delay * 0.7
        const t = Math.max(0, Math.min(1, (p - start) / 0.3))
        const ease = 1 - Math.pow(1 - t, 3)
        const dx = (1 - ease) * Math.cos(d.ang) * d.dist
        const dy = (1 - ease) * Math.sin(d.ang) * d.dist
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x * cell,
              top: d.y * cell,
              width: cell - 2,
              height: cell - 2,
              background: BRAND.charcoal,
              transform: `translate(${dx}px, ${dy}px) rotate(${(1 - ease) * 180}deg)`,
              opacity: ease,
              borderRadius: 2,
            }}
          />
        )
      })}
    </div>
  )
}

function ScanBeam({ p }: { p: number }) {
  if (p <= 0 || p >= 1) return null
  const y = p * 100
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 400,
        pointerEvents: 'none',
        zIndex: 15,
        borderRadius: 4,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${y}%`,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${BRAND.orange}, transparent)`,
          boxShadow: `0 0 20px ${BRAND.orange}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% ${y}%, rgba(255,107,0,0.15), transparent 60%)`,
        }}
      />
    </div>
  )
}

function ReceiptUnroll({ p }: { p: number }) {
  if (p <= 0) return null
  const maxH = 560
  const h = p * maxH
  const lines = [
    '================================',
    '        quelessly.               ',
    '    SHAN DA STALL · FC RD        ',
    '================================',
    '',
    '2 ×  Samosa .............. ₹50  ',
    '1 ×  Masala Chai ......... ₹15  ',
    '1 ×  Vada Pav ............ ₹30  ',
    '--------------------------------',
    'SUBTOTAL ................. ₹95  ',
    'FEE ..................... FREE  ',
    '================================',
    '** TOTAL ............... ₹95 ** ',
    '================================',
    'PAID · UPI · #Q-4721             ',
    '',
    '   THANK YOU   COME AGAIN        ',
    '   ★★★★★                        ',
  ]
  const linesVisible = Math.floor(p * lines.length * 1.1)

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 50,
        transform: 'translateX(-50%)',
        width: 340,
        zIndex: 12,
        filter: 'drop-shadow(0 20px 30px rgba(31,26,23,0.15))',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 360,
          height: 28,
          background: BRAND.charcoal,
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 200, height: 3, background: '#000', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: 10, fontFamily: FONT_MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
          PRINTING
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          height: h,
          overflow: 'hidden',
          padding: h > 16 ? '16px 20px' : 0,
          fontFamily: FONT_MONO,
          fontSize: 12,
          lineHeight: 1.7,
          whiteSpace: 'pre',
          transition: 'height .05s, padding .05s',
          position: 'relative',
        }}
      >
        {lines.slice(0, linesVisible).map((line, i) => {
          const isTotal = line.includes('TOTAL')
          const isPaid = line.includes('PAID')
          const isTitle = i === 1
          return (
            <div
              key={i}
              style={{
                color: isTotal ? BRAND.orange : isPaid ? '#10b981' : BRAND.charcoal,
                fontWeight: isTotal || isTitle ? 800 : 400,
                fontSize: isTitle ? 16 : 12,
                fontFamily: isTitle ? FONT_SERIF : FONT_MONO,
                fontStyle: isTitle ? 'italic' : 'normal',
                textAlign: isTitle ? 'center' : 'left',
                animation: 'qless-receipt-line .2s both',
              }}
            >
              {line || ' '}
            </div>
          )
        })}
        {p < 1 && linesVisible < lines.length && (
          <span style={{ display: 'inline-block', width: 8, height: 14, background: BRAND.charcoal, animation: 'qless-blink 1s infinite' }} />
        )}
      </div>

      {h > 20 && (
        <div
          style={{
            height: 10,
            background: 'radial-gradient(circle at 8px 10px, transparent 5px, #fff 5.5px) 0 0 / 16px 12px',
          }}
        />
      )}
    </div>
  )
}

function FoodAssembly({ p }: { p: number }) {
  if (p <= 0) return null

  const plate = Math.min(1, p / 0.2)
  const samosa = Math.max(0, Math.min(1, (p - 0.2) / 0.25))
  const chutney = Math.max(0, Math.min(1, (p - 0.4) / 0.2))
  const chai = Math.max(0, Math.min(1, (p - 0.55) / 0.25))
  const steam = Math.max(0, Math.min(1, (p - 0.75) / 0.25))

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 520,
        height: 360,
        zIndex: 14,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute', left: '50%', bottom: 60, transform: `translateX(-50%) scale(${plate})`,
          width: 360, height: 60, background: BRAND.cream2, borderRadius: '50%',
          border: `2px solid ${BRAND.border}`, boxShadow: 'inset 0 -8px 0 rgba(0,0,0,0.05)',
          transition: 'transform .2s',
        }}
      />
      <div
        style={{
          position: 'absolute', left: '50%', bottom: 66, transform: `translateX(-50%) scale(${plate})`,
          width: 320, height: 40, background: '#fff', borderRadius: '50%', transition: 'transform .2s',
        }}
      />

      {[0, 1, 2].map((i) => {
        const baseDelay = i * 0.12
        const t = Math.max(0, Math.min(1, (samosa - baseDelay) / 0.5))
        const ease = 1 - Math.pow(1 - t, 3)
        const drop = (1 - ease) * -300
        const rot = (1 - ease) * (i % 2 ? 240 : -180)
        const xs = [-70, 0, 70]
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: '50%', bottom: 90 + (i === 1 ? 4 : 0),
              transform: `translate(calc(-50% + ${xs[i]}px), ${drop}px) rotate(${rot}deg)`,
              opacity: ease,
            }}
          >
            <Samosa size={80} />
          </div>
        )
      })}

      {([[-120, 40], [130, 50], [-40, 20], [50, 30]] as [number, number][]).map(([x, y], i) => {
        const t = Math.max(0, Math.min(1, (chutney - i * 0.1) / 0.4))
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: '50%', bottom: 90 + y, marginLeft: x,
              width: 18 * t, height: 10 * t,
              background: i % 2 ? '#C43B1A' : '#2E5D3A',
              borderRadius: '50%',
              transform: `translate(-50%, 0) scale(${t})`,
              filter: 'blur(0.5px)',
            }}
          />
        )
      })}

      <div
        style={{
          position: 'absolute', right: 60, bottom: 80,
          transform: `translateY(${(1 - chai) * -280}px) rotate(${(1 - chai) * -180}deg)`,
          opacity: chai,
        }}
      >
        <ChaiCup size={100} />
      </div>

      {steam > 0 && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute', right: 70 + i * 6, bottom: 180,
                width: 14 - i * 1.5, height: 14 - i * 1.5,
                background: 'rgba(255,255,255,0.85)',
                borderRadius: '50%', filter: 'blur(4px)',
                opacity: steam * (1 - i * 0.15),
                animation: `qless-steam-${i} ${2 + i * 0.3}s ease-in-out infinite`,
              }}
            />
          ))}
        </>
      )}

      <div
        style={{
          position: 'absolute', left: -20, top: -10, transform: `rotate(-8deg) scale(${plate})`,
          fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: BRAND.muted,
          background: '#fff', padding: '4px 10px', border: `1.5px dashed ${BRAND.border}`,
          opacity: plate,
        }}
      >
        #Q-4721 · READY IN 94s
      </div>
    </div>
  )
}

function ReadyStamp({ p }: { p: number }) {
  if (p <= 0) return null
  const t = p
  const scale = t < 0.5 ? 2 - t * 2 : 1 + (0.5 - t) * 0.3
  const rot = -10 + t * 4

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
        opacity: Math.min(1, t * 3),
        zIndex: 22,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          border: `4px solid ${BRAND.orange}`,
          color: BRAND.orange,
          padding: '18px 30px',
          fontFamily: FONT_SERIF,
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: 54,
          letterSpacing: -1,
          lineHeight: 1,
          background: 'rgba(249,246,241,0.7)',
          backdropFilter: 'blur(4px)',
        }}
      >
        READY · #Q-4721
      </div>
      <div
        style={{
          textAlign: 'center', marginTop: 10,
          fontFamily: FONT_MONO, letterSpacing: 3, color: BRAND.orange, fontSize: 12, fontWeight: 800,
        }}
      >
        ● WALK UP TO COUNTER 3
      </div>
    </div>
  )
}

// Re-export ref helper type (unused export removed)
export type { RefObject }
