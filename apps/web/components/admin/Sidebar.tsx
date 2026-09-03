'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

const navItems = [
  { href: '/dashboard',    label: 'Tableau de bord', icon: '▦',  badge: null },
  { href: '/praticiens',   label: 'Praticiens',       icon: '👤', badge: '3'  },
  { href: '/missions',     label: 'Missions',         icon: '📍', badge: '7'  },
  { href: '/litiges',      label: 'Litiges',          icon: '⚠️', badge: '3'  },
  { href: '/statistiques', label: 'Statistiques',     icon: '📊', badge: null },
  { href: '/articles',     label: 'Articles santé',   icon: '📰', badge: null },
  { href: '/parametres',   label: 'Paramètres',       icon: '⚙️', badge: null },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    document.cookie = 'waluma_access_token=; path=/; max-age=0'
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-[220px] bg-[#0d5068] flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <path d="M4 8L11 26L18 12L25 26L32 8" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 26L18 12L25 26" stroke="#86efac" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
        </svg>
        <span className="font-extrabold text-[17px] text-white tracking-tight">
          W<span className="text-[#4ade80]">aluma</span>
        </span>
      </div>

      {/* Admin info */}
      <div className="mx-2 mb-3 bg-white/[0.07] rounded-xl px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div>
          <div className="text-white text-[13px] font-semibold leading-tight">
            {user?.prenom} {user?.nom}
          </div>
          <div className="text-white/40 text-[11px]">Super admin</div>
        </div>
      </div>

      {/* Nav Principal */}
      <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 px-4 mt-2 mb-1">Principal</div>
      <nav className="px-2 space-y-0.5">
        {navItems.slice(0, 4).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition border-l-2 ${
                active
                  ? 'bg-[#22c55e]/12 text-[#4ade80] border-[#22c55e] font-semibold'
                  : 'text-white/50 border-transparent hover:bg-white/7 hover:text-white/80'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Nav Gestion */}
      <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 px-4 mt-4 mb-1">Gestion</div>
      <nav className="px-2 space-y-0.5">
        {navItems.slice(4).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition border-l-2 ${
                active
                  ? 'bg-[#22c55e]/12 text-[#4ade80] border-[#22c55e] font-semibold'
                  : 'text-white/50 border-transparent hover:bg-white/7 hover:text-white/80'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto p-2 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-white/30 hover:text-white/60 text-[13px] rounded-xl transition"
        >
          <span>→</span> Déconnexion
        </button>
      </div>
    </aside>
  )
}