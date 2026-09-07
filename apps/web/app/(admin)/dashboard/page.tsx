'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import Link from 'next/link'

const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers',
  MEDECIN_GENERALISTE: 'Médecine générale',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement',
  PEDIATRE: 'Pédiatrie',
  AUTRE: 'Autres',
}

const specialiteColor: Record<string, string> = {
  INFIRMIER: '#22c55e',
  MEDECIN_GENERALISTE: '#0d5068',
  SAGE_FEMME: '#8b5cf6',
  KINESITHERAPEUTE: '#f59e0b',
  PRELEVEUR: '#ec4899',
  PEDIATRE: '#06b6d4',
  AUTRE: '#d1d5db',
}

interface DashboardData {
  kpis: {
    totalMissions: number
    missionsActives: number
    missionsCeMois: number
    totalPraticiens: number
    praticiensActifs: number
    praticiensAValider: number
    totalLitiges: number
    litigesOuverts: number
    totalPatients: number
    volumeCeMois: number
  }
  topPraticiens: { nom: string; missions: number; note: number | null; specialite: string }[]
  repartitionSpecialites: { specialite: string; count: number }[]
  graphiqueMissions: { jour: string; missions: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
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
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalSpecialites = data?.repartitionSpecialites.reduce((s, r) => s + r.count, 0) || 1

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tableau de bord">
        <span className="text-xs text-gray-400">Mis à jour toutes les 30s</span>
        <button className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          Exporter
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-sm text-gray-400 mt-0.5">Dakar, Sénégal</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">Chargement...</div>
        ) : (
          <>
            {/* Banner missions actives */}
            {(data?.kpis.missionsActives ?? 0) > 0 && (
              <Link href="/missions">
                <div className="bg-[#e0f2fe] border border-[#0d5068]/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-5 cursor-pointer hover:bg-[#cfe8f5] transition">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-[#0d5068]">
                    <strong>{data?.kpis.missionsActives} mission{(data?.kpis.missionsActives ?? 0) > 1 ? 's' : ''} active{(data?.kpis.missionsActives ?? 0) > 1 ? 's' : ''}</strong> en ce moment
                  </span>
                  <span className="ml-auto text-xs font-semibold text-[#0d5068] underline">Superviser →</span>
                </div>
              </Link>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <StatCard
                label="Missions · ce mois"
                value={data?.kpis.missionsCeMois ?? 0}
                delta={`${data?.kpis.totalMissions ?? 0} au total`}
                deltaUp
              />
              <StatCard
  label="Volume · FCFA"
  value={data?.kpis.volumeCeMois
    ? data.kpis.volumeCeMois.toLocaleString('fr-FR')
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
                delta="Total"
                deltaUp
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-sm font-bold text-gray-800 mb-4">Missions par jour · ce mois</div>
                {(data?.graphiqueMissions.length ?? 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={data?.graphiqueMissions} barSize={20}>
                      <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="missions" fill="#22c55e" radius={[3,3,0,0]} opacity={0.8} name="Missions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[120px] flex items-center justify-center text-sm text-gray-300">
                    Aucune mission ce mois
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-sm font-bold text-gray-800 mb-4">Répartition par spécialité</div>
                {(data?.repartitionSpecialites.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {data?.repartitionSpecialites.map((r) => {
                      const pct = Math.round((r.count / totalSpecialites) * 100)
                      return (
                        <div key={r.specialite}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">{specialiteLabel[r.specialite] ?? r.specialite}</span>
                            <span className="font-semibold text-gray-800">{pct}% · {r.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: specialiteColor[r.specialite] ?? '#d1d5db' }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 text-sm text-gray-300">
                    Aucune donnée
                  </div>
                )}
              </div>
            </div>

            {/* Actions + Top praticiens + Alertes */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Actions requises</div>
                <div className="space-y-2">
                  {(data?.kpis.praticiensAValider ?? 0) > 0 && (
                    <Link href="/praticiens">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-yellow-100 transition">
                        <span className="text-yellow-500 text-sm">⏱</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-yellow-700">{data?.kpis.praticiensAValider} praticien{(data?.kpis.praticiensAValider ?? 0) > 1 ? 's' : ''} à valider</div>
                          <div className="text-[10px] text-yellow-600">En attente de vérification</div>
                        </div>
                        <span className="text-yellow-500 text-xs">→</span>
                      </div>
                    </Link>
                  )}
                  {(data?.kpis.litigesOuverts ?? 0) > 0 && (
                    <Link href="/litiges">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-red-100 transition mt-2">
                        <span className="text-red-500 text-sm">⚠</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-red-700">{data?.kpis.litigesOuverts} litige{(data?.kpis.litigesOuverts ?? 0) > 1 ? 's' : ''} ouvert{(data?.kpis.litigesOuverts ?? 0) > 1 ? 's' : ''}</div>
                          <div className="text-[10px] text-red-600">Nécessite votre attention</div>
                        </div>
                        <span className="text-red-500 text-xs">→</span>
                      </div>
                    </Link>
                  )}
                  {(data?.kpis.praticiensAValider ?? 0) === 0 && (data?.kpis.litigesOuverts ?? 0) === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                      <span className="text-green-500 text-sm">✓</span>
                      <div className="text-xs text-green-700">Tout est nominal</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Top praticiens</div>
                {(data?.topPraticiens.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {data?.topPraticiens.map((p, i) => (
                      <div key={p.nom} className="flex items-center gap-2">
                        <span className="text-sm">{['🥇','🥈','🥉'][i]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">{p.nom}</div>
                          <div className="text-[10px] text-gray-400">{p.missions} mission{p.missions > 1 ? 's' : ''}</div>
                        </div>
                        {p.note && <span className="text-xs font-semibold text-yellow-500">★ {p.note.toFixed(1)}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-300 text-center py-4">Aucune donnée</div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Aperçu global</div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Total missions', value: data?.kpis.totalMissions ?? 0 },
                    { label: 'Litiges total', value: data?.kpis.totalLitiges ?? 0 },
                    { label: 'Praticiens total', value: data?.kpis.totalPraticiens ?? 0 },
                    { label: 'Patients inscrits', value: data?.kpis.totalPatients ?? 0 },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-xs font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}