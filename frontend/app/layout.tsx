import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'LiverDetect AI — Liver Tumor Detection',
  description: 'AI-powered two-stage liver tumor detection from CT scans using ResNet18 deep learning.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFF] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
            <span className="font-medium text-slate-500">LiverDetect AI</span>
            &nbsp;&mdash;&nbsp;For academic and research use only
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
