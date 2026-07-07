'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ScanLine, BarChart2, History, TrendingUp, CheckCircle2,
  AlertTriangle, ClipboardList, Loader2, ArrowRight, Heart, Wind, ChevronRight,
} from 'lucide-react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getScanHistory } from '@/lib/firestore'
import type { ScanRecord } from '@/lib/types'

function StatCard({ label, value, sub, icon: Icon, gradient }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; gradient: string
}) {
  return (
    <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-5 hover:border-[#282B40] transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${gradient}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  )
}

function resultDot(scan: ScanRecord) {
  const rc = scan.result.result_class
  if (['tumor', 'cancer'].includes(rc)) return 'bg-rose-500'
  if (['non-tumor', 'non-cancer'].includes(rc)) return 'bg-[#34D399]'
  return 'bg-amber-400'
}

function resultChip(scan: ScanRecord) {
  const rc = scan.result.result_class
  if (rc === 'tumor')      return { label: 'Tumor',     cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' }
  if (rc === 'cancer')     return { label: 'Cancer',    cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' }
  if (rc === 'non-tumor')  return { label: 'Healthy',   cls: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25' }
  if (rc === 'non-cancer') return { label: 'Clear',     cls: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25' }
  return                          { label: 'Rejected',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25' }
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useRequireAuth()
  const [scans, setScans]     = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getScanHistory(user.uid).then(setScans).finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" />
    </div>
  )

  const liverScans = scans.filter(s => s.scanType === 'liver' || !s.scanType)
  const lungScans  = scans.filter(s => s.scanType === 'lung')
  const abnormal   = scans.filter(s => ['tumor', 'cancer'].includes(s.result.result_class)).length
  const evaluated  = scans.filter(s => s.evaluation).length
  const recent     = scans.slice(0, 6)

  const firstName = profile?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const role      = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Doctor'

  return (
    <div className="min-h-[calc(100vh-130px)]">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-7">

        {/* ── Welcome banner ─────────────────────────────────── */}
        <div className="relative bg-[#0D0F1A] border border-[#1E2130] rounded-3xl p-8 overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00C2FF]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#818CF8]/4 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#00C2FF] text-[11px] font-bold uppercase tracking-widest">{role}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-1.5">
                Welcome back, {firstName}
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                {scans.length === 0
                  ? 'No scans yet. Upload your first CT scan to get started.'
                  : `${liverScans.length} liver · ${lungScans.length} lung scan${scans.length !== 1 ? 's' : ''} on record`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/scan?mode=liver"
                className="flex items-center gap-2 bg-[#818CF8] hover:bg-[#6D6FD4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-[#818CF8]/20">
                <Heart className="w-4 h-4" /> Liver Scan
              </Link>
              <Link href="/scan?mode=lung"
                className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#08090F] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-[#2DD4BF]/15">
                <Wind className="w-4 h-4" /> Lung Scan
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Scans"       value={scans.length}      icon={ClipboardList} gradient="bg-gradient-to-br from-[#00C2FF]/80 to-[#0080FF]" />
          <StatCard label="Liver Scans"       value={liverScans.length} icon={Heart}         gradient="bg-gradient-to-br from-[#818CF8] to-[#6D28D9]" />
          <StatCard label="Lung Scans"        value={lungScans.length}  icon={Wind}          gradient="bg-gradient-to-br from-[#2DD4BF] to-[#0891B2]" />
          <StatCard label="Abnormal Findings" value={abnormal}          icon={AlertTriangle}  gradient="bg-gradient-to-br from-rose-500 to-rose-700"
            sub={scans.length > 0 ? `${Math.round((abnormal / scans.length) * 100)}% of all scans` : undefined} />
        </div>

        {/* ── Quick actions ───────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { href: '/history', icon: History,    title: 'Scan History',       sub: 'Browse all past results',              iconBg: 'bg-[#00C2FF]/10 group-hover:bg-[#00C2FF]/15',    iconCl: 'text-[#00C2FF]' },
            { href: '/metrics', icon: BarChart2,  title: 'Performance Metrics', sub: 'Accuracy, precision, recall, F1',      iconBg: 'bg-[#818CF8]/10 group-hover:bg-[#818CF8]/15', iconCl: 'text-[#818CF8]' },
            { href: '/scan',    icon: TrendingUp, title: 'Evaluations',         sub: `${evaluated} of ${liverScans.length} liver scans rated`, iconBg: 'bg-[#34D399]/10 group-hover:bg-[#34D399]/15', iconCl: 'text-[#34D399]' },
          ].map(({ href, icon: Icon, title, sub, iconBg, iconCl }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-4 bg-[#0F1018] border border-[#1E2130] rounded-2xl p-5 hover:border-[#282B40] hover:shadow-[0_0_24px_rgba(0,0,0,0.3)] transition-all">
              <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 transition-colors`}>
                <Icon className={`w-5 h-5 ${iconCl}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-200 text-sm">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#00C2FF] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* ── Recent scans ────────────────────────────────────── */}
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2130]">
            <h2 className="font-semibold text-slate-200 text-sm">Recent Scans</h2>
            {recent.length > 0 && (
              <Link href="/history"
                className="flex items-center gap-1 text-xs text-[#00C2FF] hover:text-[#22D3EE] font-medium transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-[#0A0B14] border border-[#1E2130] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ScanLine className="w-6 h-6 text-slate-600" />
              </div>
              <p className="font-medium text-slate-500 text-sm">No scans yet</p>
              <p className="text-xs text-slate-600 mt-1">
                <Link href="/scan" className="text-[#00C2FF] hover:underline">Upload your first CT scan</Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E2130]">
              {recent.map(scan => {
                const isLung = scan.scanType === 'lung'
                const chip   = resultChip(scan)
                const conf   = isLung ? scan.result.cancer_probability : scan.result.tumor_probability
                return (
                  <div key={scan.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${resultDot(scan)}`} />
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isLung ? 'bg-[#2DD4BF]/15' : 'bg-[#818CF8]/15'}`}>
                      {isLung
                        ? <Wind className="w-3.5 h-3.5 text-[#2DD4BF]" />
                        : <Heart className="w-3.5 h-3.5 text-[#818CF8]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{scan.filename}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {scan.timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{isLung ? 'Lung' : scan.fileType === 'nifti' ? 'NIfTI' : 'Image'}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${chip.cls}`}>
                      {chip.label}
                    </span>
                    <span className="text-sm text-slate-400 font-medium w-14 text-right tabular-nums flex-shrink-0">
                      {conf != null ? `${conf.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
