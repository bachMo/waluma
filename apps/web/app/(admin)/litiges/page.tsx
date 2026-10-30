'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Litige {
  id: string
  mission: { id: string; specialite: string }
  patient: { prenom: string; nom: string; telephone: string }
  praticien: { prenom: string; nom: string } | null
  description: string
  statut: 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'CLOS'
  montantLitige: number
  createdAt: string
}

const STATUT_MAP: Record<Litige['statut'], { label: string; variant: 'red' | 'amber' | 'green' | 'gray' }> = {
  OUVERT: { label: 'Ouvert', variant: 'red' },
  EN_COURS: { label: 'En cours', variant: 'amber' },
  RESOLU: { label: 'Résolu', variant: 'green' },
  CLOS: { label: 'Clos', variant: 'gray' },
}

export default function LitigesPage() {
  const [litiges, setLitiges] = useState<Litige[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Litige | null>(null)
  const [filterStatut, setFilterStatut] = useState('tous')

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get<Litige[]>('/litiges')
      setLitiges(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handleResoudre(id: string) {
    await api.patch(`/litiges/${id}/resoudre`)
    setSelected(null)
    fetch()
  }

  const filtered = litiges.filter((l) => filterStatut === 'tous' || l.statut === filterStatut)
  const ouverts = litiges.filter((l) => l.statut === 'OUVERT').length

  const fmtF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F'

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Litiges"
        subtitle={ouverts > 0 ? `${ouverts} litige${ouverts > 1 ? 's' : ''} ouvert${ouverts > 1 ? 's' : ''}` : `${litiges.length} litiges`}
      />

      <div className="p-5 sm:p-6 space-y-4">
        {/* ONGLETS */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {[
            { val: 'tous', label: 'Tous' },
            { val: 'OUVERT', label: 'Ouverts' },
            { val: 'EN_COURS', label: 'En cours' },
            { val: 'RESOLU', label: 'Résolus' },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setFilterStatut(t.val)}
              className={`px-3.5 py-1.5 text-[12.5px] font-medium rounded-md transition-all ${
                filterStatut === t.val ? 'bg-[#0d5068] text-white font-semibold' : 'text-gray-500 hover:text-[#0a2535]'
              }`}
            >
              {t.label}
              {t.val === 'OUVERT' && ouverts > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${filterStatut === t.val ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                  {ouverts}
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
                  {['Patient', 'Praticien', 'Mission', 'Montant', 'Date', 'Statut', ''].map((h) => (
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
                      Aucun litige.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => {
                    const st = STATUT_MAP[l.statut]
                    return (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelected(l)}>
                        <td className="px-4 py-3.5">
                          <div className="text-[13px] font-semibold text-[#0a2535]">{l.patient.prenom} {l.patient.nom}</div>
                          <div className="text-[11px] text-gray-400">{l.patient.telephone}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">
                          {l.praticien ? `${l.praticien.prenom} ${l.praticien.nom}` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-[12.5px] text-gray-600 whitespace-nowrap">{l.mission.specialite}</td>
                        <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0a2535] whitespace-nowrap">{fmtF(l.montantLitige)}</td>
                        <td className="px-4 py-3.5 text-[11.5px] text-gray-500 whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={st.variant} dot>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {(l.statut === 'OUVERT' || l.statut === 'EN_COURS') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleResoudre(l.id) }}
                              className="text-[11.5px] font-semibold text-[#0d5068] hover:bg-[#f0f7f5] px-2.5 py-1 rounded-md transition-colors"
                            >
                              Résoudre
                            </button>
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

      {/* DETAIL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-[#0a2535]">Détail du litige</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'Patient', val: `${selected.patient.prenom} ${selected.patient.nom}` },
                  { label: 'Praticien', val: selected.praticien ? `${selected.praticien.prenom} ${selected.praticien.nom}` : '—' },
                  { label: 'Mission', val: selected.mission.specialite },
                  { label: 'Montant', val: fmtF(selected.montantLitige) },
                ].map((r) => (
                  <div key={r.label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <div className="text-[11px] text-gray-400 mb-0.5">{r.label}</div>
                    <div className="text-[13px] font-semibold text-[#0a2535]">{r.val}</div>
                  </div>
                ))}
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="text-[11px] text-gray-400 mb-1">Description</div>
                  <div className="text-[12.5px] text-gray-700 leading-relaxed">{selected.description}</div>
                </div>
              </div>
              {(selected.statut === 'OUVERT' || selected.statut === 'EN_COURS') && (
                <button
                  onClick={() => handleResoudre(selected.id)}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl text-[13.5px] transition-colors"
                >
                  Marquer comme résolu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
