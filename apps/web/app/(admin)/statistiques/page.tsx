'use client'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const volumeData = [
  { mois: 'Sep 25', v: 6 }, { mois: 'Oct', v: 7 }, { mois: 'Nov', v: 8 },
  { mois: 'Déc', v: 7 }, { mois: 'Jan 26', v: 9 }, { mois: 'Fév', v: 10 },
  { mois: 'Mar', v: 11 }, { mois: 'Avr', v: 12 }, { mois: 'Mai', v: 13 },
  { mois: 'Jun', v: 14 }, { mois: 'Jul', v: 13 }, { mois: 'Aoû', v: 16 },
]

const heureData = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}h`,
  v: i < 6 ? Math.floor(Math.random() * 3) + 1
    : i < 10 ? Math.floor(Math.random() * 15) + 10
    : i < 14 ? Math.floor(Math.random() * 20) + 20
    : i < 18 ? Math.floor(Math.random() * 25) + 25
    : Math.floor(Math.random() * 15) + 5,
}))

const indicateurs = [
  { label: 'Missions totales', aout: '347', juil: '294', variation: '+18%', objectif: '320', ok: true },
  { label: 'Volume FCFA', aout: '16,3M', juil: '13,4M', variation: '+22%', objectif: '15M', ok: true },
  { label: 'Taux d\'annulation', aout: '5,8%', juil: '7,2%', variation: '-1,4 pts', objectif: '< 8%', ok: true },
  { label: 'Délai moyen matching', aout: '2,3 min', juil: '2,8 min', variation: '-18%', objectif: '< 3 min', ok: true },
  { label: 'Note moyenne patients', aout: '4,83', juil: '4,79', variation: '+0,04', objectif: '≥ 4,5', ok: true },
  { label: 'Nouveaux patients', aout: '186', juil: '141', variation: '+32%', objectif: '150', ok: true },
  { label: 'Litiges ouverts', aout: '3', juil: '5', variation: '-40%', objectif: '< 5', ok: true },
]

export default function StatistiquesPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Statistiques">
        <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#0d5068]">
          <option>Août 2026</option>
          <option>Juillet 2026</option>
          <option>Q3 2026</option>
        </select>
        <button className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">CSV</button>
        <button className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">PDF</button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Rapport mensuel · Août 2026</h1>
          <p className="text-sm text-gray-400 mt-0.5">Toutes les données · Périmètre Dakar</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard label="Volume total (FCFA)" value="16,3M" delta="+22%" deltaUp />
          <StatCard label="Revenus Waluma (10%)" value="1,63M" delta="+22%" deltaUp />
          <StatCard label="Taux de complétion" value="94,2%" delta="+1,4 pts" deltaUp />
          <StatCard label="NPS patients" value="+71" delta="Excellent" deltaUp />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-4">Volume mensuel · 12 derniers mois</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={volumeData} barSize={18}>
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="v" fill="#0d5068" radius={[3,3,0,0]} opacity={0.8} name="M FCFA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-1">Missions par heure de la journée</div>
            <div className="text-xs text-gray-400 mb-3">Pic : 10h–12h et 16h–18h</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={heureData} barSize={8}>
                <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="v" fill="#22c55e" radius={[2,2,0,0]} opacity={0.75} name="Missions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Indicateur', 'Août 2026', 'Juillet 2026', 'Variation', 'Objectif', 'Statut'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indicateurs.map((ind, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold text-gray-900 text-[13px]">{ind.label}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">{ind.aout}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{ind.juil}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-green-600">{ind.variation}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{ind.objectif}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ OK</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}