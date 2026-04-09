'use client'

import { useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL

export default function AdminPage() {
  const [step, setStep] = useState<'invite' | 'verify' | 'done'>('invite')

  const [adminSecret, setAdminSecret] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdVendor, setCreatedVendor] = useState<any>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/invite-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, name, email, phone }),
      }).then(r => r.json())
      if (res.success) {
        setStep('verify')
      } else {
        setError(res.message || 'Something went wrong')
      }
    } catch {
      setError('Could not reach server')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/verify-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, email, otp, password }),
      }).then(r => r.json())
      if (res.success) {
        setCreatedVendor(res.data)
        setStep('done')
      } else {
        setError(res.message || 'Invalid OTP')
      }
    } catch {
      setError('Could not reach server')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('invite')
    setName(''); setEmail(''); setPhone('')
    setOtp(''); setPassword(''); setError('')
    setCreatedVendor(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-lime-400 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-black font-black text-2xl">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tighter">Admin Panel</h1>
          <p className="text-zinc-600 text-xs mt-1">Vendor onboarding</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {['Send OTP', 'Verify & Create', 'Done'].map((label, i) => {
            const stepIndex = step === 'invite' ? 0 : step === 'verify' ? 1 : 2
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < stepIndex ? 'bg-lime-400 text-black'
                  : i === stepIndex ? 'bg-lime-400/20 text-lime-400 border border-lime-400/50'
                  : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-semibold ${i === stepIndex ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          {step === 'invite' && (
            <form onSubmit={handleInvite} className="space-y-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">New Vendor Details</p>
              {[
                { label: 'Admin Secret', value: adminSecret, set: setAdminSecret, type: 'password', placeholder: '••••••••' },
                { label: 'Vendor Name', value: name, set: setName, type: 'text', placeholder: 'The Canteen' },
                { label: 'Vendor Email', value: email, set: setEmail, type: 'email', placeholder: 'vendor@college.com' },
                { label: 'Phone Number', value: phone, set: setPhone, type: 'tel', placeholder: '+91 98765 43210' },
              ].map(({ label, value, set, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={e => set(e.target.value)}
                    required
                    placeholder={placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
                  />
                </div>
              ))}
              {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-lime-400 text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending OTP…</>
                  : 'Send OTP →'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="bg-zinc-800 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-zinc-500">OTP sent to</p>
                <p className="text-sm text-white font-mono mt-0.5">{email}</p>
              </div>
              {[
                { label: 'OTP Code', value: otp, set: setOtp, type: 'text', placeholder: '123456' },
                { label: 'Set Password', value: password, set: setPassword, type: 'password', placeholder: 'Min 8 characters' },
              ].map(({ label, value, set, type, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={e => set(e.target.value)}
                    required
                    placeholder={placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-lime-400/50 transition-colors"
                  />
                </div>
              ))}
              {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-lime-400 text-black py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating…</>
                  : 'Create Vendor Account →'}
              </button>
              <button type="button" onClick={() => { setStep('invite'); setError('') }} className="w-full text-zinc-600 text-xs py-2 hover:text-zinc-400 transition-colors">
                ← Back
              </button>
            </form>
          )}

          {step === 'done' && createdVendor && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-lime-400/10 border border-lime-400/30 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div>
                <p className="text-white font-bold">Vendor created!</p>
                <p className="text-zinc-500 text-xs mt-1">They can now log in to their dashboard</p>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4 text-left space-y-2">
                <div>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Name</p>
                  <p className="text-white text-sm font-mono">{createdVendor.name}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Email</p>
                  <p className="text-white text-sm font-mono">{createdVendor.email}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Vendor ID</p>
                  <p className="text-white text-sm font-mono">{createdVendor.id}</p>
                </div>
              </div>
              <button
                onClick={reset}
                className="w-full bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors"
              >
                Add Another Vendor
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          <Link
            href="/admin/settlements"
            className="block text-zinc-600 text-xs hover:text-lime-400 transition-colors"
          >
            View Settlements →
          </Link>
          <p className="text-zinc-800 text-xs">quelessly admin · internal use only</p>
        </div>
      </div>
    </div>
  )
}