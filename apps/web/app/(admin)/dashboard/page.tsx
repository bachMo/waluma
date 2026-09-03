'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'

const missionData = [
  { jour: '1', missions: 8 }, { jour: '5', missions: 12 },
  { jour: '10', missions: 15 }, { jour: '15', missions: 22 },
  { jour: '20', missions: 28 }, { jour: '25', missions: 35 },
  { jour: '29', missions: 42 },
]

const specialiteData = [
  { name: 'Soins infirmiers', pct: 48, count: 166, color: '#22c55e' },
  { name: 'Médecine générale', pct: 28, count: 97, color: '#0d5068' },
  { name: 'Sage-femme', pct: 12, count: 42, color: '#8b5cf6' },
  { name: 'Prélèvement', pct: 8, count: 28, color: '#f59e0b' },
  { name: 'Autres', pct: 4, count: 14, color: '#d1d5db' },
]

interface DashboardStats {
  totalMissions: number
  totalPraticiens: number
  praticienAValider: number
  litiges: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const praticiens = await api.get('/praticiens?limit=100')
        setStats({
          totalMissions: 347,
          totalPraticiens: praticiens.data.total,
          praticienAValider: praticiens.data.praticiens.filter(
            (p: { statutCompte: string }) => p.statutCompte === 'EN_ATTENTE'
          ).length,
          litiges: 3,
        })
      } catch {
        setStats({ totalMissions: 347, totalPraticiens: 87, praticienAValider: 3, litiges: 3 })
      }
    }
    loadStats()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tableau de bord">
        <span className="text-xs text-gray-400">Mis à jour il y a 30s</span>
        <button className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          Exporter
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-sm text-gray-400 mt-0.5">Dakar, Sénégal</p>
        </div>

        {/* Banner mission live */}
        <div className="bg-[#e0f2fe] border border-[#0d5068]/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-5 cursor-pointer hover:bg-[#cfe8f5] transition">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-[#0d5068]">
            <strong>7 missions actives</strong> en ce moment — 4 en route, 2 en cours, 1 en attente.
          </span>
          <span className="ml-auto text-xs font-semibold text-[#0d5068] underline">Superviser →</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard label="Missions · ce mois" value={stats?.totalMissions ?? '—'} delta="+18% vs mois dernier" deltaUp />
          <StatCard label="Volume · FCFA" value="16,3M" delta="+22%" deltaUp />
          <StatCard label="Praticiens actifs" value={stats?.totalPraticiens ?? '—'} delta="+5 ce mois" deltaUp />
          <StatCard label="Satisfaction moy." value="4,83" delta="+0,04" deltaUp />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-4">Missions par jour · août</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={missionData} barSize={20}>
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="missions" fill="#22c55e" radius={[3,3,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-4">Répartition par spécialité</div>
            <div className="space-y-3">
              {specialiteData.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{s.name}</span>
                    <span className="font-semibold text-gray-800">{s.pct}% · {s.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions + Top praticiens + Paiements */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Actions requises</div>
            <div className="space-y-2">
              {(stats?.praticienAValider ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer">
                  <span className="text-yellow-500 text-sm">⏱</span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-yellow-700">{stats?.praticienAValider} praticiens à valider</div>
                    <div className="text-[10px] text-yellow-600">En attente de vérification</div>
                  </div>
                  <span className="text-yellow-500 text-xs">→</span>
                </div>
              )}
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer">
                <span className="text-red-500 text-sm">⚠</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-red-700">{stats?.litiges} litiges ouverts</div>
                  <div className="text-[10px] text-red-600">Dont 1 urgent</div>
                </div>
                <span className="text-red-500 text-xs">→</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <span className="text-green-500 text-sm">✓</span>
                <div className="text-xs text-green-700">Paiements · tout nominal</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Top praticiens · mois</div>
            <div className="space-y-3">
              {[
                { rank: '🥇', name: 'Aminata Diallo', missions: 18, note: '4,9' },
                { rank: '🥈', name: 'Moussa Fall', missions: 15, note: '4,7' },
                { rank: '🥉', name: 'Kadiatou Sow', missions: 14, note: '4,8' },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="text-sm">{p.rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-400">{p.missions} missions</div>
                  </div>
                  <span className="text-xs font-semibold text-yellow-500">★ {p.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Paiements Mobile Money</div>
            <div className="space-y-3">
              {[
                { label: 'Wave', pct: 64, amount: '10,4M', color: '#00a0e3' },
                { label: 'Orange Money', pct: 29, amount: '4,7M', color: '#ff6600' },
                { label: 'Free Money', pct: 7, amount: '1,1M', color: '#e31e24' },
              ].map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{p.label}</span>
                    <span className="font-semibold text-gray-800">{p.pct}% · {p.amount}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}