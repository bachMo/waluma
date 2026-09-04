'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'

const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers',
  MEDECIN_GENERALISTE: 'Médecine générale',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement',
  PEDIATRE: 'Pédiatrie',
  AUTRE: 'Autres',
}

interface StatsData {
  kpis: {
    totalMissions: number
    missionsCeMois: number
    missionsActives: number
    totalPraticiens: number
    praticiensActifs: number
    totalPatients: number
    litigesOuverts: number
    totalLitiges: number
    volumeCeMois: number
  }
  graphiqueMissions: { jour: string; missions: number }[]
  repartitionSpecialites: { specialite: string; count: number }[]
  topPraticiens: { nom: string; missions: number; note: number | null }[]
}

export default function StatistiquesPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: d } = await api.get('/stats/dashboard')
        setData(d)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalSpec = data?.repartitionSpecialites.reduce((s, r) => s + r.count, 0) || 1

  const indicateurs = data ? [
    { label: 'Missions totales', valeur: data.kpis.totalMissions, detail: `${data.kpis.missionsCeMois} ce mois` },
    { label: 'Praticiens actifs', valeur: data.kpis.praticiensActifs, detail: `${data.kpis.totalPraticiens} au total` },
    { label: 'Patients inscrits', valeur: data.kpis.totalPatients, detail: 'Total cumulé' },
    { label: 'Litiges ouverts', valeur: data.kpis.litigesOuverts, detail: `${data.kpis.totalLitiges} au total` },
    { label: 'Missions actives', valeur: data.kpis.missionsActives, detail: 'En ce moment' },
    { label: 'Volume FCFA ce mois', valeur: data.kpis.volumeCeMois.toLocaleString(), detail: 'Paiements confirmés' },
  ] : []

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Statistiques">
        <button className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          CSV
        </button>
        <button className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          PDF
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Statistiques · données réelles</h1>
          <p className="text-sm text-gray-400 mt-0.5">Toutes les données · Périmètre Dakar</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">Chargement...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <StatCard
                label="Missions ce mois"
                value={data?.kpis.missionsCeMois ?? 0}
                delta={`${data?.kpis.totalMissions ?? 0} au total`}
                deltaUp
              />
              <StatCard
                label="Volume FCFA"
                value={data?.kpis.volumeCeMois
                  ? (data.kpis.volumeCeMois / 1000000).toFixed(2) + 'M'
                  : '0'}
                delta="Ce mois"
                deltaUp
              />
              <StatCard
                label="Praticiens actifs"
                value={data?.kpis.praticiensActifs ?? 0}
                delta={`${data?.kpis.totalPraticiens ?? 0} au total`}
                deltaUp
              />
              <StatCard
                label="Patients inscrits"
                value={data?.kpis.totalPatients ?? 0}
                delta="Total cumulé"
                deltaUp
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-sm font-bold text-gray-800 mb-4">Missions par jour · ce mois</div>
                {(data?.graphiqueMissions.length ?? 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={data?.graphiqueMissions} barSize={18}>
                      <XAxis dataKey="jour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="missions" fill="#0d5068" radius={[3,3,0,0]} opacity={0.8} name="Missions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[130px] flex items-center justify-center text-sm text-gray-300">
                    Aucune mission ce mois
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-sm font-bold text-gray-800 mb-4">Répartition par spécialité</div>
                {(data?.repartitionSpecialites.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {data?.repartitionSpecialites.map(r => {
                      const pct = Math.round((r.count / totalSpec) * 100)
                      return (
                        <div key={r.specialite}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">{specialiteLabel[r.specialite] ?? r.specialite}</span>
                            <span className="font-semibold text-gray-800">{pct}% · {r.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#22c55e]" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 text-sm text-gray-300">Aucune donnée</div>
                )}
              </div>
            </div>

            {/* Tableau indicateurs */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Indicateur', 'Valeur', 'Détail'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {indicateurs.map((ind, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900 text-[13px]">{ind.label}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#0d5068]">{ind.valeur}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500">{ind.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top praticiens */}
            {(data?.topPraticiens.length ?? 0) > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-sm font-bold text-gray-800 mb-4">Top praticiens</div>
                <div className="space-y-3">
                  {data?.topPraticiens.map((p, i) => (
                    <div key={p.nom} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0">
                      <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{p.nom}</div>
                        <div className="text-xs text-gray-400">{p.missions} mission{p.missions > 1 ? 's' : ''}</div>
                      </div>
                      {p.note && (
                        <span className="text-sm font-bold text-yellow-500">★ {p.note.toFixed(1)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}