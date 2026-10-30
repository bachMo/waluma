'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import {
  ListeLitiges,
  Litige,
  StatutLitige,
  STATUT_LITIGE_LABEL,
  SPECIALITE_LABEL,
  fcfa,
  dateCourte,
  nomComplet,
} from '@/lib/api-types'

type Variante = 'red' | 'amber' | 'green' | 'gray'

const VARIANTE: Record<StatutLitige, Variante> = {
  OUVERT: 'red',
  EN_TRAITEMENT: 'amber',
  RESOLU: 'green',
  CLOS: 'gray',
}

const ONGLETS: { valeur: string; libelle: string }[] = [
  { valeur: 'tous', libelle: 'Tous' },
  { valeur: 'OUVERT', libelle: 'Ouverts' },
  { valeur: 'EN_TRAITEMENT', libelle: 'En traitement' },
  { valeur: 'RESOLU', libelle: 'Résolus' },
  { valeur: 'CLOS', libelle: 'Clos' },
]

export default function LitigesPage() {
  const [litiges, setLitiges] = useState<Litige[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [filtre, setFiltre] = useState('tous')
  const [ouvert, setOuvert] = useState<Litige | null>(null)
  const [resolution, setResolution] = useState('')
  const [enCours, setEnCours] = useState(false)

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get<ListeLitiges>('/litiges', { params: { limit: 100 } })
      setLitiges(Array.isArray(data?.litiges) ? data.litiges : [])
      setTotal(data?.total ?? 0)
      setErreur(null)
    } catch {
      setErreur("Impossible de charger les litiges. Vérifiez que l'API est accessible.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const filtres = litiges.filter((l) => filtre === 'tous' || l.statut === filtre)
  const ouverts = litiges.filter((l) => l.statut === 'OUVERT').length

  async function appliquer(statut: StatutLitige) {
    if (!ouvert) return
    setEnCours(true)
    try {
      // PATCH /litiges/:id accepte { statut, resolution }
      await api.patch(`/litiges/${ouvert.id}`, {
        statut,
        resolution: resolution.trim() || undefined,
      })
      setOuvert(null)
      setResolution('')
      await charger()
    } catch {
      setErreur("Le litige n'a pas pu être mis à jour.")
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Litiges"
        subtitle={loading ? 'Chargement…' : ouverts > 0 ? `${ouverts} ouvert${ouverts > 1 ? 's' : ''} sur ${total}` : `${total} litige${total > 1 ? 's' : ''}`}
      />

      <div className="flex-1 space-y-4 p-5 sm:p-6">
        {erreur && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{erreur}</div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {ONGLETS.map((o) => {
            const n = o.valeur === 'tous' ? litiges.length : litiges.filter((l) => l.statut === o.valeur).length
            const actif = filtre === o.valeur
            return (
              <button
                key={o.valeur}
                onClick={() => setFiltre(o.valeur)}
                className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                  actif ? 'bg-[#0d5068] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#0d5068]'
                }`}
              >
                {o.libelle}
                {n > 0 && <span className={`ml-1.5 ${actif ? 'text-white/70' : 'text-gray-400'}`}>{n}</span>}
              </button>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Patient', 'Praticien', 'Soin', 'Motif', 'Montant', 'Ouvert le', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={7} className="px-4 py-4"><div className="h-5 animate-pulse rounded bg-gray-50" /></td>
                    </tr>
                  ))
                ) : filtres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <p className="text-[13.5px] font-semibold text-[#0a2535]">
                        {litiges.length === 0 ? 'Aucun litige' : 'Aucun litige dans cette catégorie'}
                      </p>
                      <p className="mt-1 text-[12.5px] text-gray-400">
                        {litiges.length === 0 ? 'Bonne nouvelle.' : 'Changez d’onglet pour en voir d’autres.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtres.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => { setOuvert(l); setResolution(l.resolution ?? '') }}
                      className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0a2535]">
                        {nomComplet(l.mission?.patient)}
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-gray-600">
                        {l.mission?.praticien ? nomComplet(l.mission.praticien.user) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-600">
                        {l.mission?.specialite ? (SPECIALITE_LABEL[l.mission.specialite] ?? l.mission.specialite) : '—'}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3.5 text-[12.5px] text-gray-500">{l.motif}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#0a2535]">
                        {fcfa(l.mission?.montantTotal)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-500">{dateCourte(l.ouvertAt)}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={VARIANTE[l.statut] ?? 'gray'} dot>
                          {STATUT_LITIGE_LABEL[l.statut] ?? l.statut}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Panneau de détail */}
      {ouvert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setOuvert(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#0a2535]">Litige</h2>
                <p className="mt-0.5 text-[12.5px] text-gray-400">Ouvert le {dateCourte(ouvert.ouvertAt)}</p>
              </div>
              <button onClick={() => setOuvert(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Fermer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <Badge variant={VARIANTE[ouvert.statut] ?? 'gray'} dot>
              {STATUT_LITIGE_LABEL[ouvert.statut] ?? ouvert.statut}
            </Badge>

            <dl className="mt-6 space-y-3 border-t border-gray-100 pt-5">
              {[
                { k: 'Patient', v: nomComplet(ouvert.mission?.patient) },
                { k: 'Praticien', v: ouvert.mission?.praticien ? nomComplet(ouvert.mission.praticien.user) : '—' },
                { k: 'Soin', v: ouvert.mission?.specialite ? (SPECIALITE_LABEL[ouvert.mission.specialite] ?? ouvert.mission.specialite) : '—' },
                { k: 'Montant', v: fcfa(ouvert.mission?.montantTotal) },
                { k: 'Motif', v: ouvert.motif },
              ].map((r) => (
                <div key={r.k} className="flex gap-4">
                  <dt className="w-24 shrink-0 text-[12.5px] text-gray-400">{r.k}</dt>
                  <dd className="text-[13px] text-[#0a2535]">{r.v}</dd>
                </div>
              ))}
            </dl>

            {ouvert.description && (
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="mb-1.5 text-[12px] font-semibold text-gray-500">Description</p>
                <p className="text-[13px] leading-relaxed text-[#0a2535]">{ouvert.description}</p>
              </div>
            )}

            {ouvert.statut !== 'CLOS' && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <label className="mb-1.5 block text-[12.5px] font-semibold text-[#0a2535]">
                  Résolution
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  placeholder="Ce qui a été décidé et pourquoi."
                  className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-[13px] outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
                />
                <div className="mt-3 flex gap-2">
                  {ouvert.statut === 'OUVERT' && (
                    <button
                      onClick={() => appliquer('EN_TRAITEMENT')}
                      disabled={enCours}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-[#0d5068] transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      Prendre en charge
                    </button>
                  )}
                  <button
                    onClick={() => appliquer('RESOLU')}
                    disabled={enCours}
                    className="flex-1 rounded-lg bg-[#22c55e] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#16a34a] disabled:opacity-50"
                  >
                    {enCours ? 'En cours…' : 'Marquer résolu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
