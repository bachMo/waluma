'use client'
import Topbar from '@/components/admin/Topbar'

const litiges = [
  {
    id: '#2801', urgent: true,
    titre: 'Paiement bloqué',
    statut: 'Urgent',
    date: '27 août',
    patient: 'Khadija Ndiaye',
    praticien: 'Dr. Diouf',
    description: 'Le compte rendu n\'a pas été soumis par le praticien depuis 48h. Le paiement est bloqué. Le patient demande un remboursement.',
    actions: ['Voir le dossier', 'Forcer la clôture', 'Rembourser le patient', 'Suspendre le praticien'],
  },
  {
    id: '#2798', urgent: false,
    titre: 'Insatisfaction patient',
    statut: 'En traitement',
    date: '26 août',
    patient: 'Cheikh Fall',
    praticien: 'Dr. Aminata',
    description: 'Patient insatisfait du soin fourni, note 2/5. Le praticien conteste en présentant son compte rendu signé. Médiation en cours.',
    actions: ['Voir le dossier', 'Médiation', 'Clore le litige'],
  },
  {
    id: '#2792', urgent: false,
    titre: 'Annulation tardive',
    statut: 'En traitement',
    date: '24 août',
    patient: 'Moussa Ba',
    praticien: 'Dr. Sow',
    description: 'Annulation après l\'arrivée du praticien. Frais de déplacement de 2 500 FCFA réclamés par le praticien. Patient conteste.',
    actions: ['Voir le dossier', 'Appliquer la politique'],
  },
]

const actionStyle: Record<string, string> = {
  'Voir le dossier': 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  'Forcer la clôture': 'bg-[#0d5068] text-white border-[#0d5068] hover:bg-[#0a3f52]',
  'Rembourser le patient': 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  'Suspendre le praticien': 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  'Médiation': 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  'Clore le litige': 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  'Appliquer la politique': 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
}

export default function LitigesPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Litiges" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Gestion des litiges</h1>
          <p className="text-sm text-gray-400 mt-0.5">3 litiges ouverts · 1 urgent · 2 en traitement</p>
        </div>

        <div className="space-y-4">
          {litiges.map((l) => (
            <div
              key={l.id}
              className={`rounded-xl p-5 border ${l.urgent ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${l.urgent ? 'bg-red-100 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {l.statut}
                    </span>
                    <span className="font-extrabold text-[15px] text-gray-900">Mission {l.id} · {l.titre}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Ouvert le {l.date} · Patient : {l.patient} · Praticien : {l.praticien}
                  </div>
                </div>
              </div>

              <div className={`text-sm text-gray-600 leading-relaxed rounded-xl px-4 py-3 mb-4 ${l.urgent ? 'bg-white' : 'bg-gray-50'}`}>
                {l.description}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {l.actions.map((action) => (
                  <button
                    key={action}
                    className={`text-[12px] font-semibold border rounded-lg px-3 py-1.5 transition ${actionStyle[action] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}