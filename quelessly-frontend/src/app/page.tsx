'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Footer from '@/components/Footer'

export default function HomePage() {
  const router = useRouter()
  const [vendorId, setVendorId] = useState('')
  const [showInput, setShowInput] = useState(false)

  const goToMenu = () => {
    if (vendorId.trim()) router.push(`/v/${vendorId}`)
  }

  const goToDashboard = () => router.push('/dashboard')

  return (
    <>
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-5 gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-5">
          <div className="w-24 h-24 bg-lime-400 rounded-4xl flex items-center justify-center glow-lime">
            <span className="text-black font-black text-5xl font-display">Q</span>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-display font-black text-white tracking-tighter leading-tight">
              quelessly.
            </h1>
            <p className="text-zinc-500 text-base mt-2">QR-based food ordering</p>
          </div>
        </div>

        {/* CTA Grid */}
        <div className="w-full max-w-md space-y-3">
          {/* Student path */}
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-full glass rounded-3xl px-6 py-6 text-left transition-all duration-300 active:scale-[0.98] hover:border-lime-400/40"
          >
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-1">Student</p>
            <p className="text-white font-display font-bold tracking-tighter text-xl">Order Food</p>
            <p className="text-zinc-600 text-xs mt-2">Scan QR or enter vendor ID</p>
          </button>

          {showInput && (
            <div className="glass rounded-3xl p-4 space-y-3 animate-slide-up">
              <input
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="Vendor ID or scan QR"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && goToMenu()}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
              />
              <button
                onClick={goToMenu}
                disabled={!vendorId.trim()}
                className="w-full bg-lime-400 text-black rounded-2xl py-3 font-bold disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                View Menu →
              </button>
            </div>
          )}

          {/* Vendor path */}
          <button
            onClick={goToDashboard}
            className="w-full glass rounded-3xl px-6 py-6 text-left transition-all duration-300 active:scale-[0.98] hover:border-lime-400/40"
          >
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-1">Vendor</p>
            <p className="text-white font-display font-bold tracking-tighter text-xl">Dashboard</p>
            <p className="text-zinc-600 text-xs mt-2">Manage orders & menu</p>
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}