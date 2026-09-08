'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'
import { REGIONS_SENEGAL } from '@/lib/senegal-geo'

const SPECIALITES = [
  { value: 'INFIRMIER', label: 'Infirmier/ère IDE' },
  { value: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste' },
  { value: 'SAGE_FEMME', label: 'Sage-femme' },
  { value: 'KINESITHERAPEUTE', label: 'Kinésithérapeute' },
  { value: 'PRELEVEUR', label: 'Préleveur/se' },
  { value: 'PEDIATRE', label: 'Pédiatre' },
  { value: 'AUTRE', label: 'Autre' },
]

const TYPES_DOCUMENT = [
  { value: 'DIPLOME', label: 'Diplôme' },
  { value: 'CNI', label: "Carte Nationale d'Identité" },
  { value: 'CASIER_JUDICIAIRE', label: 'Casier judiciaire' },
  { value: 'ORDRE_PROFESSIONNEL', label: "Numéro d'ordre professionnel" },
  { value: 'AUTRE', label: 'Autre document' },
]

const OPERATEURS_MM = [
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'FREE_MONEY', label: 'Free Money' },
]

interface MoyenPaiement {
  operateur: string
  numero: string
}

interface Document {
  type: string
  file: File
  nom: string
}

function validerTelephone(tel: string): boolean {
  const regex = /^\+221(70|75|76|77|78)\d{7}$/
  return regex.test(tel.replace(/\s/g, ''))
}

