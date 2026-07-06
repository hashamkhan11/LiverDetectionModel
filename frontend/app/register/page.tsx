'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Mail, Lock, User, Loader2, AlertCircle, Heart, Wind, BarChart2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    role: 'doctor' as 'doctor' | 'radiologist',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return }
    setError(null)
    setLoading(true)
    try {
      await signUp(form.name, form.email, form.password, form.role)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('email-already-in-use')) setError('This email is already registered.')
      else setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#080F1E] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-600/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white font-bold text-lg tracking-tight">MediScan</span>
            <span className="text-blue-400 font-bold text-lg"> AI</span>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">Join the Platform</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start Detecting<br />
            <span className="gradient-text">Smarter</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
            Create your account to begin uploading CT scans and contributing
            ground truth evaluations to improve model performance.
          </p>

          <div className="space-y-3">
            {[
              { icon: Heart,    color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25',    text: 'Full volumetric NIfTI analysis with Grad-CAM' },
              { icon: Wind,     color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/25',     text: 'Lung cancer screening with high-precision scoring' },
              { icon: BarChart2, color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/25', text: 'Track personal precision, recall and F1 in real time' },
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
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#F0F4FF]">
        <div className="w-full max-w-[400px]">

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
            <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Create your account</h1>
            <p className="text-slate-500 text-sm">Fill in the details below to get started</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-200/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl animate-fade-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Dr. Mahnoor Khan" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['doctor', 'radiologist'] as const).map(r => (
                    <button key={r} type="button" onClick={() => set('role', r)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                        form.role === r
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50/60'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="doctor@hospital.com" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 characters" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="••••••••" className={inputCls} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 mt-1">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or</span></div>
            </div>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">Sign in</Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
