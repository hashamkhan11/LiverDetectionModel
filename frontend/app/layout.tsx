import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MediScan AI — Liver & Lung Cancer Detection',
  description: 'Clinical-grade AI for liver tumor and lung cancer detection from CT scans using deep learning.',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#08090F] text-slate-300">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-[#1E2130] bg-[#0A0B14] py-5 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">MediScan AI</span>
                <span>·</span>
                <span>For academic and research use only</span>
              </div>
              <span>© 2026 MediScan AI. All rights reserved.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
