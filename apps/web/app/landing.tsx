import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Waluma — Votre santé, à domicile. En quelques minutes.',
  description:
    'Waluma connecte patients et professionnels de santé à Dakar pour des soins à domicile rapides et fiables. Infirmiers, médecins, sages-femmes disponibles près de chez vous.',
}

const SPECIALITES = [
  { icon: '💉', label: 'Soins infirmiers', prix: 'dès 8 000 F', desc: 'Injections, perfusions, pansements, suivi post-opératoire.' },
  { icon: '🩺', label: 'Médecin généraliste', prix: 'dès 15 000 F', desc: 'Consultation, prescription, avis médical à domicile.' },
  { icon: '🧪', label: 'Prélèvement sanguin', prix: 'dès 5 000 F', desc: 'Bilan biologique, prise de sang, analyse rapide.' },
  { icon: '🤲', label: 'Kinésithérapie', prix: 'dès 12 000 F', desc: 'Rééducation, massage thérapeutique, traitement douleur.' },
  { icon: '👶', label: 'Sage-femme', prix: 'dès 12 000 F', desc: 'Suivi grossesse, consultation post-natale, allaitement.' },
  { icon: '🧒', label: 'Pédiatre', prix: 'dès 15 000 F', desc: 'Consultation enfant, vaccination, suivi développement.' },
]

