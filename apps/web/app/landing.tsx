import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Waluma — Votre santé, à domicile. En quelques minutes.',
  description: 'Waluma connecte patients et professionnels de santé à Dakar pour des soins à domicile rapides et fiables. Infirmiers, médecins, sages-femmes disponibles près de chez vous.',
}

const SPECIALITES = [
  { icon: '💉', label: 'Soins infirmiers', prix: 'dès 8 000 F' },
  { icon: '🩺', label: 'Médecin généraliste', prix: 'dès 15 000 F' },
  { icon: '🧪', label: 'Prélèvement', prix: 'dès 5 000 F' },
  { icon: '🤲', label: 'Kinésithérapie', prix: 'dès 12 000 F' },
  { icon: '👶', label: 'Sage-femme', prix: 'dès 12 000 F' },
  { icon: '🧒', label: 'Pédiatre', prix: 'dès 15 000 F' },
]

const ETAPES = [
  { num: '01', titre: 'Choisissez votre soin', desc: 'Sélectionnez le type de soin dont vous avez besoin parmi notre liste de spécialités.' },
  { num: '02', titre: 'Un praticien vous est assigné', desc: 'Notre système trouve automatiquement le meilleur professionnel disponible près de chez vous.' },
  { num: '03', titre: 'Suivi en temps réel', desc: 'Suivez l\'arrivée de votre praticien sur la carte et restez informé à chaque étape.' },
  { num: '04', titre: 'Payez en toute sécurité', desc: 'Réglez via Wave, Orange Money ou Free Money directement depuis l\'application.' },
]

