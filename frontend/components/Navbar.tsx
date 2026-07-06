'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Stethoscope, BarChart2, ScanLine, LayoutDashboard, History, LogOut, ChevronDown, Server } from 'lucide-react'
import { checkHealth } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan',      label: 'New Scan',  icon: ScanLine },
  { href: '/history',   label: 'History',   icon: History },
  { href: '/metrics',   label: 'Metrics',   icon: BarChart2 },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile, signOut } = useAuth()
  const [modelStatus, setModelStatus] = useState<'checking' | 'ready' | 'offline'>('checking')
  const [menuOpen, setMenuOpen]       = useState(false)

  useEffect(() => {
    checkHealth().then(d => setModelStatus(d.status === 'healthy' ? 'ready' : 'offline'))
  }, [])

  if (pathname === '/login' || pathname === '/register') return null

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    router.replace('/login')
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  const statusLabel = modelStatus === 'checking' ? 'Checking…' : modelStatus === 'ready' ? 'Models Ready' : 'Models Offline'
  const statusDot   = modelStatus === 'checking' ? 'bg-slate-300' : modelStatus === 'ready' ? 'bg-emerald-500 animate-pulse-dot' : 'bg-rose-500'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center justify-between gap-6">

        {/* Brand */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-md group-hover:shadow-blue-300/60 transition-all">
            <Stethoscope className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">MediScan</span>
            <span className="font-bold text-blue-600 text-[15px]"> AI</span>
          </div>
        </Link>

        {/* Nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-2">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
                  }`}>
                  <Icon className="w-[15px] h-[15px]" />
                  {label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Model status */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-full px-3 py-1.5">
            <Server className="w-3 h-3 text-slate-400" />
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
            <span className="text-[11px] font-medium text-slate-500 leading-none">{statusLabel}</span>
          </div>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                Sign In
              </Link>
              <Link href="/register"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-[28px] h-[28px] rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[12px] font-semibold text-slate-800 leading-tight max-w-[90px] truncate">
                    {profile?.name ?? user.email}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize leading-tight">{profile?.role ?? 'User'}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">{profile?.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      {profile?.role && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md capitalize">
                          {profile.role}
                        </span>
                      )}
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
