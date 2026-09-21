'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

const categories = [
  'Tout',
  'Prévention',
  'Nutrition',
  'Maternité',
  'Enfants',
  'Chroniques',
  'Conseils',
  'Bien-être',
]

export default function ArticlesPage() {
  const router = useRouter()
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

  useEffect(() => {
    load()
  }, [cat])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation() // empêche la navigation
    if (!confirm('Supprimer cet article ?')) return
    setDeleting(id)
    try {
      await api.delete(`/articles/${id}`)
      await load()
    } finally {
      setDeleting(null)
    }
  }

  async function handleToggleStatut(e: React.MouseEvent, article: Article) {
    e.stopPropagation() // empêche la navigation
    const newStatut = article.statut === 'publié' ? 'brouillon' : 'publié'
    await api.patch(`/articles/${article.id}`, { statut: newStatut })
    await load()
  }

  const filtered = articles.filter((a) =>
    a.titre.toLowerCase().includes(search.toLowerCase())
  )

  const publies = articles.filter((a) => a.statut === 'publié').length

  return (
    <div className="flex h-full min-w-0 flex-col">
      <Topbar title="Articles santé">
        <Link
          href="/articles/nouveau"
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#22c55e] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#16a34a] sm:px-3 sm:text-xs"
        >
          +{' '}
          <span className="hidden xs:inline">Nouvel article</span>
          <span className="xs:hidden">Article</span>
        </Link>
      </Topbar>

      <div className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-5">
          <h1 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
            Articles santé
          </h1>
          <p className="mt-1 text-xs text-gray-400 sm:text-sm">
            {total} article{total > 1 ? 's' : ''} · {publies} publié
            {publies > 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-4 space-y-3">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0d5068] sm:w-72"
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                  cat === c
                    ? 'border-[#0d5068] bg-[#0d5068] text-white'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-[#0d5068]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Chargement...
          </div>
        ) : (
          <>
            {/* ── VERSION MOBILE ── */}
            <div className="block md:hidden">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-white py-10 text-center text-sm text-gray-400">
                  Aucun article trouvé
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => router.push(`/articles/${a.id}`)}
                      className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition hover:border-[#0d5068]/30 hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="break-words text-sm font-bold leading-snug text-gray-900">
                            {a.titre}
                          </div>
                          <div className="mt-2">
                            <span className="inline-block rounded-full bg-[#e0f2fe] px-2 py-1 text-[10px] font-semibold text-[#0d5068]">
                              {a.categorie}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleToggleStatut(e, a)}
                          className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold ${
                            a.statut === 'publié'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {a.statut === 'publié' ? '● Publié' : '● Brouillon'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-3">
                        <div>
                          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            Auteur
                          </div>
                          <div className="truncate text-xs text-gray-600">
                            {a.auteur}
                          </div>
                        </div>
                        <div>
                          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            Date
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(a.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            Vues
                          </div>
                          <div className="text-xs font-semibold text-gray-700">
                            {a.vues.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Bouton supprimer séparé — stopPropagation pour pas naviguer */}
                      <div className="mt-4 border-t border-gray-50 pt-3">
                        <button
                          onClick={(e) => handleDelete(e, a.id)}
                          disabled={deleting === a.id}
                          className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {deleting === a.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── VERSION TABLETTE / DESKTOP ── */}
            <div className="hidden md:block">
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-sm"
                    style={{ minWidth: '850px', tableLayout: 'fixed' }}
                  >
                    <colgroup>
                      <col style={{ width: '32%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '9%' }} />
                      <col style={{ width: '11%' }} />
                    </colgroup>

                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Titre', 'Catégorie', 'Auteur', 'Date', 'Vues', 'Statut', 'Actions'].map(
                          (h) => (
                            <th
                              key={h}
                              className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                            Aucun article trouvé
                          </td>
                        </tr>
                      ) : (
                        filtered.map((a) => (
                          <tr
                            key={a.id}
                            onClick={() => router.push(`/articles/${a.id}`)}
                            className="cursor-pointer border-b border-gray-50 transition hover:bg-[#f0f9ff]"
                          >
                            <td className="px-3 py-3">
                              <div
                                className="truncate text-[12px] font-semibold text-gray-900"
                                title={a.titre}
                              >
                                {a.titre}
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <span className="inline-block max-w-full truncate rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-semibold text-[#0d5068]">
                                {a.categorie}
                              </span>
                            </td>

                            <td className="px-3 py-3">
                              <div
                                className="truncate text-[11px] text-gray-600"
                                title={a.auteur}
                              >
                                {a.auteur}
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-[11px] text-gray-500">
                              {new Date(a.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-[11px] font-semibold text-gray-700">
                              {a.vues.toLocaleString()}
                            </td>

                            <td className="px-3 py-3">
                              <button
                                onClick={(e) => handleToggleStatut(e, a)}
                                className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-bold ${
                                  a.statut === 'publié'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-yellow-50 text-yellow-700'
                                }`}
                              >
                                {a.statut === 'publié' ? '● Publié' : '● Brouillon'}
                              </button>
                            </td>

                            <td className="px-3 py-3">
                              <button
                                onClick={(e) => handleDelete(e, a.id)}
                                disabled={deleting === a.id}
                                className="whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {deleting === a.id ? '...' : 'Suppr.'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="mt-2 text-right text-[10px] text-gray-400">
                Faites défiler horizontalement le tableau si nécessaire.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}