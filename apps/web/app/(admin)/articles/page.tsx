'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import { ListeArticles, Article, dateCourte } from '@/lib/api-types'

/** Le champ statut est une chaîne libre côté Prisma ; l'API crée en « brouillon ». */
const STATUT_LABEL: Record<string, string> = {
  brouillon: 'Brouillon',
  publié: 'Publié',
  publie: 'Publié',
  archivé: 'Archivé',
  archive: 'Archivé',
}

const STATUT_VARIANTE: Record<string, 'amber' | 'green' | 'gray'> = {
  brouillon: 'amber',
  publié: 'green',
  publie: 'green',
  archivé: 'gray',
  archive: 'gray',
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [filtre, setFiltre] = useState('tous')
  const [aSupprimer, setASupprimer] = useState<Article | null>(null)
  const [enCours, setEnCours] = useState(false)

  const charger = useCallback(async () => {
    try {
      // La liste admin est sur /articles/admin/all (brouillons inclus).
      const { data } = await api.get<ListeArticles>('/articles/admin/all', { params: { limit: 100 } })
      setArticles(Array.isArray(data?.articles) ? data.articles : [])
      setTotal(data?.total ?? 0)
      setErreur(null)
    } catch {
      setErreur("Impossible de charger les articles. Vérifiez que l'API est accessible.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const filtres = articles.filter((a) => filtre === 'tous' || a.statut === filtre)
  const statuts = Array.from(new Set(articles.map((a) => a.statut)))

  async function supprimer() {
    if (!aSupprimer) return
    setEnCours(true)
    try {
      await api.delete(`/articles/${aSupprimer.id}`)
      setASupprimer(null)
      await charger()
    } catch {
      setErreur("L'article n'a pas pu être supprimé.")
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Articles"
        subtitle={loading ? 'Chargement…' : `${total} article${total > 1 ? 's' : ''}`}
        actions={
          <Link
            href="/articles/nouveau"
            className="rounded-lg bg-[#0d5068] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#0a3f52]"
          >
            Nouvel article
          </Link>
        }
      />

      <div className="flex-1 space-y-4 p-5 sm:p-6">
        {erreur && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{erreur}</div>
        )}

        {statuts.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {['tous', ...statuts].map((s) => {
              const actif = filtre === s
              const n = s === 'tous' ? articles.length : articles.filter((a) => a.statut === s).length
              return (
                <button
                  key={s}
                  onClick={() => setFiltre(s)}
                  className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                    actif ? 'bg-[#0d5068] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#0d5068]'
                  }`}
                >
                  {s === 'tous' ? 'Tous' : (STATUT_LABEL[s] ?? s)}
                  <span className={`ml-1.5 ${actif ? 'text-white/70' : 'text-gray-400'}`}>{n}</span>
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl border border-gray-100 bg-white" />
            ))}
          </div>
        ) : filtres.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
            <p className="text-[13.5px] font-semibold text-[#0a2535]">
              {articles.length === 0 ? 'Aucun article' : 'Aucun article dans cette catégorie'}
            </p>
            <p className="mx-auto mt-1 max-w-[36ch] text-[12.5px] text-gray-400">
              Les articles santé publiés ici sont visibles dans l&apos;application patient.
            </p>
            {articles.length === 0 && (
              <Link
                href="/articles/nouveau"
                className="mt-5 inline-block rounded-lg bg-[#0d5068] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#0a3f52]"
              >
                Écrire le premier
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtres.map((a) => (
              <div
                key={a.id}
                className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <Badge variant={STATUT_VARIANTE[a.statut] ?? 'gray'} dot>
                    {STATUT_LABEL[a.statut] ?? a.statut}
                  </Badge>
                  <span className="shrink-0 text-[11.5px] text-gray-400">{dateCourte(a.createdAt)}</span>
                </div>

                <h3 className="text-[14.5px] font-bold leading-snug text-[#0a2535]">{a.titre}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-gray-500">
                  {a.contenu}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5">
                  <span className="truncate text-[11.5px] text-gray-400">
                    {a.categorie} · {a.auteur}
                    {a.vues > 0 && ` · ${a.vues} vue${a.vues > 1 ? 's' : ''}`}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/articles/${a.id}`}
                      className="rounded-md px-2 py-1 text-[12px] font-semibold text-[#0d5068] hover:bg-gray-50"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => setASupprimer(a)}
                      className="rounded-md px-2 py-1 text-[12px] font-semibold text-red-500 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {aSupprimer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-[16px] font-bold text-[#0a2535]">Supprimer cet article&nbsp;?</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
              «&nbsp;{aSupprimer.titre}&nbsp;» sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setASupprimer(null)}
                disabled={enCours}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={supprimer}
                disabled={enCours}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {enCours ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
