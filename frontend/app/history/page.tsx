'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ScanLine, Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck, Heart, Wind } from 'lucide-react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getScanHistory } from '@/lib/firestore'
import type { ScanRecord } from '@/lib/types'

type FilterType = 'all' | 'liver' | 'lung' | 'abnormal' | 'clear'

const filters: { key: FilterType; label: string; active: string }[] = [
  { key: 'all',      label: 'All',      active: 'bg-[#00C2FF] text-[#08090F] font-bold border-[#00C2FF]' },
  { key: 'liver',    label: 'Liver',    active: 'bg-[#818CF8]/15 text-[#818CF8] border-[#818CF8]/50' },
  { key: 'lung',     label: 'Lung',     active: 'bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/40' },
  { key: 'abnormal', label: 'Abnormal', active: 'bg-rose-500/10 text-rose-400 border-rose-500/35' },
  { key: 'clear',    label: 'Clear',    active: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/35' },
]

function matchFilter(scan: ScanRecord, filter: FilterType) {
  if (filter === 'all')      return true
  if (filter === 'liver')    return scan.scanType === 'liver' || !scan.scanType
  if (filter === 'lung')     return scan.scanType === 'lung'
  if (filter === 'abnormal') return ['tumor', 'cancer'].includes(scan.result.result_class)
  if (filter === 'clear')    return ['non-tumor', 'non-cancer'].includes(scan.result.result_class)
  return true
}

function resultBadge(scan: ScanRecord) {
  const rc = scan.result.result_class
  if (rc === 'tumor')      return { label: 'Tumor',   Icon: AlertTriangle, cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' }
  if (rc === 'cancer')     return { label: 'Cancer',  Icon: AlertTriangle, cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' }
  if (rc === 'non-tumor')  return { label: 'Healthy', Icon: CheckCircle2,  cls: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25' }
  if (rc === 'non-cancer') return { label: 'Clear',   Icon: CheckCircle2,  cls: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25' }
  return                          { label: 'Rejected', Icon: XCircle,       cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25' }
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [scans, setScans]     = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<FilterType>('all')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    if (!user) return
    getScanHistory(user.uid).then(setScans).finally(() => setLoading(false))
  }, [user])

  const filtered = useMemo(() => scans
    .filter(s => matchFilter(s, filter))
    .filter(s => search === '' || s.filename.toLowerCase().includes(search.toLowerCase())),
    [scans, filter, search])

  if (authLoading || loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" />
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-130px)]">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[#00C2FF] text-[11px] font-bold uppercase tracking-widest">Records</span>
            <h1 className="text-2xl font-bold text-white mt-1">Scan History</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {scans.length} total scan{scans.length !== 1 ? 's' : ''} on record
            </p>
          </div>
          <Link href="/scan"
            className="flex items-center gap-2 bg-[#00C2FF] hover:bg-[#22D3EE] text-[#08090F] text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-[0_0_16px_rgba(0,194,255,0.2)] mt-1">
            <ScanLine className="w-4 h-4" /> New Scan
          </Link>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text" placeholder="Search by filename…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#1E2130] rounded-xl text-sm bg-[#0F1018] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/25 focus:border-[#00C2FF]/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map(({ key, label, active }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  filter === key ? active : 'bg-[#0F1018] border-[#1E2130] text-slate-500 hover:bg-[#131420] hover:border-[#282B40]'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 bg-[#0A0B14] border border-[#1E2130] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ScanLine className="w-6 h-6 text-slate-600" />
              </div>
              {scans.length === 0 ? (
                <>
                  <p className="font-medium text-slate-500 text-sm">No scans yet</p>
                  <p className="text-xs text-slate-600 mt-1.5">
                    <Link href="/scan" className="text-[#00C2FF] hover:underline">Upload your first CT scan</Link>
                  </p>
                </>
              ) : (
                <p className="text-slate-500 text-sm">No scans match the current filter.</p>
              )}
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-[#0A0B14] border-b border-[#1E2130]">
                {['File', 'Date', 'Organ', 'Result', 'Score', 'Eval'].map((h, i) => (
                  <div key={h} className={`text-[10px] font-bold text-slate-600 uppercase tracking-widest ${
                    i === 0 ? 'col-span-4' : i === 4 ? 'col-span-1' : i === 5 ? 'col-span-1 text-right' : 'col-span-2'
                  }`}>{h}</div>
                ))}
              </div>

              <div className="divide-y divide-[#1E2130]">
                {filtered.map(scan => {
                  const isLung = scan.scanType === 'lung'
                  const badge  = resultBadge(scan)
                  const conf   = isLung ? scan.result.cancer_probability : scan.result.tumor_probability
                  return (
                    <div key={scan.id}
                      className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">

                      <div className="col-span-4 min-w-0 flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isLung ? 'bg-[#2DD4BF]/15' : 'bg-[#818CF8]/15'}`}>
                          {isLung
                            ? <Wind className="w-3.5 h-3.5 text-[#2DD4BF]" />
                            : <Heart className="w-3.5 h-3.5 text-[#818CF8]" />}
                        </div>
                        <p className="text-sm font-medium text-slate-200 truncate">{scan.filename}</p>
                      </div>

                      <div className="col-span-2 text-xs text-slate-500">
                        {scan.timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </div>

                      <div className="col-span-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isLung ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' : 'bg-[#818CF8]/10 text-[#818CF8]'
                        }`}>
                          {isLung ? 'Lung' : scan.fileType === 'nifti' ? 'NIfTI' : 'Image'}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>
                          <badge.Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <div className="col-span-1 text-sm font-semibold text-slate-400 tabular-nums">
                        {conf != null ? `${conf.toFixed(1)}%` : '—'}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        {scan.evaluation
                          ? <ClipboardCheck className="w-4 h-4 text-[#34D399]" />
                          : <span className="text-xs text-slate-700 font-bold">—</span>}
                      </div>

                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
