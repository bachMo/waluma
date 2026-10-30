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

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

// ─── Icônes SVG inline ───
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  praticiens: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  missions: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.48-2.02-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  litiges: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14.5 13H1.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
    </svg>
  ),
  demandes: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 8h6M5 5.5h3M5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  statistiques: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13L6 8l3 3 5-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  articles: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 6h6M5 8.5h4M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  parametres: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.22 3.22l1.27 1.27M11.51 11.51l1.27 1.27M3.22 12.78l1.27-1.27M11.51 4.49l1.27-1.27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10.5 10.5L13 8l-2.5-2.5M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export default function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const [badges, setBadges] = useState<Badges>({
    praticiensEnAttente: 0,
    missionsActives: 0,
    litigesOuverts: 0,
    demandesEnAttente: 0,
  })

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

  const navGroups = [
    {
      label: 'Principal',
      items: [
        { href: '/dashboard', label: 'Tableau de bord', icon: Icons.dashboard, badge: null },
        { href: '/praticiens', label: 'Praticiens', icon: Icons.praticiens, badge: badges.praticiensEnAttente || null },
        { href: '/missions', label: 'Missions', icon: Icons.missions, badge: badges.missionsActives || null },
        { href: '/litiges', label: 'Litiges', icon: Icons.litiges, badge: badges.litigesOuverts || null },
      ],
    },
    {
      label: 'Gestion',
      items: [
        { href: '/demandes', label: 'Demandes', icon: Icons.demandes, badge: badges.demandesEnAttente || null },
        { href: '/statistiques', label: 'Statistiques', icon: Icons.statistiques, badge: null },
        { href: '/articles', label: 'Articles santé', icon: Icons.articles, badge: null },
        { href: '/parametres', label: 'Paramètres', icon: Icons.parametres, badge: null },
      ],
    },
  ]

  const initials = user ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}` : 'AD'
  const fullName = user ? `${user.prenom} ${user.nom}` : 'Administrateur'

  const handleNavigation = () => {
    if (isMobile) onToggle()
  }

  return (
    <aside
      className={`
        ${isMobile ? 'fixed top-0 left-0 z-50' : 'relative'}
        w-[220px] h-full
        bg-[#0d5068]
        flex flex-col
        shadow-2xl md:shadow-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3v8" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-bold text-white tracking-tight leading-none">Waluma</div>
              <div className="text-[9px] text-white/35 font-medium tracking-wider mt-0.5">ADMINISTRATION</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Fermer le menu"
            className="w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Utilisateur ── */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">{fullName}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Super admin</p>
          </div>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22c55e] flex-shrink-0" title="En ligne" />
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
            <div className="text-[9.5px] font-semibold text-white/30 px-2 mb-1.5 tracking-widest">
              {group.label.toUpperCase()}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigation}
                    className={`
                      relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                      transition-all text-[13px] font-medium
                      ${isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/55 hover:text-white hover:bg-white/8'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#22c55e] rounded-r-full" />
                    )}
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#22c55e] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Déconnexion ── */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg w-full text-[13px] font-medium text-white/45 hover:text-white hover:bg-white/8 transition-all"
        >
          <span className="flex-shrink-0 text-white/35">{Icons.logout}</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
