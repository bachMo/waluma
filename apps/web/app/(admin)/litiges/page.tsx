
'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'

interface Litige {
  id: string
  statut: string
  motif: string
  description: string | null
  resolution: string | null
  ouvertAt: string
  resoluAt: string | null
  mission: {
    id: string
    reference: string
    patient: { nom: string; prenom: string }
    praticien: {
      user: { nom: string; prenom: string }
    } | null
    paiement: { statut: string } | null
  }
}

const statutLabel: Record<string, string> = {
  OUVERT: 'Urgent',
  EN_TRAITEMENT: 'En traitement',
  RESOLU: 'Résolu',
  CLOS: 'Clos',
}

const statutStyle: Record<string, string> = {
  OUVERT: 'bg-red-100 text-red-700',
  EN_TRAITEMENT: 'bg-yellow-50 text-yellow-700',
  RESOLU: 'bg-green-50 text-green-700',
  CLOS: 'bg-gray-100 text-gray-500',
}

const cardStyle: Record<string, string> = {
  OUVERT: 'bg-red-50 border-red-200',
  EN_TRAITEMENT: 'bg-white border-gray-100',
  RESOLU: 'bg-green-50 border-green-200',
  CLOS: 'bg-gray-50 border-gray-200',
}

export default function LitigesPage() {
  const [litiges, setLitiges] = useState<Litige[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function load() {
    setLoading(true)

    try {
      const { data } = await api.get('/litiges?limit=50')
      setLitiges(data.litiges)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAction(
    action: string,
    id: string,
    body?: Record<string, unknown>
  ) {
    setActionLoading(id + action)

    try {
      if (action === 'forcer') {
        await api.post(
          `/litiges/${id}/forcer-cloture`,
          body || {}
        )
      } else if (action === 'rembourser') {
        await api.post(`/litiges/${id}/rembourser`, {})
      } else if (action === 'traitement') {
        await api.patch(`/litiges/${id}`, {
          statut: 'EN_TRAITEMENT',
        })
      } else if (action === 'suspendre') {
        const litige = litiges.find((l) => l.id === id)

        if (litige?.mission?.praticien) {
          const { data: missionData } = await api.get(
            `/missions/${litige.mission.id}`
          )

          if (missionData.praticienId) {
            await api.patch(
              `/praticiens/${missionData.praticienId}/statut`,
              {
                statut: 'SUSPENDU',
              }
            )
          }
        }
      } else if (action === 'clore') {
        await api.patch(`/litiges/${id}`, {
          statut: 'CLOS',
          resolution:
            "Litige clos par l'administrateur",
        })
      }

      await load()
    } finally {
      setActionLoading(null)
    }
  }

  const ouverts = litiges.filter(
    (l) => l.statut === 'OUVERT'
  ).length

  const enTraitement = litiges.filter(
    (l) => l.statut === 'EN_TRAITEMENT'
  ).length

  return (
    <div className="flex flex-col h-full min-w-0">
      <Topbar title="Litiges" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
            Gestion des litiges
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-relaxed">
            {total} litige{total > 1 ? 's' : ''} au total
            {ouverts > 0 &&
              ` · ${ouverts} urgent${ouverts > 1 ? 's' : ''}`}
            {enTraitement > 0 &&
              ` · ${enTraitement} en traitement`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">
            Chargement...
          </div>
        ) : litiges.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">✅</div>

            <div className="text-sm font-semibold text-gray-600">
              Aucun litige ouvert
            </div>

            <div className="text-xs text-gray-400 mt-1">
              Tout est nominal
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {litiges.map((l) => (
              <div
                key={l.id}
                className={`
                  rounded-xl
                  p-4
                  sm:p-5
                  border
                  min-w-0
                  ${cardStyle[l.statut] ?? 'bg-white border-gray-100'}
                `}
              >
                {/* EN-TÊTE */}
                <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          px-2
                          py-0.5
                          rounded-full
                          whitespace-nowrap
                          ${statutStyle[l.statut] ?? 'bg-gray-100 text-gray-500'}
                        `}
                      >
                        {statutLabel[l.statut] ?? l.statut}
                      </span>

                      <span className="font-extrabold text-sm sm:text-[15px] text-gray-900 break-words">
                        Mission{' '}
                        {l.mission.reference
                          .slice(0, 8)
                          .toUpperCase()}{' '}
                        · {l.motif}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 leading-relaxed">
                      Ouvert le{' '}
                      {new Date(
                        l.ouvertAt
                      ).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                      })}

                      {' · '}Patient :{' '}
                      {l.mission.patient.prenom}{' '}
                      {l.mission.patient.nom}

                      {l.mission.praticien &&
                        ` · Praticien : ${l.mission.praticien.user.prenom} ${l.mission.praticien.user.nom}`}
                    </div>
                  </div>

                  {l.resoluAt && (
                    <div className="text-xs text-gray-400 lg:text-right flex-shrink-0">
                      Résolu le{' '}
                      {new Date(
                        l.resoluAt
                      ).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                {/* DESCRIPTION */}
                {l.description && (
                  <div
                    className={`
                      text-xs
                      sm:text-sm
                      text-gray-600
                      leading-relaxed
                      rounded-xl
                      px-3
                      sm:px-4
                      py-3
                      mb-4
                      break-words
                      ${
                        l.statut === 'OUVERT'
                          ? 'bg-white'
                          : 'bg-gray-50'
                      }
                    `}
                  >
                    {l.description}
                  </div>
                )}

                {/* RÉSOLUTION */}
                {l.resolution && (
                  <div
                    className="
                      text-xs
                      sm:text-sm
                      text-green-700
                      bg-green-50
                      border
                      border-green-200
                      rounded-xl
                      px-3
                      sm:px-4
                      py-3
                      mb-4
                      leading-relaxed
                      break-words
                    "
                  >
                    <span className="font-semibold">
                      Résolution :
                    </span>{' '}
                    {l.resolution}
                  </div>
                )}

                {/* ACTIONS */}
                {(l.statut === 'OUVERT' ||
                  l.statut === 'EN_TRAITEMENT') && (
                  <div className="flex flex-wrap items-center gap-2">
                    {l.statut === 'OUVERT' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            'traitement',
                            l.id
                          )
                        }
                        disabled={
                          actionLoading ===
                          l.id + 'traitement'
                        }
                        className="
                          text-[11px]
                          sm:text-[12px]
                          font-semibold
                          bg-gray-50
                          text-gray-700
                          border
                          border-gray-200
                          rounded-lg
                          px-3
                          py-1.5
                          hover:bg-gray-100
                          transition
                          disabled:opacity-50
                          whitespace-nowrap
                        "
                      >
                        Prendre en charge
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          'forcer',
                          l.id
                        )
                      }
                      disabled={
                        actionLoading ===
                        l.id + 'forcer'
                      }
                      className="
                        text-[11px]
                        sm:text-[12px]
                        font-semibold
                        bg-[#0d5068]
                        text-white
                        border
                        border-[#0d5068]
                        rounded-lg
                        px-3
                        py-1.5
                        hover:bg-[#0a3f52]
                        transition
                        disabled:opacity-50
                        whitespace-nowrap
                      "
                    >
                      Forcer la clôture
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          'rembourser',
                          l.id
                        )
                      }
                      disabled={
                        actionLoading ===
                        l.id + 'rembourser'
                      }
                      className="
                        text-[11px]
                        sm:text-[12px]
                        font-semibold
                        bg-yellow-50
                        text-yellow-700
                        border
                        border-yellow-200
                        rounded-lg
                        px-3
                        py-1.5
                        hover:bg-yellow-100
                        transition
                        disabled:opacity-50
                        whitespace-nowrap
                      "
                    >
                      Rembourser le patient
                    </button>

                    {l.mission.praticien && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(
                            'suspendre',
                            l.id
                          )
                        }
                        disabled={
                          actionLoading ===
                          l.id + 'suspendre'
                        }
                        className="
                          text-[11px]
                          sm:text-[12px]
                          font-semibold
                          bg-red-50
                          text-red-700
                          border
                          border-red-200
                          rounded-lg
                          px-3
                          py-1.5
                          hover:bg-red-100
                          transition
                          disabled:opacity-50
                          whitespace-nowrap
                        "
                      >
                        Suspendre le praticien
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          'clore',
                          l.id
                        )
                      }
                      disabled={
                        actionLoading ===
                        l.id + 'clore'
                      }
                      className="
                        text-[11px]
                        sm:text-[12px]
                        font-semibold
                        bg-gray-50
                        text-gray-500
                        border
                        border-gray-200
                        rounded-lg
                        px-3
                        py-1.5
                        hover:bg-gray-100
                        transition
                        disabled:opacity-50
                        whitespace-nowrap
                      "
                    >
                      Clore
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

