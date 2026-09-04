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
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="text-sm font-bold text-gray-800 mb-3">Image de couverture</div>
      {currentUrl ? (
        <div className="relative">
          <img src={currentUrl} alt="Couverture" className="w-full h-32 object-cover rounded-lg mb-2" />
          <label className="cursor-pointer text-xs font-semibold text-[#0d5068] hover:underline">
            {uploading ? 'Upload...' : 'Changer l\'image'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          </label>
        </div>
      ) : (
        <label className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-[#0d5068] transition">
          {uploading ? (
            <div className="text-xs text-gray-400">Upload en cours...</div>
          ) : (
            <>
              <div className="text-2xl mb-1">🖼</div>
              <div className="text-xs text-gray-400">Cliquer pour uploader</div>
              <div className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, WEBP · 5 MB max</div>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
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
    titre: '', categorie: 'Prévention', auteur: '', contenu: '', statut: 'brouillon', imageUrl: null as string | null,
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
    setForm(f => ({ ...f, [field]: value }))
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
      <div className="flex flex-col h-full">
        <Topbar title="Modifier l'article" />
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Modifier l'article">
        <button
          onClick={() => router.push('/articles')}
          className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
        >
          Annuler
        </button>
        <button
          onClick={() => handleSubmit('brouillon')}
          disabled={saving}
          className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Sauvegarder brouillon
        </button>
        <button
          onClick={() => handleSubmit('publié')}
          disabled={saving}
          className="text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Publier'}
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Modifier l&apos;article</h1>
          <p className="text-sm text-gray-400 mt-0.5">Les modifications sont visibles immédiatement après publication.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                value={form.titre}
                onChange={e => set('titre', e.target.value)}
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0d5068]"
              />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Contenu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.contenu}
                onChange={e => set('contenu', e.target.value)}
                rows={18}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0d5068] resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Paramètres</div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={e => set('categorie', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Auteur</label>
                <input
                  value={form.auteur}
                  onChange={e => set('auteur', e.target.value)}
                  type="text"
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

            <ImageUpload
              currentUrl={form.imageUrl}
              onUploaded={(url) => set('imageUrl', url)}
            />

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