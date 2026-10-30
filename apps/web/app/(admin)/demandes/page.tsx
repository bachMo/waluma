'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Demande {
  id: string
  prenom: string
  nom: string
  telephone: string
  email: string
  specialite: string
  experience: string
  zones: string[]
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE'
  createdAt: string
}

const STATUT_MAP: Record<Demande['statut'], { label: string; variant: 'amber' | 'green' | 'red' }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'amber' },
  APPROUVEE: { label: 'Approuvée', variant: 'green' },
  REJETEE: { label: 'Rejetée', variant: 'red' },
}

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Demande | null>(null)
  const [filterStatut, setFilterStatut] = useState('tous')

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get<Demande[]>('/demandes')
      setDemandes(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handleDecision(id: string, action: 'approuver' | 'rejeter') {
    await api.patch(`/demandes/${id}/${action}`)
    setSelected(null)
    fetch()
  }

  const filtered = demandes.filter((d) => filterStatut === 'tous' || d.statut === filterStatut)
  const enAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Demandes d'inscription"
        subtitle={enAttente > 0 ? `${enAttente} en attente de validation` : `${demandes.length} demandes`}
      />

      <div className="p-5 sm:p-6 space-y-4">
        {/* ONGLETS STATUT */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {[
            { val: 'tous', label: 'Toutes' },
            { val: 'EN_ATTENTE', label: 'En attente' },
            { val: 'APPROUVEE', label: 'Approuvées' },
            { val: 'REJETEE', label: 'Rejetées' },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setFilterStatut(t.val)}
              className={`px-3.5 py-1.5 text-[12.5px] font-medium rounded-md transition-all ${
                filterStatut === t.val
                  ? 'bg-[#0d5068] text-white font-semibold'
                  : 'text-gray-500 hover:text-[#0a2535]'
              }`}
            >
              {t.label}
              {t.val === 'EN_ATTENTE' && enAttente > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${filterStatut === t.val ? 'bg-white/20' : 'bg-amber-100 text-amber-600'}`}>
                  {enAttente}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Candidat', 'Spécialité', 'Expérience', 'Zones', 'Date', 'Statut', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
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
                      Aucune demande.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => {
                    const st = STATUT_MAP[d.statut]
                    return (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelected(d)}>
                        <td className="px-4 py-3.5">
                          <div className="text-[13px] font-semibold text-[#0a2535]">{d.prenom} {d.nom}</div>
                          <div className="text-[11px] text-gray-400">{d.telephone}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">{d.specialite}</td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">{d.experience}</td>
                        <td className="px-4 py-3.5 text-[12px] text-gray-500 max-w-[160px]">
                          <div className="truncate">{d.zones.join(', ')}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[11.5px] text-gray-500 whitespace-nowrap">
                          {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={st.variant} dot>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {d.statut === 'EN_ATTENTE' && (
                            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDecision(d.id, 'approuver')}
                                className="text-[11.5px] font-semibold text-[#22c55e] hover:bg-[#f0fdf4] px-2.5 py-1 rounded-md transition-colors"
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() => handleDecision(d.id, 'rejeter')}
                                className="text-[11.5px] font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors"
                              >
                                Rejeter
                              </button>
                            </div>
                          )}
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

      {/* DETAIL DRAWER */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-[#0a2535]">Dossier candidat</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'Nom complet', val: `${selected.prenom} ${selected.nom}` },
                  { label: 'Téléphone', val: selected.telephone },
                  { label: 'Email', val: selected.email },
                  { label: 'Spécialité', val: selected.specialite },
                  { label: 'Expérience', val: selected.experience },
                  { label: 'Zones', val: selected.zones.join(', ') },
                ].map((r) => (
                  <div key={r.label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-[11px] text-gray-400 mb-0.5">{r.label}</div>
                    <div className="text-[13px] font-semibold text-[#0a2535]">{r.val}</div>
                  </div>
                ))}
              </div>
              {selected.statut === 'EN_ATTENTE' && (
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => handleDecision(selected.id, 'approuver')}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl text-[13.5px] transition-colors"
                  >
                    Approuver la candidature
                  </button>
                  <button
                    onClick={() => handleDecision(selected.id, 'rejeter')}
                    className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl text-[13.5px] transition-colors"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
