'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'

interface Demande {
id: string
type: string
description: string
details: string
statut: string
reponseAdmin: string | null
createdAt: string
traiteeAt: string | null
user: {
nom: string
prenom: string
telephone: string
role: string
}
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
SPECIALITE: {
label: 'Nouvelle spécialité',
color: '#7c3aed',
bg: '#ede9fe',
},
ZONE: {
label: "Zone d'intervention",
color: '#0891b2',
bg: '#cffafe',
},
AUTRE: {
label: 'Autre',
color: '#6b7280',
bg: '#f3f4f6',
},
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
EN_ATTENTE: {
label: 'En attente',
color: '#d97706',
bg: '#fef3c7',
},
EN_COURS: {
label: 'En cours',
color: '#0891b2',
bg: '#cffafe',
},
TRAITEE: {
label: 'Traitée',
color: '#15803d',
bg: '#dcfce7',
},
REFUSEE: {
label: 'Refusée',
color: '#dc2626',
bg: '#fee2e2',
},
}

function TraiterModal({
demande,
onClose,
onSave,
}: {
demande: Demande
onClose: () => void
onSave: () => void
}) {
const [statut, setStatut] = useState(demande.statut)
const [reponse, setReponse] = useState(demande.reponseAdmin || '')
const [saving, setSaving] = useState(false)

async function handleSave() {
if (!reponse.trim()) return


setSaving(true)

try {
  await api.patch(`/demandes/${demande.id}`, {
    statut,
    reponseAdmin: reponse,
  })

  onSave()
  onClose()
} finally {
  setSaving(false)
}


}

return ( <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4"> <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)] overflow-hidden flex flex-col"> <div className="bg-[#0d5068] px-4 sm:px-6 py-4 shrink-0"> <h3 className="text-white font-bold text-base">
Traiter la demande </h3>


      <p className="text-white/60 text-xs mt-0.5 truncate">
        {demande.user.prenom} {demande.user.nom} ·{' '}
        {TYPE_CONFIG[demande.type]?.label}
      </p>
    </div>

    <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Description
        </p>

        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed break-words">
          {demande.description}
        </p>

        {demande.details && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mt-2 leading-relaxed break-words">
            {demande.details}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Statut
        </p>

        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d5068] bg-white"
        >
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_COURS">En cours de traitement</option>
          <option value="TRAITEE">Traitée ✓</option>
          <option value="REFUSEE">Refusée ✗</option>
        </select>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Réponse au praticien <span className="text-red-500">*</span>
        </p>

        <textarea
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          rows={4}
          placeholder="Rédigez votre réponse..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0d5068] resize-none"
        />
      </div>
    </div>

    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 shrink-0">
      <button
        onClick={onClose}
        className="w-full sm:flex-1 text-sm font-semibold border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition"
      >
        Annuler
      </button>

      <button
        onClick={handleSave}
        disabled={!reponse.trim() || saving}
        className="w-full sm:flex-1 text-sm font-bold bg-[#0d5068] text-white rounded-xl py-2.5 hover:bg-[#0a3f52] transition disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  </div>
</div>


)
}

