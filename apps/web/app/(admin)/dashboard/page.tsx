'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
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
  topPraticiens: {
    id: string
    nom: string
    missions: number
    note: number | null
    specialite: string
  }[]
  repartitionSpecialites: {
    specialite: string
    count: number
  }[]
  graphiqueMissions: {
    jour: string
    missions: number
  }[]
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
    <div className="flex flex-col h-full min-w-0">
      <Topbar title="Tableau de bord">
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Mis à jour toutes les 30s
          </span>
          <button
            type="button"
            className="text-[12px] font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
          >
            Exporter
          </button>
        </div>
      </Topbar>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6">

        {/* ─── Header ─── */}
        <div className="mb-6">
          <h2 className="font-extrabold text-[18px] sm:text-[20px] text-gray-900 tracking-tight">
            Vue d&apos;ensemble
          </h2>
          <p className="text-[13px] text-gray-400 mt-0.5">Dakar, Sénégal</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#0d5068] border-t-transparent animate-spin" />
            <span className="text-[13px] text-gray-400">Chargement des données…</span>
          </div>
        ) : (
          <>
            {/* ─── Banner missions actives ─── */}
            {(data?.kpis.missionsActives ?? 0) > 0 && (
              <Link href="/missions" className="block mb-5">
                <div className="bg-[#0d5068] rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-[#0a3f52] transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse flex-shrink-0" />
                  <span className="text-white text-[13px] font-medium flex-1">
                    <strong className="text-[#4ade80]">
                      {data?.kpis.missionsActives} mission{(data?.kpis.missionsActives ?? 0) > 1 ? 's' : ''} active{(data?.kpis.missionsActives ?? 0) > 1 ? 's' : ''}
                    </strong>{' '}en ce moment
                  </span>
                  <span className="text-white/60 text-[12px] font-semibold whitespace-nowrap">Superviser →</span>
                </div>
              </Link>
            )}

            {/* ─── KPIs ─── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
              <StatCard
                label="Missions ce mois"
                value={data?.kpis.missionsCeMois ?? 0}
                delta={`${data?.kpis.totalMissions ?? 0} au total`}
                deltaUp
                accent="#22c55e"
              />
              <StatCard
                label="Volume FCFA"
                value={data?.kpis.volumeCeMois ? data.kpis.volumeCeMois.toLocaleString('fr-FR') : '0'}
                delta="Ce mois"
                deltaUp
                accent="#0d5068"
              />
              <StatCard
                label="Praticiens actifs"
                value={data?.kpis.praticiensActifs ?? 0}
                delta={`${data?.kpis.totalPraticiens ?? 0} au total`}
                deltaUp
                accent="#8b5cf6"
              />
              <StatCard
                label="Patients inscrits"
                value={data?.kpis.totalPatients ?? 0}
                delta="Total"
                deltaUp
                accent="#f59e0b"
              />
            </div>

            {/* ─── Graphiques ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              {/* Graphique missions */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] font-bold text-gray-900">Missions par jour</div>
                  <span className="text-[11px] text-gray-400">Ce mois</span>
                </div>
                {(data?.graphiqueMissions.length ?? 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={data?.graphiqueMissions} barSize={18} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <XAxis dataKey="jour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: '#f7f9fb' }}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}
                      />
                      <Bar dataKey="missions" fill="#22c55e" radius={[4, 4, 0, 0]} name="Missions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-[13px] text-gray-300">
                    Aucune mission ce mois
                  </div>
                )}
              </div>

              {/* Répartition spécialités */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] font-bold text-gray-900">Par spécialité</div>
                  <span className="text-[11px] text-gray-400">{totalSpecialites} total</span>
                </div>
                {(data?.repartitionSpecialites.length ?? 0) > 0 ? (
                  <div className="space-y-3">
                    {data?.repartitionSpecialites.map((r) => {
                      const pct = Math.round((r.count / totalSpecialites) * 100)
                      return (
                        <div key={r.specialite}>
                          <div className="flex items-center justify-between gap-3 text-[11.5px] mb-1.5">
                            <span className="text-gray-500 truncate">{specialiteLabel[r.specialite] ?? r.specialite}</span>
                            <span className="font-semibold text-gray-800 whitespace-nowrap tabular-nums">{pct}% · {r.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: specialiteColor[r.specialite] ?? '#d1d5db' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 text-[13px] text-gray-300">Aucune donnée</div>
                )}
              </div>
            </div>

            {/* ─── Actions / Top / Aperçu ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* Actions requises */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 min-w-0">
                <div className="text-[11.5px] font-semibold text-gray-400 mb-3">Actions requises</div>
                <div className="space-y-2">
                  {(data?.kpis.praticiensAValider ?? 0) > 0 && (
                    <Link href="/praticiens" className="block">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-center gap-2 hover:bg-amber-100 transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="5" r="2.5" stroke="#d97706" strokeWidth="1.4"/>
                            <path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-amber-800">
                            {data?.kpis.praticiensAValider} praticien{(data?.kpis.praticiensAValider ?? 0) > 1 ? 's' : ''} à valider
                          </div>
                          <div className="text-[10.5px] text-amber-600">En attente de vérification</div>
                        </div>
                        <span className="text-amber-400 text-[11px]">→</span>
                      </div>
                    </Link>
                  )}

                  {(data?.kpis.litigesOuverts ?? 0) > 0 && (
                    <Link href="/litiges" className="block">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-center gap-2 hover:bg-red-100 transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1.5L13 12H1L7 1.5z" stroke="#dc2626" strokeWidth="1.4" strokeLinejoin="round"/>
                            <path d="M7 5.5v3" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round"/>
                            <circle cx="7" cy="10" r="0.6" fill="#dc2626"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-red-800">
                            {data?.kpis.litigesOuverts} litige{(data?.kpis.litigesOuverts ?? 0) > 1 ? 's' : ''} ouvert{(data?.kpis.litigesOuverts ?? 0) > 1 ? 's' : ''}
                          </div>
                          <div className="text-[10.5px] text-red-600">Nécessite votre attention</div>
                        </div>
                        <span className="text-red-400 text-[11px]">→</span>
                      </div>
                    </Link>
                  )}

                  {(data?.kpis.praticiensAValider ?? 0) === 0 && (data?.kpis.litigesOuverts ?? 0) === 0 && (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="text-[12px] text-green-700 font-medium">Tout est nominal</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top praticiens */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 min-w-0">
                <div className="text-[11.5px] font-semibold text-gray-400 mb-3">Top praticiens</div>
                {(data?.topPraticiens.length ?? 0) > 0 ? (
                  <div className="space-y-2.5">
                    {data?.topPraticiens.map((p, i) => (
                      <div key={p.id ?? `praticien-${i}`} className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold text-gray-800 truncate">{p.nom}</div>
                          <div className="text-[10.5px] text-gray-400">{p.missions} mission{p.missions > 1 ? 's' : ''}</div>
                        </div>
                        {p.note !== null && (
                          <span className="text-[11.5px] font-semibold text-amber-500 whitespace-nowrap">★ {p.note.toFixed(1)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12px] text-gray-300 text-center py-4">Aucune donnée</div>
                )}
              </div>

              {/* Aperçu global */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 min-w-0 md:col-span-2 xl:col-span-1">
                <div className="text-[11.5px] font-semibold text-gray-400 mb-3">Aperçu global</div>
                <div className="space-y-2">
                  {[
                    { label: 'Total missions', value: data?.kpis.totalMissions ?? 0 },
                    { label: 'Litiges total', value: data?.kpis.totalLitiges ?? 0 },
                    { label: 'Praticiens total', value: data?.kpis.totalPraticiens ?? 0 },
                    { label: 'Patients inscrits', value: data?.kpis.totalPatients ?? 0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-[12.5px] text-gray-500">{item.label}</span>
                      <span className="text-[13px] font-bold text-gray-900 tabular-nums">{item.value.toLocaleString('fr-FR')}</span>
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
