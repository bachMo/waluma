
'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'

interface ParamValue {
  valeur: number | boolean | string
  label: string
  description?: string
  type: string
}

interface GroupedParams {
  tarifs?: Record<string, ParamValue>
  matching?: Record<string, ParamValue>
  notifications?: Record<string, ParamValue>
  securite?: Record<string, ParamValue>
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-label={value ? 'Désactiver' : 'Activer'}
      className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${
        value ? 'bg-[#22c55e]' : 'bg-gray-200'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function ParamRow({
  label,
  sub,
  children,
}: {
  label: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-800">
          {label}
        </div>

        {sub && (
          <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            {sub}
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  )
}

export default function ParametresPage() {
  const [localValues, setLocalValues] = useState<
    Record<string, number | boolean | string>
  >({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/parametres')

        const flat: Record<string, number | boolean | string> = {}

        Object.values(data.grouped as GroupedParams).forEach((cat) => {
          Object.entries(cat as Record<string, ParamValue>).forEach(
            ([cle, p]) => {
              flat[cle] = p.valeur
            }
          )
        })

        setLocalValues(flat)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function setValue(
    cle: string,
    val: number | boolean | string
  ) {
    setLocalValues((prev) => ({
      ...prev,
      [cle]: val,
    }))
  }

  async function handleSave() {
    setSaving(true)

    try {
      await api.patch('/parametres', localValues)

      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    } finally {
      setSaving(false)
    }
  }

  function numInput(cle: string, unit: string) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={
            localValues[cle] !== undefined &&
            !isNaN(Number(localValues[cle]))
              ? Number(localValues[cle])
              : ''
          }
          onChange={(e) =>
            setValue(
              cle,
              parseFloat(e.target.value) || 0
            )
          }
          className="
            w-20
            sm:w-24
            text-right
            border
            border-gray-200
            rounded-lg
            px-2.5
            sm:px-3
            py-1.5
            text-sm
            font-mono
            font-semibold
            outline-none
            focus:border-[#0d5068]
            bg-white
          "
        />

        <span className="text-xs text-gray-400 flex-shrink-0">
          {unit}
        </span>
      </div>
    )
  }

  function boolToggle(cle: string) {
    return (
      <Toggle
        value={!!localValues[cle]}
        onChange={(v) => setValue(cle, v)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full min-w-0">
        <Topbar title="Paramètres" />

        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Chargement...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-w-0">
      <Topbar title="Paramètres">
        <div className="flex items-center gap-2">
          {saved && (
            <span
              className="
                hidden
                sm:inline-flex
                text-xs
                font-semibold
                text-green-600
                bg-green-50
                border
                border-green-200
                rounded-lg
                px-3
                py-1.5
                whitespace-nowrap
              "
            >
              ✓ Enregistré
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              text-xs
              font-bold
              bg-[#0d5068]
              text-white
              rounded-lg
              px-2.5
              sm:px-3
              py-1.5
              hover:bg-[#0a3f52]
              transition
              disabled:opacity-50
              whitespace-nowrap
            "
          >
            {saving
              ? 'Enregistrement...'
              : '✓ Enregistrer'}
          </button>
        </div>
      </Topbar>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6">
        <div className="mb-5">
          <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
            Configuration de la plateforme
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-relaxed">
            Les modifications s&apos;appliquent immédiatement sur les
            nouvelles missions.
          </p>
        </div>

        <div
          className="
            bg-yellow-50
            border
            border-yellow-200
            rounded-xl
            px-3
            sm:px-4
            py-3
            text-xs
            sm:text-sm
            text-yellow-700
            mb-5
            sm:mb-6
            flex
            items-start
            gap-2
          "
        >
          <span className="flex-shrink-0">⚠</span>

          <span>
            Les missions en cours ne sont pas affectées. Seules les
            nouvelles missions utiliseront les nouveaux paramètres.
          </span>
        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-4
            lg:gap-5
          "
        >
          {/* TARIFS */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 min-w-0">
            <div className="text-sm font-bold text-gray-800 mb-1">
              Tarifs et commissions
            </div>

            <div className="text-xs text-gray-400 mb-4">
              Prélevés à la clôture de chaque mission
            </div>

            <ParamRow
              label="Commission Waluma standard"
              sub="Prélevée à la clôture (%)"
            >
              {numInput('commission_standard', '%')}
            </ParamRow>

            <ParamRow
              label="Soins infirmiers — base"
              sub="Tarif minimum facturé au patient"
            >
              {numInput('tarif_infirmier', 'FCFA')}
            </ParamRow>

            <ParamRow label="Médecine générale — base">
              {numInput('tarif_medecin', 'FCFA')}
            </ParamRow>

            <ParamRow label="Sage-femme — base">
              {numInput('tarif_sage_femme', 'FCFA')}
            </ParamRow>

            <ParamRow
              label="Frais de déplacement"
              sub="Ajoutés automatiquement"
            >
              {numInput('frais_deplacement', 'FCFA')}
            </ParamRow>
          </div>

          {/* MATCHING */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 min-w-0">
            <div className="text-sm font-bold text-gray-800 mb-4">
              Algorithme de matching
            </div>

            <ParamRow
              label="Rayon de recherche maximum"
              sub="Distance max pour trouver un praticien"
            >
              {numInput('rayon_recherche_km', 'km')}
            </ParamRow>

            <ParamRow
              label="Délai avant repli généraliste"
              sub="Si aucun spécialiste disponible"
            >
              {numInput('delai_repli_generaliste', 'min')}
            </ParamRow>

            <ParamRow
              label="Délai d'expiration d'une demande"
              sub="Avant annulation automatique"
            >
              {numInput('delai_expiration_demande', 'min')}
            </ParamRow>

            <ParamRow
              label="Taux d'annulation max praticien"
              sub="Au-delà → alerte automatique"
            >
              {numInput('taux_annulation_max', '%')}
            </ParamRow>

            <ParamRow
              label="Priorité distance en urgence"
              sub="La distance prime sur la spécialité"
            >
              {boolToggle('priorite_distance_urgence')}
            </ParamRow>
          </div>

          {/* NOTIFICATIONS */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 min-w-0">
            <div className="text-sm font-bold text-gray-800 mb-4">
              Notifications et messages
            </div>

            <ParamRow
              label="Vérification OTP à la connexion"
              sub="Code envoyé pour chaque connexion"
            >
              {boolToggle('otp_connexion')}
            </ParamRow>

            <ParamRow
              label="Notifications push"
              sub="Changements de statut des missions"
            >
              {boolToggle('notif_push_statut')}
            </ParamRow>

            <ParamRow
              label="Alerte solde bas praticien"
              sub="Seuil déclencheur"
            >
              {numInput('seuil_solde_bas', 'FCFA')}
            </ParamRow>
          </div>

          {/* SECURITE */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 min-w-0">
            <div className="text-sm font-bold text-gray-800 mb-4">
              Sécurité et accès
            </div>

            <ParamRow
              label="Durée de session admin"
              sub="Déconnexion automatique après inactivité"
            >
              {numInput('duree_session_admin', 'min')}
            </ParamRow>

            <ParamRow
              label="Logs d'activité admin"
              sub="Enregistrement de toutes les actions"
            >
              {boolToggle('logs_activite_admin')}
            </ParamRow>

            <ParamRow
              label="Mode maintenance"
              sub="Bloque toutes les nouvelles missions"
            >
              {boolToggle('mode_maintenance')}
            </ParamRow>
          </div>
        </div>
      </div>
    </div>
  )
}

