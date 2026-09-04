export const metadata = {
  title: 'Politique de confidentialité — Waluma',
  description: 'Politique de confidentialité et protection des données personnelles de la plateforme Waluma.',
}

export default function PrivacyPage() {
  const lastUpdate = '3 septembre 2026'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <path d="M4 8L11 26L18 12L25 26L32 8" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-extrabold text-xl text-[#0d5068]">Waluma</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-sm text-gray-400">Dernière mise à jour : {lastUpdate}</p>
        </div>

        <div className="bg-[#e0f2fe] border border-[#0d5068]/20 rounded-xl px-5 py-4 mb-8 text-sm text-[#0d5068]">
          Waluma est une plateforme de mise en relation entre patients et professionnels de santé au Sénégal. Nous traitons des données de santé et prenons leur protection très au sérieux.
        </div>

        <div className="space-y-8 text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Responsable du traitement</h2>
            <p className="text-sm leading-relaxed">
              Waluma, plateforme de soins à domicile, domiciliée à Dakar, Sénégal.
              Contact : <a href="mailto:privacy@waluma.com" className="text-[#0d5068] hover:underline">privacy@waluma.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Données collectées</h2>
            <div className="text-sm leading-relaxed space-y-3">
              <p><strong>Données d&apos;identification :</strong> nom, prénom, numéro de téléphone.</p>
              <p><strong>Données de santé :</strong> nature des soins demandés, comptes rendus de soins, constantes vitales (température, tension, etc.). Ces données sont des données sensibles et bénéficient d&apos;une protection renforcée.</p>
              <p><strong>Données de localisation :</strong> position GPS lors de la demande de soin, afin de trouver le praticien le plus proche. La localisation n&apos;est collectée qu&apos;au moment de la demande, avec votre consentement explicite.</p>
              <p><strong>Données financières :</strong> numéro de téléphone Mobile Money (Wave, Orange Money, Free Money) pour les paiements. Aucune donnée bancaire n&apos;est stockée sur nos serveurs.</p>
              <p><strong>Photos :</strong> photos prises lors du compte rendu de soin par le praticien, avec votre accord.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Mise en relation avec un professionnel de santé disponible</li>
              <li>Suivi et historique des soins reçus</li>
              <li>Traitement des paiements via Mobile Money</li>
              <li>Envoi de notifications liées à votre mission de soin</li>
              <li>Amélioration de la qualité du service</li>
              <li>Respect de nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Base légale</h2>
            <p className="text-sm leading-relaxed">
              Le traitement de vos données est fondé sur votre consentement explicite lors de l&apos;inscription et de chaque demande de soin, ainsi que sur l&apos;exécution du contrat de service. Le traitement des données de santé repose sur votre consentement exprès, conformément à la loi n°2008-12 du 25 janvier 2008 sur la Protection des Données à Caractère Personnel au Sénégal et aux exigences de la Commission de Protection des Données Personnelles (CDP).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Partage des données</h2>
            <div className="text-sm leading-relaxed space-y-2">
              <p>Vos données sont partagées uniquement avec :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Le praticien assigné</strong> à votre mission de soin (nom, adresse, nature du soin)</li>
                <li><strong>Les opérateurs Mobile Money</strong> pour le traitement du paiement</li>
                <li><strong>Nos prestataires techniques</strong> (hébergement : Render, stockage fichiers : Cloudflare R2) dans le cadre de la fourniture du service</li>
              </ul>
              <p className="mt-2">Nous ne vendons jamais vos données à des tiers.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Durée de conservation</h2>
            <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
              <li>Données de compte : durée de vie du compte + 3 ans après clôture</li>
              <li>Données de santé (comptes rendus) : 10 ans conformément aux obligations légales médicales</li>
              <li>Données de localisation : supprimées 30 jours après la mission</li>
              <li>Logs techniques : 12 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Vos droits</h2>
            <div className="text-sm leading-relaxed space-y-2">
              <p>Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Droit d&apos;accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l&apos;effacement (dans les limites légales)</li>
                <li>Droit d&apos;opposition au traitement</li>
                <li>Droit à la portabilité de vos données</li>
              </ul>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@waluma.com" className="text-[#0d5068] hover:underline">privacy@waluma.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Sécurité</h2>
            <p className="text-sm leading-relaxed">
              Vos données sont protégées par chiffrement en transit (HTTPS/TLS) et au repos. L&apos;accès aux données de santé est strictement limité aux personnels autorisés. Nous appliquons le principe de minimisation des données : nous ne collectons que ce qui est strictement nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Cookies et tracking</h2>
            <p className="text-sm leading-relaxed">
              L&apos;application mobile Waluma n&apos;utilise pas de cookies de tracking tiers. Des données techniques minimales (sessions, logs d&apos;erreurs) sont collectées pour assurer le bon fonctionnement du service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Modifications</h2>
            <p className="text-sm leading-relaxed">
              Toute modification substantielle de cette politique vous sera notifiée par notification dans l&apos;application au moins 30 jours avant son entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contact et réclamations</h2>
            <p className="text-sm leading-relaxed">
              Pour toute question relative à vos données personnelles : <a href="mailto:privacy@waluma.com" className="text-[#0d5068] hover:underline">privacy@waluma.com</a><br/>
              Vous pouvez également déposer une réclamation auprès de la Commission de Protection des Données Personnelles du Sénégal (CDP).
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} Waluma · Dakar, Sénégal · <a href="mailto:privacy@waluma.com" className="hover:text-gray-600">privacy@waluma.com</a>
        </div>
      </div>
    </div>
  )
}