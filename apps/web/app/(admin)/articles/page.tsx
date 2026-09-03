'use client'
import { useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'

const articles = [
  { id: 1, titre: 'Saison des pluies : protéger sa famille du paludisme', categorie: 'Prévention', auteur: 'Dr. Moussa Fall', date: '29 août 2026', statut: 'publié', vues: 1240 },
  { id: 2, titre: 'Hydratation et chaleur : ce qu\'il faut savoir', categorie: 'Conseils', auteur: 'Dr. Aminata Diallo', date: '27 août 2026', statut: 'publié', vues: 873 },
  { id: 3, titre: 'Suivi prénatal : consultations à ne pas manquer', categorie: 'Maternité', auteur: 'Dr. Kadiatou Sow', date: '25 août 2026', statut: 'publié', vues: 654 },
  { id: 4, titre: 'Diabète type 2 : adapter son mode de vie', categorie: 'Chroniques', auteur: 'Dr. Ibrahima Ba', date: '22 août 2026', statut: 'brouillon', vues: 0 },
  { id: 5, titre: 'Vaccins essentiels pour les enfants de 0 à 5 ans', categorie: 'Enfants', auteur: 'Dr. Moussa Fall', date: '20 août 2026', statut: 'publié', vues: 1102 },
]

const categories = ['Tout', 'Prévention', 'Nutrition', 'Maternité', 'Enfants', 'Chroniques', 'Conseils']

export default function ArticlesPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Tout')

  const filtered = articles.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) &&
    (cat === 'Tout' || a.categorie === cat)
  )

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Articles santé">
        <Link
          href="/articles/nouveau"
          className="flex items-center gap-1.5 text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition"
        >
          + Nouvel article
        </Link>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Articles santé</h1>
          <p className="text-sm text-gray-400 mt-0.5">{articles.length} articles · {articles.filter(a => a.statut === 'publié').length} publiés</p>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-60"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${cat === c ? 'bg-[#0d5068] text-white border-[#0d5068]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#0d5068]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '38%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Titre', 'Catégorie', 'Auteur', 'Date', 'Vues', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 text-[13px] truncate">{a.titre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold bg-[#e0f2fe] text-[#0d5068] px-2 py-0.5 rounded-full">{a.categorie}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 truncate">{a.auteur}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-500">{a.date}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-gray-700">{a.vues.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {a.statut === 'publié'
                      ? <Badge variant="active" label="Publié" />
                      : <Badge variant="pending" label="Brouillon" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link href={`/articles/${a.id}`} className="text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-100 transition">
                        Modifier
                      </Link>
                      <button className="text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition">
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}