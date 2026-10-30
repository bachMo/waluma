import Link from 'next/link'
import type { Metadata } from 'next'
import MapDakar from '@/components/ui/MapDakar'

export const metadata: Metadata = {
  title: 'Waluma — Un soignant qualifié, chez vous.',
  description:
    'Waluma envoie un professionnel de santé vérifié à votre porte, à Dakar, en moins de 30 minutes. Infirmiers, médecins, sages-femmes, kinés. Vous payez après le soin.',
}

/* ──────────────────────────────────────────────────────────────
   Contenu
   ────────────────────────────────────────────────────────────── */

const ETAPES = [
  {
    n: 1,
    titre: 'Vous décrivez le besoin',
    desc: 'Le soin, l’adresse, le moment. Trois écrans, pas de compte à créer avant.',
  },
  {
    n: 2,
    titre: 'Waluma trouve le soignant',
    desc: 'Le praticien vérifié le plus proche et disponible reçoit la demande.',
  },
  {
    n: 3,
    titre: 'Vous suivez son trajet',
    desc: 'Son nom, sa spécialité, sa position. Vous savez qui sonne à votre porte.',
  },
  {
    n: 4,
    titre: 'Vous payez après le soin',
    desc: 'Wave, Orange Money ou Free Money. Jamais avant, jamais de carte bancaire.',
  },
]

const SOINS = [
  {
    nom: 'Soins infirmiers',
    desc: 'Pansements, injections, perfusions, prise de constantes',
    prix: '8 000',
    courant: true,
    icon: (
      <>
        <path d="M14.5 3.5l6 6M17 6L6.5 16.5 4 22l5.5-2.5L20 9" />
        <path d="M11 9l4 4" />
      </>
    ),
  },
  {
    nom: 'Médecin généraliste',
    desc: 'Consultation, diagnostic, ordonnance',
    prix: '15 000',
    icon: (
      <>
        <path d="M5 3v6a5 5 0 0010 0V3" />
        <path d="M10 14v2a4 4 0 008 0v-1" />
        <circle cx="19" cy="13" r="2" />
      </>
    ),
  },
  {
    nom: 'Prélèvement',
    desc: 'Prise de sang, analyses à domicile',
    prix: '5 000',
    icon: (
      <>
        <path d="M9 3h6" />
        <path d="M10 3v12a2 2 0 004 0V3" />
        <path d="M10 10h4" />
      </>
    ),
  },
  {
    nom: 'Kinésithérapie',
    desc: 'Rééducation, massages thérapeutiques',
    prix: '12 000',
    icon: (
      <>
        <path d="M8 13V5.5a1.5 1.5 0 013 0V12" />
        <path d="M11 11V4.5a1.5 1.5 0 013 0V12" />
        <path d="M14 11.5V6.5a1.5 1.5 0 013 0V14" />
        <path d="M17 10.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1.5a5.5 5.5 0 01-5.5-5.5V13" />
      </>
    ),
  },
  {
    nom: 'Sage-femme',
    desc: 'Suivi de grossesse, post-partum, nouveau-né',
    prix: '12 000',
    icon: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5.5 21c0-4 2.9-7 6.5-7s6.5 3 6.5 7" />
        <path d="M15.5 17.5c1 0 1.8.8 1.8 1.8s-.8 1.7-1.8 1.7" />
      </>
    ),
  },
  {
    nom: 'Pédiatre',
    desc: 'Consultation enfant, suivi du développement',
    prix: '15 000',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M9.5 7.5h.01M14.5 7.5h.01" />
      </>
    ),
  },
]

const CONFIANCE = [
  {
    titre: 'Trois contrôles avant d’exercer',
    desc: 'Diplôme, inscription à l’ordre professionnel et casier judiciaire. Un dossier incomplet ne passe pas.',
    icon: (
      <>
        <path d="M12 3l7 3v5.5c0 4.5-3 8.3-7 9.5-4-1.2-7-5-7-9.5V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    titre: 'Un compte rendu après chaque soin',
    desc: 'Ce qui a été fait, par qui, quand. Conservé dans votre espace et consultable par votre médecin traitant.',
    icon: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9.5 12h6M9.5 16h4" />
      </>
    ),
  },
  {
    titre: 'Vous payez une fois le soin fait',
    desc: 'Le montant est annoncé avant l’intervention. Vous réglez ensuite par mobile money, jamais de carte bancaire.',
    icon: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <path d="M2.5 10h19" />
        <path d="M6 14h3" />
      </>
    ),
  },
]

