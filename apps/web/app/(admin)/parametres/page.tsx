'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'
import { ReponseParametres } from '@/lib/api-types'

type Valeur = string | number | boolean

interface Champ {
  cle: string
  valeur: Valeur
  label: string
  description: string | null
  type: string
}

const CATEGORIE_LABEL: Record<string, string> = {
  tarifs: 'Tarifs et commission',
  matching: 'Attribution des missions',
  notifications: 'Notifications',
  general: 'Général',
  systeme: 'Système',
}

export default function ParametresPage() {
  const [categories, setCategories] = useState<Record<string, Champ[]>>({})
  const [modifs, setModifs] = useState<Record<string, Valeur>>({})
  const [loading, setLoading] = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)
  const [message, setMessage] = useState<{ ton: 'ok' | 'erreur'; texte: string } | null>(null)

  const charger = useCallback(async () => {
    try {
      // GET /parametres → { grouped, raw }
      const { data } = await api.get<ReponseParametres>('/parametres')
      const groupes: Record<string, Champ[]> = {}
      Object.entries(data?.grouped ?? {}).forEach(([categorie, champs]) => {
        groupes[categorie] = Object.entries(champs).map(([cle, c]) => ({
          cle,
          valeur: c.valeur as Valeur,
          label: c.label,
          description: c.description,
          type: c.type,
        }))
      })
      setCategories(groupes)
      setModifs({})
      setMessage(null)
    } catch {
      setMessage({ ton: 'erreur', texte: "Impossible de charger les paramètres. Vérifiez que l'API est accessible." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  function valeurDe(c: Champ): Valeur {
    return c.cle in modifs ? modifs[c.cle] : c.valeur
  }

  function modifier(cle: string, v: Valeur) {
    setModifs((p) => ({ ...p, [cle]: v }))
    setMessage(null)
  }

  const nbModifs = Object.keys(modifs).length

  async function enregistrer() {
    if (nbModifs === 0) return
    setEnregistrement(true)
    try {
      // PATCH /parametres attend un objet plat { cle: valeur }
      await api.patch('/parametres', modifs)
      setMessage({ ton: 'ok', texte: `${nbModifs} paramètre${nbModifs > 1 ? 's' : ''} enregistré${nbModifs > 1 ? 's' : ''}.` })
      await charger()
    } catch {
      setMessage({ ton: 'erreur', texte: "L'enregistrement a échoué." })
    } finally {
      setEnregistrement(false)
    }
  }

  const entrees = Object.entries(categories)

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Paramètres"
        subtitle={nbModifs > 0 ? `${nbModifs} modification${nbModifs > 1 ? 's' : ''} non enregistrée${nbModifs > 1 ? 's' : ''}` : 'Configuration de la plateforme'}
        actions={
          <div className="flex items-center gap-2">
            {nbModifs > 0 && (
              <button
                onClick={() => { setModifs({}); setMessage(null) }}
                disabled={enregistrement}
                className="rounded-lg border border-gray-200 px-3 py-2 text-[12.5px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
            )}
            <button
              onClick={enregistrer}
              disabled={enregistrement || nbModifs === 0}
              className="rounded-lg bg-[#0d5068] px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#0a3f52] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        }
      />

      <div className="flex-1 space-y-4 p-5 sm:p-6">
        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-[13px] ${
              message.ton === 'ok'
                ? 'border-green-100 bg-green-50 text-green-700'
                : 'border-red-100 bg-red-50 text-red-700'
            }`}
          >
            {message.texte}
          </div>
        )}

        {loading ? (
          <div className="max-w-2xl space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-gray-100 bg-white" />
            ))}
          </div>
        ) : entrees.length === 0 ? (
          <div className="max-w-2xl rounded-xl border border-gray-100 bg-white py-14 text-center">
            <p className="text-[13.5px] font-semibold text-[#0a2535]">Aucun paramètre configuré</p>
            <p className="mx-auto mt-1 max-w-[42ch] text-[12.5px] text-gray-400">
              Lancez le script de seed des paramètres côté API pour initialiser les tarifs,
              la commission et les règles d&apos;attribution.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl space-y-4">
            {entrees.map(([categorie, champs]) => (
              <section key={categorie} className="rounded-xl border border-gray-100 bg-white p-5">
                <h2 className="mb-4 text-[13.5px] font-bold text-[#0a2535]">
                  {CATEGORIE_LABEL[categorie] ?? categorie}
                </h2>

                <div className="divide-y divide-gray-50">
                  {champs.map((c) => {
                    const v = valeurDe(c)
                    const modifie = c.cle in modifs
                    return (
                      <div key={c.cle} className="flex items-center justify-between gap-5 py-3.5 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#0a2535]">
                            {c.label}
                            {modifie && <span className="ml-2 text-[11px] font-medium text-amber-600">modifié</span>}
                          </p>
                          {c.description && (
                            <p className="mt-0.5 text-[11.5px] leading-snug text-gray-400">{c.description}</p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {c.type === 'boolean' ? (
                            <button
                              onClick={() => modifier(c.cle, !v)}
                              role="switch"
                              aria-checked={Boolean(v)}
                              aria-label={c.label}
                              className={`relative h-6 w-10 rounded-full transition-colors ${v ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
                            >
                              <span
                                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                                style={{ left: v ? '18px' : '2px' }}
                              />
                            </button>
                          ) : c.type === 'number' ? (
                            <input
                              type="number"
                              value={String(v ?? '')}
                              onChange={(e) => modifier(c.cle, e.target.value === '' ? '' : Number(e.target.value))}
                              aria-label={c.label}
                              className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right text-[13px] outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
                            />
                          ) : (
                            <input
                              type="text"
                              value={String(v ?? '')}
                              onChange={(e) => modifier(c.cle, e.target.value)}
                              aria-label={c.label}
                              className="w-48 rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none transition focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10"
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
