'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const SPECIALITES = [
  { value: 'INFIRMIER', label: 'Infirmier / IDE' },
  { value: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste' },
  { value: 'SAGE_FEMME', label: 'Sage-femme' },
  { value: 'KINESITHERAPEUTE', label: 'Kinésithérapeute' },
  { value: 'PRELEVEUR', label: 'Préleveur / euse' },
  { value: 'PEDIATRE', label: 'Pédiatre' },
  { value: 'AUTRE', label: 'Autre spécialité' },
]

const ZONES = [
  'Plateau', 'Médina', 'Almadies', 'Mermoz', 'Ouakam', 'Yoff',
  'Liberté', 'HLM', 'Grand Dakar', 'Pikine', 'Guédiawaye', 'Rufisque',
]

const OPERATEURS = [
  { value: 'WAVE', label: 'Wave', color: '#0066FF' },
  { value: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600' },
  { value: 'FREE_MONEY', label: 'Free Money', color: '#CC0000' },
]

interface FormData {
  prenom: string
  nom: string
  telephone: string
  email: string
  adresse: string
  specialite: string
  experience: string
  zones: string[]
  diplome: File | null
  cni: File | null
  casier: File | null
  operateur: string
  numeroMobile: string
}

const STEPS = [
  { n: 1, label: 'Informations' },
  { n: 2, label: 'Profil pro' },
  { n: 3, label: 'Documents' },
  { n: 4, label: 'Paiement' },
]

function FileInput({
  label,
  hint,
  file,
  onChange,
}: {
  label: string
  hint: string
  file: File | null
  onChange: (f: File | null) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <div className="text-[12px] font-semibold text-gray-600 mb-2">{label}</div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-dashed transition-all text-left ${
          file
            ? 'border-[#22c55e]/40 bg-[#f0fdf4]'
            : 'border-gray-200 hover:border-[#0d5068]/30 bg-gray-50 hover:bg-[#f0f7f5]'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${file ? 'bg-[#22c55e]/10' : 'bg-white border border-gray-200'}`}>
          {file ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7.5l3 3 6-6" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M3.5 5l3.5-4 3.5 4M1.5 11.5h11" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <div className={`text-[12.5px] font-semibold truncate ${file ? 'text-[#16a34a]' : 'text-gray-500'}`}>
            {file ? file.name : 'Choisir un fichier'}
          </div>
          <div className="text-[11px] text-gray-400">{hint}</div>
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="ml-auto w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 flex-shrink-0 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </button>
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  )
}

export default function RejoindrePageRedesigned() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<FormData>({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    specialite: '',
    experience: '',
    zones: [],
    diplome: null,
    cni: null,
    casier: null,
    operateur: '',
    numeroMobile: '',
  })

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function toggleZone(z: string) {
    setForm((prev) => ({
      ...prev,
      zones: prev.zones.includes(z) ? prev.zones.filter((x) => x !== z) : [...prev.zones, z],
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0f7f5] flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 sm:p-14 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] border-2 border-[#22c55e]/30 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 14.5l6.5 6.5L23 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-[22px] font-extrabold text-[#0a2535] mb-3">Candidature envoyée</h2>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-8">
            Nous examinons votre dossier sous 24–48h. Un email de confirmation a été envoyé à <strong className="text-[#0a2535]">{form.email || 'votre adresse'}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-[#0d5068] hover:text-[#0a2535] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 7H3M5 3.5L1.5 7 5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f7f5]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="h-14 bg-white border-b border-gray-100 flex items-center px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#0d5068] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-[15px] font-extrabold text-[#0a2535]">Waluma</span>
        </Link>
        <span className="ml-3 text-gray-300">|</span>
        <span className="ml-3 text-[13px] text-gray-500 font-medium">Rejoindre le réseau</span>
      </nav>

      <div className="max-w-xl mx-auto px-5 py-10 sm:py-14">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-[#0a2535] tracking-tight mb-1.5">
            Devenez praticien Waluma.
          </h1>
          <p className="text-gray-500 text-[14px]">
            Remplissez ce formulaire en 5 minutes. Nous traitons votre dossier sous 48h.
          </p>
        </div>

        {/* STEPPER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${
                    step > s.n
                      ? 'bg-[#22c55e] text-white'
                      : step === s.n
                      ? 'bg-[#0d5068] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > s.n ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : s.n}
                </div>
                <span className={`text-[11px] hidden sm:block font-semibold ${step === s.n ? 'text-[#0a2535]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0d5068] to-[#22c55e] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

          {/* STEP 1 — INFOS PERSO */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Étape 1 · Informations personnelles</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => set('prenom', e.target.value)}
                    placeholder="Aminata"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Nom</label>
                  <input
                    value={form.nom}
                    onChange={(e) => set('nom', e.target.value)}
                    placeholder="Diallo"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Numéro de téléphone</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400">+221</span>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => set('telephone', e.target.value)}
                    placeholder="77 000 00 00"
                    className="w-full border border-gray-200 rounded-xl pl-14 pr-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Adresse email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="aminata@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Quartier / Adresse</label>
                <input
                  value={form.adresse}
                  onChange={(e) => set('adresse', e.target.value)}
                  placeholder="Almadies, Dakar"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — PROFIL PRO */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Étape 2 · Profil professionnel</div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-2">Spécialité</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALITES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('specialite', s.value)}
                      className={`text-left px-4 py-3 rounded-xl border text-[13px] font-medium transition-all ${
                        form.specialite === s.value
                          ? 'border-[#0d5068] bg-[#f0f7f5] text-[#0d5068] font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-[#0d5068]/30 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Années d'expérience</label>
                <select
                  value={form.experience}
                  onChange={(e) => set('experience', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] bg-white focus:ring-2 focus:ring-[#0d5068]/10 transition"
                >
                  <option value="">Sélectionner</option>
                  <option value="0-2">Moins de 2 ans</option>
                  <option value="2-5">2 à 5 ans</option>
                  <option value="5-10">5 à 10 ans</option>
                  <option value="10+">Plus de 10 ans</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-2">Zones d'intervention</label>
                <div className="flex flex-wrap gap-2">
                  {ZONES.map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => toggleZone(z)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border ${
                        form.zones.includes(z)
                          ? 'bg-[#0d5068] text-white border-[#0d5068]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#0d5068]/40'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
                {form.zones.length > 0 && (
                  <div className="text-[11px] text-[#0d5068] mt-2 font-semibold">
                    {form.zones.length} zone{form.zones.length > 1 ? 's' : ''} sélectionnée{form.zones.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — DOCUMENTS */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Étape 3 · Documents</div>
              <div className="bg-[#f0f7f5] rounded-xl p-4 text-[12.5px] text-gray-600 leading-relaxed">
                Tous vos documents sont chiffrés et conservés de manière sécurisée. Formats acceptés : PDF, JPG, PNG.
              </div>
              <FileInput
                label="Diplôme ou attestation professionnelle"
                hint="PDF ou image · max 10 Mo"
                file={form.diplome}
                onChange={(f) => set('diplome', f)}
              />
              <FileInput
                label="Pièce d'identité nationale (CNI)"
                hint="Recto-verso · PDF ou image"
                file={form.cni}
                onChange={(f) => set('cni', f)}
              />
              <FileInput
                label="Extrait de casier judiciaire"
                hint="Bulletin n°3 · moins de 3 mois"
                file={form.casier}
                onChange={(f) => set('casier', f)}
              />
            </div>
          )}

          {/* STEP 4 — PAIEMENT */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Étape 4 · Compte de paiement</div>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Vos revenus sont versés directement sur votre compte mobile après chaque mission.
              </p>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-2">Opérateur mobile money</label>
                <div className="space-y-2">
                  {OPERATEURS.map((op) => (
                    <button
                      key={op.value}
                      type="button"
                      onClick={() => set('operateur', op.value)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all ${
                        form.operateur === op.value
                          ? 'border-[#0d5068] bg-[#f0f7f5]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: op.color }}
                      />
                      <span className="font-semibold text-[14px] text-[#0a2535]">{op.label}</span>
                      {form.operateur === op.value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-[#0d5068] flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {form.operateur && (
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Numéro de téléphone associé</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-gray-400">+221</span>
                    <input
                      type="tel"
                      value={form.numeroMobile}
                      onChange={(e) => set('numeroMobile', e.target.value)}
                      placeholder="77 000 00 00"
                      className="w-full border border-gray-200 rounded-xl pl-14 pr-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                    />
                  </div>
                </div>
              )}

              {/* récap */}
              <div className="bg-[#f0f7f5] rounded-xl p-4 space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Récapitulatif</div>
                {[
                  { label: 'Nom', val: `${form.prenom} ${form.nom}`.trim() || '—' },
                  { label: 'Téléphone', val: form.telephone || '—' },
                  { label: 'Spécialité', val: SPECIALITES.find((s) => s.value === form.specialite)?.label || '—' },
                  { label: 'Zones', val: form.zones.length ? form.zones.join(', ') : '—' },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-[12.5px]">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-semibold text-[#0a2535] text-right max-w-[60%] truncate">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#0a2535] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Retour
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Annuler
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="bg-[#0d5068] hover:bg-[#0a3f52] text-white font-bold text-[13.5px] px-7 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                Suivant
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white font-bold text-[13.5px] px-7 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    Soumettre ma candidature
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M7.5 3.5L12 7l-4.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11.5px] text-gray-400 mt-6">
          En soumettant ce formulaire, vous acceptez nos{' '}
          <a href="/legal/cgu" className="text-[#0d5068] hover:underline">conditions d'utilisation</a>
          {' '}et notre{' '}
          <a href="/legal/confidentialite" className="text-[#0d5068] hover:underline">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  )
}
