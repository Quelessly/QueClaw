// Brand tokens, type-only.
// All values used by inline styles across the Quelessly canvas.

export const BRAND = {
  cream: '#F9F6F1',
  cream2: '#F1EBE0',
  charcoal: '#1F1A17',
  teal: '#0F3A3E',
  tealDark: '#0A2A2D',
  orange: '#FF6B00',
  orangeHover: '#E85D00',
  orangeDim: 'rgba(255,107,0,0.08)',
  orangeBorder: 'rgba(255,107,0,0.35)',
  muted: '#7A6F64',
  border: '#E4DED3',
  border2: '#EDE7DB',
  green: '#10b981',
  red: '#ef4444',
} as const

export type Aesthetic = 'editorial' | 'playful' | 'tech'

export type View = 'canvas' | 'landing' | 'customer' | 'kitchen'

export const FONT_SERIF = "var(--font-fraunces), 'Fraunces', serif"
export const FONT_SANS = "var(--font-dm-sans), 'DM Sans', sans-serif"
export const FONT_MONO = "var(--font-dm-mono), 'DM Mono', monospace"
