
'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const SPECIALITES = [
  { value: 'INFIRMIER', label: 'Infirmier/ère IDE' },
  { value: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste' },
  { value: 'SAGE_FEMME', label: 'Sage-femme' },
  { value: 'KINESITHERAPEUTE', label: 'Kinésithérapeute' },
  { value: 'PRELEVEUR', label: 'Préleveur/se' },
  { value: 'PEDIATRE', label: 'Pédiatre' },
  { value: 'AUTRE', label: 'Autre' },
]

const ZONES = [
  'Plateau',
  'Médina',
  'Almadies',
  'Mermoz',
  'Ouakam',
  'Yoff',
  'Liberté',
  'HLM',
  'Grand Dakar',
  'Pikine',
  'Guédiawaye',
  'Rufisque',
]

const OPERATEURS = [
  {
    value: 'WAVE',
    label: 'Wave',
    color: '#0066FF',
    description: 'Compte Wave',
  },
  {
    value: 'ORANGE_MONEY',
    label: 'Orange Money',
    color: '#FF6600',
    description: 'Compte Orange Money',
  },
  {
    value: 'FREE_MONEY',
    label: 'Free Money',
    color: '#CC0000',
    description: 'Compte Free Money',
  },
]

const STEPS = [
  {
    num: 1,
    label: 'Informations personnelles',
    shortLabel: 'Personnel',
  },
  {
    num: 2,
    label: 'Profil professionnel',
    shortLabel: 'Profil',
  },
  {
    num: 3,
    label: 'Documents',
    shortLabel: 'Documents',
  },
  {
    num: 4,
    label: 'Paiement Mobile Money',
    shortLabel: 'Paiement',
  },
]

type FormData = {
  prenom: string
  nom: string
  telephone: string
  zones: string[]

  specialite: string
  anneesExperience: string
  numeroOrdre: string
  bio: string

  diplome: File | null
  cni: File | null
  casier: File | null

  operateur: string
  numeroWave: string
  numeroOrangeMoney: string
  numeroFreeMoney: string
}

const initialForm: FormData = {
  prenom: '',
  nom: '',
  telephone: '',
  zones: [],

  specialite: '',
  anneesExperience: '',
  numeroOrdre: '',
  bio: '',

  diplome: null,
  cni: null,
  casier: null,

  operateur: 'WAVE',
  numeroWave: '',
  numeroOrangeMoney: '',
  numeroFreeMoney: '',
}