const ZONES = [
  'Plateau', 'Médina', 'Almadies', 'Mermoz', 'Ouakam', 'Yoff',
  'Liberté', 'HLM', 'Grand Dakar', 'Pikine', 'Guédiawaye', 'Rufisque',
]

const CHIFFRES = [
  { val: '6', label: 'spécialités' },
  { val: '+30', label: 'praticiens vérifiés' },
  { val: '30 min', label: 'délai d’intervention' },
  { val: '12', label: 'zones couvertes' },
]

/* ──────────────────────────────────────────────────────────────
   Primitives
   ────────────────────────────────────────────────────────────── */

function Icon({ children, size = 22 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function Wordmark({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-[#0D5068]">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <path d="M6.5 1.5v10M1.5 6.5h10" stroke="#5EE090" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span
        className={`text-[18px] font-bold tracking-[-.02em] ${tone === 'light' ? 'text-white' : 'text-[#0B3B4A]'}`}
        style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
      >
        Waluma
      </span>
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div
      className="bg-white text-[#0B3B4A]"
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      {/* La séquence d'arrivée du hero : joue une fois, puis reste à l'état final.
          Les états de base sont les états FINAUX, donc prefers-reduced-motion
          (animation: none) affiche directement la carte résolue. */}
      <style>{`
        @keyframes wal-seek   { 0%,62% { opacity:1 } 100% { opacity:0 } }
        @keyframes wal-land   { 0%,55% { opacity:0; transform:translateY(6px) } 100% { opacity:1; transform:none } }
        @keyframes wal-fill   { 0%,62% { width:0% }  100% { width:64% } }
        @keyframes wal-breathe{ 0%,100% { opacity:1 } 50% { opacity:.35 } }

        .wal-seek    { opacity:0; animation: wal-seek 2.1s ease-in forwards }
        .wal-land    { animation: wal-land 2.6s cubic-bezier(.2,.8,.2,1) forwards }
        .wal-fill    { width:64%; animation: wal-fill 3.4s cubic-bezier(.3,.9,.3,1) forwards }
        .wal-breathe { animation: wal-breathe 1.4s ease-in-out infinite }
        .wal-b2      { animation-delay:.2s }
        .wal-b3      { animation-delay:.4s }

        @media (prefers-reduced-motion: reduce) {
          .wal-seek, .wal-land, .wal-fill, .wal-breathe { animation: none }
        }
        html { scroll-behavior: smooth }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#E3EAE7] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="Waluma, accueil">
            <Wordmark />
          </Link>

          <nav className="ml-4 hidden items-center gap-7 text-[14px] text-[#4A6670] md:flex">
            <a className="transition-colors hover:text-[#0B3B4A]" href="#comment">Comment ça marche</a>
            <a className="transition-colors hover:text-[#0B3B4A]" href="#soins">Soins et tarifs</a>
            <a className="transition-colors hover:text-[#0B3B4A]" href="#confiance">Confiance</a>
            <a className="transition-colors hover:text-[#0B3B4A]" href="#zones">Zones</a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/rejoindre"
              className="hidden rounded-xl px-3.5 py-2 text-[13.5px] font-semibold text-[#0D5068] transition-colors hover:bg-[#EEF4F2] sm:block"
            >
              Je suis soignant
            </Link>
            <a
              href="#telecharger"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5068] focus-visible:ring-offset-2 rounded-xl bg-[#0D5068] px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0B3B4A]"
            >
              Télécharger l&apos;app
            </a>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* voile mint très léger, aucun dégradé décoratif appuyé */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[#EEF4F2]"
          style={{ clipPath: 'ellipse(130% 100% at 72% 0%)' }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-14 pb-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:pt-20 lg:pb-24">
          {/* colonne texte */}
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#CFE3DB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#0D5068]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#15A34A]" />
              Dakar, 7 jours sur 7
            </p>

            <h1
              className="text-[clamp(40px,8.2vw,74px)] font-bold leading-[.98] tracking-[-.035em] text-[#0B3B4A]"
              style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              Un soignant
              <br />
              qualifié,
              <br />
              chez vous.
            </h1>

            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.65] text-[#4A6670]">
              Waluma envoie un professionnel de santé vérifié à votre porte en moins de
              trente minutes. Vous voyez qui vient, ce que ça coûte, et vous payez une
              fois le soin terminé.
            </p>

            <div id="telecharger" className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#0B3B4A] px-5 py-3.5 text-white transition-colors hover:bg-[#072C38]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42z" />
                </svg>
                <span className="text-left leading-tight">
                  <span className="block text-[10.5px] text-white/60">Télécharger sur</span>
                  <span className="block text-[14.5px] font-semibold">App Store</span>
                </span>
              </a>

              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-xl border border-[#D8E3DE] bg-white px-5 py-3.5 text-[#0B3B4A] transition-colors hover:border-[#0D5068]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.18.24a1.55 1.55 0 00-.18.75v22.02c0 .27.07.52.18.75l9.75-9.76L3.18.24z" fill="#34A853" />
                  <path d="M20.82 10.33L18.1 8.78l-2.69 2.7 2.69 2.7 2.74-1.57a1.55 1.55 0 000-2.28z" fill="#FBBC04" />
                  <path d="M3.18 23.76c.38.2.82.2 1.21 0l10.76-6.17-2.4-2.4-9.57 8.57z" fill="#EA4335" />
                  <path d="M13.15 12L4.39.24 3.18.24l9.57 11.76 2.48-2.7L13.15 12z" fill="#4285F4" />
                </svg>
                <span className="text-left leading-tight">
                  <span className="block text-[10.5px] text-[#7A8F96]">Disponible sur</span>
                  <span className="block text-[14.5px] font-semibold">Google Play</span>
                </span>
              </a>
            </div>
          </div>

          {/* colonne carte : la séquence d'arrivée */}
          <div className="relative lg:pl-6">
            <div className="relative mx-auto w-full max-w-[400px] rounded-[22px] border border-[#DCE7E2] bg-white p-5 shadow-[0_24px_60px_-28px_rgba(11,59,74,.28)]">
              {/* en-tête de la demande */}
              <div className="flex items-start justify-between gap-4 border-b border-[#EDF2F0] pb-4">
                <div>
                  <p className="text-[12.5px] text-[#7A8F96]">Votre demande</p>
                  <p className="mt-1 text-[15.5px] font-semibold text-[#0B3B4A]">Soins infirmiers</p>
                  <p className="mt-0.5 text-[13px] text-[#4A6670]">Mermoz &middot; dès que possible</p>
                </div>
                <span className="shrink-0 rounded-lg bg-[#FDF3E4] px-2.5 py-1 text-[11.5px] font-semibold text-[#9E5F13]">
                  Urgent
                </span>
              </div>

              {/* zone de résolution : les deux couches sont empilées */}
              <div className="relative mt-4 min-h-[132px]">
                {/* couche 1 — recherche */}
                <div className="wal-seek absolute inset-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2.5">
                    <span className="wal-breathe h-2 w-2 rounded-full bg-[#0D5068]" />
                    <span className="wal-breathe wal-b2 h-2 w-2 rounded-full bg-[#0D5068]" />
                    <span className="wal-breathe wal-b3 h-2 w-2 rounded-full bg-[#0D5068]" />
                  </div>
                  <p className="mt-3.5 text-[14px] text-[#4A6670]">
                    Recherche d&apos;un praticien près de Mermoz…
                  </p>
                </div>

                {/* couche 2 — praticien trouvé, en route */}
                <div className="wal-land">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0D5068] text-[14px] font-semibold text-white">
                      FN
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-[#0B3B4A]">Fatou Ndiaye</p>
                        <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[#9E5F13]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="#E0912F" aria-hidden="true">
                            <path d="M6 .8l1.6 3.3 3.6.5-2.6 2.6.6 3.6L6 9.1l-3.2 1.7.6-3.6L.8 4.6l3.6-.5L6 .8z" />
                          </svg>
                          4,9
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] text-[#4A6670]">
                        Infirmière IDE &middot; 412 soins réalisés
                      </p>
                    </div>
                  </div>

                  {/* progression du trajet */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-baseline justify-between">
                      <p className="text-[13px] text-[#4A6670]">En route vers vous</p>
                      <p className="text-[13.5px] font-semibold text-[#0B3B4A]">arrive dans 8 min</p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#EDF2F0]">
                      <div className="wal-fill h-full rounded-full bg-[#15A34A]" />
                    </div>
                  </div>

                  {/* pied : vérification + montant */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#EDF2F0] pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#15803D]">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M7 1.5l4.5 2v3.3c0 2.7-1.9 5-4.5 5.7-2.6-.7-4.5-3-4.5-5.7V3.5L7 1.5z" stroke="#15803D" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M5.3 7l1.3 1.3L9 5.9" stroke="#15803D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Diplôme vérifié
                    </span>
                    <span className="text-[13px] text-[#4A6670]">
                      <span className="font-semibold text-[#0B3B4A]">8 000 F</span> après le soin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bande chiffres */}
        <div className="border-y border-[#E3EAE7] bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-8 md:grid-cols-4">
            {CHIFFRES.map((c, i) => (
              <div
                key={c.label}
                className={`py-6 md:py-7 ${i % 2 === 1 ? 'border-l border-[#E3EAE7] pl-6' : 'md:border-l md:border-[#E3EAE7] md:pl-6'} ${i < 2 ? 'border-b border-[#E3EAE7] md:border-b-0' : ''} ${i === 0 ? 'md:border-l-0 md:pl-0' : ''}`}
              >
                <p
                  className="text-[26px] font-bold tracking-[-.02em] text-[#0B3B4A] sm:text-[30px]"
                  style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                >
                  {c.val}
                </p>
                <p className="mt-1 text-[13.5px] text-[#4A6670]">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="comment" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <h2
          className="max-w-[20ch] text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.08] tracking-[-.03em] text-[#0B3B4A]"
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
        >
          De la demande au soin, quatre étapes.
        </h2>
        <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.65] text-[#4A6670]">
          Tout se passe dans l&apos;application. Pas d&apos;appel à passer, pas de salle
          d&apos;attente.
        </p>

        {/* piste séquentielle : la numérotation est justifiée, c'est un ordre réel */}
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {ETAPES.map((e, i) => (
            <li key={e.n} className="relative">
              {/* trait de liaison, desktop seulement */}
              {i < ETAPES.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[34px] top-[13px] hidden h-px w-[calc(100%-34px)] bg-[#DCE7E2] lg:block"
                />
              )}
              <div className="relative mb-5 grid h-7 w-7 place-items-center rounded-full border border-[#CFE3DB] bg-white text-[12.5px] font-semibold text-[#0D5068]">
                {e.n}
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-.01em] text-[#0B3B4A]">
                {e.titre}
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#4A6670]">{e.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── SOINS ET TARIFS ─────────────────────────────────── */}
      <section id="soins" className="border-t border-[#E3EAE7] bg-[#F6F3EC]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2
                className="text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.08] tracking-[-.03em] text-[#0B3B4A]"
                style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
              >
                Six soins, tarifs annoncés.
              </h2>
              <p className="mt-4 max-w-[42ch] text-[16.5px] leading-[1.65] text-[#4A6670]">
                Le prix affiché est le prix de départ du soin, déplacement compris. Le
                montant exact vous est confirmé avant que le praticien se mette en route.
              </p>
              <p className="mt-6 text-[14px] text-[#7A8F96]">
                Un soin que vous ne trouvez pas ici&nbsp;? Décrivez-le dans
                l&apos;application, nous cherchons le bon profil.
              </p>
            </div>

            {/* liste de prix, pas une grille de cartes : c'est ce qu'on veut scanner */}
            <ul className="divide-y divide-[#E2DDD2] border-y border-[#E2DDD2]">
              {SOINS.map((s) => (
                <li
                  key={s.nom}
                  className="group flex items-center gap-4 py-5 transition-colors hover:bg-white/60 sm:gap-5 sm:py-6"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#E2DDD2] bg-white text-[#0D5068] transition-colors group-hover:border-[#CFE3DB]">
                    <Icon>{s.icon}</Icon>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <h3 className="text-[16px] font-semibold tracking-[-.01em] text-[#0B3B4A]">
                        {s.nom}
                      </h3>
                      {s.courant && (
                        <span className="rounded-md bg-[#FDF3E4] px-2 py-0.5 text-[11px] font-semibold text-[#9E5F13]">
                          le plus demandé
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[14px] leading-snug text-[#4A6670]">{s.desc}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[11.5px] text-[#7A8F96]">dès</p>
                    <p
                      className="text-[17px] font-bold tracking-[-.01em] text-[#0B3B4A]"
                      style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
                    >
                      {s.prix}
                      <span className="ml-0.5 text-[13px] font-medium text-[#4A6670]">F</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CONFIANCE ───────────────────────────────────────── */}
      <section id="confiance" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <h2
          className="max-w-[24ch] text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.08] tracking-[-.03em] text-[#0B3B4A]"
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
        >
          Laisser entrer quelqu&apos;un chez soi, ça se mérite.
        </h2>
        <p className="mt-4 max-w-[54ch] text-[16.5px] leading-[1.65] text-[#4A6670]">
          C&apos;est pour ça que la vérification n&apos;est pas une case à cocher chez nous.
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {CONFIANCE.map((c) => (
            <div key={c.titre}>
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-[#EEF4F2] text-[#0D5068]">
                <Icon size={24}>{c.icon}</Icon>
              </span>
              <h3 className="text-[17.5px] font-semibold leading-snug tracking-[-.01em] text-[#0B3B4A]">
                {c.titre}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-[1.65] text-[#4A6670]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ZONES ───────────────────────────────────────────── */}
      <section id="zones" className="border-y border-[#E3EAE7] bg-[#EEF4F2]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <h2
              className="text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.08] tracking-[-.03em] text-[#0B3B4A]"
              style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
            >
              Douze zones, de Plateau à Rufisque.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[16.5px] leading-[1.65] text-[#4A6670]">
              Nos praticiens interviennent depuis leur propre quartier. C&apos;est ce qui
              nous permet de tenir les trente minutes.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {ZONES.map((z) => (
                <li
                  key={z}
                  className="rounded-lg border border-[#CFE3DB] bg-white px-3 py-1.5 text-[13.5px] font-medium text-[#0B3B4A]"
                >
                  {z}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#CFE3DB] bg-white shadow-[0_20px_50px_-30px_rgba(11,59,74,.3)]">
            <MapDakar />
          </div>
        </div>
      </section>

      {/* ─── BANDE PRATICIEN ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[26px] bg-[#0B3B4A] px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
            <div>
              <h2
                className="text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.1] tracking-[-.03em] text-white"
                style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
              >
                Vous êtes infirmier, sage-femme, kiné&nbsp;?
              </h2>
              <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.65] text-white/70">
                Choisissez vos quartiers, vos horaires, vos types de soins. Waluma vous
                envoie les demandes qui correspondent et vous paie par mobile money.
              </p>

              <Link
                href="/rejoindre"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-[14.5px] font-semibold text-[#0B3B4A] transition-colors hover:bg-[#EEF4F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B3B4A]"
              >
                Déposer ma candidature
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M3 7.5h8M8 4.5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <ol className="space-y-5 border-t border-white/12 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              {[
                { t: 'Vous remplissez le formulaire', d: 'Dix minutes, diplôme et pièce d’identité à portée de main.' },
                { t: 'Nous étudions le dossier', d: 'Vérification du diplôme, de l’ordre et du casier.' },
                { t: 'Réponse sous 72 heures', d: 'Un membre de l’équipe vous appelle, quelle que soit la décision.' },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[11.5px] font-semibold text-white/80">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[14.5px] font-semibold text-white">{s.t}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-white/55">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-[#E3EAE7] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Wordmark />
              <p className="mt-4 max-w-[34ch] text-[14px] leading-[1.65] text-[#4A6670]">
                Des soins à domicile à Dakar, assurés par des professionnels de santé
                vérifiés.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {[
                  { label: 'Facebook', d: 'M13.5 9h2V6h-2c-1.7 0-3 1.3-3 3v1.5H9V13h1.5v5h2.5v-5H15l.5-2.5h-2.5V9.5c0-.3.2-.5.5-.5z' },
                  { label: 'Instagram', d: 'M8 5h8a3 3 0 013 3v8a3 3 0 01-3 3H8a3 3 0 01-3-3V8a3 3 0 013-3zm4 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM16.5 7.5h.01' },
                  { label: 'LinkedIn', d: 'M6.5 9.5v8M6.5 6.5v.01M11 17.5v-8M11 13c0-2 1.3-3.5 3-3.5s3 1.5 3 3.5v4.5' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-[#E3EAE7] text-[#4A6670] transition-colors hover:border-[#0D5068] hover:text-[#0D5068]"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              { titre: 'Soins', liens: SOINS.map((s) => s.nom) },
              { titre: 'Waluma', liens: ['Comment ça marche', 'Confiance', 'Zones couvertes', 'Devenir praticien'] },
              { titre: 'Légal', liens: ['Confidentialité', 'Conditions d’utilisation', 'Mentions légales', 'Nous contacter'] },
            ].map((col) => (
              <div key={col.titre}>
                <p className="mb-4 text-[13.5px] font-semibold text-[#0B3B4A]">{col.titre}</p>
                <ul className="space-y-2.5">
                  {col.liens.map((l) => (
                    <li key={l}>
                      <Link
                        href={l === 'Devenir praticien' ? '/rejoindre' : l === 'Confidentialité' ? '/privacy' : '#'}
                        className="text-[13.5px] text-[#4A6670] transition-colors hover:text-[#0D5068]"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-[#E3EAE7] pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#7A8F96]">
              © {new Date().getFullYear()} Waluma. Dakar, Sénégal.
            </p>
            <p className="text-[13px] text-[#7A8F96]">
              Waluma ne remplace pas les urgences. En cas d&apos;urgence vitale, appelez le 15.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
