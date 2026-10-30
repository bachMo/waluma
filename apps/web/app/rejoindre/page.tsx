'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────────────────
   Données
   ────────────────────────────────────────────────────────────── */

/** tarif = prix de départ du soin affiché aux patients ; le praticien
 *  conserve 90 %, Waluma prélève 10 % de frais de service. */
const SPECIALITES = [
  { value: 'INFIRMIER', label: 'Infirmier / IDE', tarif: 8000 },
  { value: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste', tarif: 15000 },
  { value: 'SAGE_FEMME', label: 'Sage-femme', tarif: 12000 },
  { value: 'KINESITHERAPEUTE', label: 'Kinésithérapeute', tarif: 12000 },
  { value: 'PRELEVEUR', label: 'Préleveur / euse', tarif: 5000 },
  { value: 'PEDIATRE', label: 'Pédiatre', tarif: 15000 },
  { value: 'AUTRE', label: 'Autre spécialité', tarif: 0 },
]

const ZONES = [
  'Plateau', 'Médina', 'Almadies', 'Mermoz', 'Ouakam', 'Yoff',
  'Liberté', 'HLM', 'Grand Dakar', 'Pikine', 'Guédiawaye', 'Rufisque',
]

const EXPERIENCES = [
  { value: '0-2', label: 'Moins de 2 ans' },
  { value: '2-5', label: '2 à 5 ans' },
  { value: '5-10', label: '5 à 10 ans' },
  { value: '10+', label: 'Plus de 10 ans' },
]

const OPERATEURS = [
  { value: 'WAVE', label: 'Wave', teinte: '#1C7CF2' },
  { value: 'ORANGE_MONEY', label: 'Orange Money', teinte: '#F07A13' },
  { value: 'FREE_MONEY', label: 'Free Money', teinte: '#C8303A' },
]

const STEPS = [
  { n: 1, label: 'Identité' },
  { n: 2, label: 'Profil' },
  { n: 3, label: 'Documents' },
  { n: 4, label: 'Paiement' },
]

const COMMISSION = 0.1

interface FormState {
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

const VIDE: FormState = {
  prenom: '', nom: '', telephone: '', email: '', adresse: '',
  specialite: '', experience: '', zones: [],
  diplome: null, cni: null, casier: null,
  operateur: '', numeroMobile: '',
}

const fcfa = (n: number) => n.toLocaleString('fr-FR').replace(/ | /g, ' ')

/* ──────────────────────────────────────────────────────────────
   Primitives
   ────────────────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#0B3B4A]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-[#7A8F96]">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-[#D8E3DE] bg-white px-4 py-3 text-[15px] text-[#0B3B4A] outline-none transition placeholder:text-[#A8B8BD] focus:border-[#0D5068] focus:ring-4 focus:ring-[#0D5068]/10'

function FileRow({
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
    <div
      className={`rounded-xl border p-4 transition ${
        file ? 'border-[#B8DFC6] bg-[#F3FAF5]' : 'border-[#D8E3DE] bg-white'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
            file ? 'bg-[#DCF2E4] text-[#15803D]' : 'bg-[#EEF4F2] text-[#0D5068]'
          }`}
        >
          {file ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.5 9.5l3.5 3.5L14.5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3h9l4 4v14H6z" />
              <path d="M15 3v4h4" />
            </svg>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-[#0B3B4A]">{label}</p>
          <p className="mt-0.5 truncate text-[12.5px] text-[#4A6670]">
            {file ? `${file.name} · ${(file.size / 1024).toFixed(0)} Ko` : hint}
          </p>
        </div>

        <input
          ref={ref}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              if (ref.current) ref.current.value = ''
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#4A6670] transition-colors hover:bg-white hover:text-[#0B3B4A]"
          >
            Retirer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 shrink-0 rounded-lg border border-[#D8E3DE] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#0D5068] transition-colors hover:border-[#0D5068]"
          >
            Choisir
          </button>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────── */

export default function RejoindrePage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(VIDE)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function toggleZone(z: string) {
    setForm((p) => ({
      ...p,
      zones: p.zones.includes(z) ? p.zones.filter((x) => x !== z) : [...p.zones, z],
    }))
  }

  const spec = SPECIALITES.find((s) => s.value === form.specialite)

  const complet: Record<number, boolean> = {
    1: Boolean(form.prenom && form.nom && form.telephone),
    2: Boolean(form.specialite && form.experience && form.zones.length),
    3: Boolean(form.diplome && form.cni),
    4: Boolean(form.operateur && form.numeroMobile),
  }

  async function handleSubmit() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setLoading(false)
    setSubmitted(true)
  }

  /* ─── Écran de confirmation ─────────────────────────────── */
  if (submitted) {
    return (
      <div
        className="grid min-h-screen place-items-center bg-[#EEF4F2] px-5 py-16"
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <div className="w-full max-w-lg rounded-[24px] border border-[#CFE3DB] bg-white p-9 sm:p-12">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#DCF2E4] text-[#15803D]">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <path d="M5 13.5l6 6L21 6.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <h1
            className="mt-7 text-[28px] font-bold leading-tight tracking-[-.03em] text-[#0B3B4A]"
            style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
            Candidature reçue, {form.prenom}.
          </h1>

          <p className="mt-3 text-[15.5px] leading-[1.65] text-[#4A6670]">
            Nous vérifions votre diplôme, votre inscription à l&apos;ordre et votre casier.
            C&apos;est la partie qui prend le plus de temps, et c&apos;est aussi ce qui fait
            que les patients nous ouvrent leur porte.
          </p>

          <ol className="mt-8 space-y-4 border-t border-[#E3EAE7] pt-7">
            {[
              { t: 'Sous 72 heures', d: 'Un membre de l’équipe vous appelle au ' + (form.telephone ? '+221 ' + form.telephone : 'numéro indiqué') + ', quelle que soit la décision.' },
              { t: 'Si c’est un oui', d: 'Vous recevez vos accès à l’application praticien et vous choisissez vos premiers créneaux.' },
              { t: 'Si un document manque', d: 'Nous vous disons précisément lequel. Vous reprenez là où vous en étiez.' },
            ].map((e, i) => (
              <li key={e.t} className="flex gap-3.5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EEF4F2] text-[11.5px] font-semibold text-[#0D5068]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold text-[#0B3B4A]">{e.t}</p>
                  <p className="mt-0.5 text-[13.5px] leading-snug text-[#4A6670]">{e.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link
            href="/"
            className="mt-9 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0D5068] transition-colors hover:text-[#0B3B4A]"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M12 7.5H4M7 4.5l-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  /* ─── Formulaire ────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen bg-white text-[#0B3B4A]"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* NAV */}
      <header className="border-b border-[#E3EAE7]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Waluma, accueil">
            <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-[#0D5068]">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M6.5 1.5v10M1.5 6.5h10" stroke="#5EE090" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span
              className="text-[18px] font-bold tracking-[-.02em] text-[#0B3B4A]"
              style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              Waluma
            </span>
          </Link>
          <span className="ml-auto text-[13.5px] text-[#4A6670]">
            Déjà praticien&nbsp;?{' '}
            <Link href="/login" className="font-semibold text-[#0D5068] hover:underline">
              Se connecter
            </Link>
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-16 lg:py-16">
        {/* ─── Panneau gauche : l'argument ──────────────────── */}
        <aside className="lg:sticky lg:top-12 lg:self-start">
          <h1
            className="text-[clamp(30px,4.6vw,44px)] font-bold leading-[1.06] tracking-[-.035em] text-[#0B3B4A]"
            style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          >
            Vos soins, vos quartiers, vos horaires.
          </h1>

          <p className="mt-5 max-w-[44ch] text-[16px] leading-[1.65] text-[#4A6670]">
            Waluma vous envoie les demandes qui correspondent à votre spécialité et aux
            zones que vous avez choisies. Vous acceptez ce que vous voulez.
          </p>

          <dl className="mt-9 space-y-5 border-t border-[#E3EAE7] pt-8">
            {[
              { t: 'Vous gardez 90 % du soin', d: 'Waluma prélève 10 % de frais de service. Aucun abonnement, aucun frais d’inscription.' },
              { t: 'Payé par mobile money', d: 'Wave, Orange Money ou Free Money, sur le numéro que vous indiquez.' },
              { t: 'Vous choisissez vos créneaux', d: 'Vous êtes indisponible ? Vous ne recevez pas de demande. Pas de pénalité.' },
            ].map((e) => (
              <div key={e.t} className="flex gap-3.5">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#DCF2E4] text-[#15803D]">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <dt className="text-[14.5px] font-semibold text-[#0B3B4A]">{e.t}</dt>
                  <dd className="mt-1 text-[13.5px] leading-[1.6] text-[#4A6670]">{e.d}</dd>
                </div>
              </div>
            ))}
          </dl>

          <p className="mt-8 rounded-xl bg-[#F6F3EC] px-4 py-3.5 text-[13px] leading-[1.6] text-[#6B5A3E]">
            Prévoyez votre diplôme et votre pièce d&apos;identité en photo ou en PDF. Le
            formulaire prend une dizaine de minutes.
          </p>
        </aside>

        {/* ─── Colonne droite : le formulaire ───────────────── */}
        <div>
          {/* Progression nommée, pas des points anonymes */}
          <div className="mb-9">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[14px] font-semibold text-[#0B3B4A]">
                Étape {step} sur {STEPS.length}
                <span className="ml-2 font-normal text-[#4A6670]">
                  {STEPS[step - 1].label}
                </span>
              </p>
              <p className="text-[13px] text-[#7A8F96]">
                {STEPS.filter((s) => complet[s.n]).length} / {STEPS.length} complétées
              </p>
            </div>

            <ol className="grid grid-cols-4 gap-1.5">
              {STEPS.map((s) => {
                const actif = s.n === step
                const fait = complet[s.n] && s.n < step
                return (
                  <li key={s.n}>
                    <button
                      type="button"
                      onClick={() => s.n < step && setStep(s.n)}
                      disabled={s.n > step}
                      aria-current={actif ? 'step' : undefined}
                      className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 h-1.5 w-full rounded-full transition-colors ${
                        fait ? 'bg-[#15A34A]' : actif ? 'bg-[#0D5068]' : 'bg-[#E3EAE7]'
                      } ${s.n < step ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="sr-only">{s.label}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* ── ÉTAPE 1 — Identité ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2
                  className="text-[22px] font-bold tracking-[-.025em] text-[#0B3B4A]"
                  style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                >
                  Faisons connaissance
                </h2>
                <p className="mt-1.5 text-[14.5px] text-[#4A6670]">
                  Le nom qui apparaîtra aux patients est celui de votre diplôme.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom">
                  <input
                    className={inputCls}
                    value={form.prenom}
                    onChange={(e) => set('prenom', e.target.value)}
                    placeholder="Fatou"
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Nom">
                  <input
                    className={inputCls}
                    value={form.nom}
                    onChange={(e) => set('nom', e.target.value)}
                    placeholder="Ndiaye"
                    autoComplete="family-name"
                  />
                </Field>
              </div>

              <Field label="Téléphone" hint="C'est sur ce numéro que nous vous appellerons.">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#7A8F96]">
                    +221
                  </span>
                  <input
                    className={`${inputCls} pl-[62px]`}
                    value={form.telephone}
                    onChange={(e) => set('telephone', e.target.value.replace(/[^\d ]/g, ''))}
                    placeholder="77 123 45 67"
                    inputMode="tel"
                    autoComplete="tel-national"
                  />
                </div>
              </Field>

              <Field label="Email" hint="Facultatif, mais utile pour vous envoyer vos accès.">
                <input
                  className={inputCls}
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="fatou.ndiaye@email.com"
                  autoComplete="email"
                />
              </Field>

              <Field label="Quartier de résidence" hint="Nous vous proposons en priorité les demandes proches de chez vous.">
                <input
                  className={inputCls}
                  value={form.adresse}
                  onChange={(e) => set('adresse', e.target.value)}
                  placeholder="Mermoz, Dakar"
                />
              </Field>
            </div>
          )}

          {/* ── ÉTAPE 2 — Profil ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="text-[22px] font-bold tracking-[-.025em] text-[#0B3B4A]"
                  style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                >
                  Votre spécialité
                </h2>
                <p className="mt-1.5 text-[14.5px] text-[#4A6670]">
                  Celle de votre diplôme principal.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {SPECIALITES.map((s) => {
                  const on = form.specialite === s.value
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('specialite', s.value)}
                      aria-pressed={on}
                      className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 rounded-xl border px-4 py-3.5 text-left text-[14.5px] font-medium transition ${
                        on
                          ? 'border-[#0D5068] bg-[#EEF4F2] text-[#0B3B4A] ring-4 ring-[#0D5068]/8'
                          : 'border-[#D8E3DE] bg-white text-[#4A6670] hover:border-[#0D5068]'
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>

              {/* Le moment où on donne l'info qui décide : l'économie réelle du soin */}
              {spec && spec.tarif > 0 && (
                <div className="rounded-xl border border-[#CFE3DB] bg-[#EEF4F2] p-5">
                  <p className="text-[13px] font-semibold text-[#0D5068]">
                    Ce que vous percevez sur ce type de soin
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-end gap-x-8 gap-y-3">
                    <div>
                      <p className="text-[12.5px] text-[#4A6670]">Soin facturé au patient</p>
                      <p
                        className="mt-0.5 text-[20px] font-bold tracking-[-.02em] text-[#0B3B4A]"
                        style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                      >
                        {fcfa(spec.tarif)} F
                      </p>
                    </div>
                    <div>
                      <p className="text-[12.5px] text-[#4A6670]">Frais de service Waluma</p>
                      <p className="mt-0.5 text-[20px] font-semibold tracking-[-.02em] text-[#7A8F96]">
                        −{fcfa(spec.tarif * COMMISSION)} F
                      </p>
                    </div>
                    <div>
                      <p className="text-[12.5px] font-medium text-[#15803D]">Vous recevez</p>
                      <p
                        className="mt-0.5 text-[20px] font-bold tracking-[-.02em] text-[#15803D]"
                        style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                      >
                        {fcfa(spec.tarif * (1 - COMMISSION))} F
                      </p>
                    </div>
                  </div>
                  <p className="mt-3.5 text-[12px] leading-snug text-[#4A6670]">
                    Montant de départ, déplacement compris. Un soin plus long ou de nuit est
                    facturé davantage.
                  </p>
                </div>
              )}

              <Field label="Années d'expérience">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {EXPERIENCES.map((x) => {
                    const on = form.experience === x.value
                    return (
                      <button
                        key={x.value}
                        type="button"
                        onClick={() => set('experience', x.value)}
                        aria-pressed={on}
                        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 rounded-xl border px-3 py-2.5 text-[13.5px] font-medium transition ${
                          on
                            ? 'border-[#0D5068] bg-[#EEF4F2] text-[#0B3B4A]'
                            : 'border-[#D8E3DE] bg-white text-[#4A6670] hover:border-[#0D5068]'
                        }`}
                      >
                        {x.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field
                label="Zones où vous pouvez intervenir"
                hint={
                  form.zones.length
                    ? `${form.zones.length} zone${form.zones.length > 1 ? 's' : ''} sélectionnée${form.zones.length > 1 ? 's' : ''}`
                    : 'Sélectionnez au moins une zone.'
                }
              >
                <div className="flex flex-wrap gap-2">
                  {ZONES.map((z) => {
                    const on = form.zones.includes(z)
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => toggleZone(z)}
                        aria-pressed={on}
                        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13.5px] font-medium transition ${
                          on
                            ? 'border-[#0D5068] bg-[#0D5068] text-white'
                            : 'border-[#D8E3DE] bg-white text-[#4A6670] hover:border-[#0D5068]'
                        }`}
                      >
                        {on && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6.2l2.6 2.6L10 3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {z}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </div>
          )}

          {/* ── ÉTAPE 3 — Documents ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2
                  className="text-[22px] font-bold tracking-[-.025em] text-[#0B3B4A]"
                  style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                >
                  Vos justificatifs
                </h2>
                <p className="mt-1.5 max-w-[52ch] text-[14.5px] leading-[1.6] text-[#4A6670]">
                  PDF ou photo, lisible. C&apos;est la vérification de ces pièces qui
                  rassure les familles au moment d&apos;ouvrir leur porte.
                </p>
              </div>

              <div className="space-y-3">
                <FileRow
                  label="Diplôme d'État"
                  hint="Obligatoire · PDF, JPG ou PNG"
                  file={form.diplome}
                  onChange={(f) => set('diplome', f)}
                />
                <FileRow
                  label="Pièce d'identité"
                  hint="Obligatoire · CNI ou passeport"
                  file={form.cni}
                  onChange={(f) => set('cni', f)}
                />
                <FileRow
                  label="Casier judiciaire"
                  hint="Facultatif maintenant, demandé avant validation"
                  file={form.casier}
                  onChange={(f) => set('casier', f)}
                />
              </div>

              <p className="rounded-xl bg-[#F6F3EC] px-4 py-3.5 text-[12.5px] leading-[1.6] text-[#6B5A3E]">
                Vos documents servent uniquement à vérifier votre droit d&apos;exercer. Ils
                ne sont jamais montrés aux patients ni transmis à des tiers.
              </p>
            </div>
          )}

          {/* ── ÉTAPE 4 — Paiement + récapitulatif ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2
                  className="text-[22px] font-bold tracking-[-.025em] text-[#0B3B4A]"
                  style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                >
                  Où vous envoyer vos paiements
                </h2>
                <p className="mt-1.5 text-[14.5px] text-[#4A6670]">
                  Versés après chaque soin validé par le patient.
                </p>
              </div>

              <Field label="Opérateur">
                <div className="grid gap-2 sm:grid-cols-3">
                  {OPERATEURS.map((o) => {
                    const on = form.operateur === o.value
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => set('operateur', o.value)}
                        aria-pressed={on}
                        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-[14px] font-medium transition ${
                          on
                            ? 'border-[#0D5068] bg-[#EEF4F2] text-[#0B3B4A] ring-4 ring-[#0D5068]/8'
                            : 'border-[#D8E3DE] bg-white text-[#4A6670] hover:border-[#0D5068]'
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: o.teinte }}
                        />
                        {o.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label="Numéro mobile money" hint="Souvent le même que votre téléphone.">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#7A8F96]">
                    +221
                  </span>
                  <input
                    className={`${inputCls} pl-[62px]`}
                    value={form.numeroMobile}
                    onChange={(e) => set('numeroMobile', e.target.value.replace(/[^\d ]/g, ''))}
                    placeholder="77 123 45 67"
                    inputMode="tel"
                  />
                </div>
              </Field>

              {/* Récapitulatif */}
              <div className="rounded-xl border border-[#D8E3DE] bg-white">
                <p className="border-b border-[#E3EAE7] px-5 py-3.5 text-[13px] font-semibold text-[#0B3B4A]">
                  Ce que vous nous envoyez
                </p>
                <dl className="divide-y divide-[#EDF2F0]">
                  {[
                    { k: 'Nom', v: `${form.prenom} ${form.nom}`.trim() || '—' },
                    { k: 'Téléphone', v: form.telephone ? `+221 ${form.telephone}` : '—' },
                    { k: 'Spécialité', v: spec?.label ?? '—' },
                    { k: 'Expérience', v: EXPERIENCES.find((x) => x.value === form.experience)?.label ?? '—' },
                    { k: 'Zones', v: form.zones.length ? form.zones.join(', ') : '—' },
                    {
                      k: 'Documents',
                      v: [form.diplome && 'diplôme', form.cni && 'pièce d’identité', form.casier && 'casier']
                        .filter(Boolean)
                        .join(', ') || '—',
                    },
                  ].map((r) => (
                    <div key={r.k} className="flex gap-4 px-5 py-3">
                      <dt className="w-28 shrink-0 text-[13px] text-[#7A8F96]">{r.k}</dt>
                      <dd className="text-[13.5px] text-[#0B3B4A]">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* ─── Navigation ───────────────────────────────── */}
          <div className="mt-9 flex items-center gap-3 border-t border-[#E3EAE7] pt-7">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 rounded-xl border border-[#D8E3DE] bg-white px-5 py-3.5 text-[14.5px] font-semibold text-[#0B3B4A] transition-colors hover:border-[#0D5068]"
              >
                Retour
              </button>
            )}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!complet[step]}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 flex-1 rounded-xl bg-[#0D5068] px-5 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#0B3B4A] disabled:cursor-not-allowed disabled:bg-[#C6D4D0] sm:flex-none sm:px-7"
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!complet[4] || loading}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-[#15A34A] px-5 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#12803C] disabled:cursor-not-allowed disabled:bg-[#C6D4D0] sm:flex-none sm:px-7"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {loading ? 'Envoi en cours' : 'Envoyer ma candidature'}
              </button>
            )}

            {!complet[step] && step < STEPS.length && (
              <p className="ml-1 text-[12.5px] text-[#7A8F96]">
                {step === 1 && 'Prénom, nom et téléphone requis'}
                {step === 2 && 'Spécialité, expérience et une zone requis'}
                {step === 3 && 'Diplôme et pièce d’identité requis'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
