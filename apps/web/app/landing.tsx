import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Waluma — Soins à domicile à Dakar',
  description:
    'Un infirmier, médecin ou sage-femme chez vous en moins de 30 minutes. Waluma connecte patients et professionnels de santé vérifiés à Dakar.',
}

const SOINS = [
  {
    label: 'Soins infirmiers',
    prix: '8 000 F',
    desc: 'Injections, perfusions, pansements, suivi post-op.',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v16M2 10h16" stroke="#0d5068" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Médecin généraliste',
    prix: '15 000 F',
    desc: 'Consultation, prescription, avis médical à domicile.',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="4" stroke="#0d5068" strokeWidth="1.6"/>
        <path d="M3 18c0-3.86 3.13-7 7-7s7 3.14 7 7" stroke="#0d5068" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Prélèvement sanguin',
    prix: '5 000 F',
    desc: 'Bilan biologique, prise de sang, analyse rapide.',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3v10M7 10l3 4 3-4" stroke="#0d5068" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 17h10" stroke="#0d5068" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Kinésithérapie',
    prix: '12 000 F',
    desc: 'Rééducation, massage thérapeutique, douleur.',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6" stroke="#0d5068" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M10 7v3l2 1.5" stroke="#0d5068" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Sage-femme',
    prix: '12 000 F',
    desc: 'Suivi grossesse, post-natal, allaitement.',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C7.24 2 5 4.24 5 7c0 4 5 11 5 11s5-7 5-11c0-2.76-2.24-5-5-5z" stroke="#0d5068" strokeWidth="1.6"/>
        <circle cx="10" cy="7" r="1.5" fill="#0d5068"/>
      </svg>
    ),
  },
  {
    label: 'Pédiatre',
    prix: '15 000 F',
    desc: 'Consultation enfant, vaccination, développement.',
    svg: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6" r="3" stroke="#0d5068" strokeWidth="1.6"/>
        <path d="M6 12h8l-1 6H7l-1-6z" stroke="#0d5068" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const ETAPES = [
  { n: '01', titre: 'Choisissez', desc: 'Sélectionnez le soin parmi 6 spécialités dans l\'app.' },
  { n: '02', titre: 'On assigne', desc: 'Le praticien disponible le plus proche est notifié instantanément.' },
  { n: '03', titre: 'Suivez', desc: 'Tracez l\'arrivée en temps réel sur la carte.' },
  { n: '04', titre: 'Payez après', desc: 'Wave, Orange Money ou Free Money. Zéro avance.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-white/96 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#0d5068] flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="text-[16px] font-extrabold text-[#0a2535] tracking-tight">Waluma</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500">
            <a href="#comment" className="hover:text-[#0a2535] transition-colors">Comment ça marche</a>
            <a href="#soins" className="hover:text-[#0a2535] transition-colors">Nos soins</a>
            <a href="#confiance" className="hover:text-[#0a2535] transition-colors">Pourquoi nous</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-[12px] font-semibold text-gray-400 hover:text-[#0a2535] transition-colors px-3 py-1.5"
            >
              Admin
            </Link>
            <Link
              href="/rejoindre"
              className="text-[12.5px] font-bold bg-[#0d5068] hover:bg-[#0a3f52] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Rejoindre le réseau
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-14 bg-[#0a2535] relative overflow-hidden">
        {/* grille décorative subtile */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-0">
          {/* pill */}
          <div className="inline-flex items-center gap-2 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse flex-shrink-0" />
            <span className="text-[11.5px] font-semibold text-white/50 tracking-wide">Dakar · Sénégal · Lancement imminent</span>
          </div>

          {/* headline */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-20 items-end">
            <div>
              <h1 className="text-[52px] sm:text-[68px] lg:text-[80px] font-extrabold text-white leading-[.95] tracking-[-2px] mb-7">
                Des soins<br />
                <span className="text-[#22c55e]">à domicile,</span><br />
                où vous êtes.
              </h1>
              <p className="text-white/50 text-[16px] sm:text-[18px] leading-relaxed max-w-[500px] mb-10">
                Infirmiers, médecins et sages-femmes diplômés. Vérifiés par Waluma. Chez vous en moins de 30 minutes à Dakar.
              </p>
              <div className="flex flex-wrap gap-3 mb-14 lg:mb-20">
                <a
                  href="#telecharger"
                  className="inline-flex items-center gap-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-[14px] px-6 py-3.5 rounded-xl transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5v9M4.5 7.5l3.5 4 3.5-4M2.5 13h11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Télécharger l'app
                </a>
                <a
                  href="#comment"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold text-[14px] px-5 py-3.5 rounded-xl border border-white/12 hover:border-white/25 transition-all"
                >
                  Comment ça marche
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* carte praticien */}
            <div className="hidden lg:block pb-0 self-end">
              <div className="bg-white rounded-t-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f4f8] flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="6" r="3.5" stroke="#0d5068" strokeWidth="1.5"/>
                      <path d="M2.5 17c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="#0d5068" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#0a2535]">Dr. Aminata Diallo</div>
                    <div className="text-[11px] text-gray-400">Médecin généraliste · Almadies</div>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <div className="flex items-center gap-1 bg-[#f0fdf4] rounded-full px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      <span className="text-[10px] font-semibold text-[#16a34a]">Disponible</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Arrivée estimée', val: '18 min', accent: 'text-[#0d5068] font-bold' },
                    { label: 'Note', val: '4.9 / 5', accent: 'text-gray-700 font-semibold' },
                    { label: 'Missions réalisées', val: '312', accent: 'text-gray-700 font-semibold' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-center text-[12.5px]">
                      <span className="text-gray-400">{r.label}</span>
                      <span className={r.accent}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full bg-[#0d5068] hover:bg-[#0a3f52] text-white text-[13px] font-bold py-2.5 rounded-lg transition-colors">
                  Demander un soin
                </button>
              </div>
            </div>
          </div>

          {/* stats band */}
          <div className="grid grid-cols-3 border-t border-white/8 py-7 gap-4">
            {[
              { val: '+500', sub: 'Soins réalisés' },
              { val: '4.9 / 5', sub: 'Note moyenne' },
              { val: '30 min', sub: 'Délai d\'intervention' },
            ].map((s) => (
              <div key={s.sub}>
                <div className="text-[22px] sm:text-[28px] font-extrabold text-white leading-none">{s.val}</div>
                <div className="text-white/35 text-[11px] sm:text-[12px] mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment" className="py-24 bg-[#f0f7f5]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="max-w-lg mb-16">
            <h2 className="text-[34px] sm:text-[42px] font-extrabold text-[#0a2535] tracking-tight leading-tight mb-3">
              En 4 étapes,<br />un praticien chez vous.
            </h2>
            <p className="text-gray-500 text-[15px]">Simple, rapide, fiable. Tout se passe dans l'application.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#d1e8e2] rounded-2xl overflow-hidden">
            {ETAPES.map((e, i) => (
              <div
                key={e.n}
                className="bg-white p-7 flex flex-col gap-4"
                style={{ borderRadius: i === 0 ? '16px 0 0 16px' : i === 3 ? '0 16px 16px 0' : '0' }}
              >
                <div className="text-[36px] font-extrabold text-[#0d5068]/15 leading-none tracking-tighter">{e.n}</div>
                <div>
                  <div className="font-bold text-[15px] text-[#0a2535] mb-1.5">{e.titre}</div>
                  <div className="text-[13px] text-gray-500 leading-relaxed">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOINS */}
      <section id="soins" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mb-12">
            <div>
              <h2 className="text-[34px] sm:text-[42px] font-extrabold text-[#0a2535] tracking-tight leading-tight">
                Tous vos soins,<br />à domicile.
              </h2>
              <p className="text-gray-500 text-[15px] mt-2">Professionnels diplômés et vérifiés pour chaque besoin.</p>
            </div>
            <a
              href="#telecharger"
              className="flex-shrink-0 text-[13px] font-semibold text-[#0d5068] border border-[#0d5068]/20 hover:bg-[#f0f7f5] px-4 py-2 rounded-lg transition-colors"
            >
              Voir tous les soins →
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOINS.map((s) => (
              <div
                key={s.label}
                className="group flex gap-4 items-start p-5 rounded-2xl border border-gray-100 hover:border-[#0d5068]/20 hover:bg-[#f0f7f5]/50 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f0f7f5] group-hover:bg-[#d1e8e2] flex items-center justify-center flex-shrink-0 transition-colors">
                  {s.svg}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[14px] text-[#0a2535]">{s.label}</span>
                    <span className="ml-auto flex-shrink-0 text-[11.5px] font-semibold text-[#22c55e]">dès {s.prix}</span>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANCE */}
      <section id="confiance" className="py-24 bg-[#0a2535]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="text-[34px] sm:text-[42px] font-extrabold text-white tracking-tight leading-tight mb-14">
            Pourquoi Waluma.
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                titre: 'Praticiens vérifiés',
                desc: 'Diplôme, ordre professionnel, casier judiciaire. Chaque praticien est contrôlé avant d\'accéder à la plateforme.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.9 5.9H18l-4.9 3.5 1.9 5.9L10 14l-5 3.3 1.9-5.9L2 8h6.1L10 2z" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
              },
              {
                titre: 'En moins de 30 minutes',
                desc: 'Notre algorithme identifie le praticien disponible le plus proche. 7j/7, soins urgents et planifiés.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#22c55e" strokeWidth="1.5"/><path d="M10 5.5v4.5l3 1.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                titre: 'Dossier médical numérique',
                desc: 'Compte rendu après chaque intervention. Historique complet accessible depuis l\'app à tout moment.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke="#22c55e" strokeWidth="1.5"/><path d="M7 7h6M7 10.5h4M7 14h5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              },
              {
                titre: 'Payez seulement après',
                desc: 'Wave, Orange Money, Free Money. Zéro paiement en avance. Remboursement garanti en cas de problème.',
                icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="11" rx="2" stroke="#22c55e" strokeWidth="1.5"/><path d="M2 9h16" stroke="#22c55e" strokeWidth="1.5"/><circle cx="6" cy="13" r="1" fill="#22c55e"/></svg>,
              },
            ].map((v) => (
              <div key={v.titre} className="flex gap-5 p-7 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-[15px] mb-2">{v.titre}</div>
                  <p className="text-white/50 text-[13.5px] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉLÉCHARGEMENT */}
      <section id="telecharger" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="bg-[#0d5068] rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden relative">
            {/* deco */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/3 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/3 rounded-full translate-y-1/2" />

            <div className="relative lg:max-w-md">
              <div className="text-[#22c55e] text-[13px] font-bold mb-3 tracking-wide">Application mobile</div>
              <h2 className="text-[30px] sm:text-[38px] font-extrabold text-white leading-tight tracking-tight mb-4">
                Téléchargez Waluma.<br />Un praticien en 30s.
              </h2>
              <p className="text-white/55 text-[14px] leading-relaxed mb-8">
                Disponible sur iOS et Android. Compte créé en 30 secondes avec votre numéro de téléphone.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: 'App Store',
                    sub: 'Télécharger sur',
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
                  },
                  {
                    label: 'Google Play',
                    sub: 'Disponible sur',
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.24.13.51.19.79.15l12.19-7.03-2.54-2.54-10.44 9.42zm16.55-9.96L17.1 12l2.63-1.8 2.54 2.54-2.54 1.06zm-2.96 1.7L4.58 22.53c-.08.05-.16.08-.24.11l11.9-6.87 2.53-1.27zM3.18.24c-.29-.16-.6-.2-.91-.1l12.36 12.36-2.53 2.54L3 1.78A1.5 1.5 0 013.18.24z"/></svg>,
                  },
                ].map((btn) => (
                  <a
                    key={btn.label}
                    href="#"
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/18 border border-white/15 px-5 py-3 rounded-xl transition-colors"
                  >
                    {btn.icon}
                    <div>
                      <div className="text-[10px] text-white/50 leading-none">{btn.sub}</div>
                      <div className="text-[13px] font-bold text-white">{btn.label}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-6 min-w-[200px]">
                <div className="text-center mb-6">
                  <div className="text-[52px] font-extrabold text-white leading-none">30s</div>
                  <div className="text-white/40 text-[12px] mt-1">pour créer votre compte</div>
                </div>
                <div className="space-y-3">
                  {[
                    'Entrez votre numéro',
                    'Code reçu par SMS',
                    'Choisissez votre soin',
                  ].map((s, i) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-white/65 text-[12.5px]">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRATICIENS BAND */}
      <section className="py-14 border-t border-gray-100 bg-[#f0f7f5]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-extrabold text-[18px] text-[#0a2535]">Vous êtes professionnel de santé ?</div>
            <div className="text-[14px] text-gray-500 mt-1">Rejoignez le réseau Waluma. Développez votre activité. Fixez vos disponibilités.</div>
          </div>
          <Link
            href="/rejoindre"
            className="flex-shrink-0 bg-[#0a2535] hover:bg-[#0d5068] text-white font-bold text-[13.5px] px-6 py-3 rounded-xl transition-colors"
          >
            Rejoindre le réseau →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a2535] py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-2 mb-10 pb-10 border-b border-white/8">
            <span className="w-6 h-6 rounded-md bg-[#0d5068] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="text-[14px] font-extrabold text-white">Waluma</span>
            <span className="ml-auto text-white/25 text-[12px]">Soins à domicile · Dakar, Sénégal</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            {[
              {
                titre: 'Patients',
                liens: ['Comment ça marche', "Nos soins", "Télécharger l'app", 'Support'],
              },
              {
                titre: 'Praticiens',
                liens: ['Rejoindre Waluma', "Conditions d'exercice", 'Support praticien'],
              },
              {
                titre: 'Légal',
                liens: ['Mentions légales', 'Confidentialité', 'CGU', 'Espace admin'],
                hrefs: ['/legal/mentions-legales', '/legal/confidentialite', '/legal/cgu', '/login'],
              },
            ].map((col) => (
              <div key={col.titre}>
                <div className="text-[11px] font-bold text-white/30 mb-4 tracking-widest uppercase">{col.titre}</div>
                <div className="space-y-2.5">
                  {col.liens.map((l, i) => (
                    <div key={l}>
                      {col.hrefs ? (
                        <Link href={col.hrefs[i]} className="text-white/45 text-[13px] hover:text-white transition-colors">{l}</Link>
                      ) : (
                        <a href="#" className="text-white/45 text-[13px] hover:text-white transition-colors">{l}</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-white/20 text-[12px]">
            © {new Date().getFullYear()} Waluma. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
