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
  totalMissions: number
  noteMoyenne: number | null
  createdAt: string
  user: { nom: string; prenom: string; telephone: string }
  specialites: { specialite: string; principale: boolean }[]
  documents: { id: string }[]
}

const statutVariant: Record<string, 'active' | 'pending' | 'suspended' | 'review'> = {
  VALIDE: 'active', EN_ATTENTE: 'review', SUSPENDU: 'suspended', REFUSE: 'suspended',
}
const statutLabel: Record<string, string> = {
  VALIDE: 'Actif', EN_ATTENTE: 'À valider', SUSPENDU: 'Suspendu', REFUSE: 'Refusé',
}
const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Infirmier/ère IDE', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapeute',
  PRELEVEUR: 'Préleveur/se', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
          <span className="text-xl">🗑</span>
        </div>
        <h3 className="font-bold text-gray-900 text-base mb-2">Confirmer la suppression</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-semibold border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm font-bold bg-red-600 text-white rounded-xl py-2.5 hover:bg-red-700 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionMenu({ praticien, onAction }: {
  praticien: Praticien
  onAction: (action: string, id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const actions = []
  if (praticien.statutCompte === 'EN_ATTENTE') {
    actions.push({ key: 'VALIDE', label: 'Valider', color: 'text-green-700' })
    actions.push({ key: 'REFUSE', label: 'Refuser', color: 'text-red-600' })
  }
  if (praticien.statutCompte === 'VALIDE') {
    actions.push({ key: 'SUSPENDU', label: 'Suspendre', color: 'text-red-600' })
  }
  if (praticien.statutCompte === 'SUSPENDU') {
    actions.push({ key: 'VALIDE', label: 'Réactiver', color: 'text-green-700' })
  }
  actions.push({ key: 'DELETE', label: 'Supprimer', color: 'text-red-700 font-bold' })

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="w-7 h-7 flex flex-col items-center justify-center gap-[3px] rounded-lg hover:bg-gray-100 transition"
      >
        {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-400" />)}
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 min-w-[140px]">
          <Link
            href={`/praticiens/${praticien.id}`}
            className="block px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setOpen(false)}
          >
            Voir la fiche
          </Link>
          <div className="border-t border-gray-50 my-1" />
          {actions.map(a => (
            <button
              key={a.key}
              onClick={e => { e.stopPropagation(); setOpen(false); onAction(a.key, praticien.id) }}
              className={`block w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 transition ${a.color}`}
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
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statut) params.append('statut', statut)
      const { data } = await api.get(`/praticiens?${params}`)
      setPraticiens(data.praticiens)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statut])

  async function handleAction(action: string, id: string) {
    if (action === 'DELETE') {
      setConfirmModal({
        message: 'Ce praticien sera supprimé définitivement. Cette action est irréversible.',
        onConfirm: async () => {
          setConfirmModal(null)
          await api.delete(`/praticiens/${id}`)
          load()
        },
      })
      return
    }
    await api.patch(`/praticiens/${id}/statut`, { statut: action })
    load()
  }

  async function handleGroupeAction() {
    if (!groupeAction || selected.length === 0) return
    if (groupeAction === 'DELETE') {
      setConfirmModal({
        message: `${selected.length} praticien(s) seront supprimés définitivement. Cette action est irréversible.`,
        onConfirm: async () => {
          setConfirmModal(null)
          setApplyingGroupe(true)
          await Promise.all(selected.map(id => api.delete(`/praticiens/${id}`)))
          setSelected([])
          setGroupeAction('')
          setApplyingGroupe(false)
          load()
        },
      })
      return
    }
    setApplyingGroupe(true)
    await Promise.all(selected.map(id => api.patch(`/praticiens/${id}/statut`, { statut: groupeAction })))
    setSelected([])
    setGroupeAction('')
    setApplyingGroupe(false)
    load()
  }

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered.map(p => p.id))
  }

  const filtered = praticiens.filter(p =>
    `${p.user.prenom} ${p.user.nom}`.toLowerCase().includes(search.toLowerCase())
  )

  const nbEnAttente = praticiens.filter(p => p.statutCompte === 'EN_ATTENTE').length

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Praticiens">
        <Link
          href="/praticiens/ajouter"
          className="flex items-center gap-1.5 text-xs font-bold bg-[#22c55e] text-white rounded-lg px-3 py-1.5 hover:bg-[#16a34a] transition"
        >
          + Ajouter un praticien
        </Link>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Gestion des praticiens</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} praticiens au total</p>
        </div>

        {nbEnAttente > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2 mb-5 text-sm text-yellow-700">
            <span>⏱</span>
            <span><strong>{nbEnAttente} praticien{nbEnAttente > 1 ? 's' : ''}</strong> en attente de validation.</span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher un praticien..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-52"
          />
          <select
            value={statut}
            onChange={e => setStatut(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
          >
            <option value="">Tous les statuts</option>
            <option value="VALIDE">Actifs</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="SUSPENDU">Suspendus</option>
          </select>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto bg-[#0d5068]/5 border border-[#0d5068]/20 rounded-lg px-3 py-1.5">
              <span className="text-xs font-semibold text-[#0d5068]">{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>
              <select
                value={groupeAction}
                onChange={e => setGroupeAction(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#0d5068]"
              >
                <option value="">Action groupée...</option>
                <option value="VALIDE">Valider</option>
                <option value="SUSPENDU">Suspendre</option>
                <option value="DELETE">Supprimer</option>
              </select>
              <button
                onClick={handleGroupeAction}
                disabled={!groupeAction || applyingGroupe}
                className="text-xs font-bold bg-[#0d5068] text-white rounded-lg px-2 py-1 hover:bg-[#0a3f52] transition disabled:opacity-50"
              >
                {applyingGroupe ? '...' : 'Appliquer'}
              </button>
              <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '3%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                {['Praticien', 'Spécialité', 'Statut', 'Missions', 'Note', 'Disponible', 'Docs', 'Ajouté le', ''].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-sm">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-sm">Aucun praticien trouvé</td></tr>
              ) : filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/praticiens/${p.id}`)}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${
                    selected.includes(p.id) ? 'bg-blue-50/30' :
                    p.statutCompte === 'EN_ATTENTE' ? 'bg-yellow-50/40' :
                    p.statutCompte === 'SUSPENDU' ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] flex items-center justify-center text-[10px] font-bold text-[#0d5068] flex-shrink-0">
                        {p.user.prenom[0]}{p.user.nom[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-[13px]">{p.user.prenom} {p.user.nom}</div>
                        <div className="text-[11px] text-gray-400">{p.user.telephone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-gray-600 truncate">
                    {specialiteLabel[p.specialites.find(s => s.principale)?.specialite ?? ''] ?? '—'}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={statutVariant[p.statutCompte] ?? 'pending'} label={statutLabel[p.statutCompte] ?? p.statutCompte} />
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-900 text-[13px]">{p.totalMissions}</td>
                  <td className="px-3 py-3 text-center text-[13px]">
                    {p.noteMoyenne ? <span className="font-semibold">{p.noteMoyenne.toFixed(1)}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${p.disponible ? 'bg-[#22c55e]' : 'bg-gray-300'}`} />
                      <span className={`text-[11px] font-semibold ${p.disponible ? 'text-[#15803d]' : 'text-gray-400'}`}>
                        {p.disponible ? 'Dispo' : 'Indispo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.documents.length > 0 ? 'bg-[#e0f2fe] text-[#0d5068]' : 'bg-gray-100 text-gray-400'}`}>
                      {p.documents.length} doc{p.documents.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <ActionMenu praticien={p} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}