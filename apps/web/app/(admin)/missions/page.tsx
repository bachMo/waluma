
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Mission {
  id: string
  reference: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  debutSoinAt: string | null
  enRouteAt: string | null
  accepteeAt: string | null
  createdAt: string
  urgence: boolean
  patient: {
    nom: string
    prenom: string
  }
  praticien: {
    user: {
      nom: string
      prenom: string
    }
  } | null
}

const statutVariant: Record<
  string,
  'active' | 'enroute' | 'inprog' | 'urgent' | 'done' | 'cancelled' | 'pending'
> = {
  EN_ATTENTE: 'urgent',
  ACCEPTEE: 'pending',
  EN_ROUTE: 'enroute',
  ARRIVE: 'enroute',
  EN_COURS: 'inprog',
  TERMINEE: 'done',
  ANNULEE: 'cancelled',
  EXPIREE: 'cancelled',
}

const statutLabel: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  EN_ROUTE: 'En route',
  ARRIVE: 'Arrivé',
  EN_COURS: 'Soin en cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
  EXPIREE: 'Expirée',
}

const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers',
  MEDECIN_GENERALISTE: 'Médecine générale',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement',
  PEDIATRE: 'Pédiatrie',
  AUTRE: 'Autre',
}

const ACTIVES = [
  'EN_ATTENTE',
  'ACCEPTEE',
  'EN_ROUTE',
  'ARRIVE',
  'EN_COURS',
]

export default function MissionsPage() {
  const router = useRouter()

  const [missions, setMissions] = useState<Mission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        limit: '50',
      })

      if (filterStatut) {
        params.append('statut', filterStatut)
      }

      const { data } = await api.get(`/missions?${params}`)

      setMissions(data.missions)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filterStatut])

  async function handleAssigner(
    e: React.MouseEvent,
    missionId: string
  ) {
    e.stopPropagation()

    const praticienId = prompt(
      'ID du praticien à assigner :'
    )

    if (!praticienId) {
      return
    }

    try {
      await api.patch(
        `/missions/${missionId}/assigner`,
        {
          praticienId,
        }
      )

      load()
    } catch {
      alert("Erreur lors de l'assignation")
    }
  }

  const filtered = missions.filter((m) =>
    `${m.patient.prenom} ${m.patient.nom} ${
      m.praticien?.user.prenom ?? ''
    } ${m.praticien?.user.nom ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const missionsActives = missions.filter((m) =>
    ACTIVES.includes(m.statut)
  )

  function formatHeure(date: string | null) {
    if (!date) {
      return '—'
    }

    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full min-w-0">
      <Topbar title="Missions en cours">
        <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />

          <span>
            {missionsActives.length} mission
            {missionsActives.length > 1 ? 's' : ''} active
            {missionsActives.length > 1 ? 's' : ''}
          </span>
        </div>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-w-0">
        <div className="mb-5">
          <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
            Supervision en temps réel
          </h1>

          <p className="text-sm text-gray-400 mt-0.5">
            {total} mission{total > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
            <input
              type="text"
              placeholder="Rechercher patient, praticien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-full sm:w-72 lg:w-80"
            />

            <select
              value={filterStatut}
              onChange={(e) =>
                setFilterStatut(e.target.value)
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-full sm:w-auto"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">
                En attente
              </option>
              <option value="EN_ROUTE">
                En route
              </option>
              <option value="EN_COURS">
                Soin en cours
              </option>
              <option value="TERMINEE">
                Terminées
              </option>
              <option value="ANNULEE">
                Annulées
              </option>
            </select>
          </div>

          <button
            onClick={load}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition whitespace-nowrap self-start lg:self-auto"
          >
            ↻ Actualiser
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="text-sm w-full"
              style={{
                minWidth: '1050px',
              }}
            >
              <colgroup>
                <col style={{ width: '90px' }} />
                <col style={{ width: '220px' }} />
                <col style={{ width: '190px' }} />
                <col style={{ width: '190px' }} />
                <col style={{ width: '135px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '85px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '85px' }} />
              </colgroup>

              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    'Réf.',
                    'Patient',
                    'Type',
                    'Praticien',
                    'Statut',
                    'Créée',
                    'Démarré',
                    'Montant',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Aucune mission trouvée
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() =>
                        router.push(`/missions/${m.id}`)
                      }
                      className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${
                        m.statut === 'EN_ATTENTE' &&
                        !m.praticien
                          ? 'bg-red-50/40'
                          : ''
                      }`}
                    >
                      {/* Référence */}
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        {m.reference
                          .slice(0, 8)
                          .toUpperCase()}
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-[13px] truncate">
                            {m.patient.prenom}{' '}
                            {m.patient.nom}
                          </div>

                          <div
                            className="text-[11px] text-gray-400 truncate"
                            title={m.adresseTexte}
                          >
                            {m.adresseTexte}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 text-[12px] text-gray-600">
                        <span
                          className="block truncate"
                          title={
                            specialiteLabel[
                              m.specialite
                            ] ?? m.specialite
                          }
                        >
                          {specialiteLabel[
                            m.specialite
                          ] ?? m.specialite}
                        </span>
                      </td>

                      {/* Praticien */}
                      <td className="px-4 py-3">
                        {m.praticien ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[9px] font-bold text-green-700 flex-shrink-0">
                              {m.praticien.user.prenom[0]}
                              {m.praticien.user.nom[0]}
                            </div>

                            <span className="text-[12px] font-medium text-gray-700 truncate">
                              {m.praticien.user.prenom}{' '}
                              {m.praticien.user.nom}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] font-bold text-red-600 whitespace-nowrap">
                            Aucun praticien
                          </span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            statutVariant[m.statut] ??
                            'pending'
                          }
                          label={
                            statutLabel[m.statut] ??
                            m.statut
                          }
                        />
                      </td>

                      {/* Créée */}
                      <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">
                        {formatHeure(m.createdAt)}
                      </td>

                      {/* Démarré */}
                      <td className="px-4 py-3 text-[12px] font-bold text-purple-700 whitespace-nowrap">
                        {formatHeure(
                          m.debutSoinAt ||
                            m.enRouteAt ||
                            m.accepteeAt
                        )}
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3 font-mono text-[12px] text-gray-700 whitespace-nowrap">
                        {m.montantTotal.toLocaleString()}
                      </td>

                      {/* Action */}
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        {!m.praticien &&
                        m.statut === 'EN_ATTENTE' ? (
                          <button
                            onClick={(e) =>
                              handleAssigner(e, m.id)
                            }
                            className="text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg px-2 py-1 hover:bg-yellow-100 transition whitespace-nowrap"
                          >
                            Assigner
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            →
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-3 text-xs text-gray-400">
          <span>
            {filtered.length} mission
            {filtered.length > 1 ? 's' : ''} affichée
            {filtered.length > 1 ? 's' : ''}
          </span>

          <span>{total} au total</span>

          <span className="sm:hidden text-[10px]">
            Faites glisser horizontalement pour voir toutes
            les colonnes →
          </span>
        </div>
      </div>
    </div>
  )
}

