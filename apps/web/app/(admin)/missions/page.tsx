'use client'
import { useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'

const missions = [
  { id: '#2847', patient: 'Oumar Ba', quartier: 'Almadies', type: 'Soins infirmiers', praticien: 'Aminata Diallo', initiales: 'AD', statut: 'enroute', debut: '14h30', eta: '~8 min', montant: '12 500' },
  { id: '#2846', patient: 'Aïssatou Sy', quartier: 'Mermoz', type: 'Médecine générale', praticien: 'Moussa Fall', initiales: 'MF', statut: 'inprog', debut: '13h45', eta: '32 min', montant: '18 000' },
  { id: '#2843', patient: 'Ibrahima Seck', quartier: 'Plateau', type: 'Soins infirmiers', praticien: null, initiales: '', statut: 'urgent', debut: '14h18', eta: '12 min !', montant: '8 000' },
  { id: '#2841', patient: 'Marième Diop', quartier: 'Grand Dakar', type: 'Prélèvement', praticien: 'Kadiatou Sow', initiales: 'KS', statut: 'enroute', debut: '14h05', eta: '~15 min', montant: '5 000' },
]

export default function MissionsPage() {
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')

  const filtered = missions.filter(m =>
    (m.patient.toLowerCase().includes(search.toLowerCase()) ||
     (m.praticien ?? '').toLowerCase().includes(search.toLowerCase())) &&
    (filterStatut === '' || m.statut === filterStatut)
  )

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Missions en cours">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          7 missions actives
        </div>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Supervision en temps réel</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mis à jour toutes les 30 secondes</p>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher patient, praticien..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068] w-60"
          />
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d5068]"
          >
            <option value="">Tous les statuts</option>
            <option value="enroute">En route</option>
            <option value="inprog">Soin en cours</option>
            <option value="urgent">En attente</option>
          </select>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '7%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Réf.', 'Patient', 'Type', 'Praticien', 'Statut', 'Démarré', 'ETA / Durée', 'Montant', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition ${m.statut === 'urgent' ? 'bg-red-50/60' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{m.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 text-[13px] truncate">{m.patient}</div>
                    <div className="text-[11px] text-gray-400">{m.quartier}</div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-600 truncate">{m.type}</td>
                  <td className="px-4 py-3">
                    {m.praticien ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[9px] font-bold text-green-700 flex-shrink-0">{m.initiales}</div>
                        <span className="text-[12px] font-medium text-gray-700 truncate">{m.praticien}</span>
                      </div>
                    ) : (
                      <span className="text-[12px] font-bold text-red-600">Aucun praticien</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.statut === 'enroute' && <Badge variant="enroute" label="En route" />}
                    {m.statut === 'inprog' && <Badge variant="inprog" label="Soin en cours" />}
                    {m.statut === 'urgent' && <Badge variant="urgent" label="En attente" />}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-500">{m.debut}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-purple-700">{m.eta}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-gray-700">{m.montant}</td>
                  <td className="px-4 py-3">
                    {m.statut === 'urgent' ? (
                      <button className="text-[11px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg px-2 py-1 hover:bg-yellow-100 transition whitespace-nowrap">
                        Assigner
                      </button>
                    ) : (
                      <button className="text-[11px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-100 transition">
                        Voir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>{filtered.length} missions affichées</span>
          <span>347 missions ce mois · 18 aujourd&apos;hui</span>
        </div>
      </div>
    </div>
  )
}