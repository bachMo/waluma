'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'

const categories = ['Prévention', 'Nutrition', 'Maternité', 'Enfants', 'Chroniques', 'Conseils', 'Bien-être']

interface ImageUploadProps {
  currentUrl: string | null
  onUploaded: (url: string) => void
}

function ImageUpload({ currentUrl, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/articles/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded(data.url)
    } catch {
      alert("Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-3 text-sm font-bold text-gray-800">Image de couverture</div>
      {currentUrl ? (
        <div className="relative">
          <img
            src={currentUrl}
            alt="Couverture"
            className="mb-2 h-32 w-full rounded-lg object-cover"
          />
          <label className="cursor-pointer text-xs font-semibold text-[#0d5068] hover:underline">
            {uploading ? 'Upload...' : "Changer l'image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition hover:border-[#0d5068]">
          {uploading ? (
            <div className="text-xs text-gray-400">Upload en cours...</div>
          ) : (
            <>
              <div className="mb-1 text-2xl">🖼</div>
              <div className="text-xs text-gray-400">Cliquer pour uploader</div>
              <div className="mt-0.5 text-[10px] text-gray-300">JPG, PNG, WEBP · 5 MB max</div>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    titre: '',
    categorie: 'Prévention',
    auteur: '',
    contenu: '',
    statut: 'brouillon',
    imageUrl: null as string | null,
  })

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/articles/${id}`)
        setForm({
          titre: data.titre,
          categorie: data.categorie,
          auteur: data.auteur,
          contenu: data.contenu,
          statut: data.statut,
          imageUrl: data.imageUrl,
        })
      } catch {
        setError('Article introuvable')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function set(field: string, value: string | null) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(statut: string) {
    if (!form.titre || !form.contenu || !form.auteur) {
      setError('Titre, contenu et auteur sont obligatoires')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.patch(`/articles/${id}`, { ...form, statut })
      router.push('/articles')
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <Topbar title="Modifier l'article" />
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          Chargement...
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar title="Modifier l'article">
        {/* Boutons : wrap sur mobile, ligne sur sm+ */}
        <div className="flex w-full flex-wrap items-center gap-2">
          <button
            onClick={() => router.push('/articles')}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => handleSubmit('brouillon')}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-gray-50 disabled:opacity-50"
          >
            Sauvegarder brouillon
          </button>
          <button
            onClick={() => handleSubmit('publié')}
            disabled={saving}
            className="rounded-lg bg-[#22c55e] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#16a34a] disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Publier'}
          </button>
        </div>
      </Topbar>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
            Modifier l&apos;article
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Les modifications sont visibles immédiatement après publication.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/*
          mobile       : 1 colonne (contenu puis sidebar en dessous)
          lg+          : col-span-2 + col-span-1
        */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">

          {/* ── COLONNE PRINCIPALE ── */}
          <div className="min-w-0 space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                value={form.titre}
                onChange={(e) => set('titre', e.target.value)}
                type="text"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0d5068]"
              />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                Contenu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.contenu}
                onChange={(e) => set('contenu', e.target.value)}
                rows={18}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#0d5068]"
              />
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="min-w-0 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
              <div className="mb-4 text-sm font-bold text-gray-800">Paramètres</div>

              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Catégorie
                </label>
                <select
                  value={form.categorie}
                  onChange={(e) => set('categorie', e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Auteur
                </label>
                <input
                  value={form.auteur}
                  onChange={(e) => set('auteur', e.target.value)}
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={(e) => set('statut', e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="publié">Publié</option>
                </select>
              </div>
            </div>

            <ImageUpload
              currentUrl={form.imageUrl}
              onUploaded={(url) => set('imageUrl', url)}
            />

            <div className="rounded-xl border border-green-200 bg-[#f0fdf4] p-4">
              <div className="mb-1.5 text-xs font-bold text-green-700">
                Conseils de rédaction
              </div>
              <ul className="space-y-1 text-[11px] leading-relaxed text-green-600">
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