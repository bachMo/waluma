'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Stats {
  totalPraticiens: number
  totalMissions: number
  totalPatients: number
  revenuTotal: number
  missionsParJour: { date: string; count: number }[]
  topPraticiens: { nom: string; missions: number; note: number | null; specialite: string }[]
  repartitionSpecialites: { label: string; count: number }[]
}

const MISSION_STATUTS: Record<string, { label: string; variant: 'amber' | 'blue' | 'green' | 'red' | 'gray' }> = {
  EN_ATTENTE: { label: 'En attente', variant: 'amber' },
  EN_COURS: { label: 'En cours', variant: 'blue' },
  TERMINEE: { label: 'Terminée', variant: 'green' },
  ANNULEE: { label: 'Annulée', variant: 'red' },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<Stats>('/stats/dashboard')
      setStats(data)
    } catch {
      // keep previous data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const t = setInterval(fetchStats, 30_000)
    return () => clearInterval(t)
  }, [fetchStats])

  const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
  const fmtF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F'

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Dashboard" subtitle="Vue temps réel" />

      <div className="flex-1 p-5 sm:p-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />
            ))
          ) : (
            <>
              <StatCard
                label="Praticiens actifs"
                value={fmtNum(stats?.totalPraticiens ?? 0)}
                delta={8}
                sub="ce mois"
                accent="#0d5068"
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                }
              />
              <StatCard
                label="Missions totales"
                value={fmtNum(stats?.totalMissions ?? 0)}
                delta={12}
                sub="ce mois"
                accent="#22c55e"
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                }
              />
              <StatCard
                label="Patients"
                value={fmtNum(stats?.totalPatients ?? 0)}
                delta={5}
                sub="ce mois"
                accent="#6366f1"
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M2 15c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                }
              />
              <StatCard
                label="Revenus"
                value={fmtF(stats?.revenuTotal ?? 0)}
                delta={18}
                sub="ce mois"
                accent="#f97316"
                icon={
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 7.5h14" stroke="currentColor" strokeWidth="1.4"/>
                    <circle cx="4.5" cy="11" r="1" fill="currentColor"/>
                  </svg>
                }
              />
            </>
          )}
        </div>

        {/* CHART + SIDE */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[14px] font-bold text-[#0a2535]">Missions par jour</div>
                <div className="text-[11.5px] text-gray-400 mt-0.5">30 derniers jours</div>
              </div>
              <Badge variant="teal">Temps réel</Badge>
            </div>
            {loading ? (
              <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.missionsParJour ?? []} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    cursor={{ fill: '#f0f7f5' }}
                  />
                  <Bar dataKey="count" fill="#0d5068" radius={[4, 4, 0, 0]} name="Missions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Répartition spécialités */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="text-[14px] font-bold text-[#0a2535] mb-1">Spécialités</div>
            <div className="text-[11.5px] text-gray-400 mb-5">Répartition des missions</div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.repartitionSpecialites ?? []).map((s) => {
                  const total = (stats?.repartitionSpecialites ?? []).reduce((a, b) => a + b.count, 0)
                  const pct = total ? Math.round((s.count / total) * 100) : 0
                  return (
                    <div key={s.label}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-gray-600 truncate max-w-[140px]">{s.label}</span>
                        <span className="font-semibold text-[#0a2535]">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0d5068] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* TOP PRATICIENS */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <div className="text-[14px] font-bold text-[#0a2535]">Top praticiens</div>
              <div className="text-[11.5px] text-gray-400 mt-0.5">Ce mois · classés par missions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-36" />
                    <div className="h-2.5 bg-gray-50 rounded animate-pulse w-20" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
                </div>
              ))
            ) : (
              (stats?.topPraticiens ?? []).map((p, idx) => (
                <div key={p.nom} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-amber-50 text-amber-600' :
                    idx === 1 ? 'bg-gray-100 text-gray-500' :
                    idx === 2 ? 'bg-orange-50 text-orange-500' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#0a2535] truncate">{p.nom}</div>
                    <div className="text-[11px] text-gray-400">{p.specialite}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[13px] font-bold text-[#0a2535]">{p.missions}</div>
                    <div className="text-[10.5px] text-gray-400">missions</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {typeof p.note === 'number' ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b">
                          <path d="M5 1l1.2 2.5L9 4l-2 1.9.5 2.6L5 7.3 2.5 8.5 3 5.9 1 4l2.8-.5L5 1z"/>
                        </svg>
                        <span className="text-[11.5px] font-semibold text-gray-600">{p.note.toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-gray-400">pas encore noté</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
