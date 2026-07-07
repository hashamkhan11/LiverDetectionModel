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

  const inputCls = "w-full pl-10 pr-4 py-2.5 border border-[#1E2130] rounded-xl text-sm bg-[#0A0B14] text-slate-200 placeholder:text-slate-600 focus:bg-[#0D0E1A] focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/25 focus:border-[#00C2FF]/50 transition-all"

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#0A0B14] relative overflow-hidden flex-col justify-between p-12 border-r border-[#1E2130]">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-[#818CF8]/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-[#00C2FF]/4 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#00C2FF]/15 border border-[#00C2FF]/25 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#00C2FF]" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-white font-bold text-lg tracking-tight">MediScan</span>
            <span className="text-[#00C2FF] font-bold text-lg"> AI</span>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-[#818CF8]/10 border border-[#818CF8]/20 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-[#818CF8] rounded-full" />
            <span className="text-[#818CF8] text-xs font-semibold tracking-wide">Join the Platform</span>
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
              { icon: Heart,    color: 'text-[#818CF8]', bg: 'bg-[#818CF8]/15 border-[#818CF8]/25',    text: 'Full volumetric NIfTI analysis with Grad-CAM' },
              { icon: Wind,     color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/15 border-[#2DD4BF]/25',     text: 'Lung cancer screening with high-precision scoring' },
              { icon: BarChart2, color: 'text-[#00C2FF]', bg: 'bg-[#00C2FF]/15 border-[#00C2FF]/25', text: 'Track personal precision, recall and F1 in real time' },
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
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#0A0B14]">
        <div className="w-full max-w-[400px]">

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
            <h1 className="text-2xl font-bold text-white mb-1.5">Create your account</h1>
            <p className="text-slate-500 text-sm">Fill in the details below to get started</p>
          </div>

          <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-xl animate-fade-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" required value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Dr. Mahnoor Khan" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['doctor', 'radiologist'] as const).map(r => (
                    <button key={r} type="button" onClick={() => set('role', r)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                        form.role === r
                          ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#00C2FF]'
                          : 'border-[#1E2130] text-slate-500 hover:border-[#282B40] bg-[#0A0B14]'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="doctor@hospital.com" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="password" required value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 characters" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="password" required value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="••••••••" className={inputCls} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#00C2FF] hover:bg-[#22D3EE] active:bg-[#06B6D4] disabled:bg-[#1E2130] disabled:text-slate-600 disabled:cursor-not-allowed text-[#08090F] font-bold py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,194,255,0.2)] disabled:shadow-none mt-1">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1E2130]" /></div>
              <div className="relative flex justify-center"><span className="bg-[#0F1018] px-3 text-xs text-slate-600">or</span></div>
            </div>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00C2FF] font-semibold hover:text-[#22D3EE] transition-colors">Sign in</Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
