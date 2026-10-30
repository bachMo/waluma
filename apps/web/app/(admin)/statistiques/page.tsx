'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import api from '@/lib/api'
import { DashboardStats, SPECIALITE_LABEL, fcfa, nombre } from '@/lib/api-types'

export default function StatistiquesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(false)

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get<DashboardStats>('/stats/dashboard')
      setStats(data)
      setErreur(false)
    } catch {
      setErreur(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const k = stats?.kpis
  const repartition = stats?.repartitionSpecialites ?? []
  const graphique = stats?.graphiqueMissions ?? []
  const totalReparti = repartition.reduce((a, r) => a + r.count, 0)

  const donneesSpecialites = repartition.map((r) => ({
    nom: SPECIALITE_LABEL[r.specialite] ?? r.specialite,
    missions: r.count,
  }))

  const tauxCompletion =
    k && k.totalMissions > 0
      ? Math.round(((k.totalMissions - k.missionsActives) / k.totalMissions) * 100)
      : null

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Statistiques" subtitle="Chiffres cumulés depuis le lancement" />

      <div className="flex-1 space-y-5 p-5 sm:p-6">
        {erreur && !stats && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            Impossible de charger les statistiques. Vérifiez que l&apos;API est accessible.
          </div>
        )}

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-100 bg-white" />
            ))
          ) : (
            <>
              <StatCard
                label="Missions au total"
                value={nombre(k?.totalMissions)}
                sub={`${nombre(k?.missionsCeMois)} ce mois`}
                accent="#0d5068"
              />
              <StatCard
                label="Taux de complétion"
                value={tauxCompletion === null ? '—' : `${tauxCompletion}%`}
                sub={tauxCompletion === null ? 'aucune mission' : `${nombre(k?.missionsActives)} encore en cours`}
                accent="#22c55e"
              />
              <StatCard
                label="Praticiens"
                value={nombre(k?.praticiensActifs)}
                sub={`${nombre(k?.praticiensAValider)} en attente de validation`}
                accent="#6366f1"
              />
              <StatCard
                label="Encaissé ce mois"
                value={fcfa(k?.volumeCeMois)}
                sub="paiements confirmés"
                accent="#f97316"
              />
            </>
          )}
        </div>

        {/* Second rang : santé de la plateforme */}
        {!loading && k && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { l: 'Patients inscrits', v: nombre(k.totalPatients) },
              { l: 'Praticiens inscrits', v: nombre(k.totalPraticiens) },
              { l: 'Litiges ouverts', v: nombre(k.litigesOuverts) },
              { l: 'Litiges au total', v: nombre(k.totalLitiges) },
            ].map((x) => (
              <div key={x.l} className="rounded-xl border border-gray-100 bg-white px-4 py-3.5">
                <p className="text-[11.5px] text-gray-400">{x.l}</p>
                <p className="mt-1 text-[20px] font-bold text-[#0a2535]">{x.v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Missions par jour */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="text-[14px] font-bold text-[#0a2535]">Missions par jour</h2>
          <p className="mt-0.5 mb-5 text-[11.5px] text-gray-400">Mois en cours</p>

          {loading ? (
            <div className="h-72 animate-pulse rounded-lg bg-gray-50" />
          ) : graphique.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <p className="text-[13.5px] font-semibold text-[#0a2535]">Aucune mission ce mois</p>
              <p className="mt-1 text-[12.5px] text-gray-400">Le graphique se remplira dès la première demande.</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphique} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    labelFormatter={(v) => `Jour ${v}`}
                    formatter={(v) => [String(v), 'missions']}
                  />
                  <Bar dataKey="missions" fill="#0d5068" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Répartition par spécialité */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="text-[14px] font-bold text-[#0a2535]">Missions par spécialité</h2>
          <p className="mt-0.5 mb-5 text-[11.5px] text-gray-400">
            {totalReparti > 0 ? `${nombre(totalReparti)} missions réparties` : 'Depuis le lancement'}
          </p>

          {loading ? (
            <div className="h-72 animate-pulse rounded-lg bg-gray-50" />
          ) : donneesSpecialites.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-[13.5px] font-semibold text-[#0a2535]">Aucune mission enregistrée</p>
              <p className="mt-1 text-[12.5px] text-gray-400">La répartition apparaîtra ici.</p>
            </div>
          ) : (
            <div style={{ height: Math.max(180, donneesSpecialites.length * 46) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={donneesSpecialites}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="nom"
                    width={140}
                    tick={{ fontSize: 12, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v) => [String(v), 'missions']}
                  />
                  <Bar dataKey="missions" fill="#0d5068" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
