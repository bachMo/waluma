import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales — Waluma',
}

export default function MentionsLegales() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-[#0d5068] mb-2">Mentions Légales</h1>
        <p className="text-gray-400 text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Éditeur de la plateforme</h2>
          <div className="bg-[#f5f4ef] rounded-xl p-5 text-gray-600 space-y-1">
            <p><strong>Raison sociale :</strong> Waluma</p>
            <p><strong>Forme juridique :</strong> Entreprise</p>
            <p><strong>Siège social :</strong> Dakar, Sénégal</p>
            <p><strong>Email :</strong> <a href="mailto:contact@waluma.app" className="text-[#0d5068] underline">contact@waluma.app</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Directeur de la publication</h2>
          <p className="text-gray-600 leading-relaxed">Le directeur de la publication est le représentant légal de la société Waluma.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Hébergement</h2>
          <div className="bg-[#f5f4ef] rounded-xl p-5 text-gray-600 space-y-1">
            <p><strong>Hébergeur :</strong> Render Services, Inc.</p>
            <p><strong>Adresse :</strong> 525 Brannan St, Suite 300, San Francisco, CA 94107, États-Unis</p>
            <p><strong>Site :</strong> <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="text-[#0d5068] underline">render.com</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Propriété intellectuelle</h2>
          <p className="text-gray-600 leading-relaxed">L'ensemble du contenu de la plateforme Waluma (textes, images, logo, design, code source) est protégé par le droit de la propriété intellectuelle et appartient à la société Waluma ou à ses partenaires. Toute reproduction, distribution ou utilisation non autorisée est strictement interdite et constitue une contrefaçon.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Droit applicable et juridiction compétente</h2>
          <p className="text-gray-600 leading-relaxed">Les présentes mentions légales sont soumises au droit sénégalais. En cas de litige, et à défaut de résolution amiable, les tribunaux de Dakar (Sénégal) seront seuls compétents.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#0d5068] mb-3">Contact</h2>
          <p className="text-gray-600 leading-relaxed">Pour toute demande ou réclamation : <a href="mailto:contact@waluma.app" className="text-[#0d5068] underline">contact@waluma.app</a></p>
        </section>
      </div>
    </article>
  )
}