import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Waluma — Votre santé, à domicile. En quelques minutes.',
  description: 'Waluma connecte patients et professionnels de santé à Dakar pour des soins à domicile rapides et fiables.',
  keywords: ['soins à domicile', 'Dakar', 'Sénégal', 'infirmier', 'médecin', 'santé', 'Waluma'],
  openGraph: {
    title: 'Waluma — Soins à domicile à Dakar',
    description: 'Des professionnels de santé vérifiés directement chez vous, en moins de 30 minutes.',
    url: 'https://waluma.app',
    siteName: 'Waluma',
    locale: 'fr_SN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}