export default function DemandesPage() {
const [demandes, setDemandes] = useState<Demande[]>([])
const [total, setTotal] = useState(0)
const [loading, setLoading] = useState(true)
const [statut, setStatut] = useState('')
const [type, setType] = useState('')
const [search, setSearch] = useState('')
const [selected, setSelected] = useState<Demande | null>(null)

async function load() {
setLoading(true)


try {
  const params = new URLSearchParams({
    limit: '50',
  })

  if (statut) {
    params.append('statut', statut)
  }

  if (type) {
    params.append('type', type)
  }

  const { data } = await api.get(`/demandes?${params}`)

  setDemandes(data.demandes)
  setTotal(data.total)
} finally {
  setLoading(false)
}


}

useEffect(() => {
load()
}, [statut, type])

const filtered = demandes.filter((d) =>
`${d.user.prenom} ${d.user.nom} ${d.user.telephone}`
.toLowerCase()
.includes(search.toLowerCase())
)

const nbEnAttente = demandes.filter(
(d) => d.statut === 'EN_ATTENTE'
).length

return ( <div className="flex flex-col h-full min-w-0"> <Topbar title="Demandes" />


  <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-w-0">
    <div className="mb-4 sm:mb-5">
      <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
        Demandes praticiens
      </h1>

      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
        {total} demande{total > 1 ? 's' : ''} au total
      </p>
    </div>

    {nbEnAttente > 0 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 sm:px-4 py-3 flex items-start sm:items-center gap-2 mb-4 sm:mb-5 text-xs sm:text-sm text-yellow-700">
        <span className="shrink-0">⏱</span>

        <span>
          <strong>
            {nbEnAttente} demande{nbEnAttente > 1 ? 's' : ''}
          </strong>{' '}
          en attente de traitement.
        </span>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-3 mb-4">
      <input
        type="text"
        placeholder="Rechercher un praticien..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-full lg:w-52 min-w-0"
      />

      <select
        value={statut}
        onChange={(e) => setStatut(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] bg-white w-full lg:w-auto"
      >
        <option value="">Tous les statuts</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="EN_COURS">En cours</option>
        <option value="TRAITEE">Traitées</option>
        <option value="REFUSEE">Refusées</option>
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] bg-white w-full lg:w-auto"
      >
        <option value="">Tous les types</option>
        <option value="SPECIALITE">Nouvelle spécialité</option>
        <option value="ZONE">Zone d'intervention</option>
        <option value="AUTRE">Autre</option>
      </select>
    </div>

    <div className="hidden md:block bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ tableLayout: 'fixed' }}
        >
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>

          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                'Praticien',
                'Type',
                'Description',
                'Statut',
                'Date',
                'Actions',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 lg:px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400"
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
                  colSpan={6}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  Chargement...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  Aucune demande trouvée
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const typeConf =
                  TYPE_CONFIG[d.type] ?? TYPE_CONFIG.AUTRE

                const statutConf =
                  STATUT_CONFIG[d.statut] ??
                  STATUT_CONFIG.EN_ATTENTE

                return (
                  <tr
                    key={d.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-3 lg:px-4 py-3">
                      <div className="font-semibold text-gray-900 text-[13px] truncate">
                        {d.user.prenom} {d.user.nom}
                      </div>

                      <div className="text-[11px] text-gray-400 truncate">
                        {d.user.telephone}
                      </div>

                      <div className="text-[10px] text-gray-300 capitalize truncate">
                        {d.user.role}
                      </div>
                    </td>

                    <td className="px-3 lg:px-4 py-3">
                      <span
                        className="inline-block text-[11px] font-bold px-2 py-1 rounded-full max-w-full"
                        style={{
                          backgroundColor: typeConf.bg,
                          color: typeConf.color,
                        }}
                      >
                        {typeConf.label}
                      </span>
                    </td>

                    <td className="px-3 lg:px-4 py-3">
                      <p className="text-[12px] text-gray-700 leading-relaxed line-clamp-2 break-words">
                        {d.description}
                      </p>

                      {d.reponseAdmin && (
                        <p className="text-[11px] text-[#0d5068] mt-1 italic line-clamp-1">
                          ↳ {d.reponseAdmin}
                        </p>
                      )}
                    </td>

                    <td className="px-3 lg:px-4 py-3">
                      <span
                        className="inline-block text-[11px] font-bold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: statutConf.bg,
                          color: statutConf.color,
                        }}
                      >
                        {statutConf.label}
                      </span>
                    </td>

                    <td className="px-3 lg:px-4 py-3 text-[11px] text-gray-400">
                      {new Date(d.createdAt).toLocaleDateString(
                        'fr-FR',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </td>

                    <td className="px-3 lg:px-4 py-3">
                      <button
                        onClick={() => setSelected(d)}
                        className="text-[11px] font-bold bg-[#0d5068] text-white rounded-lg px-3 py-1.5 hover:bg-[#0a3f52] transition whitespace-nowrap"
                      >
                        Traiter
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    <div className="md:hidden space-y-3">
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-10 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-10 text-gray-400 text-sm">
          Aucune demande trouvée
        </div>
      ) : (
        filtered.map((d) => {
          const typeConf =
            TYPE_CONFIG[d.type] ?? TYPE_CONFIG.AUTRE

          const statutConf =
            STATUT_CONFIG[d.statut] ??
            STATUT_CONFIG.EN_ATTENTE

          return (
            <div
              key={d.id}
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {d.user.prenom} {d.user.nom}
                  </div>

                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {d.user.telephone}
                  </div>
                </div>

                <span
                  className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: statutConf.bg,
                    color: statutConf.color,
                  }}
                >
                  {statutConf.label}
                </span>
              </div>

              <div className="mt-3">
                <span
                  className="inline-block text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: typeConf.bg,
                    color: typeConf.color,
                  }}
                >
                  {typeConf.label}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </p>

                <p className="text-xs text-gray-700 leading-relaxed break-words">
                  {d.description}
                </p>

                {d.details && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5 mt-2 leading-relaxed break-words">
                    {d.details}
                  </p>
                )}
              </div>

              {d.reponseAdmin && (
                <div className="mt-3 bg-[#f0f7f9] rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-[#0d5068] uppercase tracking-wider mb-1">
                    Réponse
                  </p>

                  <p className="text-[11px] text-[#0d5068] leading-relaxed">
                    {d.reponseAdmin}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="text-[10px] text-gray-400">
                  {new Date(d.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>

                <button
                  onClick={() => setSelected(d)}
                  className="text-[11px] font-bold bg-[#0d5068] text-white rounded-lg px-3 py-2 hover:bg-[#0a3f52] transition"
                >
                  Traiter
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  </div>

  {selected && (
    <TraiterModal
      demande={selected}
      onClose={() => setSelected(null)}
      onSave={load}
    />
  )}
</div>


)
}
