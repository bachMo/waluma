'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'

interface Badges {
  praticiensEnAttente: number
  missionsActives: number
  litigesOuverts: number
  demandesEnAttente: number
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [badges, setBadges] = useState<Badges>({ praticiensEnAttente: 0, missionsActives: 0, litigesOuverts: 0, demandesEnAttente: 0 })

  useEffect(() => {
    async function loadBadges() {
      try {
        const { data } = await api.get('/stats/badges')
        setBadges(data)
      } catch {}
    }
    loadBadges()
    const interval = setInterval(loadBadges, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: '▦', badge: null },
    { href: '/praticiens', label: 'Praticiens', icon: '👤', badge: badges.praticiensEnAttente || null },
    { href: '/missions', label: 'Missions', icon: '📍', badge: badges.missionsActives || null },
    { href: '/litiges', label: 'Litiges', icon: '⚠️', badge: badges.litigesOuverts || null },
    { href: '/demandes', label: 'Demandes', icon: '📋', badge: badges.demandesEnAttente || null },
    { href: '/statistiques', label: 'Statistiques', icon: '📊', badge: null },
    { href: '/articles', label: 'Articles santé', icon: '📰', badge: null },
    { href: '/parametres', label: 'Paramètres', icon: '⚙️', badge: null },
  ]

  const initials = user ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}` : 'AD'
  const fullName = user ? `${user.prenom} ${user.nom}` : 'Administrateur'

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0d5068] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-extrabold text-white tracking-tight">W</span>
          <span className="text-2xl font-extrabold text-[#4ade80] tracking-tight">aluma</span>
        </div>
        <p className="text-[10px] text-white/40 mt-0.5 font-medium tracking-wider uppercase">Administration</p>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white truncate">{fullName}</p>
            <p className="text-[10px] text-white/40">Super admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-2 mb-2">Principal</p>
        {navItems.slice(0, 4).map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[13px] font-medium ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              {isActive && <div className="absolute left-0 w-0.5 h-6 bg-[#22c55e] rounded-r-full" />}
              <span className="text-base leading-none">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#22c55e] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-2 mb-2 mt-4">Gestion</p>
        {navItems.slice(4).map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[13px] font-medium ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg w-full text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all"
        >
          <span className="text-base">→</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}