function FileUpload({
  label,
  required,
  file,
  onChange,
  accept = '.pdf,image/jpeg,image/png',
}: {
  label: string
  required?: boolean
  file: File | null
  onChange: (f: File | null) => void
  accept?: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="min-w-0">
      <div className="mb-2 text-sm font-semibold text-gray-700">
        {label}{' '}
        {required && <span className="text-red-500">*</span>}
      </div>

      <div
        onClick={() => ref.current?.click()}
        className={`flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition ${
          file
            ? 'border-[#22c55e] bg-[#f0fdf4]'
            : 'border-gray-200 bg-gray-50 hover:border-[#0d5068] hover:bg-blue-50/30'
        }`}
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            file
              ? 'bg-[#22c55e]'
              : 'border border-gray-200 bg-white'
          }`}
        >
          {file ? (
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {file ? (
            <>
              <div className="truncate text-sm font-semibold text-[#15803d]">
                {file.name}
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-gray-600">
                Cliquer pour uploader
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                PDF, JPG, PNG · 5 MB max
              </div>
            </>
          )}
        </div>

        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)

              if (ref.current) {
                ref.current.value = ''
              }
            }}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            aria-label="Supprimer le fichier"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) =>
          onChange(e.target.files?.[0] ?? null)
        }
      />
    </div>
  )
}

function PhoneInput({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}) {
  function handleChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    onChange(digits)
  }

  const isComplete = value.length === 9

  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>

      <div
        className={`flex min-w-0 overflow-hidden rounded-xl border bg-white transition ${
          error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 focus-within:border-[#0d5068] focus-within:ring-2 focus-within:ring-[#0d5068]/10'
        }`}
      >
        <div className="flex flex-shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-600">
          +221
        </div>

        <input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="77 000 00 00"
          type="tel"
          inputMode="numeric"
          maxLength={9}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
        />

        {isComplete && !error && (
          <div className="flex flex-shrink-0 items-center px-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e]">
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-gray-400">
          {hint || '9 chiffres · Exemple : 77 000 00 00'}
        </p>
      )}
    </div>
  )
}

export default function RejoindrePages() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | 'global', string>>
  >({})

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof FormData>(
    key: K,
    val: FormData[K]
  ) {
    setForm((f) => ({
      ...f,
      [key]: val,
    }))

    setErrors((e) => ({
      ...e,
      [key]: '',
      global: '',
    }))
  }

  function toggleZone(zone: string) {
    setForm((f) => ({
      ...f,
      zones: f.zones.includes(zone)
        ? f.zones.filter((z) => z !== zone)
        : [...f.zones, zone],
    }))

    setErrors((e) => ({
      ...e,
      zones: '',
    }))
  }

  function getSelectedPaymentNumber() {
    if (form.operateur === 'WAVE') return form.numeroWave
    if (form.operateur === 'ORANGE_MONEY')
      return form.numeroOrangeMoney

    return form.numeroFreeMoney
  }

  function setSelectedPaymentNumber(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 9)

    if (form.operateur === 'WAVE') {
      set('numeroWave', digits)
    } else if (form.operateur === 'ORANGE_MONEY') {
      set('numeroOrangeMoney', digits)
    } else {
      set('numeroFreeMoney', digits)
    }
  }

  function isValidSenegalPhone(value: string) {
    return /^(70|75|76|77|78)\d{7}$/.test(value)
  }

  function validateStep(s: number): boolean {
    const errs: typeof errors = {}

    if (s === 1) {
      if (!form.prenom.trim()) {
        errs.prenom = 'Prénom requis'
      }

      if (!form.nom.trim()) {
        errs.nom = 'Nom requis'
      }

      if (!isValidSenegalPhone(form.telephone)) {
        errs.telephone =
          'Entrez les 9 chiffres de votre numéro, par exemple 77 000 00 00'
      }

      if (form.zones.length === 0) {
        errs.zones = 'Sélectionnez au moins une zone'
      }
    }

    if (s === 2) {
      if (!form.specialite) {
        errs.specialite = 'Spécialité requise'
      }

      const exp = parseInt(form.anneesExperience)

      if (
        !form.anneesExperience ||
        isNaN(exp) ||
        exp < 0 ||
        exp > 50
      ) {
        errs.anneesExperience =
          "Nombre d'années invalide (0–50)"
      }

      if (
        !form.bio.trim() ||
        form.bio.trim().length < 30
      ) {
        errs.bio =
          'Biographie trop courte (30 caractères minimum)'
      }
    }

    if (s === 3) {
      if (!form.diplome) {
        errs.diplome = 'Diplôme requis'
      }

      if (!form.cni) {
        errs.cni = 'CNI requise'
      }

      if (!form.casier) {
        errs.casier = 'Casier judiciaire requis'
      }
    }

    if (s === 4) {
      const selectedNumber = getSelectedPaymentNumber()

      if (!isValidSenegalPhone(selectedNumber)) {
        errs.numeroWave =
          form.operateur === 'WAVE'
            ? 'Numéro Wave invalide'
            : errs.numeroWave

        errs.numeroOrangeMoney =
          form.operateur === 'ORANGE_MONEY'
            ? 'Numéro Orange Money invalide'
            : errs.numeroOrangeMoney

        errs.numeroFreeMoney =
          form.operateur === 'FREE_MONEY'
            ? 'Numéro Free Money invalide'
            : errs.numeroFreeMoney
      }
    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4))
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1))
    setErrors({})

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function handleSubmit() {
    if (!validateStep(4)) return

    setLoading(true)
    setErrors({})

    try {
      const fd = new FormData()

      fd.append('prenom', form.prenom.trim())
      fd.append('nom', form.nom.trim())

      // API : on reconstruit le numéro complet avec +221
      fd.append(
        'telephone',
        `+221${form.telephone}`
      )

      fd.append('specialite', form.specialite)
      fd.append(
        'anneesExperience',
        form.anneesExperience
      )
      fd.append('bio', form.bio.trim())
      fd.append(
        'zoneIntervention',
        JSON.stringify(form.zones)
      )

      if (form.numeroOrdre) {
        fd.append(
          'numeroOrdre',
          form.numeroOrdre.trim()
        )
      }

      fd.append('operateur', form.operateur)

      // L'API continue de recevoir le champ numeroMM,
      // avec le numéro correspondant à l'opérateur sélectionné.
      fd.append(
        'numeroMM',
        `+221${getSelectedPaymentNumber()}`
      )

      if (form.diplome) {
        fd.append('files', form.diplome)
        fd.append(
          'documentsTypes',
          JSON.stringify([
            'DIPLOME',
            'CNI',
            'CASIER_JUDICIAIRE',
          ])
        )
      }

      if (form.cni) {
        fd.append('files', form.cni)
      }

      if (form.casier) {
        fd.append('files', form.casier)
      }

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          'http://localhost:5001/api'
        }/praticiens/creer-demande`,
        {
          method: 'POST',
          body: fd,
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(
          data.error || "Erreur lors de l'envoi"
        )
      }

      setSuccess(true)
    } catch (e: unknown) {
      setErrors({
        global:
          e instanceof Error
            ? e.message
            : 'Une erreur est survenue. Réessayez.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#dcfce7]">
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-[#0f172a]">
            Demande envoyée !
          </h2>

          <p className="mb-6 leading-relaxed text-gray-500">
            Votre dossier a bien été reçu. Notre équipe
            l'examinera dans les{' '}
            <strong>48–72 heures</strong> et vous
            contactera par téléphone au{' '}
            <strong>
              +221 {form.telephone}
            </strong>
            .
          </p>

          <div className="mb-6 rounded-2xl bg-[#f0fdf4] p-4 text-left">
            <div className="mb-3 text-sm font-bold text-[#15803d]">
              Prochaines étapes
            </div>

            {[
              'Vérification de vos documents par notre équipe',
              'Appel de confirmation de votre profil',
              'Activation de votre compte Waluma',
              'Première mission !',
            ].map((text, i) => (
              <div
                key={i}
                className="mb-2 flex items-start gap-2 text-sm text-gray-600 last:mb-0"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#22c55e]/20 text-xs font-bold text-[#15803d]">
                  {i + 1}
                </span>

                <span>{text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="block w-full rounded-xl bg-[#0d5068] py-3 text-center text-sm font-bold text-white transition hover:bg-[#0a3f52]"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const canProceed = (() => {
    if (step === 1) {
      return (
        form.prenom.trim() &&
        form.nom.trim() &&
        isValidSenegalPhone(form.telephone) &&
        form.zones.length > 0
      )
    }

    if (step === 2) {
      return (
        form.specialite &&
        form.anneesExperience &&
        form.bio.trim().length >= 30
      )
    }

    if (step === 3) {
      return (
        !!form.diplome &&
        !!form.cni &&
        !!form.casier
      )
    }

    if (step === 4) {
      return isValidSenegalPhone(
        getSelectedPaymentNumber()
      )
    }

    return false
  })()

  const selectedOperator = OPERATEURS.find(
    (op) => op.value === form.operateur
  )

  return (
    <div
      className="min-h-screen bg-[#f8fafc]"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* NAVBAR */}
      <nav className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              className="flex-shrink-0"
            >
              <rect
                width="32"
                height="32"
                rx="9"
                fill="#0d5068"
              />
              <path
                d="M16 22s-7-4.5-7-9a4 4 0 017-2.65A4 4 0 0123 13c0 4.5-7 9-7 9z"
                fill="#4ade80"
              />
            </svg>

            <span className="text-lg font-extrabold text-[#0d5068]">
              Waluma
            </span>
          </Link>

          <Link
            href="/"
            className="flex-shrink-0 text-xs font-medium text-gray-400 transition hover:text-gray-600 sm:text-sm"
          >
            ←{' '}
            <span className="hidden sm:inline">
              Retour à l'accueil
            </span>
            <span className="sm:hidden">Accueil</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-2xl px-3 py-7 sm:px-4 sm:py-12">
        {/* HEADER */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[#e0f2fe] px-3 py-2 sm:px-4">
            <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-[#22c55e]" />

            <span className="text-xs font-semibold text-[#0d5068] sm:text-sm">
              Rejoignez le réseau Waluma
            </span>
          </div>

          <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
            Devenez praticien Waluma
          </h1>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
            Complétez votre candidature en 4 étapes.
            Notre équipe examinera votre dossier sous
            48 à 72 heures.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mb-7 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:mb-8 sm:p-4">
          <div className="flex items-start">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="flex min-w-0 flex-1 items-start"
              >
                <div className="flex min-w-0 flex-1 flex-col items-center">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all sm:h-10 sm:w-10 ${
                      step > s.num
                        ? 'bg-[#22c55e] text-white'
                        : step === s.num
                        ? 'bg-[#0d5068] text-white ring-4 ring-[#0d5068]/10'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step > s.num ? (
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>

                  <span
                    className={`mt-1.5 max-w-[70px] text-center text-[10px] font-semibold leading-tight sm:max-w-none sm:text-xs ${
                      step === s.num
                        ? 'text-[#0d5068]'
                        : 'text-gray-400'
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {s.label}
                    </span>
                    <span className="sm:hidden">
                      {s.shortLabel}
                    </span>
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <div
                    className={`mt-4 h-0.5 min-w-2 flex-1 transition-all sm:mt-5 ${
                      step > s.num
                        ? 'bg-[#22c55e]'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* CARD HEADER */}
          <div className="bg-gradient-to-r from-[#0d5068] to-[#083d50] px-4 py-4 sm:px-6">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">
              Étape {step} sur 4
            </div>

            <div className="mt-0.5 flex items-center justify-between gap-3">
              <h2 className="min-w-0 text-base font-bold text-white sm:text-lg">
                {STEPS[step - 1].label}
              </h2>

              <span className="flex-shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/70">
                {Math.round((step / 4) * 100)}%
              </span>
            </div>
          </div>

          {/* FORM CONTENT */}
          <div className="space-y-5 p-4 sm:p-6">
            {/* GLOBAL ERROR */}
            {errors.global && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="mt-0.5 flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>

                <span className="break-words">
                  {errors.global}
                </span>
              </div>
            )}

            {/* ÉTAPE 1 */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Prénom{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={form.prenom}
                      onChange={(e) =>
                        set('prenom', e.target.value)
                      }
                      placeholder="Amadou"
                      autoComplete="given-name"
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                        errors.prenom
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'
                      }`}
                    />

                    {errors.prenom && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.prenom}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Nom{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={form.nom}
                      onChange={(e) =>
                        set('nom', e.target.value)
                      }
                      placeholder="Diallo"
                      autoComplete="family-name"
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                        errors.nom
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'
                      }`}
                    />

                    {errors.nom && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nom}
                      </p>
                    )}
                  </div>
                </div>

                <PhoneInput
                  label="Téléphone"
                  value={form.telephone}
                  onChange={(value) =>
                    set('telephone', value)
                  }
                  error={errors.telephone}
                  hint="Entrez uniquement les 9 chiffres · Exemple : 77 000 00 00"
                />

                <div className="min-w-0">
                  <div className="mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Zones d'intervention{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <span className="ml-1 text-xs text-gray-400">
                      ({form.zones.length}{' '}
                      sélectionnée
                      {form.zones.length > 1 ? 's' : ''})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((zone) => {
                      const selected =
                        form.zones.includes(zone)

                      return (
                        <button
                          key={zone}
                          type="button"
                          onClick={() =>
                            toggleZone(zone)
                          }
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                            selected
                              ? 'border-[#0d5068] bg-[#0d5068] text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-[#0d5068] hover:text-[#0d5068]'
                          }`}
                        >
                          {selected && (
                            <span className="mr-1">
                              ✓
                            </span>
                          )}
                          {zone}
                        </button>
                      )
                    })}
                  </div>

                  {errors.zones && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.zones}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-[#f8fafc] px-4 py-3 text-xs leading-relaxed text-gray-500">
                  <strong className="text-gray-700">
                    Conseil :
                  </strong>{' '}
                  sélectionnez toutes les zones dans
                  lesquelles vous pouvez réellement vous
                  déplacer pour effectuer des missions.
                </div>
              </>
            )}

            {/* ÉTAPE 2 */}
            {step === 2 && (
              <>
                <div className="min-w-0">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Spécialité{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.specialite}
                    onChange={(e) =>
                      set(
                        'specialite',
                        e.target.value
                      )
                    }
                    className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                      errors.specialite
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'
                    }`}
                  >
                    <option value="">
                      Sélectionner une spécialité
                    </option>

                    {SPECIALITES.map((specialite) => (
                      <option
                        key={specialite.value}
                        value={specialite.value}
                      >
                        {specialite.label}
                      </option>
                    ))}
                  </select>

                  {errors.specialite && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.specialite}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Années d'expérience{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={
                        form.anneesExperience
                      }
                      onChange={(e) =>
                        set(
                          'anneesExperience',
                          e.target.value
                        )
                      }
                      type="number"
                      min="0"
                      max="50"
                      placeholder="5"
                      inputMode="numeric"
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                        errors.anneesExperience
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'
                      }`}
                    />

                    {errors.anneesExperience && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.anneesExperience}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Numéro d'ordre{' '}
                      <span className="font-normal text-gray-400">
                        (optionnel)
                      </span>
                    </label>

                    <input
                      value={form.numeroOrdre}
                      onChange={(e) =>
                        set(
                          'numeroOrdre',
                          e.target.value
                        )
                      }
                      placeholder="Ex : SN-INF-2024-001"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Biographie{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <span
                      className={`flex-shrink-0 text-xs ${
                        form.bio.length < 30
                          ? 'text-gray-400'
                          : 'text-[#22c55e]'
                      }`}
                    >
                      {form.bio.length}/30
                    </span>
                  </div>

                  <textarea
                    value={form.bio}
                    onChange={(e) =>
                      set('bio', e.target.value)
                    }
                    rows={5}
                    placeholder="Décrivez votre parcours, vos compétences et votre approche du soin à domicile..."
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.bio
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'
                    }`}
                  />

                  <div className="mt-1 flex items-center justify-between gap-3">
                    {errors.bio ? (
                      <p className="text-xs text-red-500">
                        {errors.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Présentez brièvement votre expérience
                        et vos compétences.
                      </p>
                    )}

                    {form.bio.length >= 30 && (
                      <span className="flex-shrink-0 text-xs font-semibold text-[#15803d]">
                        ✓ Minimum atteint
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ÉTAPE 3 */}
            {step === 3 && (
              <>
                <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-0.5 flex-shrink-0 text-blue-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>

                  <div className="min-w-0 text-xs leading-relaxed text-blue-700 sm:text-sm">
                    <strong className="font-bold">
                      Préparez vos documents.
                    </strong>{' '}
                    Ils doivent être lisibles et valides.
                    Formats acceptés : PDF, JPG ou PNG,
                    5 MB maximum par fichier.
                  </div>
                </div>

                <div className="space-y-4">
                  <FileUpload
                    label="Diplôme"
                    required
                    file={form.diplome}
                    onChange={(file) =>
                      set('diplome', file)
                    }
                  />

                  {errors.diplome && (
                    <p className="-mt-2 text-xs text-red-500">
                      {errors.diplome}
                    </p>
                  )}

                  <FileUpload
                    label="Carte Nationale d'Identité (CNI)"
                    required
                    file={form.cni}
                    onChange={(file) =>
                      set('cni', file)
                    }
                  />

                  {errors.cni && (
                    <p className="-mt-2 text-xs text-red-500">
                      {errors.cni}
                    </p>
                  )}

                  <FileUpload
                    label="Casier judiciaire"
                    required
                    file={form.casier}
                    onChange={(file) =>
                      set('casier', file)
                    }
                  />

                  {errors.casier && (
                    <p className="-mt-2 text-xs text-red-500">
                      {errors.casier}
                    </p>
                  )}
                </div>

                {form.diplome &&
                  form.cni &&
                  form.casier && (
                    <div className="flex items-center gap-2 rounded-xl border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#15803d]">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#22c55e]">
                        <svg
                          width="13"
                          height="13"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>

                      <span>
                        Les 3 documents sont prêts.
                      </span>
                    </div>
                  )}
              </>
            )}

            {/* ÉTAPE 4 */}
            {step === 4 && (
              <>
                <div className="rounded-2xl border border-[#fcd34d] bg-[#fef3c7] px-4 py-4">
                  <div className="mb-1 text-sm font-bold text-[#92400e]">
                    Comment serez-vous payé ?
                  </div>

                  <p className="text-xs leading-relaxed text-[#92400e]/90 sm:text-sm">
                    Après chaque mission, votre gain
                    (montant total − 10 % de commission)
                    sera versé sur le compte Mobile Money
                    que vous indiquez ci-dessous.
                  </p>
                </div>

                <div>
                  <div className="mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Moyen de paiement{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <p className="mt-1 text-xs text-gray-400">
                      Sélectionnez le compte sur lequel vous
                      souhaitez recevoir vos gains.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {OPERATEURS.map((operator) => {
                      const selected =
                        form.operateur ===
                        operator.value

                      return (
                        <button
                          key={operator.value}
                          type="button"
                          onClick={() =>
                            set(
                              'operateur',
                              operator.value
                            )
                          }
                          className={`relative min-w-0 rounded-2xl border-2 p-4 text-left transition ${
                            selected
                              ? 'shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          style={
                            selected
                              ? {
                                  borderColor:
                                    operator.color,
                                  backgroundColor:
                                    `${operator.color}08`,
                                }
                              : {}
                          }
                        >
                          {selected && (
                            <div
                              className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                              style={{
                                backgroundColor:
                                  operator.color,
                              }}
                            >
                              <svg
                                width="11"
                                height="11"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </div>
                          )}

                          <div
                            className="mb-2 flex h-9 w-fit items-center rounded-lg px-2.5 text-sm font-extrabold text-white"
                            style={{
                              backgroundColor:
                                operator.color,
                            }}
                          >
                            {operator.label}
                          </div>

                          <p className="text-xs text-gray-500">
                            {operator.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* NUMERO DE L'OPERATEUR SELECTIONNE */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3">
                    <div className="text-sm font-bold text-gray-800">
                      Numéro{' '}
                      {selectedOperator?.label}
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-gray-400">
                      Entrez le numéro du compte{' '}
                      {selectedOperator?.label} sur lequel
                      vous souhaitez recevoir vos paiements.
                    </p>
                  </div>

                  <PhoneInput
                    label={`Numéro ${selectedOperator?.label}`}
                    value={getSelectedPaymentNumber()}
                    onChange={setSelectedPaymentNumber}
                    error={
                      form.operateur === 'WAVE'
                        ? errors.numeroWave
                        : form.operateur ===
                          'ORANGE_MONEY'
                        ? errors.numeroOrangeMoney
                        : errors.numeroFreeMoney
                    }
                    hint={`Entrez uniquement les 9 chiffres de votre compte ${selectedOperator?.label}`}
                  />

                  <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="mt-0.5 flex-shrink-0"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                      />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>

                    <span>
                      Le numéro doit être actif sur{' '}
                      {selectedOperator?.label}. Vous pourrez
                      utiliser un numéro différent pour chaque
                      moyen de paiement.
                    </span>
                  </div>
                </div>

                {/* RECAP */}
                <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-gray-700">
                      Récapitulatif
                    </div>

                    <span className="rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[10px] font-bold text-[#0d5068]">
                      Prêt à envoyer
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        label: 'Nom complet',
                        val: `${form.prenom} ${form.nom}`,
                      },
                      {
                        label: 'Téléphone',
                        val: `+221 ${form.telephone}`,
                      },
                      {
                        label: 'Spécialité',
                        val:
                          SPECIALITES.find(
                            (s) =>
                              s.value ===
                              form.specialite
                          )?.label || '—',
                      },
                      {
                        label: 'Expérience',
                        val: `${form.anneesExperience} an${
                          form.anneesExperience !==
                          '1'
                            ? 's'
                            : ''
                        }`,
                      },
                      {
                        label: 'Zones',
                        val: form.zones.join(', '),
                      },
                      {
                        label: 'Paiement',
                        val: `${selectedOperator?.label} · +221 ${getSelectedPaymentNumber()}`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex min-w-0 flex-col gap-1 border-b border-gray-100 pb-2.5 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                      >
                        <span className="flex-shrink-0 text-xs text-gray-500">
                          {item.label}
                        </span>

                        <span className="min-w-0 break-words text-left text-xs font-semibold text-gray-800 sm:max-w-[65%] sm:text-right">
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-4 pb-4 pt-4 sm:flex-row sm:px-6 sm:pb-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex-1"
              >
                ← Retour
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
                className={`w-full rounded-xl py-3 text-sm font-bold transition sm:flex-1 ${
                  canProceed
                    ? 'bg-[#0d5068] text-white shadow-sm hover:bg-[#0a3f52] active:scale-[0.99]'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canProceed}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition sm:flex-1 ${
                  canProceed && !loading
                    ? 'bg-[#22c55e] text-white shadow-sm hover:bg-[#16a34a] active:scale-[0.99]'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="30"
                        strokeLinecap="round"
                      />
                    </svg>

                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer ma candidature
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* LEGAL */}
        <p className="mt-4 px-2 text-center text-[11px] leading-relaxed text-gray-400 sm:text-xs">
          En soumettant ce formulaire, vous acceptez
          nos{' '}
          <Link
            href="/legal/cgu"
            className="underline transition hover:text-gray-600"
          >
            CGU
          </Link>{' '}
          et notre{' '}
          <Link
            href="/legal/confidentialite"
            className="underline transition hover:text-gray-600"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </main>
    </div>
  )
}

