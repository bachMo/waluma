'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, hydrate } = useAuthStore()
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem('waluma_access_token')

      if (!token) {
        router.push('/login')
      }
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768

      setIsMobile(mobile)

      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Sidebar desktop */}
      <div
        className={`
          hidden md:block
          flex-shrink-0
          h-full
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-[220px]' : 'w-0'}
        `}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isMobile={false}
        />
      </div>

      {/* Sidebar mobile */}
      <div className="md:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          isMobile
        />
      </div>

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>

      {/* Bouton ouvrir */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Ouvrir le menu"
          className="
            fixed
            top-4
            left-4
            z-30
            w-10
            h-10
            bg-[#0d5068]
            text-white
            rounded-xl
            shadow-lg
            flex
            items-center
            justify-center
            hover:bg-[#0a3f52]
            active:scale-95
            transition-all
          "
        >
          <span className="text-xl leading-none">☰</span>
        </button>
      )}
    </div>
  )
}

