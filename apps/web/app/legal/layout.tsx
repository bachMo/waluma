import Link from 'next/link'
import type { ReactNode } from 'react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f4ef]">
      <nav className="bg-[#0d5068] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">💚</span>
          <span className="text-lg font-extrabold text-white">Waluma</span>
        </Link>
        <Link href="/" className="text-white/70 text-sm hover:text-white transition">← Retour à l'accueil</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {children}
      </div>
    </div>
  )
}