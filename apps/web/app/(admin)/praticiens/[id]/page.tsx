'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

const specialites = [
  { value: 'INFIRMIER', label: 'Infirmier/ère IDE' },
  { value: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste' },
  { value: 'SAGE_FEMME', label: 'Sage-femme' },
  { value: 'KINESITHERAPEUTE', label: 'Kinésithérapeute' },
  { value: 'PRELEVEUR', label: 'Préleveur/se' },
  { value: 'PEDIATRE', label: 'Pédiatre' },
  { value: 'AUTRE', label: 'Autre' },
]

const typeDocumentLabel: Record<string, string> = {
  DIPLOME: 'Diplôme',
  ORDRE_PROFESSIONNEL: 'Ordre professionnel',
  CNI: 'CNI',
  CASIER_JUDICIAIRE: 'Casier judiciaire',
  AUTRE: 'Autre',
}

const statutDocVariant: Record<string, 'active' | 'pending' | 'suspended'> = {
  VALIDE: 'active',
  EN_ATTENTE: 'pending',
  REFUSE: 'suspended',
}

interface Document {
  id: string
  type: string
  statut: string
  url: string
  nom: string
  commentaireAdmin: string | null
  createdAt: string
}

interface Praticien {
  id: string
  statutCompte: string
  disponible: boolean
  numeroOrdre: string | null
  anneesExperience: number
  bio: string | null
  zoneIntervention: string[]
  commission: number
  operateurMM: string | null
  numeroMM: string | null
  noteMoyenne: number | null
  totalMissions: number
  createdAt: string
  user: { nom: string; prenom: string; telephone: string }
  specialites: { specialite: string; principale: boolean }[]
  documents: Document[]
}

const statutVariant: Record<string, 'active' | 'pending' | 'suspended' | 'review'> = {
  VALIDE: 'active',
  EN_ATTENTE: 'review',
  SUSPENDU: 'suspended',
  REFUSE: 'suspended',
}

const statutLabel: Record<string, string> = {
  VALIDE: 'Actif',
  EN_ATTENTE: 'À valider',
  SUSPENDU: 'Suspendu',
  REFUSE: 'Refusé',
}

export default function PraticienDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [praticien, setPraticien] = useState<Praticien | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'infos' | 'documents'>('infos')

  const [form, setForm] = useState({
    nom: '', prenom: '', telephone: '',
    numeroOrdre: '', anneesExperience: 0, bio: '',
    zone: '', commission: 10,
    operateurMM: 'WAVE', numeroMM: '',
    specialite: 'INFIRMIER',
  })

  const docFileRef = useRef<HTMLInputElement>(null)
  const [docType, setDocType] = useState('DIPLOME')

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/praticiens/${id}`)
      setPraticien(data)
      const principale = data.specialites.find((s: { principale: boolean }) => s.principale)
      setForm({
        nom: data.user.nom,
        prenom: data.user.prenom,
        telephone: data.user.telephone,
        numeroOrdre: data.numeroOrdre || '',
        anneesExperience: data.anneesExperience,
        bio: data.bio || '',
        zone: data.zoneIntervention.join(', '),
        commission: data.commission,
        operateurMM: data.operateurMM || 'WAVE',
        numeroMM: data.numeroMM || '',
        specialite: principale?.specialite || 'INFIRMIER',
      })
    } catch {
      setError('Praticien introuvable')
    } finally {
      setLoading(false)
    }
  }

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.patch(`/praticiens/${id}/infos`, {
        nom: form.nom,
        prenom: form.prenom,
        telephone: form.telephone,
        numeroOrdre: form.numeroOrdre,
        anneesExperience: form.anneesExperience,
        bio: form.bio,
        zoneIntervention: form.zone.split(',').map(z => z.trim()).filter(Boolean),
        commission: form.commission,
        operateurMM: form.operateurMM,
        numeroMM: form.numeroMM,
      })
      setSuccess('Informations mises à jour')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', docType)
      await api.post(`/praticiens/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Document uploadé avec succès')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    } catch {
      setError('Erreur lors de l\'upload')
    } finally {
      setUploadingDoc(false)
      if (docFileRef.current) docFileRef.current.value = ''
    }
  }

  async function handleDocStatut(docId: string, statut: string) {
    try {
      await api.patch(`/praticiens/documents/${docId}`, { statut })
      await load()
    } catch {
      setError('Erreur lors de la mise à jour')
    }
  }

  async function handleDeleteDoc(docId: string) {
    if (!confirm('Supprimer ce document ?')) return
    try {
      await api.delete(`/praticiens/documents/${docId}`)
      await load()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  async function handleStatut(statut: string) {
    try {
      await api.patch(`/praticiens/${id}/statut`, { statut })
      await load()
    } catch {
      setError('Erreur')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Fiche praticien" />
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Chargement...</div>
      </div>
    )
  }

  if (!praticien) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Fiche praticien" />
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Fiche praticien">
        <button onClick={() => router.push('/praticiens')} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          ← Retour
        </button>
        {activeTab === 'infos' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-bold bg-[#0d5068] text-white rounded-lg px-3 py-1.5 hover:bg-[#0a3f52] transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '✓ Enregistrer'}
          </button>
        )}
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header praticien */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-lg font-extrabold text-[#0d5068]">
              {praticien.user.prenom[0]}{praticien.user.nom[0]}
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">
                {praticien.user.prenom} {praticien.user.nom}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant={statutVariant[praticien.statutCompte] ?? 'pending'} label={statutLabel[praticien.statutCompte] ?? praticien.statutCompte} />
                <span className="text-xs text-gray-400">{praticien.user.telephone}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{praticien.totalMissions} missions</span>
                {praticien.noteMoyenne && (
                  <>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-semibold text-yellow-500">★ {praticien.noteMoyenne.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {praticien.statutCompte === 'EN_ATTENTE' && (
              <>
                <button onClick={() => handleStatut('VALIDE')} className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition">
                  Valider
                </button>
                <button onClick={() => handleStatut('REFUSE')} className="text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition">
                  Refuser
                </button>
              </>
            )}
            {praticien.statutCompte === 'VALIDE' && (
              <button onClick={() => handleStatut('SUSPENDU')} className="text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition">
                Suspendre
              </button>
            )}
            {praticien.statutCompte === 'SUSPENDU' && (
              <button onClick={() => handleStatut('VALIDE')} className="text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-200 transition">
                Réactiver
              </button>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">✓ {success}</div>}

        {/* Onglets */}
        <div className="flex gap-1 mb-5 border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations' },
            { key: 'documents', label: `Documents (${praticien.documents.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'infos' | 'documents')}
              className={`text-sm font-semibold px-4 py-2.5 border-b-2 transition ${activeTab === tab.key ? 'border-[#0d5068] text-[#0d5068]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Onglet Informations */}
        {activeTab === 'infos' && (
          <div className="grid grid-cols-2 gap-5">

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Informations personnelles</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Prénom</label>
                  <input value={form.prenom} onChange={e => set('prenom', e.target.value)} type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nom</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)} type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Téléphone</label>
                <input value={form.telephone} onChange={e => set('telephone', e.target.value)} type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Zone d&apos;intervention</label>
                <input value={form.zone} onChange={e => set('zone', e.target.value)} type="text" placeholder="Almadies, Mermoz..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                <p className="text-[11px] text-gray-400 mt-1">Séparez les zones par des virgules</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Informations professionnelles</div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Spécialité principale</label>
                <select value={form.specialite} onChange={e => set('specialite', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none">
                  {specialites.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Numéro d&apos;ordre</label>
                <input value={form.numeroOrdre} onChange={e => set('numeroOrdre', e.target.value)} type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Années d&apos;expérience</label>
                <input value={form.anneesExperience} onChange={e => set('anneesExperience', parseInt(e.target.value) || 0)} type="number" min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Biographie</label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] resize-none" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Paiement</div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Opérateur</label>
                <select value={form.operateurMM} onChange={e => set('operateurMM', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none">
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="FREE_MONEY">Free Money</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Numéro Mobile Money</label>
                <input value={form.numeroMM} onChange={e => set('numeroMM', e.target.value)} type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Commission Waluma (%)</label>
                <input value={form.commission} onChange={e => set('commission', parseFloat(e.target.value) || 10)} type="number" min="0" max="100" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Statistiques</div>
              <div className="space-y-3">
                {[
                  { label: 'Total missions', value: praticien.totalMissions },
                  { label: 'Note moyenne', value: praticien.noteMoyenne ? `★ ${praticien.noteMoyenne.toFixed(1)}` : '—' },
                  { label: 'Documents', value: praticien.documents.length },
                  { label: 'Membre depuis', value: new Date(praticien.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {/* Upload nouveau document */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Ajouter un document</div>
              <div className="flex items-center gap-3">
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
                >
                  <option value="DIPLOME">Diplôme</option>
                  <option value="ORDRE_PROFESSIONNEL">Ordre professionnel</option>
                  <option value="CNI">CNI</option>
                  <option value="CASIER_JUDICIAIRE">Casier judiciaire</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <label className={`flex items-center gap-2 text-xs font-bold bg-[#0d5068] text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-[#0a3f52] transition ${uploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadingDoc ? 'Upload...' : '↑ Choisir un fichier'}
                  <input
                    ref={docFileRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    onChange={handleUploadDoc}
                    disabled={uploadingDoc}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-400">PDF, JPG, PNG · 5 MB max</span>
              </div>
            </div>

            {/* Liste des documents */}
            {praticien.documents.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">Aucun document uploadé</div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Type', 'Fichier', 'Date', 'Statut', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {praticien.documents.map(doc => (
                      <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-900 text-[13px]">
                          {typeDocumentLabel[doc.type] ?? doc.type}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] text-[#0d5068] hover:underline truncate block max-w-[200px]"
                          >
                            {doc.nom}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={statutDocVariant[doc.statut] ?? 'pending'}
                            label={doc.statut === 'VALIDE' ? 'Validé' : doc.statut === 'REFUSE' ? 'Refusé' : 'En attente'}
                          />
                          {doc.commentaireAdmin && (
                            <div className="text-[10px] text-red-500 mt-0.5">{doc.commentaireAdmin}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {doc.statut !== 'VALIDE' && (
                              <button
                                onClick={() => handleDocStatut(doc.id, 'VALIDE')}
                                className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition"
                              >
                                Valider
                              </button>
                            )}
                            {doc.statut !== 'REFUSE' && (
                              <button
                                onClick={() => handleDocStatut(doc.id, 'REFUSE')}
                                className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition"
                              >
                                Refuser
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-100 transition"
                            >
                              Suppr.
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
        )}
      </div>
    </div>
  )
}