'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore()
  const router = useRouter()

  useEffect(() => { hydrate() }, [hydrate])

  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem('waluma_access_token')
      if (!token) router.push('/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}