export default function AjouterPraticienPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Infos personnelles
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('+221')
  const [specialite, setSpecialite] = useState('INFIRMIER')
  const [numeroOrdre, setNumeroOrdre] = useState('')
  const [anneesExp, setAnneesExp] = useState('')
  const [bio, setBio] = useState('')

  // Zone d'intervention
  const [regionSelectionnee, setRegionSelectionnee] = useState('')
  const [modeZone, setModeZone] = useState<'region' | 'departements'>('region')
  const [departementsSelectionnes, setDepartementsSelectionnes] = useState<string[]>([])

  // Moyens de paiement
  const [moyensPaiement, setMoyensPaiement] = useState<MoyenPaiement[]>([])
  const [accepteEspeces, setAccepteEspeces] = useState(false)

  // Documents
  const [documents, setDocuments] = useState<Document[]>([])
  const [docType, setDocType] = useState('DIPLOME')
  const fileRef = useRef<HTMLInputElement>(null)

  const region = REGIONS_SENEGAL.find(r => r.nom === regionSelectionnee)

  function toggleDepartement(dep: string) {
    setDepartementsSelectionnes(prev =>
      prev.includes(dep) ? prev.filter(d => d !== dep) : [...prev, dep]
    )
  }

  function addMoyenPaiement(operateur: string) {
    if (moyensPaiement.find(m => m.operateur === operateur)) return
    setMoyensPaiement(prev => [...prev, { operateur, numero: '+221' }])
  }

  function removeMoyenPaiement(operateur: string) {
    setMoyensPaiement(prev => prev.filter(m => m.operateur !== operateur))
  }

  function updateNumeroMM(operateur: string, numero: string) {
    setMoyensPaiement(prev => prev.map(m => m.operateur === operateur ? { ...m, numero } : m))
  }

  function handleDocFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDocuments(prev => [...prev, { type: docType, file, nom: file.name }])
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeDoc(index: number) {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!prenom.trim()) newErrors.prenom = 'Prénom requis'
    if (!nom.trim()) newErrors.nom = 'Nom requis'
    if (!validerTelephone(telephone)) newErrors.telephone = 'Format invalide : +221 suivi de 70/75/76/77/78 et 7 chiffres'
    if (!regionSelectionnee) newErrors.zone = 'Choisissez une région'
    if (modeZone === 'departements' && departementsSelectionnes.length === 0) newErrors.zone = 'Choisissez au moins un département'
    if (moyensPaiement.length === 0 && !accepteEspeces) newErrors.paiement = 'Choisissez au moins un moyen de paiement'
    moyensPaiement.forEach(m => {
      if (!validerTelephone(m.numero)) newErrors[`mm_${m.operateur}`] = `Numéro ${m.operateur} invalide`
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
  if (!validate()) return
  setSaving(true)
  setError('')

  try {
    const zoneIntervention = modeZone === 'region'
      ? [regionSelectionnee]
      : departementsSelectionnes

    const formData = new FormData()
    formData.append('prenom', prenom)
    formData.append('nom', nom)
    formData.append('telephone', telephone.replace(/\s/g, ''))
    formData.append('specialite', specialite)
    formData.append('numeroOrdre', numeroOrdre)
    formData.append('anneesExperience', anneesExp || '0')
    formData.append('bio', bio)
    formData.append('zoneIntervention', JSON.stringify(zoneIntervention))
    formData.append('moyensPaiement', JSON.stringify(moyensPaiement))
    formData.append('accepteEspeces', String(accepteEspeces))

    // Envoyer les types en JSON séparé
    formData.append('documentsTypes', JSON.stringify(documents.map(d => d.type)))

    // Envoyer les fichiers sous le même champ 'files'
    documents.forEach((doc) => {
      formData.append('files', doc.file)
    })

    await api.post('/praticiens/creer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    router.push('/praticiens')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } } }
    setError(err?.response?.data?.error || 'Erreur lors de la création')
  } finally {
    setSaving(false)
  }
}
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Ajouter un praticien">
        <button onClick={() => router.push('/praticiens')} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition disabled:opacity-50"
        >
          {saving ? 'Création...' : 'Créer le praticien'}
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Nouveau praticien</h1>
          <p className="text-sm text-gray-400 mt-0.5">Le praticien sera en attente de validation avant de pouvoir exercer.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}

        <div className="space-y-5 max-w-4xl">

          {/* Informations personnelles */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} type="text" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] ${errors.prenom ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input value={nom} onChange={e => setNom(e.target.value)} type="text" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] ${errors.nom ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone <span className="text-red-500">*</span></label>
                <input value={telephone} onChange={e => setTelephone(e.target.value)} type="tel" placeholder="+221 77 000 00 00" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] ${errors.telephone ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.telephone
                  ? <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>
                  : <p className="text-xs text-gray-400 mt-1">Format : +221 suivi de 70/75/76/77/78 + 7 chiffres</p>
                }
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Spécialité <span className="text-red-500">*</span></label>
                <select value={specialite} onChange={e => setSpecialite(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none">
                  {SPECIALITES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Numéro d'ordre professionnel</label>
                <input value={numeroOrdre} onChange={e => setNumeroOrdre(e.target.value)} type="text" placeholder="Ex : INF-SN-2020-04821" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Années d'expérience</label>
                <input value={anneesExp} onChange={e => setAnneesExp(e.target.value)} type="number" min="0" placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Biographie</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Présentation du praticien..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] resize-none" />
              </div>
            </div>
          </div>

          {/* Zone d'intervention */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Zone d'intervention <span className="text-red-500">*</span></h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Région</label>
              <select
                value={regionSelectionnee}
                onChange={e => { setRegionSelectionnee(e.target.value); setDepartementsSelectionnes([]); setModeZone('region') }}
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none ${errors.zone ? 'border-red-300' : 'border-gray-200'}`}
              >
                <option value="">Choisir une région...</option>
                {REGIONS_SENEGAL.map(r => <option key={r.code} value={r.nom}>{r.nom}</option>)}
              </select>
              {errors.zone && <p className="text-xs text-red-500 mt-1">{errors.zone}</p>}
            </div>

            {region && (
              <>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => { setModeZone('region'); setDepartementsSelectionnes([]) }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${modeZone === 'region' ? 'bg-[#0d5068] text-white border-[#0d5068]' : 'border-gray-200 text-gray-600 hover:border-[#0d5068]'}`}
                  >
                    Toute la région {region.nom}
                  </button>
                  <button
                    onClick={() => setModeZone('departements')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${modeZone === 'departements' ? 'bg-[#0d5068] text-white border-[#0d5068]' : 'border-gray-200 text-gray-600 hover:border-[#0d5068]'}`}
                  >
                    Choisir des départements
                  </button>
                </div>

                {modeZone === 'departements' && (
                  <div className="flex flex-wrap gap-2">
                    {region.departements.map(dep => (
                      <button
                        key={dep}
                        onClick={() => toggleDepartement(dep)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${departementsSelectionnes.includes(dep) ? 'bg-[#22c55e] text-white border-[#22c55e]' : 'border-gray-200 text-gray-600 hover:border-[#0d5068]'}`}
                      >
                        {dep}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Moyens de paiement */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-1">Moyens de paiement <span className="text-red-500">*</span></h2>
            <p className="text-xs text-gray-400 mb-4">Au moins un moyen de paiement requis</p>
            {errors.paiement && <p className="text-xs text-red-500 mb-3">{errors.paiement}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {OPERATEURS_MM.map(op => {
                const selected = !!moyensPaiement.find(m => m.operateur === op.value)
                return (
                  <button
                    key={op.value}
                    onClick={() => selected ? removeMoyenPaiement(op.value) : addMoyenPaiement(op.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${selected ? 'bg-[#0d5068] text-white border-[#0d5068]' : 'border-gray-200 text-gray-600 hover:border-[#0d5068]'}`}
                  >
                    {selected ? '✓ ' : ''}{op.label}
                  </button>
                )
              })}
              <button
                onClick={() => setAccepteEspeces(!accepteEspeces)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${accepteEspeces ? 'bg-[#0d5068] text-white border-[#0d5068]' : 'border-gray-200 text-gray-600 hover:border-[#0d5068]'}`}
              >
                {accepteEspeces ? '✓ ' : ''}Espèces
              </button>
            </div>

            {moyensPaiement.map(m => (
              <div key={m.operateur} className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-gray-600 w-28 flex-shrink-0">{m.operateur}</span>
                <div className="flex-1">
                  <input
                    value={m.numero}
                    onChange={e => updateNumeroMM(m.operateur, e.target.value)}
                    type="tel"
                    placeholder="+221 77 000 00 00"
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] ${errors[`mm_${m.operateur}`] ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors[`mm_${m.operateur}`] && <p className="text-xs text-red-500 mt-1">{errors[`mm_${m.operateur}`]}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Documents de vérification */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-800">Documents de vérification</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${documents.length === 0 ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
                {documents.length} document{documents.length > 1 ? 's' : ''} ajouté{documents.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Diplôme, CNI, casier judiciaire...</p>

            <div className="flex items-center gap-3 mb-4">
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none"
              >
                {TYPES_DOCUMENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-xs font-bold bg-[#0d5068] text-white rounded-lg px-3 py-2 cursor-pointer hover:bg-[#0a3f52] transition">
                + Ajouter un fichier
                <input ref={fileRef} type="file" accept=".pdf,image/jpeg,image/png" onChange={handleDocFile} className="hidden" />
              </label>
              <span className="text-xs text-gray-400">PDF, JPG, PNG · 5 MB max</span>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded bg-[#0d5068]/10 flex items-center justify-center text-xs">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{doc.nom}</p>
                      <p className="text-[10px] text-gray-400">{TYPES_DOCUMENT.find(t => t.value === doc.type)?.label}</p>
                    </div>
                    <button onClick={() => removeDoc(i)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Retirer</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}