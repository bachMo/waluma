'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'

const categories = ['Prévention', 'Nutrition', 'Maternité', 'Enfants', 'Chroniques', 'Conseils', 'Bien-être']

export default function NouvelArticlePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    titre: '', categorie: 'Prévention', auteur: '', contenu: '', statut: 'brouillon',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Nouvel article">
        <button onClick={() => router.push('/articles')} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          Annuler
        </button>
        <button onClick={() => { set('statut', 'brouillon'); router.push('/articles') }} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          Sauvegarder brouillon
        </button>
        <button onClick={() => { set('statut', 'publié'); router.push('/articles') }} className="text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition">
          Publier
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Nouvel article santé</h1>
          <p className="text-sm text-gray-400 mt-0.5">Cet article sera visible dans l&apos;application patient.</p>
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Corps principal */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Titre de l&apos;article <span className="text-red-500">*</span></label>
              <input
                value={form.titre}
                onChange={e => set('titre', e.target.value)}
                type="text"
                placeholder="Ex : Comment protéger sa famille du paludisme..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0d5068]"
              />
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contenu <span className="text-red-500">*</span></label>
              <textarea
                value={form.contenu}
                onChange={e => set('contenu', e.target.value)}
                rows={18}
                placeholder="Rédigez le contenu de l'article ici...&#10;&#10;Vous pouvez structurer votre texte en paragraphes clairs.&#10;&#10;Conseils :&#10;- Utilisez un langage simple et accessible&#10;- Évitez le jargon médical non expliqué&#10;- Ajoutez des conseils pratiques adaptés au contexte sénégalais"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0d5068] resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Paramètres</div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Catégorie <span className="text-red-500">*</span></label>
                <select
                  value={form.categorie}
                  onChange={e => set('categorie', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Auteur <span className="text-red-500">*</span></label>
                <input
                  value={form.auteur}
                  onChange={e => set('auteur', e.target.value)}
                  type="text"
                  placeholder="Ex : Dr. Moussa Fall"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Statut</label>
                <select
                  value={form.statut}
                  onChange={e => set('statut', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="publié">Publié</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-3">Image de couverture</div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-[#0d5068] transition">
                <div className="text-2xl mb-1">🖼</div>
                <div className="text-xs text-gray-400">Cliquer pour uploader</div>
                <div className="text-[10px] text-gray-300 mt-0.5">JPG, PNG · 2 MB max</div>
              </div>
            </div>

            <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-4">
              <div className="text-xs font-bold text-green-700 mb-1.5">Conseils de rédaction</div>
              <ul className="text-[11px] text-green-600 space-y-1 leading-relaxed">
                <li>• Langage simple et accessible</li>
                <li>• Contexte sénégalais (exemples locaux)</li>
                <li>• Conseils pratiques et actionnables</li>
                <li>• Inclure un CTA vers un soin si pertinent</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}