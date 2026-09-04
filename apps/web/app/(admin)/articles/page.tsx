'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import Link from 'next/link'
import api from '@/lib/api'

interface Article {
  id: string
  titre: string
  categorie: string
  auteur: string
  statut: string
  vues: number
  createdAt: string
}

const categories = ['Tout', 'Prévention', 'Nutrition', 'Maternité', 'Enfants', 'Chroniques', 'Conseils', 'Bien-être']

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Tout')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (cat !== 'Tout') params.append('categorie', cat)
      const { data } = await api.get(`/articles/admin/all?${params}`)
      setArticles(data.articles)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [cat])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet article ?')) return
    setDeleting(id)
    try {
      await api.delete(`/articles/${id}`)
      await load()
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleStatut(article: Article) {
    const newStatut = article.statut === 'publié' ? 'brouillon' : 'publié'
    await api.patch(`/articles/${article.id}`, { statut: newStatut })
    await load()
  }

  const filtered = articles.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase())
  )

  const publies = articles.filter(a => a.statut === 'publié').length

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
          <p className="text-sm text-gray-400 mt-0.5">{total} article{total > 1 ? 's' : ''} · {publies} publié{publies > 1 ? 's' : ''}</p>
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

        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">Chargement...</div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '36%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Titre', 'Catégorie', 'Auteur', 'Date', 'Vues', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Aucun article trouvé</td></tr>
                ) : filtered.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-[13px] truncate">{a.titre}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold bg-[#e0f2fe] text-[#0d5068] px-2 py-0.5 rounded-full">
                        {a.categorie}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-600 truncate">{a.auteur}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-gray-700">
                      {a.vues.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatut(a)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.statut === 'publié' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}
                      >
                        {a.statut === 'publié' ? '● Publié' : '● Brouillon'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Link
                          href={`/articles/${a.id}`}
                          className="text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-100 transition"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deleting === a.id}
                          className="text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {deleting === a.id ? '...' : 'Suppr.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}