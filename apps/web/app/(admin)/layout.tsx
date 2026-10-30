'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { useAuthStore } from '@/store/auth.store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, hydrate } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Le store est en mémoire : au rechargement de la page il est vide même si
  // un token valide existe. Il faut l'hydrater depuis localStorage AVANT de
  // décider de rediriger, sinon toute actualisation renvoie au login.
  const [hydrate_fait, setHydrateFait] = useState(false)

  useEffect(() => {
    hydrate()
    setHydrateFait(true)
  }, [hydrate])

  useEffect(() => {
    if (hydrate_fait && !user) router.replace('/login')
  }, [hydrate_fait, user, router])

  if (!hydrate_fait) return null
  if (!user) return null

  return (
    <div className="h-screen flex overflow-hidden bg-[#f7f9fb]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR — desktop always visible, mobile slide-in */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto h-full transition-transform duration-200 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar />
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Chaque page rend sa propre Topbar (titre, sous-titre, actions).
            Le layout ne fournit que le déclencheur du menu mobile. */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          className="lg:hidden fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-[#0d5068] text-white shadow-lg flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
