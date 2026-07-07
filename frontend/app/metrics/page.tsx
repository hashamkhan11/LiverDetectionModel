'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Trash2, Loader2, BarChart2, AlertCircle, TrendingUp } from 'lucide-react'
import { getMetrics, resetEvaluation } from '@/lib/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'

interface MetricsData {
  accuracy:   number; precision: number; recall: number; f1: number
  tp: number; tn: number; fp: number; fn: number
  total_evaluated: number; total_correct: number
}

function MetricCard({ label, value, color, barColor, icon: Icon }: {
  label: string; value: number; color: string; barColor: string; icon: React.ElementType
}) {
  const pct = Math.round(value * 100)
  return (
    <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-6 hover:border-[#282B40] transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}/10`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <span className="text-slate-400 text-sm font-medium">{label}</span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${color}`}>{pct}%</span>
      </div>
      <div className="w-full bg-[#1E2130] rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MetricsPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [metrics, setMetrics]   = useState<MetricsData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [tab, setTab]           = useState<'liver' | 'lung'>('liver')

  const fetchMetrics = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getMetrics()
      setMetrics(data)
    } catch {
      setError('Could not load metrics. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (user) fetchMetrics() }, [user, fetchMetrics])

  const handleReset = async () => {
    if (!confirm('Reset all evaluations? This cannot be undone.')) return
    setResetting(true)
    try { await resetEvaluation(); await fetchMetrics() }
    finally { setResetting(false) }
  }

  if (authLoading || loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl px-6 py-4 text-sm max-w-md">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
      </div>
    </div>
  )

  if (!metrics || metrics.total_evaluated === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#0F1018] border border-[#1E2130] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="font-semibold text-slate-300 text-base mb-1">No evaluations yet</h2>
        <p className="text-slate-600 text-sm">Submit doctor evaluations from the Results page to see metrics here.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-130px)]">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[#00C2FF] text-[11px] font-bold uppercase tracking-widest">Analytics</span>
            <h1 className="text-2xl font-bold text-white mt-1">Performance Metrics</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Model evaluation based on doctor-submitted ground truth
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={fetchMetrics} disabled={loading}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 bg-[#0F1018] border border-[#1E2130] px-3 py-2 rounded-xl transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={handleReset} disabled={resetting}
              className="flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-xl transition-colors">
              {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Reset
            </button>
          </div>
        </div>

        {/* Sample count pill */}
        <div className="flex items-center gap-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-xl px-4 py-2.5 w-fit">
          <TrendingUp className="w-4 h-4 text-[#00C2FF]" />
          <span className="text-[#00C2FF] text-sm font-semibold">
            {metrics.total_evaluated} evaluation{metrics.total_evaluated !== 1 ? 's' : ''} submitted
          </span>
          <span className="text-slate-500 text-sm">·</span>
          <span className="text-slate-400 text-sm">{metrics.total_correct} correct</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0A0B14] border border-[#1E2130] rounded-2xl p-1 w-fit">
          {(['liver', 'lung'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-[#0F1018] border border-[#282B40] text-slate-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-400'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Accuracy"  value={metrics.accuracy}  icon={BarChart2}  color="text-[#00C2FF]" barColor="bg-[#00C2FF]" />
          <MetricCard label="Precision" value={metrics.precision} icon={TrendingUp} color="text-[#818CF8]" barColor="bg-[#818CF8]" />
          <MetricCard label="Recall"    value={metrics.recall}    icon={TrendingUp} color="text-[#34D399]" barColor="bg-[#34D399]" />
          <MetricCard label="F1 Score"  value={metrics.f1}        icon={BarChart2}  color="text-[#2DD4BF]" barColor="bg-[#2DD4BF]" />
        </div>

        {/* Confusion matrix */}
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E2130]">
            <h2 className="font-semibold text-slate-200 text-sm">Confusion Matrix</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {[
                { label: 'True Positive',  abbr: 'TP', value: metrics.tp, cls: 'bg-[#34D399]/10 border-[#34D399]/25 text-[#34D399]' },
                { label: 'False Positive', abbr: 'FP', value: metrics.fp, cls: 'bg-rose-500/10 border-rose-500/25 text-rose-400' },
                { label: 'False Negative', abbr: 'FN', value: metrics.fn, cls: 'bg-rose-500/10 border-rose-500/25 text-rose-400' },
                { label: 'True Negative',  abbr: 'TN', value: metrics.tn, cls: 'bg-[#34D399]/10 border-[#34D399]/25 text-[#34D399]' },
              ].map(({ label, abbr, value, cls }) => (
                <div key={abbr} className={`border rounded-xl p-4 text-center ${cls}`}>
                  <div className="text-3xl font-bold tabular-nums mb-1">{value}</div>
                  <div className="font-bold text-xs uppercase tracking-widest opacity-75">{abbr}</div>
                  <div className="text-[11px] opacity-60 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Axis labels */}
            <div className="mt-6 flex justify-center gap-8 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#34D399]/40 inline-block" />Correct Prediction
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 inline-block" />Wrong Prediction
              </span>
            </div>
          </div>
        </div>

        {/* Formula reference */}
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-6">
          <h2 className="font-semibold text-slate-200 text-sm mb-4">Metric Definitions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Accuracy',  formula: '(TP + TN) / Total' },
              { label: 'Precision', formula: 'TP / (TP + FP)' },
              { label: 'Recall',    formula: 'TP / (TP + FN)' },
              { label: 'F1 Score',  formula: '2 × (Precision × Recall) / (Precision + Recall)' },
            ].map(({ label, formula }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest w-20 shrink-0">{label}</span>
                <span className="text-xs font-mono text-slate-400">{formula}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