const ETAPES = [
  { num: '1', titre: 'Choisissez votre soin', desc: 'Sélectionnez le type de soin dont vous avez besoin parmi notre liste de spécialités.' },
  { num: '2', titre: 'Un praticien est assigné', desc: 'Notre système trouve automatiquement le meilleur professionnel disponible près de chez vous.' },
  { num: '3', titre: 'Suivi en temps réel', desc: 'Suivez l\'arrivée de votre praticien sur la carte et restez informé à chaque étape.' },
  { num: '4', titre: 'Payez après le soin', desc: 'Réglez via Wave, Orange Money ou Free Money. Aucun paiement en avance requis.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="11" fill="#0d5068"/>
              <path d="M7 11h8M11 7v8" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            <span className="text-[17px] font-bold text-[#0d5068] tracking-tight">Waluma</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-gray-500">
            <a href="#comment" className="hover:text-[#0d5068] transition-colors">Comment ça marche</a>
            <a href="#soins" className="hover:text-[#0d5068] transition-colors">Nos soins</a>
            <a href="#confiance" className="hover:text-[#0d5068] transition-colors">Pourquoi nous</a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="hidden sm:block text-[13px] font-semibold text-gray-500 hover:text-[#0d5068] transition-colors px-3 py-1.5">
              Espace admin
            </Link>
            <a
              href="#telecharger"
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Télécharger l'app
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-[60px] bg-[#0d5068] overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-0 relative">

          {/* Badge disponibilité */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-white/75 text-[12.5px] font-medium">Disponible à Dakar · Sénégal</span>
          </div>

          {/* Headline principale */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-16 items-end pb-12 lg:pb-16">
            <div>
              <h1 className="text-[42px] sm:text-[54px] lg:text-[62px] font-extrabold text-white leading-[1.05] tracking-tight mb-5">
                Un praticien<br />
                chez vous en{' '}
                <span className="text-[#4ade80]">30 minutes.</span>
              </h1>
              <p className="text-white/60 text-[16px] sm:text-[18px] max-w-[520px] leading-relaxed mb-8">
                Waluma connecte patients et professionnels de santé diplômés à Dakar pour des soins rapides, fiables et sécurisés directement à domicile.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#telecharger"
                  className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold px-6 py-3 rounded-xl text-[15px] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 1.5v11M5 9l4 4 4-4M3 15.5h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Télécharger l'application
                </a>
                <a
                  href="#comment"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-[15px] transition-colors border border-white/15"
                >
                  Voir comment ça marche
                </a>
              </div>
            </div>

            {/* Stats verticales */}
            <div className="hidden lg:flex flex-col gap-5 pb-2">
              {[
                { val: '+500', label: 'Soins réalisés' },
                { val: '4.9★', label: 'Note moyenne' },
                { val: '< 30 min', label: 'Délai d'intervention' },
              ].map((s) => (
                <div key={s.label} className="text-right">
                  <div className="text-[28px] font-extrabold text-white leading-none">{s.val}</div>
                  <div className="text-white/45 text-[12px] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats mobiles */}
          <div className="lg:hidden grid grid-cols-3 gap-4 pb-10 border-t border-white/10 pt-8">
            {[
              { val: '+500', label: 'Soins réalisés' },
              { val: '4.9★', label: 'Note moyenne' },
              { val: '30 min', label: 'Délai moyen' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[22px] font-extrabold text-white leading-none">{s.val}</div>
                <div className="text-white/45 text-[11px] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bande spécialités en bas du hero */}
          <div className="flex gap-2 overflow-x-auto pb-0 scrollbar-none -mx-5 px-5 sm:-mx-8 sm:px-8 border-t border-white/10 pt-4">
            {SPECIALITES.map((s) => (
              <a
                key={s.label}
                href="#soins"
                className="flex-shrink-0 flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/10 rounded-lg px-3.5 py-2.5 transition-colors"
              >
                <span className="text-[18px]">{s.icon}</span>
                <span className="text-white/75 text-[12px] font-medium whitespace-nowrap">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section id="comment" className="py-20 sm:py-28 bg-[#f7f9fb]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="mb-14">
            <h2 className="text-[30px] sm:text-[36px] font-extrabold text-[#0f1923] tracking-tight leading-tight">
              Comment ça marche
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] max-w-md">
              Du choix du soin à la prise en charge, en quelques étapes simples.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ETAPES.map((e, i) => (
              <div key={e.num} className="relative">
                {/* Connecteur */}
                {i < ETAPES.length - 1 && (
                  <div className="hidden lg:block absolute top-[22px] left-[calc(100%+8px)] right-0 h-px bg-[#0d5068]/15 w-[calc(100%-20px)]" />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0d5068] text-white text-[15px] font-bold flex items-center justify-center flex-shrink-0">
                    {e.num}
                  </div>
                  <div className="h-px flex-1 bg-[#0d5068]/12 lg:hidden" />
                </div>
                <h3 className="font-bold text-[15px] text-[#0f1923] mb-2">{e.titre}</h3>
                <p className="text-gray-500 text-[13.5px] leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOINS ─── */}
      <section id="soins" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-[30px] sm:text-[36px] font-extrabold text-[#0f1923] tracking-tight leading-tight">
                Tous vos soins,<br />à domicile
              </h2>
              <p className="text-gray-500 mt-2 text-[15px]">
                Des professionnels diplômés et vérifiés pour chaque besoin.
              </p>
            </div>
            <a
              href="#telecharger"
              className="self-start sm:self-auto text-[13.5px] font-semibold text-[#0d5068] border border-[#0d5068]/25 hover:bg-[#0d5068]/5 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Voir tous les soins
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPECIALITES.map((s) => (
              <div
                key={s.label}
                className="group border border-gray-100 hover:border-[#0d5068]/20 bg-white hover:bg-[#e8f4f8]/30 rounded-2xl p-5 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e8f4f8] flex items-center justify-center text-[20px] mb-4">
                  {s.icon}
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-[15px] text-[#0f1923]">{s.label}</h3>
                  <span className="text-[12px] font-semibold text-[#22c55e] whitespace-nowrap flex-shrink-0">{s.prix}</span>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONFIANCE ─── */}
      <section id="confiance" className="py-20 sm:py-28 bg-[#0d5068]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="mb-14">
            <h2 className="text-[30px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight">
              Pourquoi choisir Waluma
            </h2>
            <p className="text-white/55 mt-2 text-[15px]">
              La santé à domicile mérite le meilleur niveau de sérieux.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 2L14 8l6.5 1-4.8 4.5L17 20 11 17l-6 3 1.3-6.5L1.5 9 8 8l3-6z" stroke="#22c55e" strokeWidth="1.6" strokeLinejoin="round"/>
                  </svg>
                ),
                titre: 'Praticiens vérifiés',
                desc: 'Tous nos professionnels de santé sont diplômés et vérifiés par notre équipe. Diplôme, ordre professionnel, antécédents — rien n\'est laissé au hasard.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="9" stroke="#22c55e" strokeWidth="1.6"/>
                    <path d="M11 6v5l3 2" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                ),
                titre: 'Intervention en 30 minutes',
                desc: 'En moins de 30 minutes, un praticien qualifié est chez vous. Disponible 7j/7 pour les soins urgents et les consultations planifiées.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="4" width="16" height="14" rx="2.5" stroke="#22c55e" strokeWidth="1.6"/>
                    <path d="M7 9h8M7 13h5" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                ),
                titre: 'Compte rendu médical',
                desc: 'À la fin de chaque soin, un compte rendu détaillé est généré et archivé dans votre dossier médical numérique, accessible à tout moment.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="6" width="16" height="11" rx="2.5" stroke="#22c55e" strokeWidth="1.6"/>
                    <path d="M7 6V5a4 4 0 018 0v1" stroke="#22c55e" strokeWidth="1.6"/>
                    <circle cx="11" cy="12" r="1.5" fill="#22c55e"/>
                  </svg>
                ),
                titre: 'Paiement sécurisé',
                desc: 'Payez via Mobile Money (Wave, Orange, Free) uniquement après le soin. Aucun paiement en avance. Remboursement garanti en cas de problème.',
              },
            ].map((v) => (
              <div key={v.titre} className="flex gap-5 bg-white/8 border border-white/10 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px] mb-1.5">{v.titre}</h3>
                  <p className="text-white/55 text-[13.5px] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA TÉLÉCHARGEMENT ─── */}
      <section id="telecharger" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="bg-[#f7f9fb] border border-gray-100 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="lg:max-w-lg">
              <h2 className="text-[28px] sm:text-[36px] font-extrabold text-[#0f1923] tracking-tight leading-tight mb-4">
                Téléchargez Waluma
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                Disponible sur iOS et Android. Créez votre compte en 2 minutes et accédez à tous nos praticiens près de chez vous.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="flex items-center gap-3 bg-[#0f1923] hover:bg-[#1a2535] text-white px-5 py-3.5 rounded-xl transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] text-white/60 leading-none">Télécharger sur</div>
                    <div className="text-[14px] font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 bg-[#0f1923] hover:bg-[#1a2535] text-white px-5 py-3.5 rounded-xl transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M3.18 23.76c.24.13.51.19.79.15l12.19-7.03-2.54-2.54-10.44 9.42zm16.55-9.96L17.1 12l2.63-1.8 2.54 2.54-2.54 1.06zm-2.96 1.7L4.58 22.53c-.08.05-.16.08-.24.11l11.9-6.87 2.53-1.27zM3.18.24c-.29-.16-.6-.2-.91-.1l12.36 12.36-2.53 2.54L3 1.78A1.5 1.5 0 013.18.24z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] text-white/60 leading-none">Disponible sur</div>
                    <div className="text-[14px] font-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-[#0d5068] rounded-2xl px-10 py-8 text-center flex-shrink-0">
              <div className="text-[48px] font-extrabold text-white leading-none">30s</div>
              <div className="text-white/50 text-[12px] mt-1 mb-5">pour créer votre compte</div>
              <div className="space-y-2.5 text-left">
                {['Numéro de téléphone', 'Code de vérification', 'C\'est prêt'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-white/70 text-[13px]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRATICIENS : REJOINDRE ─── */}
      <section className="py-16 bg-[#f7f9fb] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-[18px] text-[#0f1923]">Vous êtes professionnel de santé ?</h3>
            <p className="text-gray-500 text-[14px] mt-1">Rejoignez le réseau Waluma et développez votre activité.</p>
          </div>
          <Link
            href="/rejoindre"
            className="flex-shrink-0 bg-[#0d5068] hover:bg-[#0a3f52] text-white font-bold text-[14px] px-6 py-3 rounded-xl transition-colors"
          >
            Rejoindre le réseau
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0f1923] py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="11" fill="#0d5068"/>
                <path d="M7 11h8M11 7v8" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <span className="text-[16px] font-bold text-white">Waluma</span>
            </div>
            <p className="text-white/35 text-[13px]">
              Soins de santé à domicile à Dakar, Sénégal.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="text-white/40 text-[11px] font-semibold mb-3 uppercase tracking-wider">Patients</div>
              <div className="space-y-2">
                {['Comment ça marche', 'Nos soins', 'Télécharger l\'app', 'Support'].map((l) => (
                  <div key={l}><a href="#" className="text-white/55 text-[13px] hover:text-white transition-colors">{l}</a></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/40 text-[11px] font-semibold mb-3 uppercase tracking-wider">Praticiens</div>
              <div className="space-y-2">
                {['Rejoindre Waluma', 'Conditions d\'exercice', 'Support praticien'].map((l) => (
                  <div key={l}><a href="#" className="text-white/55 text-[13px] hover:text-white transition-colors">{l}</a></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white/40 text-[11px] font-semibold mb-3 uppercase tracking-wider">Entreprise</div>
              <div className="space-y-2">
                {['À propos', 'Mentions légales', 'Politique de confidentialité', 'Espace admin'].map((l, i) => (
                  <div key={l}>
                    {i === 3
                      ? <Link href="/login" className="text-white/55 text-[13px] hover:text-white transition-colors">{l}</Link>
                      : <a href="#" className="text-white/55 text-[13px] hover:text-white transition-colors">{l}</a>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-white/25 text-[12px]">
            © {new Date().getFullYear()} Waluma. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
