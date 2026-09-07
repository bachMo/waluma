'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import Link from 'next/link'

interface Praticien {
  id: string
  statutCompte: string
  disponible: boolean
  totalMissions: number
  noteMoyenne: number | null
  tauxAcceptation: number | null
  createdAt: string
  user: { nom: string; prenom: string; telephone: string }
  specialites: { specialite: string; principale: boolean }[]
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

const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Infirmier/ère IDE',
  MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapeute',
  PRELEVEUR: 'Préleveur/se',
  PEDIATRE: 'Pédiatre',
  AUTRE: 'Autre',
}

export default function PraticiensPage() {
  const [praticiens, setPraticiens] = useState<Praticien[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statut, setStatut] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statut) params.append('statut', statut)
      const { data } = await api.get(`/praticiens?${params}`)
      setPraticiens(data.praticiens)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statut])

  async function handleToggleDisponible(p: Praticien) {
    await api.patch(`/praticiens/${p.id}/disponibilite`)
    load()
  }

  async function handleStatut(id: string, newStatut: string) {
    await api.patch(`/praticiens/${id}/statut`, { statut: newStatut })
    load()
  }

  const filtered = praticiens.filter(p =>
    `${p.user.prenom} ${p.user.nom}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Praticiens">
        <Link
          href="/praticiens/ajouter"
          className="flex items-center gap-1.5 text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition"
        >
          + Ajouter un praticien
        </Link>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Gestion des praticiens</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} praticiens au total</p>
        </div>

        {/* Alerte validation */}
        {praticiens.filter(p => p.statutCompte === 'EN_ATTENTE').length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2 mb-5 text-sm text-yellow-700">
            <span>⏱</span>
            <span><strong>{praticiens.filter(p => p.statutCompte === 'EN_ATTENTE').length} praticiens</strong> attendent une validation de leurs documents.</span>
          </div>
        )}

        {/* Filtres */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher un praticien..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-52"
          />
          <select
            value={statut}
            onChange={e => setStatut(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
          >
            <option value="">Tous les statuts</option>
            <option value="VALIDE">Actifs</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="SUSPENDU">Suspendus</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Praticien</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Spécialité</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Missions</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Note</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Disponible</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Ajouté le</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Aucun praticien trouvé</td></tr>
              ) : filtered.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition ${
                    p.statutCompte === 'EN_ATTENTE' ? 'bg-yellow-50/50' :
                    p.statutCompte === 'SUSPENDU' ? 'bg-red-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] flex items-center justify-center text-[10px] font-bold text-[#0d5068] flex-shrink-0">
                        {p.user.prenom[0]}{p.user.nom[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-[13px]">{p.user.prenom} {p.user.nom}</div>
                        <div className="text-[11px] text-gray-400">{p.user.telephone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 truncate">
                    {specialiteLabel[p.specialites.find(s => s.principale)?.specialite ?? ''] ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statutVariant[p.statutCompte] ?? 'pending'} label={statutLabel[p.statutCompte] ?? p.statutCompte} />
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">{p.totalMissions}</td>
                  <td className="px-4 py-3 text-center">
                    {p.noteMoyenne ? (
                      <span className="font-semibold text-gray-900">{p.noteMoyenne.toFixed(1)}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
  <div className="flex items-center justify-center gap-1.5">
    <div className={`w-2 h-2 rounded-full ${p.disponible ? 'bg-[#22c55e]' : 'bg-gray-300'}`}></div>
    <span className={`text-[11px] font-semibold ${p.disponible ? 'text-[#15803d]' : 'text-gray-400'}`}>
      {p.disponible ? 'Dispo' : 'Indispo'}
    </span>
  </div>
</td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.statutCompte === 'EN_ATTENTE' && (
                        <>
                          <button
                            onClick={() => handleStatut(p.id, 'VALIDE')}
                            className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => handleStatut(p.id, 'REFUSE')}
                            className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      {p.statutCompte === 'VALIDE' && (
                        <button
                          onClick={() => handleStatut(p.id, 'SUSPENDU')}
                          className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition"
                        >
                          Suspendre
                        </button>
                      )}
                      {p.statutCompte === 'SUSPENDU' && (
                        <button
                          onClick={() => handleStatut(p.id, 'VALIDE')}
                          className="text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-200 transition"
                        >
                          Réactiver
                        </button>
                      )}
                      <Link
  href={`/praticiens/${p.id}`}
  className="text-[11px] font-bold bg-[#e0f2fe] text-[#0d5068] border border-[#0d5068]/20 rounded-lg px-2 py-1 hover:bg-[#cfe8f5] transition"
>
  Voir
</Link>
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