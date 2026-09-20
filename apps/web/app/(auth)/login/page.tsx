
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      setError('Numéro introuvable ou compte inactif')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/otp/verify', {
        telephone,
        code: otp,
      })

      if (data.user.role !== 'ADMIN') {
        setError('Accès réservé aux administrateurs')
        return
      }

      document.cookie = `waluma_access_token=${data.accessToken}; path=/; max-age=900`

      setAuth(
        data.user,
        data.accessToken,
        data.refreshToken
      )

      router.push('/dashboard')
    } catch {
      setError('Code invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d5068] tracking-tight">
            Waluma
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Espace administrateur
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-3 mb-4 sm:mb-5">
            {error}
          </div>
        )}

        {/* Phone step */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1.5">
                Numéro de téléphone
              </label>

              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+221 77 000 00 00"
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-3 text-sm outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d5068] hover:bg-[#0a3f52] text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Recevoir le code'}
            </button>
          </form>
        ) : (
          /* OTP step */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
              Code envoyé au{' '}
              <span className="font-semibold text-gray-700 break-words">
                {telephone}
              </span>
            </p>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1.5">
                Code OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                placeholder="000000"
                maxLength={6}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition tracking-widest text-center text-lg sm:text-xl font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setError('')
              }}
              className="w-full text-gray-400 text-xs sm:text-sm hover:text-gray-600 transition py-1"
            >
              Modifier le numéro
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

