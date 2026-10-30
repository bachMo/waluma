'use client'

import { useAuthStore } from '@/store/auth.store'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  onMenuClick?: () => void
}

export default function Topbar({ title, subtitle, actions, onMenuClick }: TopbarProps) {
  const { user } = useAuthStore()
  const initials = user?.prenom
    ? (user.prenom[0] + (user.nom?.[0] ?? '')).toUpperCase()
    : 'A'

  return (
    <header className="h-14 flex-shrink-0 flex items-center gap-4 px-5 sm:px-6 bg-white border-b border-gray-100">
      {/* hamburger mobile */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-[#0a2535] truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
      </div>

      {/* actions */}
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}

      {/* user */}
      <div className="flex items-center gap-2.5 ml-1 flex-shrink-0">
        <div className="hidden sm:block text-right">
          <div className="text-[12.5px] font-semibold text-[#0a2535] leading-none">
            {user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || 'Admin' : 'Admin'}
          </div>
          <div className="text-[10.5px] text-gray-400 mt-0.5">Super admin</div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#0d5068] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
          {initials}
        </div>
      </div>
    </header>
  )
}
