'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Topbar from '@/components/admin/Topbar'
import StatCard from '@/components/ui/StatCard'
import api from '@/lib/api'
import {
  DashboardStats,
  SPECIALITE_LABEL,
  fcfa,
  nombre,
} from '@/lib/api-types'

export default function DashboardPage() {
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

  useEffect(() => {
    charger()
    const t = setInterval(charger, 30_000)
    return () => clearInterval(t)
  }, [charger])

  const k = stats?.kpis
  const graphique = stats?.graphiqueMissions ?? []
  const repartition = stats?.repartitionSpecialites ?? []
  const top = stats?.topPraticiens ?? []
  const totalReparti = repartition.reduce((acc, r) => acc + r.count, 0)

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Dashboard" subtitle="Vue temps réel" />

      <div className="flex-1 p-5 sm:p-6 space-y-6">
        {erreur && !stats && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            Impossible de charger les statistiques. Vérifiez que l&apos;API est accessible.
          </div>
        )}

        {/* KPIs — uniquement des valeurs renvoyées par l'API */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl border border-gray-100 bg-white animate-pulse" />
            ))
          ) : (
            <>
              <StatCard
                label="Praticiens actifs"
                value={nombre(k?.praticiensActifs)}
                sub={`${nombre(k?.totalPraticiens)} au total`}
                accent="#0d5068"
              />
              <StatCard
                label="Missions en cours"
                value={nombre(k?.missionsActives)}
                sub={`${nombre(k?.totalMissions)} depuis le début`}
                accent="#22c55e"
              />
              <StatCard
                label="Patients"
                value={nombre(k?.totalPatients)}
                sub={`${nombre(k?.missionsCeMois)} missions ce mois`}
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

        {/* À traiter */}
        {!loading && ((k?.praticiensAValider ?? 0) > 0 || (k?.litigesOuverts ?? 0) > 0) && (
          <div className="flex flex-wrap gap-2">
            {(k?.praticiensAValider ?? 0) > 0 && (
              <Link
                href="/praticiens"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-[12.5px] font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                {nombre(k?.praticiensAValider)} praticien{(k?.praticiensAValider ?? 0) > 1 ? 's' : ''} à valider
              </Link>
            )}
            {(k?.litigesOuverts ?? 0) > 0 && (
              <Link
                href="/litiges"
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[12.5px] font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                {nombre(k?.litigesOuverts)} litige{(k?.litigesOuverts ?? 0) > 1 ? 's' : ''} ouvert{(k?.litigesOuverts ?? 0) > 1 ? 's' : ''}
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Graphique missions */}
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-[#0a2535]">Missions par jour</h2>
                <p className="mt-0.5 text-[11.5px] text-gray-400">Mois en cours</p>
              </div>
              <span className="rounded-md bg-[#f0f7f5] px-2 py-1 text-[11px] font-semibold text-[#0d5068]">
                Temps réel
              </span>
            </div>

            {loading ? (
              <div className="h-64 animate-pulse rounded-lg bg-gray-50" />
            ) : graphique.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-[13.5px] font-semibold text-[#0a2535]">Aucune mission ce mois</p>
                <p className="mt-1 text-[12.5px] text-gray-400">
                  Le graphique se remplira dès la première demande.
                </p>
              </div>
            ) : (
              <div className="h-64">
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

          {/* Répartition spécialités */}
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="text-[14px] font-bold text-[#0a2535]">Spécialités</h2>
            <p className="mt-0.5 mb-5 text-[11.5px] text-gray-400">Répartition des missions</p>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-gray-50" />
                ))}
              </div>
            ) : repartition.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] text-gray-400">
                Aucune mission enregistrée.
              </p>
            ) : (
              <div className="space-y-3.5">
                {repartition.map((r) => {
                  const pct = totalReparti > 0 ? Math.round((r.count / totalReparti) * 100) : 0
                  return (
                    <div key={r.specialite}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="truncate text-[12.5px] text-gray-600">
                          {SPECIALITE_LABEL[r.specialite] ?? r.specialite}
                        </span>
                        <span className="shrink-0 text-[12px] font-semibold text-[#0a2535]">
                          {r.count} · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-[#0d5068]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top praticiens */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="text-[14px] font-bold text-[#0a2535]">Meilleurs praticiens</h2>
          <p className="mt-0.5 mb-5 text-[11.5px] text-gray-400">Par note, puis par nombre de missions</p>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
              ))}
            </div>
          ) : top.length === 0 ? (
            <p className="py-8 text-center text-[12.5px] text-gray-400">
              Aucun praticien validé pour le moment.
            </p>
          ) : (
            <div className="space-y-1">
              {top.map((p, i) => (
                <div key={`${p.nom}-${i}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-700'
                      : i === 1 ? 'bg-gray-100 text-gray-600'
                      : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[#0a2535]">{p.nom}</div>
                    <div className="text-[11px] text-gray-400">
                      {p.specialite ? (SPECIALITE_LABEL[p.specialite] ?? p.specialite) : '—'}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[13px] font-bold text-[#0a2535]">{p.missions}</div>
                    <div className="text-[10.5px] text-gray-400">missions</div>
                  </div>

                  <div className="flex w-[92px] shrink-0 items-center justify-end gap-1">
                    {typeof p.note === 'number' ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b" aria-hidden="true">
                          <path d="M5 1l1.2 2.5L9 4l-2 1.9.5 2.6L5 7.3 2.5 8.5 3 5.9 1 4l2.8-.5L5 1z"/>
                        </svg>
                        <span className="text-[11.5px] font-semibold text-gray-600">{p.note.toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-gray-400">pas encore noté</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
