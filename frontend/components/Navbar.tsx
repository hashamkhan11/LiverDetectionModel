'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Activity, BarChart2, ScanLine, LayoutDashboard, History, LogOut, ChevronDown } from 'lucide-react'
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
  const [apiUp, setApiUp]       = useState<boolean | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    checkHealth().then(d => setApiUp(d.status === 'healthy'))
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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm transition-shadow group-hover:shadow-md group-hover:shadow-blue-300/50">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-[15px] tracking-tight">
            LiverDetect <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">

          {/* API status */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              apiUp === null ? 'bg-slate-300'
              : apiUp        ? 'bg-emerald-500 animate-pulse-dot'
              :                'bg-rose-500'
            }`} />
            <span className="text-[11px] font-medium text-slate-500">
              {apiUp === null ? 'Checking' : apiUp ? 'API Live' : 'Offline'}
            </span>
          </div>

          {!user ? (
            <Link href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              Sign In
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[100px] truncate">
                    {profile?.name ?? user.email}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize leading-tight">{profile?.role ?? ''}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{profile?.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                      {profile?.role && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md capitalize">
                          {profile.role}
                        </span>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                      >
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
