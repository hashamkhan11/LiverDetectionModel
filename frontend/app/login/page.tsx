'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Mail, Lock, Loader2, AlertCircle, Layers, Brain, BarChart2 } from 'lucide-react'
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            LiverDetect <span className="text-blue-400">AI</span>
          </span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            AI-Powered<br />
            <span className="gradient-text">Liver Tumor</span><br />
            Detection
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            A two-stage ResNet18 deep learning pipeline that analyses CT scans
            for liver tumor detection with Grad-CAM visualisation.
          </p>

          <div className="space-y-4">
            {[
              { icon: Layers,   text: 'Two-stage liver verification + tumor detection' },
              { icon: Brain,    text: '70% threshold / 11% ratio detection logic' },
              { icon: BarChart2, text: 'Real-time accuracy and F1 metrics tracking' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xs">
          For academic and research use only
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFF]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">LiverDetect <span className="text-blue-600">AI</span></span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl animate-fade-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              No account?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
