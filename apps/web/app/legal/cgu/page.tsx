import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Waluma",
}

export default function CGU() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-[#0d5068] mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-gray-400 text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">1. Présentation de Waluma</h2>
          <p className="text-gray-600 leading-relaxed">Waluma est une plateforme numérique de mise en relation entre patients et professionnels de santé pour des soins à domicile. La société Waluma, dont le siège est à Dakar (Sénégal), édite et exploite l'application mobile Waluma disponible sur iOS et Android ainsi que le site web waluma.app.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">2. Acceptation des conditions</h2>
          <p className="text-gray-600 leading-relaxed">En téléchargeant et utilisant l'application Waluma, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">3. Description des services</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Waluma propose les services suivants :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Mise en relation entre patients et professionnels de santé (infirmiers, médecins, sages-femmes, kinésithérapeutes, préleveurs, pédiatres)</li>
            <li>Suivi en temps réel des interventions à domicile</li>
            <li>Génération de comptes rendus médicaux numériques</li>
            <li>Paiement sécurisé via Mobile Money</li>
            <li>Gestion des dossiers de soins</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">Waluma agit en tant qu'intermédiaire et ne fournit pas directement des soins médicaux. Les praticiens inscrits sur la plateforme exercent en tant qu'indépendants et sont seuls responsables de la qualité des soins dispensés.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">4. Inscription et compte utilisateur</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Pour utiliser Waluma, vous devez créer un compte en fournissant un numéro de téléphone valide. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées depuis votre compte. Toute utilisation frauduleuse doit être signalée immédiatement à support@waluma.app.</p>
          <p className="text-gray-600 leading-relaxed">Waluma se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">5. Obligations des utilisateurs</h2>
          <p className="text-gray-600 leading-relaxed mb-3">En utilisant Waluma, vous vous engagez à :</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Fournir des informations exactes et à jour</li>
            <li>Ne pas utiliser la plateforme à des fins illégales ou frauduleuses</li>
            <li>Traiter les praticiens avec respect</li>
            <li>Honorer les rendez-vous confirmés ou les annuler dans un délai raisonnable</li>
            <li>Ne pas contourner le système de paiement de la plateforme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">6. Tarification et paiements</h2>
          <p className="text-gray-600 leading-relaxed">Les tarifs des soins sont affichés avant toute confirmation de demande. Le paiement s'effectue après la réalisation du soin via les solutions de Mobile Money disponibles (Wave, Orange Money, Free Money). Une commission de 10% est prélevée sur chaque transaction au bénéfice de Waluma pour le fonctionnement de la plateforme.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">7. Responsabilité</h2>
          <p className="text-gray-600 leading-relaxed">Waluma s'efforce de maintenir la disponibilité de la plateforme mais ne peut garantir un accès ininterrompu. Waluma ne saurait être tenu responsable des dommages résultant d'une interruption de service, d'une erreur technique ou d'un acte d'un praticien indépendant. En tant qu'intermédiaire, Waluma facilite la mise en relation mais n'est pas responsable des actes médicaux réalisés.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">8. Propriété intellectuelle</h2>
          <p className="text-gray-600 leading-relaxed">L'ensemble des éléments constituant l'application Waluma (logo, design, code, textes) sont la propriété exclusive de la société Waluma et sont protégés par les lois applicables en matière de propriété intellectuelle. Toute reproduction non autorisée est interdite.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">9. Modification des CGU</h2>
          <p className="text-gray-600 leading-relaxed">Waluma se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés de toute modification substantielle via l'application. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">10. Droit applicable</h2>
          <p className="text-gray-600 leading-relaxed">Les présentes CGU sont soumises au droit sénégalais. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents de Dakar, Sénégal.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">11. Contact</h2>
          <p className="text-gray-600 leading-relaxed">Pour toute question relative aux présentes CGU, contactez-nous à : <a href="mailto:contact@waluma.app" className="text-[#0d5068] underline">contact@waluma.app</a></p>
        </section>
      </div>
    </article>
  )
}