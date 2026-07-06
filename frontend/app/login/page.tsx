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
      <div className="hidden lg:flex lg:w-[46%] bg-[#080F1E] relative overflow-hidden flex-col justify-between p-12">
        {/* Background mesh */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-teal-600/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white font-bold text-lg tracking-tight">MediScan</span>
            <span className="text-blue-400 font-bold text-lg"> AI</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse-dot" />
            <span className="text-blue-300 text-xs font-semibold tracking-wide">Clinical AI Platform</span>
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
              { icon: Heart,    color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25', text: 'Two-stage liver tumor detection with Grad-CAM' },
              { icon: Wind,     color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/25',  text: 'Lung cancer screening with ResNet50 (0.99 threshold)' },
              { icon: BarChart2, color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/25', text: 'Real-time accuracy and F1 metrics tracking' },
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F0F4FF]">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-slate-900">MediScan</span>
              <span className="font-bold text-blue-600"> AI</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to access your scan dashboard</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-200/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl animate-fade-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 mt-1">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or</span></div>
            </div>

            <p className="text-center text-sm text-slate-500">
              No account?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                Create one free
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
