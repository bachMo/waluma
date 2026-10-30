'use client'

import { useAuthStore } from '@/store/auth.store'

interface TopbarProps {
  title: string
  children?: React.ReactNode
}

export default function Topbar({ title, children }: TopbarProps) {
  const { user } = useAuthStore()

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`
    : 'AD'

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 h-[56px] bg-white border-b border-gray-100 flex-shrink-0">
      {/* Titre — aligné à gauche, pas centré */}
      <h1 className="font-bold text-[15px] text-gray-900 tracking-tight leading-none flex-1 min-w-0 truncate">
        {title}
      </h1>

      {/* Actions + avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {children}

        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <div className="text-[12px] font-semibold text-gray-700 leading-none">
              {user ? `${user.prenom} ${user.nom}` : 'Admin'}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Super admin</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#0d5068] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </div>
  )
}
