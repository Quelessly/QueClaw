'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { BRAND, FONT_SERIF, FONT_MONO, type Aesthetic, type View } from './brand'
import { useLocalStorage } from './hooks'
import Landing from './Landing'
import CustomerFlow from './CustomerFlow'
import KitchenDashboard from './KitchenDashboard'
import { PhoneFrame, TabletFrame, LandingFrame } from './Frames'

// ─────────────────────────────────────────────────────────
// Top-level Canvas / app shell
// ─────────────────────────────────────────────────────────

interface Tweaks {
  aesthetic: Aesthetic
  accent: string
}

const DEFAULT_TWEAKS: Tweaks = {
  aesthetic: 'editorial',
  accent: '#FF6B00',
}

export default function QuelesslyCanvas() {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS)
  const [editMode, setEditMode] = useState(false)
  const [view, setView] = useLocalStorage<View>('qless-view', 'canvas')

  // Edit-mode protocol
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true)
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false)
    }
    window.addEventListener('message', onMsg)
    window.parent.postMessage({ type: '__edit_mode_available' }, '*')
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setTweaks((t) => ({ ...t, [k]: v }))
    window.parent.postMessage(
      { type: '__edit_mode_set_keys', edits: { [k]: v } },
      '*',
    )
  }

  const accent = tweaks.accent || BRAND.orange
  // best-effort global accent override
  useEffect(() => {
    document.documentElement.style.setProperty('--qless-accent', accent)
  }, [accent])

  return (
    <div style={{ minHeight: '100vh', background: BRAND.cream, position: 'relative' }}>
      <TopNav view={view} setView={setView} />

      {view === 'canvas' && <CanvasView aesthetic={tweaks.aesthetic} setView={setView} />}
      {view === 'landing' && (
        <FullView title="Landing · 1440×900 window" onBack={() => setView('canvas')}>
          <LandingFrame aesthetic={tweaks.aesthetic} />
        </FullView>
      )}
      {view === 'customer' && (
        <FullView title="Customer flow · iPhone 14 Pro" onBack={() => setView('canvas')}>
          <PhoneFrame>
            <CustomerFlow aesthetic={tweaks.aesthetic} />
          </PhoneFrame>
        </FullView>
      )}
      {view === 'kitchen' && (
        <FullView title="Kitchen counter · Tablet / TV board" onBack={() => setView('canvas')}>
          <TabletFrame>
            <KitchenDashboard aesthetic={tweaks.aesthetic} />
          </TabletFrame>
        </FullView>
      )}

      {editMode && <TweakPanel tweaks={tweaks} setTweak={setTweak} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Top nav
// ─────────────────────────────────────────────────────────

function TopNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const tabs: [View, string][] = [
    ['canvas', '◷ Canvas'],
    ['landing', '01 · Landing'],
    ['customer', '02 · Customer'],
    ['kitchen', '03 · Kitchen'],
  ]
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(31,26,23,0.95)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: 18,
        }}
      >
        quelessly<span style={{ color: BRAND.orange }}>.</span>
      </div>
      <div
        style={{
          fontSize: 10,
          fontFamily: FONT_MONO,
          letterSpacing: 1.5,
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        HI-FI CONCEPTS · SIDE-BY-SIDE · INTERACTIVE
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          gap: 3,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 8,
          padding: 3,
        }}
      >
        {tabs.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              background: view === v ? BRAND.orange : 'transparent',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: FONT_MONO,
              letterSpacing: 0.5,
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
      <div
        style={{
          fontSize: 10,
          fontFamily: FONT_MONO,
          letterSpacing: 1,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span style={{ color: BRAND.green }}>●</span> TOGGLE TWEAKS ↗ TOP-RIGHT
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Canvas view (three concepts side-by-side)
// ─────────────────────────────────────────────────────────

function CanvasView({
  aesthetic,
  setView,
}: {
  aesthetic: Aesthetic
  setView: (v: View) => void
}) {
  return (
    <div style={{ padding: '40px 40px 80px' }}>
      {/* Intro */}
      <div style={{ maxWidth: 1400, margin: '0 auto 50px' }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: 2,
            color: BRAND.muted,
            fontWeight: 700,
          }}
        >
          ● CANVAS · THREE SURFACES · ONE PRODUCT
        </div>
        <h1
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: 'italic',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            margin: '10px 0 0',
            lineHeight: 1,
          }}
        >
          Quelessly, <span style={{ color: BRAND.orange }}>end to end.</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: BRAND.muted,
            marginTop: 14,
            maxWidth: 720,
            lineHeight: 1.6,
          }}
        >
          Each concept below is fully interactive. Click into any frame to go full-screen.
          Toggle Tweaks to change aesthetic direction. The interactions below use reciprocity,
          scarcity, social proof, goal-gradient effect and variable reward to quietly keep
          people ordering.
        </p>
      </div>

      {/* Cards grid */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <ConceptCard
          n="01"
          t="Landing"
          sub="Editorial hero · receipt unrolls · live demo"
          psychology={[
            'receipt metaphor = tangibility',
            'live counter = social proof',
            'try-the-demo = zero-friction CTA',
          ]}
          onOpen={() => setView('landing')}
        >
          <LandingPreview aesthetic={aesthetic} />
        </ConceptCard>

        <ConceptCard
          n="02"
          t="Customer flow"
          sub="Scan → menu → cart → pay → ready"
          psychology={[
            'scarcity ("8 left")',
            'social proof ("12 ordering now")',
            'progress bar = goal gradient',
            'confetti reward',
          ]}
          accent
          onOpen={() => setView('customer')}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ transform: 'scale(0.65)', transformOrigin: 'top center' }}>
              <PhoneFrame>
                <CustomerFlow aesthetic={aesthetic} />
              </PhoneFrame>
            </div>
          </div>
        </ConceptCard>

        <ConceptCard
          n="03"
          t="Kitchen counter"
          sub="Big tiles · timers · SLA pulse · live flow"
          psychology={[
            '3m-readable type',
            'color-coded SLA urgency',
            'live stats = operator flow state',
          ]}
          onOpen={() => setView('kitchen')}
        >
          <div
            style={{
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: '200%',
              height: 520,
              overflow: 'hidden',
              borderRadius: 12,
              border: `1px solid ${BRAND.border}`,
            }}
          >
            <div style={{ width: 1100, height: 1040 }}>
              <KitchenDashboard aesthetic={aesthetic} />
            </div>
          </div>
        </ConceptCard>
      </div>

      {/* Psychology callout */}
      <div
        style={{
          maxWidth: 1400,
          margin: '70px auto 0',
          padding: '28px 32px',
          background: BRAND.teal,
          color: '#fff',
          borderRadius: 20,
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 30,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            ● PSYCHOLOGY LAYER
          </div>
          <h3
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 36,
              margin: '8px 0 0',
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            Quiet nudges,
            <br />
            <span style={{ color: BRAND.orange }}>loud results.</span>
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {(
            [
              ['Scarcity', '"Only 8 left" badge on low-stock items creates urgency without being pushy.'],
              ['Social proof', '"12 people ordering now" ticker in the menu; "2,847 orders today" in the nav.'],
              ['Goal gradient', 'Progress circles (pay, prep) visibly close — people finish what they start seeing progress on.'],
              ['Variable reward', 'Random "you earned a stamp" moments + confetti on ready. Keeps dopamine pleasantly surprised.'],
              ['Reciprocity', 'Free loyalty stamp on first order, upsells framed as "often added with this".'],
              ['Zero-friction CTA', 'Landing has a working mini-order. Nothing commits; everything shows what\u2019s possible.'],
            ] as const
          ).map(([t, b], i) => (
            <div key={i} style={{ borderLeft: `2px solid ${BRAND.orange}`, paddingLeft: 12 }}>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: BRAND.orange,
                  fontWeight: 700,
                }}
              >
                {t.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {b}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConceptCard({
  n,
  t,
  sub,
  psychology,
  children,
  onOpen,
  accent,
}: {
  n: string
  t: string
  sub: string
  psychology: string[]
  children: ReactNode
  onOpen: () => void
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: BRAND.cream,
        border: `1px solid ${BRAND.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: accent
          ? '0 20px 40px -20px rgba(255,107,0,0.2)'
          : '0 10px 20px -10px rgba(31,26,23,0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: `1px dashed ${BRAND.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: accent ? BRAND.orange : BRAND.charcoal,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_MONO,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {n}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONT_SERIF,
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: -0.5,
            }}
          >
            {t}
          </div>
          <div
            style={{
              fontSize: 11,
              color: BRAND.muted,
              fontFamily: FONT_MONO,
              letterSpacing: 0.5,
            }}
          >
            {sub}
          </div>
        </div>
        <button
          onClick={onOpen}
          style={{
            background: BRAND.charcoal,
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT_MONO,
            letterSpacing: 1,
          }}
        >
          OPEN →
        </button>
      </div>
      {/* Preview */}
      <div
        style={{
          padding: 20,
          background: BRAND.cream2,
          minHeight: 520,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      {/* Psychology pills */}
      <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {psychology.map((p, i) => (
          <span
            key={i}
            style={{
              background: 'rgba(255,107,0,0.1)',
              color: BRAND.orange,
              border: '1px solid rgba(255,107,0,0.2)',
              padding: '3px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontFamily: FONT_MONO,
              letterSpacing: 0.5,
              fontWeight: 600,
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

function LandingPreview({ aesthetic }: { aesthetic: Aesthetic }) {
  return (
    <div
      style={{
        width: '100%',
        height: 520,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${BRAND.border}`,
        background: BRAND.cream,
        position: 'relative',
      }}
    >
      <div
        style={{
          transform: 'scale(0.48)',
          transformOrigin: 'top left',
          width: '208%',
          height: '208%',
        }}
      >
        <div style={{ width: 1200, height: 1083 }}>
          <Landing aesthetic={aesthetic} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Full view wrapper
// ─────────────────────────────────────────────────────────

function FullView({
  title,
  children,
  onBack,
}: {
  title: string
  children: ReactNode
  onBack: () => void
}) {
  return (
    <div style={{ padding: '30px 20px 60px' }}>
      <div
        style={{
          maxWidth: 1500,
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: BRAND.charcoal,
            color: '#fff',
            border: 'none',
            padding: '7px 14px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: FONT_MONO,
            letterSpacing: 1,
          }}
        >
          ← BACK TO CANVAS
        </button>
        <div
          style={{
            fontSize: 11,
            fontFamily: FONT_MONO,
            letterSpacing: 1.5,
            color: BRAND.muted,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          maxWidth: 1500,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Tweak Panel
// ─────────────────────────────────────────────────────────

function TweakPanel({
  tweaks,
  setTweak,
}: {
  tweaks: Tweaks
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 280,
        zIndex: 200,
        background: '#fff',
        border: `1px solid ${BRAND.border}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 20px 40px -10px rgba(31,26,23,0.2)',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: 2,
          color: BRAND.muted,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        ● TWEAKS
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: -0.5,
          marginBottom: 14,
        }}
      >
        Play with it.
      </div>

      {/* Aesthetic */}
      <div
        style={{
          fontSize: 11,
          fontFamily: FONT_MONO,
          letterSpacing: 1.2,
          color: BRAND.muted,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        AESTHETIC
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {(
          [
            ['editorial', '📰 Editorial (default)'],
            ['playful', '🎪 Playful (emoji + sticker)'],
            ['tech', '🖥  Tech (dark · mono)'],
          ] as [Aesthetic, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTweak('aesthetic', v)}
            style={{
              textAlign: 'left',
              background: tweaks.aesthetic === v ? BRAND.charcoal : BRAND.cream2,
              color: tweaks.aesthetic === v ? '#fff' : BRAND.charcoal,
              border: 'none',
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Accent */}
      <div
        style={{
          fontSize: 11,
          fontFamily: FONT_MONO,
          letterSpacing: 1.2,
          color: BRAND.muted,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        ACCENT COLOR
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['#FF6B00', '#E3355B', '#8C52FF', '#10b981', '#0F3A3E'].map((c) => (
          <button
            key={c}
            onClick={() => setTweak('accent', c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: c,
              border:
                tweaks.accent === c
                  ? `3px solid ${BRAND.charcoal}`
                  : '2px solid transparent',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 10,
          color: BRAND.muted,
          fontFamily: FONT_MONO,
          letterSpacing: 1,
          paddingTop: 10,
          borderTop: `1px dashed ${BRAND.border}`,
        }}
      >
        TIP · IN CUSTOMER FLOW, USE THE TOP-RIGHT STAGE SWITCHER
        <br />
        TIP · KITCHEN ORDERS LOAD AUTOMATICALLY
      </div>
    </div>
  )
}
