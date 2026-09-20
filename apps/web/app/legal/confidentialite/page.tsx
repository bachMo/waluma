import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Waluma',
}

export default function Confidentialite() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-[#0d5068] mb-2">Politique de Confidentialité</h1>
        <p className="text-gray-400 text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">1. Responsable du traitement</h2>
          <p className="text-gray-600 leading-relaxed">La société Waluma, dont le siège est à Dakar (Sénégal), est responsable du traitement de vos données personnelles. Contact : <a href="mailto:contact@waluma.app" className="text-[#0d5068] underline">contact@waluma.app</a></p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">2. Données collectées</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li><strong>Données d'identité :</strong> nom, prénom, numéro de téléphone</li>
            <li><strong>Données de localisation :</strong> adresse du domicile, position GPS lors des soins (avec votre consentement)</li>
            <li><strong>Données médicales :</strong> comptes rendus de soins, constantes vitales, historique des interventions</li>
            <li><strong>Données de paiement :</strong> numéro Mobile Money, montants des transactions (aucun numéro de carte bancaire n'est stocké)</li>
            <li><strong>Données techniques :</strong> type d'appareil, système d'exploitation, token de notification push</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">3. Finalités du traitement</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Vos données sont utilisées pour :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Mettre en relation patients et praticiens</li>
            <li>Assurer le suivi en temps réel des soins</li>
            <li>Générer les comptes rendus médicaux</li>
            <li>Traiter les paiements</li>
            <li>Vous envoyer des notifications liées à vos soins</li>
            <li>Améliorer nos services et assurer la sécurité de la plateforme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">4. Base légale</h2>
          <p className="text-gray-600 leading-relaxed">Le traitement de vos données est fondé sur l'exécution du contrat de service (utilisation de l'application), votre consentement (localisation GPS, notifications push) et nos obligations légales.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">5. Conservation des données</h2>
          <p className="text-gray-600 leading-relaxed">Vos données personnelles sont conservées pendant toute la durée de votre utilisation de la plateforme et 3 ans après la suppression de votre compte. Les données médicales sont conservées conformément aux obligations légales applicables au Sénégal.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">6. Partage des données</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Vos données peuvent être partagées avec :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Les praticiens assignés à vos soins (nom, adresse, numéro de téléphone)</li>
            <li>Les opérateurs de Mobile Money pour le traitement des paiements</li>
            <li>Nos prestataires techniques (hébergement, notifications push) sous contrat de confidentialité</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">Nous ne vendons jamais vos données à des tiers.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">7. Sécurité</h2>
          <p className="text-gray-600 leading-relaxed">Waluma met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des données en transit (HTTPS), accès limité aux données sensibles, hébergement sécurisé.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">8. Vos droits</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@waluma.app" className="text-[#0d5068] underline">contact@waluma.app</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">9. Modifications</h2>
          <p className="text-gray-600 leading-relaxed">Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif via l'application. La date de dernière mise à jour est indiquée en haut de ce document.</p>
        </section>
      </div>
    </article>
  )
}