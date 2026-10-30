'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/admin/Topbar'
import api from '@/lib/api'

interface Config {
  fraisService: number
  delaiMaxMinutes: number
  notificationsSms: boolean
  notificationsEmail: boolean
  maintenanceMode: boolean
  versionApp: string
}

export default function ParametresPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<Config>('/config').then(({ data }) => { setConfig(data) }).catch(() => {
      setConfig({
        fraisService: 10,
        delaiMaxMinutes: 45,
        notificationsSms: true,
        notificationsEmail: false,
        maintenanceMode: false,
        versionApp: '1.0.0',
      })
    }).finally(() => setLoading(false))
  }, [])

  function set<K extends keyof Config>(k: K, v: Config[K]) {
    setConfig((prev) => prev ? { ...prev, [k]: v } : null)
  }

  async function handleSave() {
    if (!config) return
    setSaving(true)
    try {
      await api.put('/config', config)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#0d5068] focus:ring-2 focus:ring-[#0d5068]/10 transition bg-white"

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title="Paramètres"
        subtitle="Configuration de la plateforme"
        actions={
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-[#0d5068] hover:bg-[#0a3f52] disabled:opacity-55 text-white text-[12.5px] font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5l3.5 3.5L11 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 9.5V11.5h2l6-6L7.5 3.5l-6 6zM10.5 2.5L10 2a.7.7 0 00-1 0l-.8.8L10.2 4.8l.8-.8a.7.7 0 000-1l-.5-.5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            )}
            {saved ? 'Enregistré' : 'Enregistrer'}
          </button>
        }
      />

      <div className="p-5 sm:p-6 space-y-4 max-w-2xl">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : config && (
          <>
            {/* Tarification */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-[13.5px] font-bold text-[#0a2535] mb-4">Tarification</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">
                    Frais de service (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={config.fraisService}
                    onChange={(e) => set('fraisService', Number(e.target.value))}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Commission prélevée sur chaque mission.</p>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">
                    Délai max avant annulation (min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={config.delaiMaxMinutes}
                    onChange={(e) => set('delaiMaxMinutes', Number(e.target.value))}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Délai sans praticien avant annulation auto.</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-[13.5px] font-bold text-[#0a2535] mb-4">Notifications</div>
              <div className="space-y-3">
                {[
                  { key: 'notificationsSms' as keyof Config, label: 'Notifications SMS', desc: 'Envoi de SMS aux patients et praticiens.' },
                  { key: 'notificationsEmail' as keyof Config, label: 'Notifications email', desc: 'Envoi de confirmations par email.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-[13px] font-semibold text-[#0a2535]">{item.label}</div>
                      <div className="text-[11.5px] text-gray-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => set(item.key, !config[item.key])}
                      className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${config[item.key] ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${config[item.key] ? 'left-4.5 translate-x-0' : 'left-0.5'}`}
                        style={{ left: config[item.key] ? '18px' : '2px' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-[13.5px] font-bold text-[#0a2535] mb-4">Système</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-[13px] font-semibold text-[#0a2535]">Mode maintenance</div>
                    <div className="text-[11.5px] text-gray-400">Désactive l'accès au site pour les utilisateurs.</div>
                  </div>
                  <button
                    onClick={() => set('maintenanceMode', !config.maintenanceMode)}
                    className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${config.maintenanceMode ? 'bg-[#f97316]' : 'bg-gray-200'}`}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                      style={{ left: config.maintenanceMode ? '18px' : '2px' }}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div>
                    <div className="text-[13px] font-semibold text-[#0a2535]">Version de l'app</div>
                    <div className="text-[11.5px] text-gray-400">Version actuellement déployée.</div>
                  </div>
                  <span className="text-[12.5px] font-semibold text-[#0d5068] bg-[#f0f7f5] px-3 py-1 rounded-lg">
                    v{config.versionApp}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
