'use client'

import { useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL

interface Vendor {
  id: string
  name: string
  email: string
  upi_id: string | null
}

interface SettlementRow {
  vendor: Vendor
  totalOrders: number
  grossAmount: number
  settled: boolean
  settlementId: string | null
}

export default function SettlementsPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [adminSecret, setAdminSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<SettlementRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settling, setSettling] = useState<string | null>(null)
  const [editingUpi, setEditingUpi] = useState<string | null>(null)
  const [upiValue, setUpiValue] = useState('')
  const [savingUpi, setSavingUpi] = useState(false)

  const fetchSettlements = async (secret: string, d: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `${API}/admin/settlements?adminSecret=${encodeURIComponent(secret)}&date=${d}`
      ).then(r => r.json())
      if (res.success) {
        setData(res.data)
        setAuthed(true)
      } else {
        setError(res.message || 'Failed to load')
      }
    } catch {
      setError('Could not reach server')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchSettlements(adminSecret, date)
  }

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    if (authed) fetchSettlements(adminSecret, newDate)
  }

  const handleMarkSettled = async (item: SettlementRow) => {
    if (!confirm(`Mark ${item.vendor.name} as settled for Rs.${item.grossAmount}?`)) return
    setSettling(item.vendor.id)
    try {
      const res = await fetch(`${API}/admin/settlements/mark-settled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret,
          vendorId: item.vendor.id,
          date,
          grossAmount: item.grossAmount,
          totalOrders: item.totalOrders,
        }),
      }).then(r => r.json())
      if (res.success) {
        setData(prev => prev.map(s =>
          s.vendor.id === item.vendor.id ? { ...s, settled: true } : s
        ))
      } else {
        alert(res.message || 'Failed to mark settled')
      }
    } catch {
      alert('Could not reach server')
    } finally {
      setSettling(null)
    }
  }

  const handleSaveUpi = async (vendorId: string) => {
    setSavingUpi(true)
    try {
      const res = await fetch(`${API}/admin/vendors/${vendorId}/upi`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, upiId: upiValue }),
      }).then(r => r.json())
      if (res.success) {
        setData(prev => prev.map(s =>
          s.vendor.id === vendorId
            ? { ...s, vendor: { ...s.vendor, upi_id: upiValue } }
            : s
        ))
        setEditingUpi(null)
      } else {
        alert(res.message || 'Failed to save UPI')
      }
    } catch {
      alert('Could not reach server')
    } finally {
      setSavingUpi(false)
    }
  }

  const totalUnsettled = data
    .filter(s => !s.settled)
    .reduce((sum, s) => sum + s.grossAmount, 0)

  const totalSettled = data
    .filter(s => s.settled)
    .reduce((sum, s) => sum + s.grossAmount, 0)

  if (!authed) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-lime-400 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-black font-black text-2xl">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tighter">Settlements</h1>
          <p className="text-zinc-600 text-xs mt-1">Admin access required</p>
        </div>
        <form onSubmit={handleAuth} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
              Admin Secret
            </label>
            <input
              type="password"
              value={adminSecret}
              onChange={e => setAdminSecret(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-lime-400/50 transition-colors"
            />
          </div>
          {error && (
            <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Loading...</>
              : 'View Settlements'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-lg border-b border-zinc-900 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-white tracking-tighter text-lg">settlements.</h1>
          <p className="text-zinc-600 text-xs mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={e => handleDateChange(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-lime-400/50 transition-colors"
          />
          <Link href="/admin" className="text-zinc-600 text-xs border border-zinc-800 px-3 py-1.5 rounded-full hover:text-zinc-300 transition-colors">
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">To Pay</p>
            <p className="text-2xl font-black text-white font-mono">Rs.{totalUnsettled}</p>
            <p className="text-xs text-zinc-600 mt-1">
              {data.filter(s => !s.settled && s.grossAmount > 0).length} vendors
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Settled</p>
            <p className="text-2xl font-black text-lime-400 font-mono">Rs.{totalSettled}</p>
            <p className="text-xs text-zinc-600 mt-1">
              {data.filter(s => s.settled).length} vendors
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">No vendors found</div>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.vendor.id}
                className={`bg-zinc-900 border rounded-2xl p-5 transition-all ${item.settled ? 'border-lime-400/20 opacity-60' : 'border-zinc-800'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-white">{item.vendor.name}</p>
                    <p className="text-zinc-500 text-xs font-mono mt-0.5">{item.vendor.email}</p>
                  </div>
                  {item.settled && (
                    <span className="text-xs font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20 px-2.5 py-1 rounded-full">
                      Settled
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-zinc-800 rounded-xl p-2.5 text-center">
                    <p className="text-white font-bold text-lg">{item.totalOrders}</p>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Orders</p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-2.5 text-center">
                    <p className="text-white font-bold text-lg font-mono">Rs.{item.grossAmount}</p>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Amount</p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-2.5 text-center">
                    {editingUpi === item.vendor.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={upiValue}
                          onChange={e => setUpiValue(e.target.value)}
                          placeholder="upi@bank"
                          className="bg-zinc-700 border border-lime-400/50 rounded-lg px-2 py-0.5 text-xs text-white outline-none w-full"
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveUpi(item.vendor.id)
                            if (e.key === 'Escape') setEditingUpi(null)
                          }}
                        />
                        <button
                          onClick={() => handleSaveUpi(item.vendor.id)}
                          disabled={savingUpi}
                          className="text-lime-400 text-xs font-bold"
                        >
                          {savingUpi ? '...' : 'OK'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUpi(item.vendor.id)
                          setUpiValue(item.vendor.upi_id ?? '')
                        }}
                        className="w-full"
                      >
                        <p className="text-white font-mono text-xs truncate">
                          {item.vendor.upi_id ? item.vendor.upi_id : 'No UPI'}
                        </p>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest">UPI</p>
                      </button>
                    )}
                  </div>
                </div>

                {!item.settled && item.grossAmount > 0 && (
                  <div className="flex gap-2">
                    {item.vendor.upi_id ? (
                      <a
                        href={`upi://pay?pa=${item.vendor.upi_id}&pn=${encodeURIComponent(item.vendor.name)}&am=${item.grossAmount}&cu=INR`}
                        className="flex-1 bg-zinc-800 text-white py-2.5 rounded-xl font-bold text-sm text-center hover:bg-zinc-700 transition-colors"
                      >
                        Open GPay
                      </a>
                    ) : null}
                    <button
                      onClick={() => handleMarkSettled(item)}
                      disabled={settling === item.vendor.id}
                      className="flex-1 bg-lime-400 text-black py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {settling === item.vendor.id
                        ? <><span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
                        : 'Mark Settled'}
                    </button>
                  </div>
                )}

                {!item.settled && item.grossAmount === 0 && (
                  <p className="text-zinc-700 text-xs text-center">No completed orders today</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
