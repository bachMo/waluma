'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [step, setStep] = useState<Step>('phone')
  const [telephone, setTelephone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { telephone })
      setStep('otp')
    } catch {
      setError('Numéro introuvable ou compte inactif.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/verify', { telephone, code: otp })
      if (data.user.role !== 'ADMIN') {
        setError('Accès réservé aux administrateurs.')
        return
      }
      // setAuth pose le cookie lu par proxy.ts (durée 7 jours, pas 15 min).
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    } catch {
      setError('Code invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[400px] flex-shrink-0 bg-[#0a2535] flex-col justify-between p-10">
        {/* logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0d5068] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-[15px] font-extrabold text-white">Waluma</span>
        </Link>

        {/* quote */}
        <div>
          <div className="text-[28px] font-extrabold text-white leading-tight tracking-tight mb-4">
            La santé à domicile,<br />
            <span className="text-[#22c55e]">à portée de main.</span>
          </div>
          <p className="text-white/40 text-[13px] leading-relaxed">
            Espace de gestion sécurisé réservé aux administrateurs Waluma.
          </p>
        </div>

        {/* stats */}
        <div className="border-t border-white/8 pt-7 space-y-4">
          {[
            { val: '+500', label: 'Missions réalisées' },
            { val: '4.9 / 5', label: 'Note praticiens' },
            { val: '30 min', label: "Délai moyen d'intervention" },
          ].map((s) => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-white/35 text-[12px]">{s.label}</span>
              <span className="text-white font-bold text-[13px]">{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f7f5] px-5 py-12">
        {/* mobile logo */}
        <Link href="/" className="flex lg:hidden items-center gap-2 mb-10">
          <span className="w-7 h-7 rounded-lg bg-[#0d5068] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-[15px] font-extrabold text-[#0a2535]">Waluma</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {/* header */}
            <div className="mb-7">
              <h1 className="text-[20px] font-extrabold text-[#0a2535] tracking-tight">
                {step === 'phone' ? 'Connexion admin' : 'Code de vérification'}
              </h1>
              <p className="text-gray-400 text-[13px] mt-1">
                {step === 'phone'
                  ? 'Entrez votre numéro pour recevoir un code.'
                  : `Code envoyé au +221 ${telephone}`}
              </p>
            </div>

            {/* error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-[12.5px] rounded-xl px-4 py-3 mb-5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-gray-500 mb-1.5">Numéro de téléphone</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400">+221</span>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="77 000 00 00"
                      required
                      className="w-full border border-gray-200 rounded-xl pl-14 pr-4 py-3.5 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0d5068] hover:bg-[#0a3f52] disabled:opacity-55 text-white font-bold py-3.5 rounded-xl text-[14px] transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : 'Recevoir le code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-gray-500 mb-1.5">Code à 6 chiffres</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[22px] font-bold tracking-[.35em] text-center outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-55 text-white font-bold py-3.5 rounded-xl text-[14px] transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Vérification...
                    </>
                  ) : 'Se connecter'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                  className="w-full text-gray-400 text-[12.5px] hover:text-gray-600 transition py-2 font-medium"
                >
                  Modifier le numéro
                </button>
              </form>
            )}
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-[12px] text-gray-400 hover:text-[#0d5068] transition-colors">
              ← Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
