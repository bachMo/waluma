'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import api from '@/lib/api'

interface Mission {
  id: string
  reference: string
  statut: string
  specialite: string
  adresseTexte: string
  montantBase: number
  fraisDeplacement: number
  montantTotal: number
  urgence: boolean
  type: string
  notePatient: string | null
  createdAt: string
  accepteeAt: string | null
  enRouteAt: string | null
  arriveeAt: string | null
  debutSoinAt: string | null
  finSoinAt: string | null
  annuleeAt: string | null
  patient: { nom: string; prenom: string; telephone: string }
  praticien: {
    id: string
    user: { nom: string; prenom: string; telephone: string }
    specialites: { specialite: string; principale: boolean }[]
  } | null
  compteRendu: {
    acteRealise: string
    description: string
    tension: string | null
    temperature: number | null
    pouls: number | null
    spo2: number | null
    recommandations: string | null
    suiteNecessaire: string | null
    soumisAt: string | null
  } | null
  paiement: {
    statut: string
    montant: number
    operateur: string
    referenceExterne: string | null
    payeAt: string | null
  } | null
  avis: {
    note: number
    commentaire: string | null
    tags: string[]
    createdAt: string
  } | null
  litige: {
    id: string
    statut: string
    motif: string
    description: string | null
  } | null
}

const statutVariant: Record<string, 'active' | 'enroute' | 'inprog' | 'urgent' | 'done' | 'cancelled' | 'pending'> = {
  EN_ATTENTE: 'urgent', ACCEPTEE: 'pending', EN_ROUTE: 'enroute',
  ARRIVE: 'enroute', EN_COURS: 'inprog', TERMINEE: 'done',
  ANNULEE: 'cancelled', EXPIREE: 'cancelled',
}

const statutLabel: Record<string, string> = {
  EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', EN_ROUTE: 'En route',
  ARRIVE: 'Arrivé', EN_COURS: 'Soin en cours', TERMINEE: 'Terminée',
  ANNULEE: 'Annulée', EXPIREE: 'Expirée',
}

const specialiteLabel: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-b-0 gap-4">
      <span className="text-[12px] text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value}</span>
    </div>
  )
}

