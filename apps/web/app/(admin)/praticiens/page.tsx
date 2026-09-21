
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'
import Link from 'next/link'

interface Praticien {
  id: string
  statutCompte: string
  disponible: boolean
  bloque: boolean
  totalMissions: number
  noteMoyenne: number | null
  createdAt: string
  user: {
    nom: string
    prenom: string
    telephone: string
  }
  specialites: {
    specialite: string
    principale: boolean
  }[]
  documents: {
    id: string
  }[]
  missionsImpayees?: number
}

const statutVariant: Record<
  string,
  'active' | 'pending' | 'suspended' | 'review'
> = {
  VALIDE: 'active',
  EN_ATTENTE: 'review',
  SUSPENDU: 'suspended',
  REFUSE: 'suspended',
}

const statutLabel: Record<string, string> = {
  VALIDE: 'Actif',
  EN_ATTENTE: 'À valider',
  SUSPENDU: 'Suspendu',
  REFUSE: 'Refusé',
}

const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Infirmier/ère IDE',
  MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapeute',
  PRELEVEUR: 'Préleveur/se',
  PEDIATRE: 'Pédiatre',
  AUTRE: 'Autre',
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  danger = true,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            danger ? 'bg-red-50' : 'bg-orange-50'
          }`}
        >
          <span className="text-xl">{danger ? '🗑' : '🔒'}</span>
        </div>

        <h3 className="font-bold text-gray-900 text-base mb-2">
          Confirmation
        </h3>

        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-semibold border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition"
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 text-sm font-bold text-white rounded-xl py-2.5 transition ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionMenu({
  praticien,
  onAction,
}: {
  praticien: Praticien
  onAction: (action: string, id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const actions = []

  if (praticien.statutCompte === 'EN_ATTENTE') {
    actions.push({
      key: 'VALIDE',
      label: 'Valider',
      color: 'text-green-700',
    })

    actions.push({
      key: 'REFUSE',
      label: 'Refuser',
      color: 'text-red-600',
    })
  }

  if (praticien.statutCompte === 'VALIDE') {
    actions.push({
      key: 'SUSPENDU',
      label: 'Suspendre',
      color: 'text-red-600',
    })
  }

  if (praticien.statutCompte === 'SUSPENDU') {
    actions.push({
      key: 'VALIDE',
      label: 'Réactiver',
      color: 'text-green-700',
    })
  }

  if (praticien.bloque) {
    actions.push({
      key: 'DEBLOQUER',
      label: 'Débloquer les missions',
      color: 'text-green-700',
    })
  } else {
    actions.push({
      key: 'BLOQUER',
      label: 'Bloquer les missions',
      color: 'text-orange-600',
    })
  }

  actions.push({
    key: 'DELETE',
    label: 'Supprimer',
    color: 'text-red-700 font-bold',
  })

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="w-8 h-8 flex flex-col items-center justify-center gap-[3px] rounded-lg hover:bg-gray-100 transition"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-gray-400"
          />
        ))}
      </button>

      {open && (
        <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 min-w-[190px]">
          <Link
            href={`/praticiens/${praticien.id}`}
            className="block px-3 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setOpen(false)}
          >
            Voir la fiche
          </Link>

          <div className="border-t border-gray-50 my-1" />

          {actions.map((a) => (
            <button
              key={a.key}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onAction(a.key, praticien.id)
              }}
              className={`block w-full text-left px-3 py-2.5 text-[12px] hover:bg-gray-50 transition ${a.color}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PraticiensPage() {
  const router = useRouter()

  const [praticiens, setPraticiens] = useState<Praticien[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statut, setStatut] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [groupeAction, setGroupeAction] = useState('')
  const [applyingGroupe, setApplyingGroupe] = useState(false)

  const [confirmModal, setConfirmModal] = useState<{
    message: string
    onConfirm: () => void
    danger?: boolean
  } | null>(null)

  async function load() {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        limit: '50',
      })

      if (statut) {
        params.append('statut', statut)
      }

      const { data } = await api.get(`/praticiens?${params}`)

      setPraticiens(data.praticiens)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [statut])

  async function handleAction(action: string, id: string) {
    if (action === 'DELETE') {
      setConfirmModal({
        message:
          'Ce praticien sera supprimé définitivement. Cette action est irréversible.',
        danger: true,

        onConfirm: async () => {
          setConfirmModal(null)
          await api.delete(`/praticiens/${id}`)
          load()
        },
      })

      return
    }

    if (action === 'BLOQUER') {
      setConfirmModal({
        message:
          "Ce praticien ne recevra plus de nouvelles missions jusqu'au déblocage. Confirmer ?",
        danger: false,

        onConfirm: async () => {
          setConfirmModal(null)

          await api.patch(`/praticiens/${id}/bloquer`, {
            bloque: true,
          })

          load()
        },
      })

      return
    }

    if (action === 'DEBLOQUER') {
      setConfirmModal({
        message:
          'Ce praticien pourra à nouveau recevoir des missions. Confirmer le déblocage ?',
        danger: false,

        onConfirm: async () => {
          setConfirmModal(null)

          await api.patch(`/praticiens/${id}/bloquer`, {
            bloque: false,
          })

          load()
        },
      })

      return
    }

    await api.patch(`/praticiens/${id}/statut`, {
      statut: action,
    })

    load()
  }

  async function handleGroupeAction() {
    if (!groupeAction || selected.length === 0) {
      return
    }

    if (groupeAction === 'DELETE') {
      setConfirmModal({
        message: `${selected.length} praticien(s) seront supprimés définitivement.`,
        danger: true,

        onConfirm: async () => {
          setConfirmModal(null)
          setApplyingGroupe(true)

          await Promise.all(
            selected.map((id) =>
              api.delete(`/praticiens/${id}`)
            )
          )

          setSelected([])
          setGroupeAction('')
          setApplyingGroupe(false)

          load()
        },
      })

      return
    }

    setApplyingGroupe(true)

    await Promise.all(
      selected.map((id) =>
        api.patch(`/praticiens/${id}/statut`, {
          statut: groupeAction,
        })
      )
    )

    setSelected([])
    setGroupeAction('')
    setApplyingGroupe(false)

    load()
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map((p) => p.id))
    }
  }

  const filtered = praticiens.filter((p) =>
    `${p.user.prenom} ${p.user.nom}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const nbEnAttente = praticiens.filter(
    (p) => p.statutCompte === 'EN_ATTENTE'
  ).length

  const nbBloques = praticiens.filter(
    (p) => p.bloque
  ).length

  return (
    <div className="flex flex-col h-full min-w-0">
      <Topbar title="Praticiens">
        <Link
          href="/praticiens/ajouter"
          className="flex items-center gap-1.5 text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition whitespace-nowrap"
        >
          + Ajouter un praticien
        </Link>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-w-0">
        <div className="mb-5">
          <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
            Gestion des praticiens
          </h1>

          <p className="text-sm text-gray-400 mt-0.5">
            {total} praticien{total > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Alertes */}
        {nbEnAttente > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 sm:px-4 py-3 flex items-start sm:items-center gap-2 mb-3 text-sm text-yellow-700">
            <span className="flex-shrink-0">⏱</span>

            <span>
              <strong>
                {nbEnAttente} praticien
                {nbEnAttente > 1 ? 's' : ''}
              </strong>{' '}
              en attente de validation.
            </span>
          </div>
        )}

        {nbBloques > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 sm:px-4 py-3 flex items-start sm:items-center gap-2 mb-5 text-sm text-orange-700">
            <span className="flex-shrink-0">🔒</span>

            <span>
              <strong>
                {nbBloques} praticien
                {nbBloques > 1 ? 's' : ''}
              </strong>{' '}
              bloqué
              {nbBloques > 1 ? 's' : ''} (paiements en attente).
            </span>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
            <input
              type="text"
              placeholder="Rechercher un praticien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-full sm:w-64 lg:w-72"
            />

            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-full sm:w-auto"
            >
              <option value="">Tous les statuts</option>
              <option value="VALIDE">Actifs</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="SUSPENDU">Suspendus</option>
            </select>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-[#0d5068]/5 border border-[#0d5068]/20 rounded-lg px-3 py-2 lg:ml-auto">
              <span className="text-xs font-semibold text-[#0d5068]">
                {selected.length} sélectionné
                {selected.length > 1 ? 's' : ''}
              </span>

              <select
                value={groupeAction}
                onChange={(e) =>
                  setGroupeAction(e.target.value)
                }
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white"
              >
                <option value="">Action groupée...</option>
                <option value="VALIDE">Valider</option>
                <option value="SUSPENDU">Suspendre</option>
                <option value="DELETE">Supprimer</option>
              </select>

              <button
                onClick={handleGroupeAction}
                disabled={!groupeAction || applyingGroupe}
                className="text-xs font-bold bg-[#0d5068] text-white rounded-lg px-3 py-1.5 hover:bg-[#0a3f52] transition disabled:opacity-50"
              >
                {applyingGroupe ? '...' : 'Appliquer'}
              </button>

              <button
                onClick={() => setSelected([])}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="text-sm w-full"
              style={{
                minWidth: '1120px',
              }}
            >
              <colgroup>
                <col style={{ width: '45px' }} />
                <col style={{ width: '235px' }} />
                <col style={{ width: '185px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '85px' }} />
                <col style={{ width: '75px' }} />
                <col style={{ width: '105px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '105px' }} />
                <col style={{ width: '55px' }} />
              </colgroup>

              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selected.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>

                  {[
                    'Praticien',
                    'Spécialité',
                    'Statut',
                    'Missions',
                    'Note',
                    'Disponible',
                    'Bloqué',
                    'Docs',
                    'Ajouté le',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Aucun praticien trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() =>
                        router.push(`/praticiens/${p.id}`)
                      }
                      className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${
                        selected.includes(p.id)
                          ? 'bg-blue-50/30'
                          : p.bloque
                          ? 'bg-orange-50/40'
                          : p.statutCompte === 'EN_ATTENTE'
                          ? 'bg-yellow-50/40'
                          : p.statutCompte === 'SUSPENDU'
                          ? 'bg-red-50/40'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-3 py-3"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() =>
                            toggleSelect(p.id)
                          }
                          className="rounded"
                        />
                      </td>

                      {/* Praticien */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] flex items-center justify-center text-[10px] font-bold text-[#0d5068] flex-shrink-0">
                            {p.user.prenom[0]}
                            {p.user.nom[0]}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-[13px] truncate">
                              {p.user.prenom} {p.user.nom}
                            </div>

                            <div className="text-[11px] text-gray-400 truncate">
                              {p.user.telephone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Spécialité */}
                      <td className="px-3 py-3 text-[12px] text-gray-600">
                        <span
                          className="block truncate"
                          title={
                            specialiteLabel[
                              p.specialites.find(
                                (s) => s.principale
                              )?.specialite ?? ''
                            ] ?? '—'
                          }
                        >
                          {specialiteLabel[
                            p.specialites.find(
                              (s) => s.principale
                            )?.specialite ?? ''
                          ] ?? '—'}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            statutVariant[p.statutCompte] ??
                            'pending'
                          }
                          label={
                            statutLabel[p.statutCompte] ??
                            p.statutCompte
                          }
                        />
                      </td>

                      {/* Missions */}
                      <td className="px-3 py-3 text-center font-bold text-gray-900 text-[13px]">
                        {p.totalMissions}
                      </td>

                      {/* Note */}
                      <td className="px-3 py-3 text-center text-[13px]">
                        {p.noteMoyenne ? (
                          <span className="font-semibold">
                            {p.noteMoyenne.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* Disponible */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              p.disponible
                                ? 'bg-[#22c55e]'
                                : 'bg-gray-300'
                            }`}
                          />

                          <span
                            className={`text-[11px] font-semibold ${
                              p.disponible
                                ? 'text-[#15803d]'
                                : 'text-gray-400'
                            }`}
                          >
                            {p.disponible
                              ? 'Dispo'
                              : 'Indispo'}
                          </span>
                        </div>
                      </td>

                      {/* Bloqué */}
                      <td className="px-3 py-3 text-center">
                        {p.bloque ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 whitespace-nowrap">
                            🔒 Bloqué
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* Documents */}
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            p.documents.length > 0
                              ? 'bg-[#e0f2fe] text-[#0d5068]'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {p.documents.length} doc
                          {p.documents.length > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(
                          p.createdAt
                        ).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <ActionMenu
                          praticien={p}
                          onAction={handleAction}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Indication scroll horizontal */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-gray-400">
            {filtered.length} résultat
            {filtered.length > 1 ? 's' : ''}
          </p>

          <p className="text-[10px] text-gray-400 sm:hidden">
            Faites glisser horizontalement pour voir toutes les colonnes →
          </p>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}

