'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ScanLine, Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck } from 'lucide-react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { getScanHistory } from '@/lib/firestore'
import type { ScanRecord } from '@/lib/types'

type FilterType = 'all' | 'tumor' | 'non-tumor' | 'not-liver'

const filters: { key: FilterType; label: string; active: string; dot: string }[] = [
  { key: 'all',       label: 'All',      active: 'bg-blue-100 text-blue-700 border-blue-200',    dot: '' },
  { key: 'tumor',     label: 'Tumor',    active: 'bg-rose-100 text-rose-700 border-rose-200',     dot: 'bg-rose-500' },
  { key: 'non-tumor', label: 'Healthy',  active: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'not-liver', label: 'Not Liver', active: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
]

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
    .filter(s => filter === 'all' || s.result.result_class === filter)
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
        <div className="flex gap-2">
          {filters.map(({ key, label, active, dot }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                filter === key ? active : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
              {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
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
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Result</div>
              <div className="col-span-1">Conf.</div>
              <div className="col-span-1 text-right">Eval</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map(scan => (
                <div key={scan.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">

                  <div className="col-span-4 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{scan.filename}</p>
                  </div>

                  <div className="col-span-2 text-xs text-slate-500">
                    {scan.timestamp.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </div>

                  <div className="col-span-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {scan.fileType === 'nifti' ? 'NIfTI' : 'Image'}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      scan.result.result_class === 'tumor'       ? 'bg-rose-50 text-rose-600'
                      : scan.result.result_class === 'not-liver' ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {scan.result.result_class === 'tumor'       ? <AlertTriangle className="w-3 h-3" />
                      : scan.result.result_class === 'not-liver'  ? <XCircle className="w-3 h-3" />
                      : <CheckCircle2 className="w-3 h-3" />}
                      {scan.result.result_class === 'tumor'       ? 'Tumor'
                      : scan.result.result_class === 'not-liver'  ? 'Not Liver'
                      : 'Healthy'}
                    </span>
                  </div>

                  <div className="col-span-1 text-sm font-medium text-slate-700 tabular-nums">
                    {scan.result.result_class === 'not-liver' ? '—' : `${scan.result.tumor_probability.toFixed(1)}%`}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    {scan.evaluation
                      ? <ClipboardCheck className="w-4 h-4 text-emerald-500" title="Evaluated" />
                      : <span className="text-xs text-slate-300">—</span>}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
