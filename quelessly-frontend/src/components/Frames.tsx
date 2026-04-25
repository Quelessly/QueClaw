'use client'

import { type ReactNode } from 'react'
import { BRAND, FONT_MONO } from './brand'
import Landing from './Landing'
import type { Aesthetic } from './brand'

// ────────── Phone (iPhone-ish) ──────────
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 360,
        height: 740,
        background: BRAND.charcoal,
        borderRadius: 46,
        padding: 10,
        boxShadow:
          '0 30px 60px -20px rgba(31,26,23,0.4), inset 0 0 0 2px rgba(255,255,255,0.08)',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 36,
          overflow: 'hidden',
          background: BRAND.cream,
          position: 'relative',
        }}
      >
        {/* status bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 60,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 22px',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: FONT_MONO,
            color: '#fff',
            mixBlendMode: 'difference',
            pointerEvents: 'none',
          }}
        >
          <span>9:41</span>
          <span>●</span>
          <span>•• 5G 100</span>
        </div>
        {/* dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 100,
            height: 28,
            background: '#000',
            borderRadius: 16,
            zIndex: 70,
          }}
        />
        {children}
      </div>
    </div>
  )
}

// ────────── Tablet (kitchen counter) ──────────
export function TabletFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 1100,
        height: 720,
        background: BRAND.charcoal,
        borderRadius: 18,
        padding: 14,
        boxShadow: '0 40px 80px -30px rgba(31,26,23,0.5)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
          overflow: 'hidden',
          background: BRAND.cream,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ────────── Landing (browser window) ──────────
export function LandingFrame({ aesthetic }: { aesthetic: Aesthetic }) {
  return (
    <div
      style={{
        width: 1400,
        height: 900,
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.15)',
        border: `1px solid ${BRAND.border}`,
      }}
    >
      {/* browser chrome */}
      <div
        style={{
          height: 36,
          background: '#EDE7DB',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 14px',
          borderBottom: `1px solid ${BRAND.border}`,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
        </div>
        <div
          style={{
            margin: '0 auto',
            background: '#fff',
            padding: '3px 14px',
            borderRadius: 6,
            fontSize: 11,
            fontFamily: FONT_MONO,
            color: BRAND.muted,
            border: `1px solid ${BRAND.border}`,
          }}
        >
          🔒 quelessly.com
        </div>
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 36px)' }}>
        <Landing aesthetic={aesthetic} />
      </div>
    </div>
  )
}
