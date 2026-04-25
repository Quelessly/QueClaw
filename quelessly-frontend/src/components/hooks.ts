'use client'

import { useEffect, useRef, useState } from 'react'

export function useLocalStorage<T>(key: string, init: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [v, setV] = useState<T>(init)
  // hydrate after mount to avoid SSR/CSR mismatch
  useEffect(() => {
    try {
      const x = localStorage.getItem(key)
      if (x !== null) setV(JSON.parse(x) as T)
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* noop */
    }
  }, [key, v])
  return [v, setV]
}

export function useHaptic() {
  return (el: HTMLElement | EventTarget | null) => {
    if (!el || !(el as HTMLElement).animate) return
    ;(el as HTMLElement).animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.92)' }, { transform: 'scale(1)' }],
      { duration: 180, easing: 'cubic-bezier(.3,.7,.4,1)' },
    )
  }
}

export function useInterval(fn: () => void, ms: number | null) {
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  }, [fn])
  useEffect(() => {
    if (!ms) return
    const t = setInterval(() => fnRef.current(), ms)
    return () => clearInterval(t)
  }, [ms])
}

export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useInterval(() => setNow(Date.now()), ms)
  return now
}
