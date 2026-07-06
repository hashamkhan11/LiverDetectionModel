import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'MediScan AI — Liver & Lung Cancer Detection',
  description: 'Clinical-grade AI for liver tumor and lung cancer detection from CT scans using deep learning.',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-5 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">MediScan AI</span>
                <span>·</span>
                <span>For academic and research use only</span>
              </div>
              <span>© 2025 MediScan AI. All rights reserved.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
