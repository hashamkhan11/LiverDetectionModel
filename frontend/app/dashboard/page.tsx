'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ScanLine, BarChart2, History, TrendingUp, CheckCircle2,
  AlertTriangle, ClipboardList, Loader2, ArrowRight,
} from 'lucide-react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getScanHistory } from '@/lib/firestore'
import type { ScanRecord } from '@/lib/types'

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; accent: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useRequireAuth()
  const [scans, setScans]     = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getScanHistory(user.uid)
      .then(setScans)
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    )
  }

  const tumors    = scans.filter(s => s.result.result_class === 'tumor').length
  const healthy   = scans.filter(s => s.result.result_class === 'non-tumor').length
  const evaluated = scans.filter(s => s.evaluation).length
  const recent    = scans.slice(0, 5)

  const role = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Doctor'

  const displayName = profile?.name
    ? profile.name.split(' ')[0]
    : user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">

      {/* ── Welcome header ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-7 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative">
          <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">{role}</span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            {scans.length === 0
              ? 'You have no scans yet. Upload your first CT scan to get started.'
              : `You have ${scans.length} scan${scans.length !== 1 ? 's' : ''} on record.`}
          </p>
          <Link href="/scan"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl mt-5 transition-colors shadow-sm">
            <ScanLine className="w-4 h-4" />
            New Scan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Scans"     value={scans.length}  icon={ClipboardList} accent="bg-blue-600" />
        <StatCard label="Tumors Detected" value={tumors}         icon={AlertTriangle} accent="bg-rose-500" />
        <StatCard label="Healthy Results" value={healthy}        icon={CheckCircle2}  accent="bg-emerald-600" />
        <StatCard label="Evaluated"       value={evaluated}      icon={TrendingUp}    accent="bg-violet-600"
          sub={scans.length > 0 ? `${Math.round((evaluated / scans.length) * 100)}% of scans` : undefined} />
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link href="/history"
          className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all group">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-800 text-sm">Scan History</div>
            <div className="text-xs text-slate-400 mt-0.5">Browse all past scan results and evaluations</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link href="/metrics"
          className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all group">
          <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
            <BarChart2 className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-800 text-sm">Metrics</div>
            <div className="text-xs text-slate-400 mt-0.5">View accuracy, precision, recall, F1 and confusion matrix</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ── Recent scans ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm">Recent Scans</h2>
          {recent.length > 0 && (
            <Link href="/history" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-14 text-slate-400 text-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ScanLine className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">No scans yet</p>
            <p className="text-xs mt-1">
              <Link href="/scan" className="text-blue-600 hover:underline">Upload your first CT scan</Link>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(scan => (
              <div key={scan.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  scan.result.result_class === 'tumor'       ? 'bg-rose-500'
                  : scan.result.result_class === 'not-liver' ? 'bg-amber-400'
                  : 'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{scan.filename}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {scan.timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {scan.fileType === 'nifti' ? 'NIfTI Volume' : 'CT Image'}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  scan.result.result_class === 'tumor'       ? 'bg-rose-50 text-rose-600'
                  : scan.result.result_class === 'not-liver' ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {scan.result.result_class === 'tumor'       ? 'Tumor'
                  : scan.result.result_class === 'not-liver'  ? 'Not Liver'
                  : 'Healthy'}
                </span>
                <span className="text-sm text-slate-500 font-medium w-14 text-right tabular-nums">
                  {scan.result.result_class === 'not-liver' ? '—' : `${scan.result.tumor_probability.toFixed(1)}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
