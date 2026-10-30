'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import api from '@/lib/api'

interface StatsData {
  revenuMensuel: { mois: string; revenu: number; missions: number }[]
  tauxCompletion: number
  delaiMoyen: number
  noteMoyenne: number
  totalRevenu: number
  missionsParSpecialite: { specialite: string; count: number }[]
}

export default function StatistiquesPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState<'3m' | '6m' | '12m'>('6m')

  const fetch = useCallback(async () => {
    try {
      const { data: d } = await api.get<StatsData>(`/stats/avancees?periode=${periode}`)
      setData(d)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [periode])

  useEffect(() => { fetch() }, [fetch])

  const fmtF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F'

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Statistiques"
        subtitle="Analyse des performances"
        actions={
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['3m', '6m', '12m'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-md transition-all ${
                  periode === p ? 'bg-white text-[#0a2535] shadow-sm' : 'text-gray-500 hover:text-[#0a2535]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-5 sm:p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />
            ))
          ) : (
            <>
              <StatCard label="Revenu total" value={fmtF(data?.totalRevenu ?? 0)} accent="#22c55e" />
              <StatCard label="Taux de complétion" value={`${data?.tauxCompletion ?? 0}%`} accent="#0d5068" />
              <StatCard label="Délai moyen" value={`${data?.delaiMoyen ?? 0} min`} accent="#6366f1" />
              <StatCard label="Note moyenne" value={`${(data?.noteMoyenne ?? 0).toFixed(1)} / 5`} accent="#f97316" />
            </>
          )}
        </div>

        {/* COURBE REVENUS */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="mb-5">
            <div className="text-[14px] font-bold text-[#0a2535]">Revenus et missions</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">Évolution mensuelle sur la période</div>
          </div>
          {loading ? (
            <div className="h-56 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.revenuMensuel ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={40} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="revenu" name="Revenus (F)" stroke="#0d5068" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="missions" name="Missions" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MISSIONS PAR SPÉCIALITÉ */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="mb-5">
            <div className="text-[14px] font-bold text-[#0a2535]">Missions par spécialité</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">Répartition sur la période</div>
          </div>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.missionsParSpecialite ?? []} barSize={20} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis dataKey="specialite" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" fill="#0d5068" radius={[0, 4, 4, 0]} name="Missions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
