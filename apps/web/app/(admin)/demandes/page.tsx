'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import {
  ListeDemandes,
  Demande,
  StatutDemande,
  STATUT_DEMANDE_LABEL,
  dateCourte,
  nomComplet,
} from '@/lib/api-types'

type Variante = 'amber' | 'blue' | 'green' | 'red'

const VARIANTE: Record<StatutDemande, Variante> = {
  EN_ATTENTE: 'amber',
  EN_COURS: 'blue',
  TRAITEE: 'green',
  REFUSEE: 'red',
}

const TYPE_LABEL: Record<string, string> = {
  SPECIALITE: 'Spécialité',
  ZONE: 'Zone',
  AUTRE: 'Autre',
}

const ONGLETS = [
  { valeur: 'tous', libelle: 'Toutes' },
  { valeur: 'EN_ATTENTE', libelle: 'En attente' },
  { valeur: 'EN_COURS', libelle: 'En cours' },
  { valeur: 'TRAITEE', libelle: 'Traitées' },
  { valeur: 'REFUSEE', libelle: 'Refusées' },
]

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [filtre, setFiltre] = useState('tous')
  const [ouverte, setOuverte] = useState<Demande | null>(null)
  const [reponse, setReponse] = useState('')
  const [enCours, setEnCours] = useState(false)

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get<ListeDemandes>('/demandes', { params: { limit: 100 } })
      setDemandes(Array.isArray(data?.demandes) ? data.demandes : [])
      setTotal(data?.total ?? 0)
      setErreur(null)
    } catch {
      setErreur("Impossible de charger les demandes. Vérifiez que l'API est accessible.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const filtres = demandes.filter((d) => filtre === 'tous' || d.statut === filtre)
  const enAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length

  async function appliquer(statut: StatutDemande) {
    if (!ouverte) return
    setEnCours(true)
    try {
      // PATCH /demandes/:id accepte { statut, reponseAdmin }
      await api.patch(`/demandes/${ouverte.id}`, {
        statut,
        reponseAdmin: reponse.trim() || undefined,
      })
      setOuverte(null)
      setReponse('')
      await charger()
    } catch {
      setErreur("La demande n'a pas pu être mise à jour.")
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Demandes"
        subtitle={loading ? 'Chargement…' : enAttente > 0 ? `${enAttente} en attente sur ${total}` : `${total} demande${total > 1 ? 's' : ''}`}
      />

      <div className="flex-1 space-y-4 p-5 sm:p-6">
        {erreur && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{erreur}</div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {ONGLETS.map((o) => {
            const n = o.valeur === 'tous' ? demandes.length : demandes.filter((d) => d.statut === o.valeur).length
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
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Demandeur', 'Type', 'Demande', 'Reçue le', 'Statut'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={5} className="px-4 py-4"><div className="h-5 animate-pulse rounded bg-gray-50" /></td>
                    </tr>
                  ))
                ) : filtres.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center">
                      <p className="text-[13.5px] font-semibold text-[#0a2535]">
                        {demandes.length === 0 ? 'Aucune demande' : 'Aucune demande dans cette catégorie'}
                      </p>
                      <p className="mt-1 text-[12.5px] text-gray-400">
                        Les demandes des patients et praticiens arrivent ici.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtres.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => { setOuverte(d); setReponse(d.reponseAdmin ?? '') }}
                      className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3.5">
                        <span className="block text-[13px] font-semibold text-[#0a2535]">{nomComplet(d.user)}</span>
                        <span className="block text-[11.5px] text-gray-400">{d.user?.telephone ?? d.user?.role ?? '—'}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-600">
                        {TYPE_LABEL[d.type] ?? d.type}
                      </td>
                      <td className="max-w-[300px] truncate px-4 py-3.5 text-[12.5px] text-gray-500">{d.description}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[12.5px] text-gray-500">{dateCourte(d.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={VARIANTE[d.statut as StatutDemande] ?? 'amber'} dot>
                          {STATUT_DEMANDE_LABEL[d.statut] ?? d.statut}
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
      {ouverte && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setOuverte(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#0a2535]">{nomComplet(ouverte.user)}</h2>
                <p className="mt-0.5 text-[12.5px] text-gray-400">
                  {TYPE_LABEL[ouverte.type] ?? ouverte.type} · reçue le {dateCourte(ouverte.createdAt)}
                </p>
              </div>
              <button onClick={() => setOuverte(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Fermer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <Badge variant={VARIANTE[ouverte.statut as StatutDemande] ?? 'amber'} dot>
              {STATUT_DEMANDE_LABEL[ouverte.statut] ?? ouverte.statut}
            </Badge>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="mb-1.5 text-[12px] font-semibold text-gray-500">Demande</p>
              <p className="text-[13px] leading-relaxed text-[#0a2535]">{ouverte.description}</p>
              {ouverte.details && (
                <p className="mt-3 border-t border-gray-200 pt-3 text-[12.5px] leading-relaxed text-gray-600">
                  {ouverte.details}
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <label className="mb-1.5 block text-[12.5px] font-semibold text-[#0a2535]">
                Réponse au demandeur
              </label>
              <textarea
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                rows={4}
                placeholder="Ce que vous répondez, et pourquoi."
                className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-[13px] outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => appliquer('REFUSEE')}
                  disabled={enCours}
                  className="flex-1 rounded-lg border border-red-200 px-4 py-2.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Refuser
                </button>
                <button
                  onClick={() => appliquer('TRAITEE')}
                  disabled={enCours}
                  className="flex-1 rounded-lg bg-[#22c55e] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#16a34a] disabled:opacity-50"
                >
                  {enCours ? 'En cours…' : 'Marquer traitée'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
