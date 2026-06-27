'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Trash2, Loader2, BarChart2, AlertCircle } from 'lucide-react'
import { getMetrics, resetEvaluation } from '@/lib/api'
import { getPersonalMetrics } from '@/lib/firestore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import type { MetricsData } from '@/lib/types'

const metricConfig = [
  { key: 'accuracy',    label: 'Accuracy',    color: 'text-blue-600',    bar: 'bg-blue-600',    bg: 'bg-blue-50' },
  { key: 'precision',   label: 'Precision',   color: 'text-violet-600',  bar: 'bg-violet-600',  bg: 'bg-violet-50' },
  { key: 'recall',      label: 'Recall',      color: 'text-emerald-600', bar: 'bg-emerald-600', bg: 'bg-emerald-50' },
  { key: 'specificity', label: 'Specificity', color: 'text-amber-600',   bar: 'bg-amber-500',   bg: 'bg-amber-50' },
  { key: 'f1_score',    label: 'F1 Score',    color: 'text-rose-600',    bar: 'bg-rose-500',    bg: 'bg-rose-50' },
]

function MetricCard({ label, value, color, bar, bg }: { label: string; value: number; color: string; bar: string; bg: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${bg} mb-4`}>
        <BarChart2 className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-3xl font-bold mb-0.5 ${color}`}>
        {value.toFixed(1)}<span className="text-base font-semibold">%</span>
      </div>
      <div className="text-sm text-slate-500 mb-3">{label}</div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`}
          style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  )
}

export default function MetricsPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [apiMetrics,      setApiMetrics]      = useState<MetricsData | null>(null)
  const [personalMetrics, setPersonalMetrics] = useState<MetricsData | null>(null)
  const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [api, personal] = await Promise.all([
        getMetrics().catch(() => null),
        getPersonalMetrics(user.uid),
      ])
      if (api?.success) setApiMetrics(api.metrics)
      setPersonalMetrics(personal)
    } catch {
      setError('Failed to load metrics.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleReset = async () => {
    if (!confirm('Reset global API evaluation data? This cannot be undone.')) return
    setResetting(true)
    await resetEvaluation()
    await fetchAll()
    setResetting(false)
  }

  const metrics = activeTab === 'personal' ? personalMetrics : apiMetrics

  if (authLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Evaluation</p>
          <h1 className="text-2xl font-bold text-slate-900">Performance Metrics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Based on submitted ground truth evaluations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeTab === 'global' && (
            <button onClick={handleReset} disabled={resetting}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 hover:bg-rose-100 shadow-sm transition-colors">
              {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {(['personal', 'global'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab === 'personal' ? 'My Metrics' : 'Global (API)'}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-6">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : !metrics || metrics.total_samples === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">No evaluations yet</p>
          <p className="text-slate-400 text-xs">
            Run a scan and submit ground truth labels to populate metrics.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Based on <strong className="mx-1">{metrics.total_samples}</strong> evaluated sample{metrics.total_samples !== 1 ? 's' : ''}
            {activeTab === 'personal' && ' from your history'}
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {metricConfig.map(({ key, label, color, bar, bg }) => (
              <MetricCard key={key} label={label}
                value={metrics[key as keyof MetricsData] as number}
                color={color} bar={bar} bg={bg} />
            ))}
          </div>

          {/* Confusion matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-5">Confusion Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-200 p-3 bg-slate-50 text-slate-500 font-medium text-xs rounded-tl-lg" />
                    <th className="border border-slate-200 p-3 bg-slate-50 text-slate-700 font-semibold text-xs">Predicted Tumor</th>
                    <th className="border border-slate-200 p-3 bg-slate-50 text-slate-700 font-semibold text-xs">Predicted Healthy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 p-3 bg-slate-50 text-slate-700 font-semibold text-xs">Actual Tumor</td>
                    <td className="border border-slate-200 p-5 text-center bg-emerald-50 hover:bg-emerald-100 transition-colors">
                      <div className="text-3xl font-bold text-emerald-700">{metrics.true_positives}</div>
                      <div className="text-xs text-emerald-500 font-semibold mt-0.5">TP</div>
                    </td>
                    <td className="border border-slate-200 p-5 text-center bg-rose-50 hover:bg-rose-100 transition-colors">
                      <div className="text-3xl font-bold text-rose-600">{metrics.false_negatives}</div>
                      <div className="text-xs text-rose-400 font-semibold mt-0.5">FN</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 bg-slate-50 text-slate-700 font-semibold text-xs">Actual Healthy</td>
                    <td className="border border-slate-200 p-5 text-center bg-rose-50 hover:bg-rose-100 transition-colors">
                      <div className="text-3xl font-bold text-rose-600">{metrics.false_positives}</div>
                      <div className="text-xs text-rose-400 font-semibold mt-0.5">FP</div>
                    </td>
                    <td className="border border-slate-200 p-5 text-center bg-emerald-50 hover:bg-emerald-100 transition-colors">
                      <div className="text-3xl font-bold text-emerald-700">{metrics.true_negatives}</div>
                      <div className="text-xs text-emerald-500 font-semibold mt-0.5">TN</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'True Positive',  sub: 'Correct tumor',   count: metrics.true_positives,  bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
                { label: 'True Negative',  sub: 'Correct healthy', count: metrics.true_negatives,  bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
                { label: 'False Positive', sub: 'Healthy → Tumor', count: metrics.false_positives, bg: 'bg-rose-50 border-rose-100',       text: 'text-rose-600' },
                { label: 'False Negative', sub: 'Tumor → Healthy', count: metrics.false_negatives, bg: 'bg-rose-50 border-rose-100',       text: 'text-rose-600' },
              ].map(({ label, sub, count, bg, text }) => (
                <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
                  <div className={`text-2xl font-bold ${text}`}>{count}</div>
                  <div className={`text-xs font-semibold ${text} mt-0.5`}>{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
