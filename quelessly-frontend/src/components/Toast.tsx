'use client'
import { useCallback, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800)
  }, [])

  return { toasts, toast }
}

const CONFIG: Record<ToastType, { border: string; icon: string; iconBg: string }> = {
  success: { border: 'border-lime-400/40',  icon: '✓', iconBg: 'bg-lime-400 text-black' },
  error:   { border: 'border-rose-500/40',  icon: '✕', iconBg: 'bg-rose-500 text-white' },
  warning: { border: 'border-amber-400/40', icon: '!', iconBg: 'bg-amber-400 text-black' },
  info:    { border: 'border-zinc-600',     icon: 'i', iconBg: 'bg-zinc-600 text-white'  },
}

export function Toaster({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-5 right-4 z-999 flex flex-col gap-2 pointer-events-none max-w-xs w-full">
      {toasts.map((t) => {
        const c = CONFIG[t.type]
        return (
          <div
            key={t.id}
            className={`glass ${c.border} rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-in-right`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${c.iconBg}`}>
              {c.icon}
            </span>
            <span className="text-sm font-medium text-zinc-100 leading-snug">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
