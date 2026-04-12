'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#09090b',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😕</p>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>
        Something went wrong
      </h1>
      <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Please try again or come back later
      </p>
      <button
        onClick={reset}
        style={{
          background: '#84cc16',
          color: '#09090b',
          border: 'none',
          borderRadius: '8px',
          padding: '0.625rem 1.25rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Try again
      </button>
    </div>
  )
}