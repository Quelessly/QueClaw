'use client'

import { useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`

interface Vendor { id: string; name: string; email: string; upi_id: string | null }
interface SettlementRow {
  vendor: Vendor; totalOrders: number; grossAmount: number; settled: boolean
  settlementId: string | null; pendingAfterSettlement: number; pendingAmountAfterSettlement: number
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
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/admin/settlements?adminSecret=${encodeURIComponent(secret)}&date=${d}`).then(r => r.json())
      if (res.success) { setData(res.data); setAuthed(true) }
      else setError(res.message || 'Failed to load')
    } catch { setError('Could not reach server') }
    finally { setLoading(false) }
  }

  const handleAuth = async (e: React.FormEvent) => { e.preventDefault(); await fetchSettlements(adminSecret, date) }
  const handleDateChange = (newDate: string) => { setDate(newDate); if (authed) fetchSettlements(adminSecret, newDate) }

  const handleMarkSettled = async (item: SettlementRow) => {
    const amountToSettle = item.settled ? item.pendingAmountAfterSettlement : item.grossAmount
    const ordersToSettle = item.settled ? item.pendingAfterSettlement : item.totalOrders
    if (!confirm(`Mark ${item.vendor.name} as settled for Rs.${amountToSettle}?`)) return
    setSettling(item.vendor.id)
    try {
      const res = await fetch(`${API}/admin/settlements/mark-settled`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, vendorId: item.vendor.id, date, grossAmount: amountToSettle, totalOrders: ordersToSettle }),
      }).then(r => r.json())
      if (res.success) await fetchSettlements(adminSecret, date)
      else alert(res.message || 'Failed to mark settled')
    } catch { alert('Could not reach server') }
    finally { setSettling(null) }
  }

  const handleSaveUpi = async (vendorId: string) => {
    setSavingUpi(true)
    try {
      const res = await fetch(`${API}/admin/vendors/${vendorId}/upi`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, upiId: upiValue }),
      }).then(r => r.json())
      if (res.success) {
        setData(prev => prev.map(s => s.vendor.id === vendorId ? { ...s, vendor: { ...s.vendor, upi_id: upiValue } } : s))
        setEditingUpi(null)
      } else alert(res.message || 'Failed to save UPI')
    } catch { alert('Could not reach server') }
    finally { setSavingUpi(false) }
  }

  const totalUnsettled =
    data.filter(s => !s.settled).reduce((sum, s) => sum + s.grossAmount, 0) +
    data.filter(s => s.settled).reduce((sum, s) => sum + s.pendingAmountAfterSettlement, 0)
  const totalSettled = data.filter(s => s.settled).reduce((sum, s) => sum + s.grossAmount, 0)

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 12,
    padding: '10px 16px', fontSize: 14, color: '#fff', outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 600, color: '#52525b',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'DM Mono', monospace",
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#ff6b00', borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Settlements</h1>
          <p style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Admin access required</p>
        </div>
        <form onSubmit={handleAuth} style={{ background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Admin Secret</label>
            <input type="password" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} required placeholder="••••••••" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
              onBlur={e => e.target.style.borderColor = '#27272a'} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
              onBlur={e => e.target.style.borderColor = '#27272a'} />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 12, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '8px 12px' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
            {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Loading…</> : 'View Settlements'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #18181b', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 2px' }}>settlements.</h1>
          <p style={{ color: '#52525b', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{date}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="date" value={date} onChange={e => handleDateChange(e.target.value)}
            style={{ background: '#111', border: '1px solid #27272a', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: '#fff', outline: 'none', fontFamily: "'DM Mono', monospace" }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
            onBlur={e => e.target.style.borderColor = '#27272a'} />
          <Link href="/admin"
            style={{ color: '#52525b', fontSize: 12, border: '1px solid #27272a', padding: '6px 14px', borderRadius: 20, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#a1a1aa'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#52525b'}>
            Back
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 16, padding: 16 }}>
            <p style={{ fontSize: 10, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>To Pay</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: "'DM Mono', monospace", margin: '0 0 4px' }}>₹{totalUnsettled}</p>
            <p style={{ fontSize: 11, color: '#3f3f46', fontFamily: "'DM Sans', sans-serif" }}>
              {data.filter(s => !s.settled && s.grossAmount > 0).length + data.filter(s => s.settled && s.pendingAmountAfterSettlement > 0).length} vendors
            </p>
          </div>
          <div style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 16, padding: 16 }}>
            <p style={{ fontSize: 10, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>Settled</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#ff6b00', fontFamily: "'DM Mono', monospace", margin: '0 0 4px' }}>₹{totalSettled}</p>
            <p style={{ fontSize: 11, color: '#3f3f46', fontFamily: "'DM Sans', sans-serif" }}>{data.filter(s => s.settled).length} vendors</p>
          </div>
        </div>

        {/* Vendor rows */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 16, height: 112 }} />)}
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#3f3f46', fontFamily: "'DM Sans', sans-serif" }}>No vendors found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map(item => {
              const hasPendingAfter = item.settled && item.pendingAmountAfterSettlement > 0
              const borderColor = hasPendingAfter ? 'rgba(245,158,11,0.4)' : item.settled ? 'rgba(255,107,0,0.15)' : '#1c1c1c'
              const cardOpacity = item.settled && !hasPendingAfter ? 0.55 : 1

              return (
                <div key={item.vendor.id} style={{ background: '#0d0d0d', border: `1px solid ${borderColor}`, borderRadius: 16, padding: 20, opacity: cardOpacity, transition: 'all 0.2s' }}>

                  {/* Vendor header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: 15, fontFamily: "'DM Sans', sans-serif", margin: '0 0 2px' }}>{item.vendor.name}</p>
                      <p style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{item.vendor.email}</p>
                    </div>
                    {item.settled && !hasPendingAfter && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,107,0,0.1)', color: '#ff6b00', border: '1px solid rgba(255,107,0,0.2)', padding: '4px 10px', borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>Settled</span>
                    )}
                    {hasPendingAfter && (
                      <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>Partially settled</span>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Orders', value: String(item.totalOrders) },
                      { label: 'Amount', value: `₹${item.grossAmount}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: '#18181b', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: "'DM Mono', monospace", margin: '0 0 2px' }}>{value}</p>
                        <p style={{ color: '#52525b', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{label}</p>
                      </div>
                    ))}
                    <div style={{ background: '#18181b', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      {editingUpi === item.vendor.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input autoFocus value={upiValue} onChange={e => setUpiValue(e.target.value)} placeholder="upi@bank"
                            style={{ background: '#27272a', border: '1px solid rgba(255,107,0,0.5)', borderRadius: 6, padding: '2px 6px', fontSize: 11, color: '#fff', outline: 'none', flex: 1, fontFamily: "'DM Mono', monospace" }}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveUpi(item.vendor.id); if (e.key === 'Escape') setEditingUpi(null) }} />
                          <button onClick={() => handleSaveUpi(item.vendor.id)} disabled={savingUpi}
                            style={{ color: '#ff6b00', fontSize: 11, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>
                            {savingUpi ? '…' : 'OK'}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingUpi(item.vendor.id); setUpiValue(item.vendor.upi_id ?? '') }} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <p style={{ color: item.vendor.upi_id ? '#fff' : '#52525b', fontFamily: "'DM Mono', monospace", fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>
                            {item.vendor.upi_id ?? 'No UPI'}
                          </p>
                          <p style={{ color: '#52525b', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>UPI</p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pending warning */}
                  {hasPendingAfter && (
                    <div style={{ marginBottom: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                      <p style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", margin: '0 0 2px' }}>
                        {item.pendingAfterSettlement} new order{item.pendingAfterSettlement > 1 ? 's' : ''} after settlement
                      </p>
                      <p style={{ color: 'rgba(251,191,36,0.6)', fontSize: 12, fontFamily: "'DM Mono', monospace", margin: 0 }}>
                        ₹{item.pendingAmountAfterSettlement} not yet paid
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {((!item.settled && item.grossAmount > 0) || hasPendingAfter) && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {item.vendor.upi_id && (
                        <a href={`upi://pay?pa=${item.vendor.upi_id}&pn=${encodeURIComponent(item.vendor.name)}&am=${hasPendingAfter ? item.pendingAmountAfterSettlement : item.grossAmount}&cu=INR`}
                          style={{ flex: 1, background: '#18181b', color: '#fff', borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1px solid #27272a' }}>
                          Open GPay
                        </a>
                      )}
                      <button onClick={() => handleMarkSettled(item)} disabled={settling === item.vendor.id}
                        style={{ flex: 1, background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", opacity: settling === item.vendor.id ? 0.6 : 1 }}>
                        {settling === item.vendor.id
                          ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Saving…</>
                          : hasPendingAfter ? `Settle ₹${item.pendingAmountAfterSettlement}` : 'Mark Settled'}
                      </button>
                    </div>
                  )}

                  {!item.settled && item.grossAmount === 0 && (
                    <p style={{ color: '#3f3f46', fontSize: 12, textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>No completed orders today</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}