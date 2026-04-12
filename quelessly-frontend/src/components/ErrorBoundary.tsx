'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
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
            Please refresh the page or try again
          </p>
          <button
            onClick={() => window.location.reload()}
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
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}