const VALEURS = [
  { icon: '🛡️', titre: 'Praticiens vérifiés', desc: 'Tous nos professionnels de santé sont diplômés et vérifiés par notre équipe avant d\'être acceptés sur la plateforme.' },
  { icon: '⚡', titre: 'Réponse rapide', desc: 'En moins de 30 minutes, un praticien qualifié est chez vous. Disponible 7j/7 pour les soins urgents.' },
  { icon: '📋', titre: 'Compte rendu médical', desc: 'À la fin de chaque soin, un compte rendu détaillé est généré et archivé dans votre dossier médical numérique.' },
  { icon: '💳', titre: 'Paiement sécurisé', desc: 'Payez via Mobile Money (Wave, Orange, Free) après le soin. Aucun paiement en avance requis.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💚</span>
            <span className="text-xl font-extrabold text-[#0d5068] tracking-tight">Waluma</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <a href="#comment" className="hover:text-[#0d5068] transition">Comment ça marche</a>
            <a href="#soins" className="hover:text-[#0d5068] transition">Nos soins</a>
            <a href="#valeurs" className="hover:text-[#0d5068] transition">Pourquoi Waluma</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-gray-500 hover:text-[#0d5068] transition hidden md:block">
              Espace admin
            </Link>
            <a href="#telecharger" className="bg-[#22c55e] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#16a34a] transition">
              Télécharger
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-[#0d5068] via-[#0a3f52] to-[#061e28] relative overflow-hidden">
        {/* Décorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-semibold">Disponible à Dakar · Bientôt dans tout le Sénégal</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Votre santé,{' '}
            <span className="text-[#4ade80]">à domicile.</span>
            <br />En quelques minutes.
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Waluma connecte patients et professionnels de santé qualifiés pour des soins rapides, fiables et sécurisés directement chez vous à Dakar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" id="telecharger">
            <a href="#" className="flex items-center gap-3 bg-white text-[#0d5068] font-bold px-6 py-4 rounded-2xl hover:bg-gray-50 transition shadow-xl shadow-black/20 w-full sm:w-auto justify-center">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <div className="text-xs text-gray-400 font-normal">Télécharger sur</div>
                <div>App Store</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 bg-white text-[#0d5068] font-bold px-6 py-4 rounded-2xl hover:bg-gray-50 transition shadow-xl shadow-black/20 w-full sm:w-auto justify-center">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <div className="text-xs text-gray-400 font-normal">Disponible sur</div>
                <div>Google Play</div>
              </div>
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-white/50 text-sm">
            {[
              { val: '6', label: 'Spécialités' },
              { val: '+30', label: 'Praticiens vérifiés' },
              { val: '<30 min', label: 'Temps de réponse' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-white">{s.val}</div>
                <div>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section id="comment" className="py-24 px-6 bg-[#f5f4ef]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#22c55e] text-sm font-bold uppercase tracking-widest mb-3">Simple et rapide</div>
            <h2 className="text-4xl font-extrabold text-[#0d5068] tracking-tight">Comment ça marche ?</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {ETAPES.map((e, i) => (
              <div key={e.num} className="relative">
                {i < ETAPES.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%_-_1rem)] w-full h-0.5 bg-gradient-to-r from-[#0d5068]/30 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#0d5068] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#0d5068]/30">
                    <span className="text-2xl font-extrabold text-[#4ade80]">{e.num}</span>
                  </div>
                  <h3 className="font-bold text-[#0d5068] mb-2">{e.titre}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOINS ─── */}
      <section id="soins" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#22c55e] text-sm font-bold uppercase tracking-widest mb-3">Nos spécialités</div>
            <h2 className="text-4xl font-extrabold text-[#0d5068] tracking-tight">Des soins pour chaque besoin</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Tous nos praticiens sont diplômés et vérifiés. Ils se déplacent directement à votre domicile à Dakar.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SPECIALITES.map(sp => (
              <div key={sp.label} className="bg-[#f5f4ef] rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition group">
                <span className="text-4xl mb-3">{sp.icon}</span>
                <div className="font-bold text-[#0d5068] mb-1 group-hover:text-[#22c55e] transition">{sp.label}</div>
                <div className="text-sm text-gray-400 font-semibold">{sp.prix}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">+ frais de déplacement selon la zone · Les tarifs peuvent varier selon le praticien</p>
        </div>
      </section>

      {/* ─── VALEURS ─── */}
      <section id="valeurs" className="py-24 px-6 bg-gradient-to-br from-[#0d5068] to-[#083d50]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#4ade80] text-sm font-bold uppercase tracking-widest mb-3">Nos engagements</div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Pourquoi choisir Waluma ?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALEURS.map(v => (
              <div key={v.titre} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{v.titre}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-[#0d5068] tracking-tight mb-4">
            Prenez soin de vous,<br />
            <span className="text-[#22c55e]">on s'occupe du reste.</span>
          </h2>
          <p className="text-gray-500 mb-10">Téléchargez Waluma et réservez votre premier soin à domicile en moins de 2 minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="flex items-center gap-3 bg-[#0d5068] text-white font-bold px-6 py-4 rounded-2xl hover:bg-[#0a3f52] transition w-full sm:w-auto justify-center">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <div className="text-xs text-white/50 font-normal">Télécharger sur</div>
                <div>App Store</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 bg-[#0d5068] text-white font-bold px-6 py-4 rounded-2xl hover:bg-[#0a3f52] transition w-full sm:w-auto justify-center">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <div className="text-xs text-white/50 font-normal">Disponible sur</div>
                <div>Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#061e28] text-white/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💚</span>
                <span className="text-lg font-extrabold text-white">Waluma</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Des soins à domicile professionnels et rapides à Dakar. Bientôt dans tout le Sénégal et en Afrique.
              </p>
              <div className="flex gap-3">
                {[
                  { label: 'Facebook', icon: 'f', href: '#' },
                  { label: 'Instagram', icon: '📸', href: '#' },
                  { label: 'LinkedIn', icon: 'in', href: '#' },
                  { label: 'X', icon: '✕', href: '#' },
                ].map(r => (
                  <a key={r.label} href={r.href} aria-label={r.label}
                    className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold text-white hover:bg-[#22c55e] hover:text-white transition">
                    {r.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Soins</div>
              <ul className="space-y-2 text-sm">
                {['Soins infirmiers', 'Médecin généraliste', 'Prélèvement', 'Kinésithérapie', 'Sage-femme', 'Pédiatre'].map(s => (
                  <li key={s}><a href="#soins" className="hover:text-white transition">{s}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Liens utiles</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#comment" className="hover:text-white transition">Comment ça marche</a></li>
                <li><a href="#valeurs" className="hover:text-white transition">Pourquoi Waluma</a></li>
                <li><Link href="/legal/cgu" className="hover:text-white transition">CGU</Link></li>
                <li><Link href="/legal/confidentialite" className="hover:text-white transition">Politique de confidentialité</Link></li>
                <li><Link href="/legal/mentions-legales" className="hover:text-white transition">Mentions légales</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-white transition">Politique de cookies</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact</div>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:contact@waluma.app" className="hover:text-white transition">contact@waluma.app</a></li>
                <li><a href="mailto:support@waluma.app" className="hover:text-white transition">support@waluma.app</a></li>
                <li className="text-white/30 text-xs pt-2">Dakar, Sénégal</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <span>© {new Date().getFullYear()} Waluma. Tous droits réservés.</span>
            <div className="flex gap-4">
              <Link href="/legal/cgu" className="hover:text-white transition">CGU</Link>
              <Link href="/legal/confidentialite" className="hover:text-white transition">Confidentialité</Link>
              <Link href="/legal/cookies" className="hover:text-white transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}