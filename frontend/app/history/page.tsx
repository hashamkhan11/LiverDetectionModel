'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ScanLine, Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck } from 'lucide-react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getScanHistory } from '@/lib/firestore'
import type { ScanRecord } from '@/lib/types'

type FilterType = 'all' | 'liver' | 'lung' | 'abnormal' | 'clear'

const filters: { key: FilterType; label: string; active: string }[] = [
  { key: 'all',      label: 'All',      active: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'liver',    label: 'Liver',    active: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { key: 'lung',     label: 'Lung',     active: 'bg-teal-100 text-teal-700 border-teal-200' },
  { key: 'abnormal', label: 'Abnormal', active: 'bg-rose-100 text-rose-700 border-rose-200' },
  { key: 'clear',    label: 'Clear',    active: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
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
  if (rc === 'tumor')      return { label: 'Tumor',     Icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600' }
  if (rc === 'cancer')     return { label: 'Cancer',    Icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600' }
  if (rc === 'non-tumor')  return { label: 'Healthy',   Icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-700' }
  if (rc === 'non-cancer') return { label: 'Clear',     Icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-700' }
  return                          { label: 'Not Found', Icon: XCircle,       cls: 'bg-amber-50 text-amber-600' }
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

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">History</p>
          <h1 className="text-2xl font-bold text-slate-900">Scan History</h1>
          <p className="text-slate-500 text-sm mt-0.5">{scans.length} total scan{scans.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/scan"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <ScanLine className="w-4 h-4" />
          New Scan
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search by filename…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, active }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                filter === key ? active : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ScanLine className="w-6 h-6 text-slate-300" />
            </div>
            {scans.length === 0 ? (
              <>
                <p className="font-medium text-slate-500">No scans yet</p>
                <p className="text-xs mt-1">
                  <Link href="/scan" className="text-blue-600 hover:underline">Upload your first CT scan</Link>
                </p>
              </>
            ) : (
              <p>No scans match your current filter.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              <div className="col-span-4">File</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Organ</div>
              <div className="col-span-2">Result</div>
              <div className="col-span-1">Conf.</div>
              <div className="col-span-1 text-right">Eval</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map(scan => {
                const badge = resultBadge(scan)
                const isLung = scan.scanType === 'lung'
                const conf = isLung ? scan.result.cancer_probability : scan.result.tumor_probability
                return (
                  <div key={scan.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">

                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{scan.filename}</p>
                    </div>

                    <div className="col-span-2 text-xs text-slate-500">
                      {scan.timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>

                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                        isLung ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {isLung ? 'Lung' : scan.fileType === 'nifti' ? 'NIfTI' : 'Liver'}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                        <badge.Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>

                    <div className="col-span-1 text-sm font-medium text-slate-700 tabular-nums">
                      {conf != null ? `${conf.toFixed(1)}%` : '—'}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      {scan.evaluation
                        ? <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                        : <span className="text-xs text-slate-300">—</span>}
                    </div>

                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
