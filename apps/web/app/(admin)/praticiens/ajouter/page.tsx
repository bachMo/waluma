'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'

const specialites = [
  { value: 'INFIRMIER', label: 'Infirmier/ère diplômé(e) d\'État' },
  { value: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste' },
  { value: 'SAGE_FEMME', label: 'Sage-femme' },
  { value: 'KINESITHERAPEUTE', label: 'Kinésithérapeute' },
  { value: 'PRELEVEUR', label: 'Préleveur/se' },
  { value: 'PEDIATRE', label: 'Pédiatre' },
  { value: 'AUTRE', label: 'Autre' },
]

export default function AjouterPraticienPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', dateNaissance: '', sexe: '',
    zone: '', specialite: 'INFIRMIER', numeroOrdre: '',
    anneesExperience: '', bio: '', commission: '10',
    operateurMM: 'WAVE', numeroMM: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/praticiens/creer', {
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        specialite: form.specialite,
        numeroOrdre: form.numeroOrdre,
        anneesExperience: parseInt(form.anneesExperience) || 0,
        bio: form.bio,
        zoneIntervention: form.zone.split(',').map(z => z.trim()).filter(Boolean),
        commission: parseFloat(form.commission) || 10,
        operateurMM: form.operateurMM,
        numeroMM: form.numeroMM,
      })
      setSuccess(true)
      setTimeout(() => router.push('/praticiens'), 1500)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e?.response?.data?.error ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Ajouter un praticien">
        <button onClick={() => router.push('/praticiens')} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          Annuler
        </button>
        <button form="form-praticien" type="submit" disabled={loading} className="text-xs font-bold bg-[#0d5068] text-white rounded-lg px-3 py-1.5 hover:bg-[#0a3f52] transition disabled:opacity-50">
          {loading ? 'Création...' : '✓ Créer le compte'}
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Nouveau praticien</h1>
          <p className="text-sm text-gray-400 mt-0.5">Un SMS avec les identifiants temporaires sera envoyé automatiquement.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">✓ Compte créé. Redirection...</div>
        )}

        <div className="bg-[#e0f2fe] border border-[#0d5068]/20 rounded-xl px-4 py-3 text-sm text-[#0d5068] mb-6">
          Un mot de passe temporaire sera généré automatiquement. Le praticien devra le changer à sa première connexion.
        </div>

        <form id="form-praticien" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-5">

            {/* Infos personnelles */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Informations personnelles</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Prénom <span className="text-red-500">*</span></label>
                  <input required value={form.prenom} onChange={e => set('prenom', e.target.value)} type="text" placeholder="Aminata" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nom <span className="text-red-500">*</span></label>
                  <input required value={form.nom} onChange={e => set('nom', e.target.value)} type="text" placeholder="Diallo" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Téléphone <span className="text-red-500">*</span></label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0d5068]">
                  <span className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-500 border-r border-gray-200">🇸🇳 +221</span>
                  <input required value={form.telephone} onChange={e => set('telephone', '+221' + e.target.value.replace('+221', ''))} type="tel" placeholder="77 000 00 00" className="flex-1 px-3 py-2 text-sm outline-none" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Ce numéro servira d&apos;identifiant unique.</p>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Zone d&apos;intervention <span className="text-red-500">*</span></label>
                <input required value={form.zone} onChange={e => set('zone', e.target.value)} type="text" placeholder="Almadies, Mermoz, Plateau..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                <p className="text-[11px] text-gray-400 mt-1">Séparez les zones par des virgules.</p>
              </div>
            </div>

            {/* Infos professionnelles */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Informations professionnelles</div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Spécialité principale <span className="text-red-500">*</span></label>
                <select value={form.specialite} onChange={e => set('specialite', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none">
                  {specialites.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Numéro d&apos;ordre professionnel</label>
                <input value={form.numeroOrdre} onChange={e => set('numeroOrdre', e.target.value)} type="text" placeholder="INF-SN-2018-04821" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Années d&apos;expérience</label>
                <input value={form.anneesExperience} onChange={e => set('anneesExperience', e.target.value)} type="number" min="0" max="50" placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Biographie courte</label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Description visible par les patients..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Commission Waluma (%)</label>
                <input value={form.commission} onChange={e => set('commission', e.target.value)} type="number" min="0" max="100" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]" />
                <p className="text-[11px] text-gray-400 mt-1">Taux par défaut : 10%</p>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Documents de vérification</div>
              <p className="text-xs text-gray-400 mb-3">Les documents peuvent être ajoutés après la création du compte depuis la fiche du praticien.</p>
              {[
                { label: 'Diplôme ou attestation de qualification', required: true },
                { label: 'Inscription à l\'ordre professionnel', required: true },
                { label: 'Pièce d\'identité nationale (CNI)', required: true },
                { label: 'Casier judiciaire bulletin n°3', required: false },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center gap-3 border border-dashed border-gray-200 rounded-lg px-3 py-2.5 mb-2 cursor-pointer hover:border-[#0d5068] transition">
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm flex-shrink-0">📄</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-700">{doc.label}{doc.required && <span className="text-red-500 ml-1">*</span>}</div>
                    <div className="text-[10px] text-gray-400">PDF ou image · 5 MB max · Cliquer pour uploader</div>
                  </div>
                  <div className="ml-auto text-gray-300 text-sm">↑</div>
                </div>
              ))}
            </div>

            {/* Paiement */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-4">Moyen de paiement</div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Opérateur principal <span className="text-red-500">*</span></label>
                <select value={form.operateurMM} onChange={e => set('operateurMM', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] appearance-none">
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="FREE_MONEY">Free Money</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Numéro Mobile Money <span className="text-red-500">*</span></label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0d5068]">
                  <span className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-500 border-r border-gray-200">🇸🇳 +221</span>
                  <input value={form.numeroMM} onChange={e => set('numeroMM', e.target.value)} type="tel" placeholder="77 000 00 00" className="flex-1 px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="text-xs font-bold text-green-700 mb-1">Compte activé à la création</div>
                <div className="text-[11px] text-green-600">Le praticien reçoit ses identifiants temporaires par SMS dès que vous cliquez sur &quot;Créer le compte&quot;.</div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}