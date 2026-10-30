'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Mission {
  id: string
  patient: { prenom: string; nom: string; telephone: string }
  praticien: { prenom: string; nom: string } | null
  specialite: string
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
  montant: number
  adresse: string
  createdAt: string
}

const STATUT_MAP: Record<Mission['statut'], { label: string; variant: 'amber' | 'blue' | 'green' | 'red' }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'amber' },
  EN_COURS: { label: 'En cours', variant: 'blue' },
  TERMINEE: { label: 'Terminée', variant: 'green' },
  ANNULEE: { label: 'Annulée', variant: 'red' },
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('tous')

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get<Mission[]>('/missions')
      setMissions(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = missions.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !q || [m.patient.prenom, m.patient.nom, m.patient.telephone, m.specialite, m.adresse]
      .join(' ').toLowerCase().includes(q)
    const matchStatut = filterStatut === 'tous' || m.statut === filterStatut
    return matchSearch && matchStatut
  })

  const fmtF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F'
  const fmtDate = (s: string) => new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Missions"
        subtitle={`${missions.length} au total`}
      />

      <div className="p-5 sm:p-6 space-y-4">
        {/* FILTRES */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher une mission…"
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#0d5068] transition"
          >
            <option value="tous">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Patient', 'Praticien', 'Spécialité', 'Adresse', 'Montant', 'Date', 'Statut'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '130px' : '80px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-gray-400">
                      Aucune mission trouvée.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => {
                    const st = STATUT_MAP[m.statut]
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="text-[13px] font-semibold text-[#0a2535] whitespace-nowrap">{m.patient.prenom} {m.patient.nom}</div>
                          <div className="text-[11px] text-gray-400">{m.patient.telephone}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">
                          {m.praticien ? `${m.praticien.prenom} ${m.praticien.nom}` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">{m.specialite}</td>
                        <td className="px-4 py-3.5 text-[12px] text-gray-500 max-w-[160px]">
                          <div className="truncate">{m.adresse}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0a2535] whitespace-nowrap">{fmtF(m.montant)}</td>
                        <td className="px-4 py-3.5 text-[11.5px] text-gray-500 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={st.variant} dot>{st.label}</Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
