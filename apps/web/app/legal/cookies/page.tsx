import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Cookies — Waluma',
}

export default function Cookies() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-[#0d5068] mb-2">Politique de Cookies</h1>
        <p className="text-gray-400 text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Qu'est-ce qu'un cookie ?</h2>
          <p className="text-gray-600 leading-relaxed">Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences pour une durée définie, afin de ne pas avoir à les saisir à nouveau lors de vos prochaines visites.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Cookies utilisés par Waluma</h2>

          <h3 className="font-bold text-gray-800 mb-2 mt-4">Cookies strictement nécessaires</h3>
          <p className="text-gray-600 leading-relaxed mb-3">Ces cookies sont indispensables au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600 border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-[#f5f4ef] text-[#0d5068] font-bold">
                <tr>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Finalité</th>
                  <th className="text-left p-3">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="p-3 font-mono text-xs">auth_token</td>
                  <td className="p-3">Maintien de la session utilisateur</td>
                  <td className="p-3">7 jours</td>
                </tr>
                <tr className="border-t border-gray-100 bg-[#f5f4ef]/50">
                  <td className="p-3 font-mono text-xs">refresh_token</td>
                  <td className="p-3">Renouvellement automatique de la session</td>
                  <td className="p-3">30 jours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-gray-800 mb-2 mt-6">Cookies de performance (analytiques)</h3>
          <p className="text-gray-600 leading-relaxed">Ces cookies nous permettent de comprendre comment vous utilisez la plateforme afin de l'améliorer. Ils sont utilisés de manière anonyme et agrégée. Vous pouvez les refuser sans impact sur votre expérience.</p>

          <h3 className="font-bold text-gray-800 mb-2 mt-6">Cookies tiers</h3>
          <p className="text-gray-600 leading-relaxed">Waluma peut utiliser des services tiers (Google Maps pour la cartographie) qui peuvent déposer leurs propres cookies. Nous vous invitons à consulter les politiques de confidentialité de ces services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Gestion de vos préférences</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Vous pouvez gérer vos préférences en matière de cookies de plusieurs façons :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Via les paramètres de votre navigateur web (pour le back-office)</li>
            <li>Via les paramètres de confidentialité de votre appareil (pour l'application mobile)</li>
            <li>En nous contactant directement à <a href="mailto:contact@waluma.app" className="text-[#0d5068] underline">contact@waluma.app</a></li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">Notez que la désactivation de certains cookies peut affecter le bon fonctionnement de la plateforme.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Mise à jour de cette politique</h2>
          <p className="text-gray-600 leading-relaxed">Cette politique peut être mise à jour en fonction de l'évolution de nos services ou de la réglementation applicable. La date de dernière mise à jour est indiquée en haut de ce document.</p>
        </section>
      </div>
    </article>
  )
}