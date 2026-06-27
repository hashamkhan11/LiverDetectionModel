'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Mail, Lock, User, Stethoscope, Loader2, AlertCircle, Layers, Brain, BarChart2 } from 'lucide-react'
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

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"

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
            Join the<br />
            <span className="gradient-text">Research Platform</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Create your account to start analysing CT scans and contributing
            ground truth evaluations to improve the model.
          </p>

          <div className="space-y-4">
            {[
              { icon: Layers,    text: 'Upload NIfTI volumes or single CT images' },
              { icon: Brain,     text: 'Grad-CAM heatmaps for tumor localisation' },
              { icon: BarChart2, text: 'Track your personal precision and recall' },
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

        <p className="relative text-slate-600 text-xs">For academic and research use only</p>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#F8FAFF]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">LiverDetect <span className="text-blue-600">AI</span></span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">Fill in the details below to get started</p>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl animate-fade-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Dr. Mahnoor Khan" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={form.role} onChange={e => set('role', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-colors">
                    <option value="doctor">Doctor</option>
                    <option value="radiologist">Radiologist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="doctor@hospital.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 characters" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="••••••••" className={inputClass} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm mt-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
