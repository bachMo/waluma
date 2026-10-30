'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Article {
  id: string
  titre: string
  contenu: string
  statut: 'PUBLIE' | 'BROUILLON' | 'ARCHIVE'
  auteur: string
  createdAt: string
  updatedAt: string
}

const STATUT_MAP: Record<Article['statut'], { label: string; variant: 'green' | 'amber' | 'gray' }> = {
  PUBLIE: { label: 'Publié', variant: 'green' },
  BROUILLON: { label: 'Brouillon', variant: 'amber' },
  ARCHIVE: { label: 'Archivé', variant: 'gray' },
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Article> | null>(null)
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get<Article[]>('/articles')
      setArticles(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.id) {
        await api.patch(`/articles/${editing.id}`, editing)
      } else {
        await api.post('/articles', editing)
      }
      setEditing(null)
      fetch()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/articles/${id}`)
    fetch()
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Articles"
        subtitle={`${articles.length} articles`}
        actions={
          <button
            onClick={() => setEditing({ titre: '', contenu: '', statut: 'BROUILLON' })}
            className="flex items-center gap-2 bg-[#0d5068] hover:bg-[#0a3f52] text-white text-[12.5px] font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nouvel article
          </button>
        }
      />

      <div className="p-5 sm:p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-36 animate-pulse" />
            ))
          ) : articles.length === 0 ? (
            <div className="col-span-3 bg-white rounded-xl border border-gray-100 py-16 text-center text-[13px] text-gray-400">
              Aucun article. Créez le premier.
            </div>
          ) : (
            articles.map((a) => {
              const st = STATUT_MAP[a.statut]
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:border-[#0d5068]/20 transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13.5px] font-bold text-[#0a2535] leading-snug flex-1">{a.titre}</h3>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed flex-1 line-clamp-3">{a.contenu}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">
                      {new Date(a.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(a)}
                        className="text-[11.5px] font-semibold text-[#0d5068] hover:bg-[#f0f7f5] px-2.5 py-1 rounded-md transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-[11.5px] font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-[#0a2535]">
                {editing.id ? 'Modifier l\'article' : 'Nouvel article'}
              </h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Titre</label>
                <input
                  value={editing.titre ?? ''}
                  onChange={(e) => setEditing((prev) => ({ ...prev, titre: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
                  placeholder="Titre de l'article"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Contenu</label>
                <textarea
                  value={editing.contenu ?? ''}
                  onChange={(e) => setEditing((prev) => ({ ...prev, contenu: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13.5px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition resize-none"
                  rows={6}
                  placeholder="Contenu de l'article…"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Statut</label>
                <select
                  value={editing.statut ?? 'BROUILLON'}
                  onChange={(e) => setEditing((prev) => ({ ...prev, statut: e.target.value as Article['statut'] }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] bg-white transition"
                >
                  <option value="BROUILLON">Brouillon</option>
                  <option value="PUBLIE">Publié</option>
                  <option value="ARCHIVE">Archivé</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#0d5068] hover:bg-[#0a3f52] disabled:opacity-55 text-white font-bold py-3 rounded-xl text-[13px] transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
