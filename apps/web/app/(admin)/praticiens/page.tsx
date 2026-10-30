'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Praticien {
  id: string
  prenom: string
  nom: string
  telephone: string
  specialite: string
  statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'EN_ATTENTE'
  missionsTotal: number
  note: number | null
  createdAt: string
}

const STATUT_MAP: Record<Praticien['statut'], { label: string; variant: 'green' | 'gray' | 'red' | 'amber' }> = {
  ACTIF: { label: 'Actif', variant: 'green' },
  INACTIF: { label: 'Inactif', variant: 'gray' },
  SUSPENDU: { label: 'Suspendu', variant: 'red' },
  EN_ATTENTE: { label: 'En attente', variant: 'amber' },
}

export default function PraticiensPage() {
  const [praticiens, setPraticiens] = useState<Praticien[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'activate' | null>(null)

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get<Praticien[]>('/praticiens')
      setPraticiens(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = praticiens.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${p.prenom} ${p.nom} ${p.telephone} ${p.specialite}`.toLowerCase().includes(q)
    const matchStatut = filterStatut === 'tous' || p.statut === filterStatut
    return matchSearch && matchStatut
  })

  async function handleAction() {
    if (!confirmId || !confirmAction) return
    await api.patch(`/praticiens/${confirmId}/${confirmAction === 'suspend' ? 'suspendre' : 'activer'}`)
    setConfirmId(null)
    setConfirmAction(null)
    fetch()
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Praticiens"
        subtitle={`${praticiens.length} inscrits`}
        actions={
          <button className="flex items-center gap-2 bg-[#0d5068] hover:bg-[#0a3f52] text-white text-[12.5px] font-bold px-4 py-2 rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Inviter
          </button>
        }
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
              placeholder="Chercher un praticien…"
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-[13px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#0d5068] transition"
          >
            <option value="tous">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="INACTIF">Inactif</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Praticien', 'Spécialité', 'Téléphone', 'Missions', 'Note', 'Statut', ''].map((h) => (
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
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '140px' : '80px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-gray-400">
                      Aucun praticien trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const st = STATUT_MAP[p.statut]
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f0f7f5] flex items-center justify-center text-[11px] font-bold text-[#0d5068] flex-shrink-0">
                              {p.prenom[0]}{p.nom[0]}
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[#0a2535]">{p.prenom} {p.nom}</div>
                              <div className="text-[11px] text-gray-400">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">{p.specialite}</td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-500 whitespace-nowrap">{p.telephone}</td>
                        <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0a2535]">{p.missionsTotal}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {typeof p.note === 'number' ? (
                              <>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b">
                                  <path d="M5 1l1.2 2.5L9 4l-2 1.9.5 2.6L5 7.3 2.5 8.5 3 5.9 1 4l2.8-.5L5 1z"/>
                                </svg>
                                <span className="text-[12.5px] font-semibold text-gray-700">{p.note.toFixed(1)}</span>
                              </>
                            ) : (
                              <span className="text-[12px] text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={st.variant} dot>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {p.statut === 'ACTIF' ? (
                              <button
                                onClick={() => { setConfirmId(p.id); setConfirmAction('suspend') }}
                                className="text-[11.5px] font-semibold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
                              >
                                Suspendre
                              </button>
                            ) : (
                              <button
                                onClick={() => { setConfirmId(p.id); setConfirmAction('activate') }}
                                className="text-[11.5px] font-semibold text-[#0d5068] hover:text-[#0a3f52] px-2.5 py-1 rounded-md hover:bg-[#f0f7f5] transition-colors"
                              >
                                Activer
                              </button>
                            )}
                          </div>
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

      {/* CONFIRM MODAL */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-7 max-w-sm w-full">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5l7.5 15h-15L9 1.5z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 7v4M9 12.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-bold text-[#0a2535] text-center mb-2">
              {confirmAction === 'suspend' ? 'Suspendre ce praticien ?' : 'Activer ce praticien ?'}
            </h3>
            <p className="text-[12.5px] text-gray-500 text-center mb-6">
              {confirmAction === 'suspend'
                ? 'Le praticien ne pourra plus recevoir de missions.'
                : 'Le praticien pourra à nouveau recevoir des missions.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmId(null); setConfirmAction(null) }}
                className="flex-1 border border-gray-200 text-gray-600 text-[13px] font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors ${
                  confirmAction === 'suspend' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#22c55e] hover:bg-[#16a34a]'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
