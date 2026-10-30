'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import {
  ListeMissions,
  Mission,
  StatutMission,
  STATUT_MISSION_LABEL,
  SPECIALITE_LABEL,
  fcfa,
  dateCourte,
  heure,
  nomComplet,
} from '@/lib/api-types'

type Variante = 'amber' | 'blue' | 'violet' | 'teal' | 'green' | 'red' | 'gray'

const VARIANTE: Record<StatutMission, Variante> = {
  EN_ATTENTE: 'amber',
  ACCEPTEE: 'blue',
  EN_ROUTE: 'violet',
  ARRIVE: 'violet',
  EN_COURS: 'teal',
  TERMINEE: 'green',
  ANNULEE: 'red',
  EXPIREE: 'gray',
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState('tous')

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get<ListeMissions>('/missions', { params: { limit: 100 } })
      setMissions(Array.isArray(data?.missions) ? data.missions : [])
      setTotal(data?.total ?? 0)
      setErreur(null)
    } catch {
      setErreur("Impossible de charger les missions. Vérifiez que l'API est accessible.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const filtres = missions.filter((m) => {
    const q = search.trim().toLowerCase()
    const correspond =
      !q ||
      `${nomComplet(m.patient)} ${m.praticien ? nomComplet(m.praticien.user) : ''} ${m.adresseTexte ?? ''} ${m.reference ?? ''}`
        .toLowerCase()
        .includes(q)
    return correspond && (filtre === 'tous' || m.statut === filtre)
  })

  const actives = missions.filter((m) =>
    ['ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'].includes(m.statut)
  ).length

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Missions"
        subtitle={loading ? 'Chargement…' : actives > 0 ? `${actives} en cours · ${total} au total` : `${total} mission${total > 1 ? 's' : ''}`}
      />

      <div className="flex-1 space-y-4 p-5 sm:p-6">
        {erreur && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{erreur}</div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un patient, un praticien, une adresse"
            className="min-w-[240px] flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
          />
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#0d5068]"
          >
            <option value="tous">Tous les statuts</option>
            {Object.entries(STATUT_MISSION_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Patient', 'Praticien', 'Soin', 'Adresse', 'Montant', 'Créée le', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={7} className="px-4 py-4"><div className="h-5 animate-pulse rounded bg-gray-50" /></td>
                    </tr>
                  ))
                ) : filtres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <p className="text-[13.5px] font-semibold text-[#0a2535]">
                        {missions.length === 0 ? 'Aucune mission enregistrée' : 'Aucun résultat'}
                      </p>
                      <p className="mt-1 text-[12.5px] text-gray-400">
                        {missions.length === 0
                          ? 'Les demandes des patients apparaîtront ici.'
                          : 'Essayez un autre terme ou un autre statut.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtres.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3.5">
                        <Link href={`/missions/${m.id}`} className="group block">
                          <span className="block text-[13px] font-semibold text-[#0a2535] group-hover:text-[#0d5068]">
                            {nomComplet(m.patient)}
                          </span>
                          <span className="block text-[11.5px] text-gray-400">{m.patient?.telephone ?? '—'}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-gray-600">
                        {m.praticien ? nomComplet(m.praticien.user) : (
                          <span className="text-[12px] font-medium text-amber-600">non assigné</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-600">
                        {SPECIALITE_LABEL[m.specialite] ?? m.specialite}
                        {m.urgence && (
                          <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">urgent</span>
                        )}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3.5 text-[12.5px] text-gray-500">
                        {m.adresseTexte || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#0a2535]">
                        {fcfa(m.montantTotal)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-500">
                        {dateCourte(m.createdAt)}
                        <span className="ml-1 text-gray-400">{heure(m.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={VARIANTE[m.statut] ?? 'gray'} dot>
                          {STATUT_MISSION_LABEL[m.statut] ?? m.statut}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
