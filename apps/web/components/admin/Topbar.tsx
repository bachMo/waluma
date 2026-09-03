'use client'
import { useAuthStore } from '@/store/auth.store'

interface TopbarProps {
  title: string
  children?: React.ReactNode
}

export default function Topbar({ title, children }: TopbarProps) {
  const { user } = useAuthStore()

  return (
    <div className="flex items-center justify-between px-6 h-[52px] bg-white border-b border-gray-100 flex-shrink-0">
      <span className="font-bold text-[15px] text-gray-800 tracking-tight">{title}</span>
      <div className="flex items-center gap-3">
        {children}
        <div className="w-7 h-7 rounded-full bg-[#0d5068] flex items-center justify-center text-white text-xs font-bold">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
      </div>
    </div>
  )
}