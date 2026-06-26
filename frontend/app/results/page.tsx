'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle, CheckCircle2, ScanLine, BarChart2,
  Loader2, ChevronRight, Info, Eye, EyeOff, XCircle,
} from 'lucide-react'
import { submitEvaluation } from '@/lib/api'
import { saveEvaluation } from '@/lib/firestore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import type { PredictionResult } from '@/lib/types'

export default function ResultsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useRequireAuth()
  const [result, setResult]           = useState<PredictionResult | null>(null)
  const [filename, setFilename]       = useState('')
  const [scanId, setScanId]           = useState('')
  const [actualClass, setActualClass] = useState<'tumor' | 'non-tumor' | null>(null)
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('liver_result')
    const fn  = sessionStorage.getItem('liver_filename') ?? ''
    const sid = sessionStorage.getItem('liver_scan_id')  ?? ''
    if (!raw) { router.replace('/scan'); return }
    try {
      setResult(JSON.parse(raw))
      setFilename(fn)
      setScanId(sid)
    } catch {
      router.replace('/scan')
    }
  }, [router])

  const isTumor    = result?.result_class === 'tumor'
  const isNotLiver = result?.result_class === 'not-liver'
  const confidence = result?.tumor_probability ?? 0
  const hasHeatmap = !!(result?.heatmap_image && result?.original_image)

  const handleSubmit = async () => {
    if (!result || !actualClass) return
    setSubmitting(true)
    try {
      await Promise.all([
        submitEvaluation(filename, result.result_class, actualClass, confidence, result.slices_analyzed, result.affected_ratio),
        scanId ? saveEvaluation(scanId, actualClass, result.result_class) : Promise.resolve(),
      ])
      setSubmitted(true)
    } catch {
      // evaluation is best-effort
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    )
  }

  // ── NOT A LIVER SCAN ────────────────────────────────────────────────────────
  if (isNotLiver) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-12 animate-fade-up">

        <div className="rounded-2xl border-2 p-8 text-center mb-6 bg-amber-50 border-amber-200">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-amber-100">
            <XCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-1 text-amber-700">Not a Liver Scan</h1>
          {filename && <p className="text-sm text-slate-400 mb-4">{filename}</p>}
          <p className="text-sm text-amber-600">
            The uploaded scan was not recognised as a liver CT scan and was not analysed for tumors.
          </p>
        </div>

        {result.liver_probability !== undefined && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Stage 1 — Liver Detection Result</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{result.liver_probability}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Liver Probability</div>
              </div>
              {result.liver_slices_checked !== undefined && (
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-700">{result.liver_slices_checked}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Slices Checked</div>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Threshold: more than 50% of slices must be classified as liver to proceed to tumor analysis.</span>
            </div>
          </div>
        )}

        {result.decision_reason && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-sm text-slate-600 shadow-sm">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            {result.decision_reason}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/scan"
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium py-3 rounded-xl transition-colors text-sm">
            <ScanLine className="w-4 h-4" />
            Try Another Scan
          </Link>
          <Link href="/metrics"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-xl transition-colors text-sm">
            <BarChart2 className="w-4 h-4" />
            View Metrics
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    )
  }

  // ── TUMOR / NON-TUMOR RESULT ─────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 animate-fade-up">

      {/* Main result card */}
      <div className={`rounded-2xl border-2 p-8 text-center mb-6 ${isTumor ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isTumor ? 'bg-red-100' : 'bg-emerald-100'}`}>
          {isTumor
            ? <AlertTriangle className="w-8 h-8 text-red-600" />
            : <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
        </div>
        <h1 className={`text-2xl font-bold mb-1 ${isTumor ? 'text-red-700' : 'text-emerald-700'}`}>
          {result.prediction}
        </h1>
        {filename && <p className="text-sm text-slate-400 mb-6">{filename}</p>}

        <div className="text-left">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Confidence Score</span>
            <span className="font-semibold">{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isTumor ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Volume stats */}
      {result.slices_analyzed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Slices Analyzed', value: result.slices_analyzed },
            { label: 'Affected Slices', value: result.affected_slices ?? '—' },
            { label: 'Affected Ratio',  value: result.affected_ratio  ?? '—' },
            { label: 'Max Probability', value: result.max_probability != null ? `${(result.max_probability * 100).toFixed(1)}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-lg font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Decision reason */}
      {result.decision_reason && (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-sm text-slate-600 shadow-sm">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          {result.decision_reason}
        </div>
      )}

      {/* ── HEATMAP SECTION (tumor only) ─────────────────────────────────── */}
      {isTumor ? (
        hasHeatmap ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Grad-CAM Activation Heatmap
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  Tumor Detected
                </span>
                <button
                  onClick={() => setShowHeatmap(v => !v)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  {showHeatmap
                    ? <><EyeOff className="w-3 h-3" /> Hide</>
                    : <><Eye className="w-3 h-3" /> Show</>}
                </button>
              </div>
            </div>

            {showHeatmap && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up">
                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                      <p className="text-xs font-medium text-slate-600">Original CT Slice</p>
                    </div>
                    <div className="p-1 bg-white">
                      <img
                        src={`data:image/png;base64,${result.original_image}`}
                        alt="Original CT slice"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <p className="text-xs font-medium text-slate-600">Activation Heatmap</p>
                      <span className="text-[10px] text-slate-400">Grad-CAM</span>
                    </div>
                    <div className="p-1 bg-white">
                      <img
                        src={`data:image/png;base64,${result.heatmap_image}`}
                        alt="Grad-CAM heatmap"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded" />
                    <span>Low → High activation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-red-500 rounded-full" />
                    <span>Potential tumor region</span>
                  </div>
                </div>
              </>
            )}

            <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Red/yellow areas indicate regions that most influenced the tumor prediction.
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-sm text-yellow-700">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            {result.heatmap_error ?? 'Heatmap data not available for this scan.'}
          </div>
        )
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-emerald-700 text-sm">Healthy Result</h3>
              <p className="text-xs text-emerald-600 mt-0.5">
                No tumor detected. Heatmap visualisation is not required for healthy patients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK SECTION ─────────────────────────────────────────────── */}
      {!submitted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-1 text-sm">Was this prediction correct?</h2>
          <p className="text-xs text-slate-400 mb-4">Your feedback improves evaluation metrics.</p>
          <div className="flex gap-3 mb-5">
            {(['tumor', 'non-tumor'] as const).map(cls => (
              <button key={cls} onClick={() => setActualClass(cls)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  actualClass === cls
                    ? cls === 'tumor'
                      ? 'bg-red-50 border-red-400 text-red-700'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                {cls === 'tumor' ? 'Yes, it is a Tumor' : 'No, it is Healthy'}
              </button>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={!actualClass || submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Feedback
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-center text-emerald-700 text-sm font-medium animate-fade-up">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
          Feedback recorded — metrics updated.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/scan"
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium py-3 rounded-xl transition-colors text-sm">
          <ScanLine className="w-4 h-4" />
          New Scan
        </Link>
        <Link href="/metrics"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-xl transition-colors text-sm">
          <BarChart2 className="w-4 h-4" />
          View Metrics
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  )
}
