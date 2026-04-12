'use client'

import { useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`

export default function AdminPage() {
  const [step, setStep] = useState<'invite' | 'verify' | 'done'>('invite')
  const [adminSecret, setAdminSecret] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [upiId, setUpiId] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdVendor, setCreatedVendor] = useState<any>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/admin/invite-vendor`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, name, email, phone, upiId: upiId || undefined }),
      }).then(r => r.json())
      if (res.success) setStep('verify')
      else setError(res.message || 'Something went wrong')
    } catch { setError('Could not reach server') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/admin/verify-vendor`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, email, otp, password }),
      }).then(r => r.json())
      if (res.success) { setCreatedVendor(res.data); setStep('done') }
      else setError(res.message || 'Invalid OTP')
    } catch { setError('Could not reach server') }
    finally { setLoading(false) }
  }

  const reset = () => {
    setStep('invite'); setName(''); setEmail(''); setPhone(''); setUpiId('')
    setOtp(''); setPassword(''); setError(''); setCreatedVendor(null)
  }

  const stepIndex = step === 'invite' ? 0 : step === 'verify' ? 1 : 2

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 12,
    padding: '10px 16px', fontSize: 14, color: '#fff', outline: 'none',
    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 600, color: '#52525b',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6,
    fontFamily: "'DM Mono', monospace",
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#ff6b00', borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 24, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Admin Panel</h1>
          <p style={{ color: '#52525b', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Vendor onboarding</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {['Send OTP', 'Verify & Create', 'Done'].map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                background: i < stepIndex ? '#ff6b00' : i === stepIndex ? 'rgba(255,107,0,0.15)' : '#18181b',
                color: i < stepIndex ? '#fff' : i === stepIndex ? '#ff6b00' : '#52525b',
                border: i === stepIndex ? '1px solid rgba(255,107,0,0.4)' : 'none',
                transition: 'all 0.3s',
              }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: i === stepIndex ? '#a1a1aa' : '#3f3f46', fontFamily: "'DM Mono', monospace" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#0d0d0d', border: '1px solid #27272a', borderRadius: 20, padding: 24 }}>

          {step === 'invite' && (
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#52525b', letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>New Vendor Details</p>
              {[
                { label: 'Admin Secret', value: adminSecret, set: setAdminSecret, type: 'password', placeholder: '••••••••', required: true },
                { label: 'Vendor Name', value: name, set: setName, type: 'text', placeholder: 'The Canteen', required: true },
                { label: 'Vendor Email', value: email, set: setEmail, type: 'email', placeholder: 'vendor@college.com', required: true },
                { label: 'Phone Number', value: phone, set: setPhone, type: 'tel', placeholder: '+91 98765 43210', required: true },
              ].map(({ label, value, set, type, placeholder, required }) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={value} onChange={e => set(e.target.value)} required={required} placeholder={placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#27272a'} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>UPI ID <span style={{ color: '#3f3f46', textTransform: 'none', fontWeight: 400, letterSpacing: 0, fontFamily: "'DM Sans', sans-serif" }}>(optional)</span></label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="vendor@upi" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                  onBlur={e => e.target.style.borderColor = '#27272a'} />
              </div>
              {error && <p style={{ color: '#f87171', fontSize: 12, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '8px 12px' }}>{error}</p>}
              <button type="submit" disabled={loading}
                style={{ marginTop: 4, background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
                {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Sending OTP…</> : 'Send OTP →'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#18181b', borderRadius: 12, padding: '12px 16px', marginBottom: 4 }}>
                <p style={{ color: '#52525b', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>OTP sent to</p>
                <p style={{ color: '#fff', fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{email}</p>
              </div>
              {[
                { label: 'OTP Code', value: otp, set: setOtp, type: 'text', placeholder: '123456' },
                { label: 'Set Password', value: password, set: setPassword, type: 'password', placeholder: 'Min 8 characters' },
              ].map(({ label, value, set, type, placeholder }) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={value} onChange={e => set(e.target.value)} required placeholder={placeholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                    onBlur={e => e.target.style.borderColor = '#27272a'} />
                </div>
              ))}
              {error && <p style={{ color: '#f87171', fontSize: 12, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '8px 12px' }}>{error}</p>}
              <button type="submit" disabled={loading}
                style={{ marginTop: 4, background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
                {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Creating…</> : 'Create Vendor Account →'}
              </button>
              <button type="button" onClick={() => { setStep('invite'); setError('') }}
                style={{ background: 'none', border: 'none', color: '#52525b', fontSize: 12, cursor: 'pointer', padding: '8px 0', fontFamily: "'DM Sans', sans-serif' " }}>
                ← Back
              </button>
            </form>
          )}

          {step === 'done' && createdVendor && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#ff6b00' }}>✓</div>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Vendor created!</p>
                <p style={{ color: '#52525b', fontSize: 12, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>They can now log in to their dashboard</p>
              </div>
              <div style={{ background: '#18181b', borderRadius: 14, padding: 16, textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Name', createdVendor.name],
                  ['Email', createdVendor.email],
                  ['UPI ID', createdVendor.upi_id ?? '—'],
                  ['Vendor ID', createdVendor.id],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ color: '#52525b', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>{label}</p>
                    <p style={{ color: '#fff', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{val}</p>
                  </div>
                ))}
              </div>
              <button onClick={reset}
                style={{ width: '100%', background: '#18181b', color: '#fff', border: '1px solid #27272a', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                Add Another Vendor
              </button>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/admin/settlements" style={{ color: '#52525b', fontSize: 12, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ff6b00'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#52525b'}>
            View Settlements →
          </Link>
          <p style={{ color: '#27272a', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>quelessly admin · internal use only</p>
        </div>
      </div>
    </div>
  )
}