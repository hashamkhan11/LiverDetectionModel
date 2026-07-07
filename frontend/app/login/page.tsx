'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Mail, Lock, Loader2, AlertCircle, Heart, Wind, BarChart2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      router.replace('/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#0A0B14] relative overflow-hidden flex-col justify-between p-12 border-r border-[#1E2130]">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-[#00C2FF]/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-[#818CF8]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#00C2FF]/15 border border-[#00C2FF]/25 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#00C2FF]" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white font-bold text-lg tracking-tight">MediScan</span>
            <span className="text-[#00C2FF] font-bold text-lg"> AI</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full animate-pulse-dot" />
            <span className="text-[#00C2FF] text-xs font-semibold tracking-wide">Clinical AI Platform</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Liver & Lung<br />
            <span className="gradient-text">Cancer Detection</span><br />
            with Deep Learning
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
            Upload CT scans and receive instant AI-powered predictions using
            two specialised ResNet pipelines.
          </p>

          <div className="space-y-3">
            {[
              { icon: Heart,    color: 'text-[#818CF8]', bg: 'bg-[#818CF8]/15 border-[#818CF8]/25', text: 'Two-stage liver tumor detection with Grad-CAM' },
              { icon: Wind,     color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/15 border-[#2DD4BF]/25', text: 'Lung cancer screening with ResNet50 (0.99 threshold)' },
              { icon: BarChart2, color: 'text-[#00C2FF]', bg: 'bg-[#00C2FF]/15 border-[#00C2FF]/25', text: 'Real-time accuracy and F1 metrics tracking' },
            ].map(({ icon: Icon, color, bg, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className={`w-8 h-8 ${bg} border rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">For academic and research use only</p>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0A0B14]">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-[10px] bg-[#00C2FF]/15 border border-[#00C2FF]/25 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#00C2FF]" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-white">MediScan</span>
              <span className="font-bold text-[#00C2FF]"> AI</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to access your scan dashboard</p>
          </div>

          <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-xl animate-fade-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-[#1E2130] rounded-xl text-sm bg-[#0A0B14] text-slate-200 placeholder:text-slate-600 focus:bg-[#0D0E1A] focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/25 focus:border-[#00C2FF]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-[#1E2130] rounded-xl text-sm bg-[#0A0B14] text-slate-200 placeholder:text-slate-600 focus:bg-[#0D0E1A] focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/25 focus:border-[#00C2FF]/50 transition-all"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#00C2FF] hover:bg-[#22D3EE] active:bg-[#06B6D4] disabled:bg-[#1E2130] disabled:text-slate-600 disabled:cursor-not-allowed text-[#08090F] font-bold py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,194,255,0.2)] disabled:shadow-none mt-1">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1E2130]" /></div>
              <div className="relative flex justify-center"><span className="bg-[#0F1018] px-3 text-xs text-slate-600">or</span></div>
            </div>

            <p className="text-center text-sm text-slate-500">
              No account?{' '}
              <Link href="/register" className="text-[#00C2FF] font-semibold hover:text-[#22D3EE] transition-colors">
                Create one free
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
