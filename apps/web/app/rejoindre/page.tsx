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

const ZONES = ['Plateau', 'Médina', 'Almadies', 'Mermoz', 'Ouakam', 'Yoff', 'Liberté', 'HLM', 'Grand Dakar', 'Pikine', 'Guédiawaye', 'Rufisque']

const OPERATEURS = [
  { value: 'WAVE', label: 'Wave', color: '#0066FF' },
  { value: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600' },
  { value: 'FREE_MONEY', label: 'Free Money', color: '#CC0000' },
]

const STEPS = [
  { num: 1, label: 'Informations personnelles' },
  { num: 2, label: 'Profil professionnel' },
  { num: 3, label: 'Documents' },
  { num: 4, label: 'Paiement Mobile Money' },
]

type DocType = 'diplome' | 'cni' | 'casier'

interface FormData {
  // Étape 1
  prenom: string
  nom: string
  telephone: string
  zones: string[]
  // Étape 2
  specialite: string
  anneesExperience: string
  numeroOrdre: string
  bio: string
  // Étape 3
  diplome: File | null
  cni: File | null
  casier: File | null
  // Étape 4
  operateur: string
  numeroMM: string
}

const initialForm: FormData = {
  prenom: '', nom: '', telephone: '', zones: [],
  specialite: '', anneesExperience: '', numeroOrdre: '', bio: '',
  diplome: null, cni: null, casier: null,
  operateur: 'WAVE', numeroMM: '',
}

function FileUpload({ label, required, file, onChange, accept = '.pdf,image/jpeg,image/png' }: {
  label: string; required?: boolean; file: File | null
  onChange: (f: File | null) => void; accept?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition flex items-center gap-3 ${
          file ? 'border-[#22c55e] bg-[#f0fdf4]' : 'border-gray-200 bg-gray-50 hover:border-[#0d5068] hover:bg-blue-50/30'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${file ? 'bg-[#22c55e]' : 'bg-white border border-gray-200'}`}>
          {file
            ? <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            : <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          }
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <div className="text-sm font-semibold text-[#15803d] truncate">{file.name}</div>
              <div className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-gray-600">Cliquer pour uploader</div>
              <div className="text-xs text-gray-400">PDF, JPG, PNG · 5 MB max</div>
            </>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = '' }}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
    </div>
  )
}

export default function RejoindrePages() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'global', string>>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function toggleZone(zone: string) {
    setForm(f => ({
      ...f,
      zones: f.zones.includes(zone) ? f.zones.filter(z => z !== zone) : [...f.zones, zone],
    }))
    setErrors(e => ({ ...e, zones: '' }))
  }

  // Validation par étape
  function validateStep(s: number): boolean {
    const errs: typeof errors = {}

    if (s === 1) {
      if (!form.prenom.trim()) errs.prenom = 'Prénom requis'
      if (!form.nom.trim()) errs.nom = 'Nom requis'
      const telRegex = /^\+221(70|75|76|77|78)\d{7}$/
      if (!telRegex.test(form.telephone.replace(/\s/g, '')))
        errs.telephone = 'Format invalide : +221 suivi de 70/75/76/77/78 + 7 chiffres'
      if (form.zones.length === 0) errs.zones = 'Sélectionnez au moins une zone'
    }

    if (s === 2) {
      if (!form.specialite) errs.specialite = 'Spécialité requise'
      const exp = parseInt(form.anneesExperience)
      if (!form.anneesExperience || isNaN(exp) || exp < 0 || exp > 50)
        errs.anneesExperience = 'Nombre d\'années invalide (0–50)'
      if (!form.bio.trim() || form.bio.trim().length < 30)
        errs.bio = 'Biographie trop courte (30 caractères minimum)'
    }

    if (s === 3) {
      if (!form.diplome) errs.diplome = 'Diplôme requis'
      if (!form.cni) errs.cni = 'CNI requise'
      if (!form.casier) errs.casier = 'Casier judiciaire requis'
    }

    if (s === 4) {
      const mmRegex = /^\+221(70|75|76|77|78)\d{7}$/
      if (!mmRegex.test(form.numeroMM.replace(/\s/g, '')))
        errs.numeroMM = 'Format invalide : +221 suivi de 70/75/76/77/78 + 7 chiffres'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep(s => s + 1)
  }

  function prevStep() {
    setStep(s => s - 1)
    setErrors({})
  }

  async function handleSubmit() {
    if (!validateStep(4)) return
    setLoading(true)
    setErrors({})

    try {
      const fd = new FormData()
      fd.append('prenom', form.prenom.trim())
      fd.append('nom', form.nom.trim())
      fd.append('telephone', form.telephone.replace(/\s/g, ''))
      fd.append('specialite', form.specialite)
      fd.append('anneesExperience', form.anneesExperience)
      fd.append('bio', form.bio.trim())
      fd.append('zoneIntervention', JSON.stringify(form.zones))
      if (form.numeroOrdre) fd.append('numeroOrdre', form.numeroOrdre.trim())
      fd.append('operateur', form.operateur)
      fd.append('numeroMM', form.numeroMM.replace(/\s/g, ''))

      // Documents
      if (form.diplome) { fd.append('files', form.diplome); fd.append('documentsTypes', JSON.stringify(['DIPLOME', 'CNI', 'CASIER_JUDICIAIRE'])) }
      if (form.cni) fd.append('files', form.cni)
      if (form.casier) fd.append('files', form.casier)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/praticiens/creer-demande`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      setSuccess(true)
    } catch (e: unknown) {
      setErrors({ global: e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#dcfce7] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f172a] mb-3 tracking-tight">Demande envoyée !</h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Votre dossier a bien été reçu. Notre équipe l'examinera dans les <strong>48–72 heures</strong> et vous contactera par téléphone au <strong>{form.telephone}</strong>.
          </p>
          <div className="bg-[#f0fdf4] rounded-2xl p-4 mb-6 text-left">
            <div className="text-sm font-bold text-[#15803d] mb-2">Prochaines étapes</div>
            {['Vérification de vos documents par notre équipe', 'Appel de confirmation de votre profil', 'Activation de votre compte Waluma', 'Première mission !'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#15803d] font-bold text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
          <Link href="/" className="block w-full bg-[#0d5068] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0a3f52] transition text-center">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const canProceed = (() => {
    if (step === 1) return form.prenom && form.nom && form.telephone && form.zones.length > 0
    if (step === 2) return form.specialite && form.anneesExperience && form.bio.length >= 30
    if (step === 3) return form.diplome && form.cni && form.casier
    if (step === 4) return form.numeroMM.length > 0
    return false
  })()

  return (
    <div className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill="#0d5068"/>
            <path d="M16 22s-7-4.5-7-9a4 4 0 017-2.65A4 4 0 0123 13c0 4.5-7 9-7 9z" fill="#4ade80"/>
          </svg>
          <span className="text-lg font-extrabold text-[#0d5068]">Waluma</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">← Retour à l'accueil</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#e0f2fe] rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full inline-block animate-pulse" />
            <span className="text-[#0d5068] text-sm font-semibold">Rejoignez le réseau Waluma</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Devenez praticien Waluma
          </h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Complétez ce formulaire en 4 étapes. Votre dossier sera examiné par notre équipe sous 48 à 72 heures.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step > s.num ? 'bg-[#22c55e] text-white' :
                  step === s.num ? 'bg-[#0d5068] text-white ring-4 ring-[#0d5068]/20' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num
                    ? <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    : s.num
                  }
                </div>
                <span className={`text-xs mt-1 font-semibold hidden sm:block ${step === s.num ? 'text-[#0d5068]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.num ? 'bg-[#22c55e]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card formulaire */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0d5068] to-[#083d50] px-6 py-4">
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-0.5">Étape {step} sur 4</div>
            <h2 className="text-lg font-bold text-white">{STEPS[step - 1].label}</h2>
          </div>

          <div className="p-6 space-y-5">

            {/* Erreur globale */}
            {errors.global && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {errors.global}
              </div>
            )}

            {/* ─── ÉTAPE 1 ─── */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                    <input
                      value={form.prenom}
                      onChange={e => set('prenom', e.target.value)}
                      placeholder="Amadou"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.prenom ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                    />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                    <input
                      value={form.nom}
                      onChange={e => set('nom', e.target.value)}
                      placeholder="Diallo"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone <span className="text-red-500">*</span></label>
                  <input
                    value={form.telephone}
                    onChange={e => set('telephone', e.target.value)}
                    placeholder="+221 77 000 00 00"
                    type="tel"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.telephone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                  />
                  {errors.telephone
                    ? <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
                    : <p className="text-gray-400 text-xs mt-1">Format : +221 suivi de 70, 75, 76, 77 ou 78 + 7 chiffres</p>
                  }
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zones d'intervention <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">({form.zones.length} sélectionnée{form.zones.length > 1 ? 's' : ''})</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map(z => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => toggleZone(z)}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                          form.zones.includes(z)
                            ? 'bg-[#0d5068] text-white border-[#0d5068]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#0d5068] hover:text-[#0d5068]'
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                  {errors.zones && <p className="text-red-500 text-xs mt-2">{errors.zones}</p>}
                </div>
              </>
            )}

            {/* ─── ÉTAPE 2 ─── */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Spécialité <span className="text-red-500">*</span></label>
                  <select
                    value={form.specialite}
                    onChange={e => set('specialite', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition appearance-none ${errors.specialite ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                  >
                    <option value="">Sélectionner une spécialité</option>
                    {SPECIALITES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  {errors.specialite && <p className="text-red-500 text-xs mt-1">{errors.specialite}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Années d'expérience <span className="text-red-500">*</span></label>
                    <input
                      value={form.anneesExperience}
                      onChange={e => set('anneesExperience', e.target.value)}
                      type="number"
                      min="0"
                      max="50"
                      placeholder="5"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.anneesExperience ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                    />
                    {errors.anneesExperience && <p className="text-red-500 text-xs mt-1">{errors.anneesExperience}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numéro d'ordre <span className="text-gray-400 font-normal">(optionnel)</span></label>
                    <input
                      value={form.numeroOrdre}
                      onChange={e => set('numeroOrdre', e.target.value)}
                      placeholder="Ex : SN-INF-2024-001"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Biographie <span className="text-red-500">*</span>
                    <span className={`font-normal ml-1 text-xs ${form.bio.length < 30 ? 'text-gray-400' : 'text-[#22c55e]'}`}>
                      {form.bio.length}/30 min
                    </span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    rows={4}
                    placeholder="Décrivez votre parcours, vos compétences et votre approche du soin à domicile..."
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition resize-none ${errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                  />
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                </div>
              </>
            )}

            {/* ─── ÉTAPE 3 ─── */}
            {step === 3 && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <span>Les documents doivent être lisibles et valides. Formats acceptés : PDF, JPG, PNG (5 MB max par fichier).</span>
                </div>

                <FileUpload
                  label="Diplôme"
                  required
                  file={form.diplome}
                  onChange={f => set('diplome', f)}
                />
                {errors.diplome && <p className="text-red-500 text-xs -mt-3">{errors.diplome}</p>}

                <FileUpload
                  label="Carte Nationale d'Identité (CNI)"
                  required
                  file={form.cni}
                  onChange={f => set('cni', f)}
                />
                {errors.cni && <p className="text-red-500 text-xs -mt-3">{errors.cni}</p>}

                <FileUpload
                  label="Casier judiciaire"
                  required
                  file={form.casier}
                  onChange={f => set('casier', f)}
                />
                {errors.casier && <p className="text-red-500 text-xs -mt-3">{errors.casier}</p>}

                {form.diplome && form.cni && form.casier && (
                  <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#15803d] font-semibold">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    3 documents uploadés — vous pouvez continuer
                  </div>
                )}
              </>
            )}

            {/* ─── ÉTAPE 4 ─── */}
            {step === 4 && (
              <>
                <div className="bg-[#fef3c7] border border-[#fcd34d] rounded-xl px-4 py-3 text-sm text-[#92400e]">
                  <strong>À quoi sert ce numéro ?</strong> Waluma versera votre gain (montant total − 10% commission) directement sur ce compte après chaque mission.
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Opérateur <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {OPERATEURS.map(op => (
                      <button
                        key={op.value}
                        type="button"
                        onClick={() => set('operateur', op.value)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition ${
                          form.operateur === op.value
                            ? 'border-current text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        style={form.operateur === op.value ? { backgroundColor: op.color, borderColor: op.color } : {}}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numéro Mobile Money <span className="text-red-500">*</span></label>
                  <input
                    value={form.numeroMM}
                    onChange={e => set('numeroMM', e.target.value)}
                    type="tel"
                    placeholder="+221 77 000 00 00"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.numeroMM ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10'}`}
                  />
                  {errors.numeroMM
                    ? <p className="text-red-500 text-xs mt-1">{errors.numeroMM}</p>
                    : <p className="text-gray-400 text-xs mt-1">Doit être un numéro sénégalais actif sur {OPERATEURS.find(o => o.value === form.operateur)?.label}</p>
                  }
                </div>

                {/* Récap */}
                <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 space-y-2">
                  <div className="text-sm font-bold text-gray-700 mb-3">Récapitulatif de votre dossier</div>
                  {[
                    { label: 'Nom complet', val: `${form.prenom} ${form.nom}` },
                    { label: 'Téléphone', val: form.telephone },
                    { label: 'Spécialité', val: SPECIALITES.find(s => s.value === form.specialite)?.label },
                    { label: 'Expérience', val: `${form.anneesExperience} ans` },
                    { label: 'Zones', val: form.zones.join(', ') },
                    { label: 'Documents', val: '3 fichiers uploadés ✓' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-semibold text-gray-800 text-right max-w-[200px] truncate">{item.val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer boutons */}
          <div className="px-6 pb-6 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                ← Retour
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition ${
                  canProceed
                    ? 'bg-[#0d5068] hover:bg-[#0a3f52]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canProceed}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition flex items-center justify-center gap-2 ${
                  canProceed && !loading
                    ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <><svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30" strokeLinecap="round"/></svg> Envoi en cours...</>
                ) : (
                  <>Envoyer ma candidature ✓</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          En soumettant ce formulaire, vous acceptez nos{' '}
          <Link href="/legal/cgu" className="underline hover:text-gray-600">CGU</Link> et notre{' '}
          <Link href="/legal/confidentialite" className="underline hover:text-gray-600">politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  )
}