'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import {
  ListePraticiens,
  Praticien,
  StatutPraticien,
  STATUT_PRATICIEN_LABEL,
  dateCourte,
  nomComplet,
  specialitePrincipale,
} from '@/lib/api-types'

type Variante = 'green' | 'gray' | 'red' | 'amber'

const STATUT_VARIANTE: Record<StatutPraticien, Variante> = {
  VALIDE: 'green',
  EN_ATTENTE: 'amber',
  SUSPENDU: 'gray',
  REFUSE: 'red',
}

/** Actions possibles depuis la liste, mappées sur PATCH /praticiens/:id/statut */
const ACTIONS: Record<string, { libelle: string; statut: StatutPraticien; ton: 'neutre' | 'danger' }> = {
  valider: { libelle: 'Valider', statut: 'VALIDE', ton: 'neutre' },
  suspendre: { libelle: 'Suspendre', statut: 'SUSPENDU', ton: 'danger' },
  reactiver: { libelle: 'Réactiver', statut: 'VALIDE', ton: 'neutre' },
}

export default function PraticiensPage() {
  const [praticiens, setPraticiens] = useState<Praticien[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState<string>('tous')
  const [enCours, setEnCours] = useState(false)
  const [confirmation, setConfirmation] = useState<{ p: Praticien; action: keyof typeof ACTIONS } | null>(null)

  const charger = useCallback(async () => {
    try {
      // L'API renvoie { praticiens, total, page } — pas un tableau.
      const { data } = await api.get<ListePraticiens>('/praticiens', { params: { limit: 100 } })
      setPraticiens(Array.isArray(data?.praticiens) ? data.praticiens : [])
      setTotal(data?.total ?? 0)
      setErreur(null)
    } catch {
      setErreur("Impossible de charger les praticiens. Vérifiez que l'API est accessible.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const filtres = praticiens.filter((p) => {
    const q = search.trim().toLowerCase()
    const correspond =
      !q ||
      `${nomComplet(p.user)} ${p.user?.telephone ?? ''} ${specialitePrincipale(p)}`
        .toLowerCase()
        .includes(q)
    const statutOk = filtre === 'tous' || p.statutCompte === filtre
    return correspond && statutOk
  })

  async function appliquer() {
    if (!confirmation) return
    setEnCours(true)
    try {
      await api.patch(`/praticiens/${confirmation.p.id}/statut`, {
        statut: ACTIONS[confirmation.action].statut,
      })
      setConfirmation(null)
      await charger()
    } catch {
      setErreur("L'action n'a pas pu être appliquée.")
    } finally {
      setEnCours(false)
    }
  }

  function actionsPour(p: Praticien): (keyof typeof ACTIONS)[] {
    if (p.statutCompte === 'EN_ATTENTE') return ['valider', 'suspendre']
    if (p.statutCompte === 'VALIDE') return ['suspendre']
    if (p.statutCompte === 'SUSPENDU' || p.statutCompte === 'REFUSE') return ['reactiver']
    return []
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Praticiens"
        subtitle={loading ? 'Chargement…' : `${total} praticien${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`}
        actions={
          <Link
            href="/praticiens/ajouter"
            className="rounded-lg bg-[#0d5068] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#0a3f52]"
          >
            Ajouter
          </Link>
        }
      />

      <div className="flex-1 space-y-4 p-5 sm:p-6">
        {erreur && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {erreur}
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom, un téléphone, une spécialité"
            className="min-w-[240px] flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
          />
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#0d5068]"
          >
            <option value="tous">Tous les statuts</option>
            <option value="EN_ATTENTE">À valider</option>
            <option value="VALIDE">Actifs</option>
            <option value="SUSPENDU">Suspendus</option>
            <option value="REFUSE">Refusés</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Praticien', 'Spécialité', 'Téléphone', 'Missions', 'Note', 'Inscrit le', 'Statut', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="h-5 animate-pulse rounded bg-gray-50" />
                      </td>
                    </tr>
                  ))
                ) : filtres.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center">
                      <p className="text-[13.5px] font-semibold text-[#0a2535]">
                        {praticiens.length === 0 ? 'Aucun praticien enregistré' : 'Aucun résultat'}
                      </p>
                      <p className="mt-1 text-[12.5px] text-gray-400">
                        {praticiens.length === 0
                          ? 'Les candidatures validées apparaîtront ici.'
                          : 'Essayez un autre terme ou un autre statut.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtres.map((p) => {
                    const variante = STATUT_VARIANTE[p.statutCompte] ?? 'gray'
                    const libelle = STATUT_PRATICIEN_LABEL[p.statutCompte] ?? p.statutCompte
                    const initiales = `${p.user?.prenom?.[0] ?? ''}${p.user?.nom?.[0] ?? ''}`.toUpperCase() || '?'

                    return (
                      <tr key={p.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3.5">
                          <Link href={`/praticiens/${p.id}`} className="flex items-center gap-2.5 group">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f0f7f5] text-[11.5px] font-bold text-[#0d5068]">
                              {initiales}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-semibold text-[#0a2535] group-hover:text-[#0d5068]">
                                {nomComplet(p.user)}
                              </span>
                              {p.bloque && (
                                <span className="text-[11px] font-semibold text-red-500">bloqué</span>
                              )}
                            </span>
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-600">
                          {specialitePrincipale(p)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-500">
                          {p.user?.telephone ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] font-semibold text-[#0a2535]">
                          {p.totalMissions ?? 0}
                        </td>
                        <td className="px-4 py-3.5">
                          {typeof p.noteMoyenne === 'number' ? (
                            <span className="flex items-center gap-1">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b" aria-hidden="true">
                                <path d="M5 1l1.2 2.5L9 4l-2 1.9.5 2.6L5 7.3 2.5 8.5 3 5.9 1 4l2.8-.5L5 1z"/>
                              </svg>
                              <span className="text-[12.5px] font-semibold text-gray-700">
                                {p.noteMoyenne.toFixed(1)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-500">
                          {dateCourte(p.createdAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={variante} dot>{libelle}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {actionsPour(p).map((a) => (
                              <button
                                key={a}
                                onClick={() => setConfirmation({ p, action: a })}
                                className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                                  ACTIONS[a].ton === 'danger'
                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                    : 'border-gray-200 text-[#0d5068] hover:bg-gray-50'
                                }`}
                              >
                                {ACTIONS[a].libelle}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      {confirmation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-[16px] font-bold text-[#0a2535]">
              {ACTIONS[confirmation.action].libelle} ce praticien&nbsp;?
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
              {nomComplet(confirmation.p.user)} passera au statut «&nbsp;
              {STATUT_PRATICIEN_LABEL[ACTIONS[confirmation.action].statut]}&nbsp;».
              {ACTIONS[confirmation.action].statut === 'SUSPENDU' &&
                ' Il ne recevra plus de demandes tant qu’il est suspendu.'}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmation(null)}
                disabled={enCours}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={appliquer}
                disabled={enCours}
                className={`flex-1 rounded-lg px-4 py-2.5 text-[13px] font-bold text-white transition-colors disabled:opacity-50 ${
                  ACTIONS[confirmation.action].ton === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#0d5068] hover:bg-[#0a3f52]'
                }`}
              >
                {enCours ? 'En cours…' : ACTIONS[confirmation.action].libelle}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