export default function MissionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  async function load() {
    try {
      const { data } = await api.get(`/missions/${id}`)
      setMission(data)
    } catch {
      router.push('/missions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleStatut(statut: string) {
    await api.patch(`/missions/${id}/statut`, { statut })
    load()
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Détail mission" />
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Chargement...</div>
      </div>
    )
  }

  if (!mission) return null

  const TIMELINE = [
    { label: 'Demande créée', date: mission.createdAt },
    { label: 'Praticien accepté', date: mission.accepteeAt },
    { label: 'En route', date: mission.enRouteAt },
    { label: 'Arrivé', date: mission.arriveeAt },
    { label: 'Soin démarré', date: mission.debutSoinAt },
    { label: 'Soin terminé', date: mission.finSoinAt },
    { label: 'Annulée', date: mission.annuleeAt },
  ].filter(t => t.date)

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Détail mission">
        <button
          onClick={() => router.push('/missions')}
          className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
        >
          ← Retour
        </button>
        {mission.statut === 'EN_ATTENTE' && !mission.praticien && (
          <button
            onClick={() => {
              const praticienId = prompt('ID du praticien à assigner :')
              if (!praticienId) return
              setAssigning(true)
              api.patch(`/missions/${id}/assigner`, { praticienId })
                .then(() => load())
                .finally(() => setAssigning(false))
            }}
            disabled={assigning}
            className="text-xs font-bold bg-[#0d5068] text-white rounded-lg px-3 py-1.5 hover:bg-[#0a3f52] transition disabled:opacity-50"
          >
            {assigning ? '...' : 'Assigner un praticien'}
          </button>
        )}
        {['ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'].includes(mission.statut) && (
          <button
            onClick={() => handleStatut('ANNULEE')}
            className="text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition"
          >
            Annuler la mission
          </button>
        )}
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={statutVariant[mission.statut] ?? 'pending'} label={statutLabel[mission.statut] ?? mission.statut} />
              {mission.urgence && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Urgent</span>
              )}
            </div>
            <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">
              {specialiteLabel[mission.specialite]}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Réf. {mission.reference.slice(0, 12).toUpperCase()} · Créée le {formatDate(mission.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-gray-900">{mission.montantTotal.toLocaleString()} FCFA</p>
            <p className="text-xs text-gray-400">Montant total</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Colonne gauche */}
          <div className="col-span-2 space-y-5">

            {/* Patient */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Patient</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] flex items-center justify-center text-sm font-bold text-[#0d5068]">
                  {mission.patient.prenom[0]}{mission.patient.nom[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{mission.patient.prenom} {mission.patient.nom}</p>
                  <p className="text-sm text-gray-500">{mission.patient.telephone}</p>
                </div>
              </div>
              <InfoRow label="Adresse" value={mission.adresseTexte} />
              {mission.notePatient && <InfoRow label="Note pour praticien" value={mission.notePatient} />}
            </div>

            {/* Praticien */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Praticien</h2>
              {mission.praticien ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center text-sm font-bold text-green-700">
                      {mission.praticien.user.prenom[0]}{mission.praticien.user.nom[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{mission.praticien.user.prenom} {mission.praticien.user.nom}</p>
                      <p className="text-sm text-gray-500">{mission.praticien.user.telephone}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/praticiens/${mission.praticien!.id}`)}
                      className="ml-auto text-xs font-semibold text-[#0d5068] border border-[#0d5068]/20 bg-[#e0f2fe] rounded-lg px-2 py-1 hover:bg-[#cfe8f5] transition"
                    >
                      Voir la fiche
                    </button>
                  </div>
                  <InfoRow label="Spécialité" value={specialiteLabel[mission.praticien.specialites.find(s => s.principale)?.specialite ?? ''] ?? '—'} />
                </>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm font-semibold text-red-600 mb-1">Aucun praticien assigné</p>
                  <p className="text-xs">La mission est en attente d'un praticien disponible</p>
                </div>
              )}
            </div>

            {/* Compte rendu */}
            {mission.compteRendu && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h2 className="text-sm font-bold text-gray-800 mb-4">Compte rendu de soin</h2>
                <InfoRow label="Acte réalisé" value={mission.compteRendu.acteRealise} />
                <div className="py-2.5 border-b border-gray-50">
                  <p className="text-[12px] text-gray-500 mb-1.5">Description</p>
                  <p className="text-[13px] text-gray-900 leading-relaxed">{mission.compteRendu.description}</p>
                </div>
                {(mission.compteRendu.tension || mission.compteRendu.temperature || mission.compteRendu.pouls || mission.compteRendu.spo2) && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {[
                      { label: 'Tension', value: mission.compteRendu.tension, unit: 'mmHg' },
                      { label: 'Temp.', value: mission.compteRendu.temperature, unit: '°C' },
                      { label: 'Pouls', value: mission.compteRendu.pouls, unit: 'bpm' },
                      { label: 'SpO₂', value: mission.compteRendu.spo2, unit: '%' },
                    ].map(c => c.value ? (
                      <div key={c.label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">{c.label}</p>
                        <p className="text-[15px] font-bold text-gray-900">{c.value}<span className="text-[10px] font-normal text-gray-400 ml-0.5">{c.unit}</span></p>
                      </div>
                    ) : null)}
                  </div>
                )}
                {mission.compteRendu.recommandations && <InfoRow label="Recommandations" value={mission.compteRendu.recommandations} />}
                {mission.compteRendu.suiteNecessaire && <InfoRow label="Suite nécessaire" value={mission.compteRendu.suiteNecessaire} />}
                <InfoRow label="Soumis le" value={formatDate(mission.compteRendu.soumisAt)} />
              </div>
            )}

            {/* Avis */}
            {mission.avis && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h2 className="text-sm font-bold text-gray-800 mb-4">Avis patient</h2>
                <div className="flex items-center gap-2 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-xl ${i <= mission.avis!.note ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                  <span className="text-sm font-bold text-gray-900 ml-1">{mission.avis.note}/5</span>
                </div>
                {mission.avis.commentaire && <p className="text-sm text-gray-600 italic">"{mission.avis.commentaire}"</p>}
                {mission.avis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mission.avis.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-semibold bg-[#e0f2fe] text-[#0d5068] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Litige */}
            {mission.litige && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h2 className="text-sm font-bold text-red-800 mb-3">⚠ Litige associé</h2>
                <InfoRow label="Motif" value={mission.litige.motif} />
                <InfoRow label="Statut" value={mission.litige.statut} />
                {mission.litige.description && <InfoRow label="Description" value={mission.litige.description} />}
                <button
                  onClick={() => router.push('/litiges')}
                  className="mt-3 text-xs font-bold text-red-700 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition"
                >
                  Voir le litige →
                </button>
              </div>
            )}
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">

            {/* Détails financiers */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Finances</h2>
              <InfoRow label="Soin" value={`${mission.montantBase.toLocaleString()} FCFA`} />
              <InfoRow label="Déplacement" value={`${mission.fraisDeplacement.toLocaleString()} FCFA`} />
              <InfoRow label="Total" value={<span className="text-[#0d5068] font-extrabold">{mission.montantTotal.toLocaleString()} FCFA</span>} />
              <InfoRow label="Commission (10%)" value={`${Math.round(mission.montantTotal * 0.1).toLocaleString()} FCFA`} />
              <InfoRow label="Gain praticien" value={`${Math.round(mission.montantTotal * 0.9).toLocaleString()} FCFA`} />

              {mission.paiement && (
                <>
                  <div className="border-t border-gray-100 mt-2 pt-3">
                    <InfoRow label="Statut paiement" value={
                      <span className={`font-bold ${mission.paiement.statut === 'PAYE' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {mission.paiement.statut}
                      </span>
                    } />
                    <InfoRow label="Opérateur" value={mission.paiement.operateur} />
                    {mission.paiement.payeAt && <InfoRow label="Payé le" value={formatDate(mission.paiement.payeAt)} />}
                    {mission.paiement.referenceExterne && <InfoRow label="Référence" value={mission.paiement.referenceExterne} />}
                  </div>
                </>
              )}

              {!mission.paiement && mission.statut === 'TERMINEE' && (
                <div className="mt-3 text-center">
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">En attente de paiement</span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Chronologie</h2>
              <div className="space-y-3">
                {TIMELINE.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">{t.label}</p>
                      <p className="text-[11px] text-gray-400">{formatDate(t.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos mission */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-bold text-gray-800 mb-4">Informations</h2>
              <InfoRow label="Type" value={mission.type === 'IMMEDIATE' ? 'Immédiate' : 'Planifiée'} />
              <InfoRow label="Spécialité" value={specialiteLabel[mission.specialite]} />
              <InfoRow label="Urgence" value={mission.urgence ? '🔴 Oui' : 'Non'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}