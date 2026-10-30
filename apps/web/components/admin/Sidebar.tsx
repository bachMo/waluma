'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Badges {
  demandes?: number
  litiges?: number
}

const NAV = [
  {
    group: 'Principal',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="8.5" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="1" y="8.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        ),
      },
      {
        href: '/statistiques',
        label: 'Statistiques',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 13L5.5 8 8.5 10.5 13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="13" cy="5" r="1.5" fill="currentColor"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Gestion',
    items: [
      {
        href: '/praticiens',
        label: 'Praticiens',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M12 7.5v4M10 9.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: '/missions',
        label: 'Missions',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: '/demandes',
        label: 'Demandes',
        badge: 'demandes' as keyof Badges,
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: '/litiges',
        label: 'Litiges',
        badge: 'litiges' as keyof Badges,
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5l6.5 12H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M8 6v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: '/articles',
        label: 'Articles',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 1.5h8a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1v-11a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Système',
    items: [
      {
        href: '/parametres',
        label: 'Paramètres',
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [badges, setBadges] = useState<Badges>({})
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  useEffect(() => {
    api.get<Badges>('/stats/badges').then(({ data }) => setBadges(data)).catch(() => {})
  }, [])

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-white border-r border-gray-100 h-full">
      {/* LOGO */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0d5068] flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <div className="text-[14px] font-extrabold text-[#0a2535] leading-none">Waluma</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Administration</div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            <div className="px-2 mb-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              {section.group}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                const badgeCount = item.badge ? (badges[item.badge] ?? 0) : 0
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                      active
                        ? 'bg-[#0d5068] text-white'
                        : 'text-gray-500 hover:text-[#0a2535] hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* BOTTOM */}
      <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 8H2M5.5 4.5L2 8l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2h4.5a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Déconnexion
        </Link>
      </div>
    </aside>
  )
}
