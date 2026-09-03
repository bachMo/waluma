'use client'
import { useState } from 'react'
import Topbar from '@/components/admin/Topbar'

interface ParamRowProps {
  label: string
  sub?: string
  children: React.ReactNode
}

function ParamRow({ label, sub, children }: ParamRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-b-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${on ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
    >
      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
    </button>
  )
}

function ParamInput({ defaultValue, unit }: { defaultValue: string; unit?: string }) {
  const [v, setV] = useState(defaultValue)
  return (
    <div className="flex items-center gap-2">
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        className="w-24 text-right border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold outline-none focus:border-[#0d5068]"
      />
      {unit && <span className="text-xs text-gray-400 flex-shrink-0">{unit}</span>}
    </div>
  )
}

export default function ParametresPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Paramètres">
        <button className="text-xs font-bold bg-[#0d5068] text-white rounded-lg px-3 py-1.5 hover:bg-[#0a3f52] transition">
          ✓ Enregistrer
        </button>
      </Topbar>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Configuration de la plateforme</h1>
          <p className="text-sm text-gray-400 mt-0.5">Les modifications s&apos;appliquent immédiatement sur les nouvelles missions.</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700 mb-6 flex items-center gap-2">
          <span>⚠</span>
          Les missions en cours ne sont pas affectées. Seules les nouvelles missions utiliseront les nouveaux paramètres.
        </div>

        <div className="grid grid-cols-2 gap-5">

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-1">Tarifs et commissions</div>
            <div className="text-xs text-gray-400 mb-4">Prélevés à la clôture de chaque mission</div>
            <ParamRow label="Commission Waluma standard" sub="Prélevée à la clôture de chaque mission">
              <ParamInput defaultValue="10" unit="%" />
            </ParamRow>
            <ParamRow label="Soins infirmiers — base" sub="Tarif minimum facturé au patient">
              <ParamInput defaultValue="8000" unit="FCFA" />
            </ParamRow>
            <ParamRow label="Médecine générale — base">
              <ParamInput defaultValue="15000" unit="FCFA" />
            </ParamRow>
            <ParamRow label="Sage-femme — base">
              <ParamInput defaultValue="12000" unit="FCFA" />
            </ParamRow>
            <ParamRow label="Frais de déplacement" sub="Ajoutés automatiquement à chaque mission">
              <ParamInput defaultValue="2500" unit="FCFA" />
            </ParamRow>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-4">Algorithme de matching</div>
            <ParamRow label="Rayon de recherche maximum" sub="Distance max pour trouver un praticien">
              <ParamInput defaultValue="10" unit="km" />
            </ParamRow>
            <ParamRow label="Délai avant repli généraliste" sub="Si aucun spécialiste disponible">
              <ParamInput defaultValue="3" unit="min" />
            </ParamRow>
            <ParamRow label="Délai d'expiration d'une demande" sub="Avant annulation automatique">
              <ParamInput defaultValue="2" unit="min" />
            </ParamRow>
            <ParamRow label="Taux d'annulation max praticien" sub="Au-delà → alerte automatique">
              <ParamInput defaultValue="15" unit="%" />
            </ParamRow>
            <ParamRow label="Priorité distance en urgence" sub="La distance prime sur la spécialité">
              <Toggle defaultOn={true} />
            </ParamRow>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-4">Notifications et messages</div>
            <ParamRow label="Vérification OTP à la connexion" sub="Code envoyé pour chaque connexion">
              <Toggle defaultOn={true} />
            </ParamRow>
            <ParamRow label="Notifications push (changements de statut)">
              <Toggle defaultOn={true} />
            </ParamRow>
            <ParamRow label="Alerte solde bas praticien" sub="Seuil déclencheur">
              <ParamInput defaultValue="5000" unit="FCFA" />
            </ParamRow>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-sm font-bold text-gray-800 mb-4">Sécurité et accès</div>
            <ParamRow label="Durée de session admin" sub="Déconnexion automatique après inactivité">
              <ParamInput defaultValue="30" unit="min" />
            </ParamRow>
            <ParamRow label="Logs d'activité admin" sub="Enregistrement de toutes les actions">
              <Toggle defaultOn={true} />
            </ParamRow>
            <ParamRow label="Mode maintenance" sub="Bloque toutes les nouvelles missions">
              <Toggle defaultOn={false} />
            </ParamRow>
          </div>

        </div>
      </div>
    </div>
  )
}