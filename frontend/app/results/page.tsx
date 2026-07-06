'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle, CheckCircle2, ScanLine, BarChart2,
  Loader2, ChevronRight, Info, Eye, EyeOff, XCircle, Wind, Heart,
} from 'lucide-react'
import { submitEvaluation } from '@/lib/api'
import { saveEvaluation } from '@/lib/firestore'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import type { PredictionResult } from '@/lib/types'

export default function ResultsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useRequireAuth()
  const [scanType, setScanType]   = useState<'liver' | 'lung'>('liver')
  const [result, setResult]       = useState<PredictionResult | null>(null)
  const [filename, setFilename]   = useState('')
  const [scanId, setScanId]       = useState('')
  const [actualClass, setActualClass] = useState<'tumor' | 'non-tumor' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(true)

  useEffect(() => {
    const st = (sessionStorage.getItem('scan_type') as 'liver' | 'lung') ?? 'liver'
    setScanType(st)
    const raw = sessionStorage.getItem(st === 'liver' ? 'liver_result' : 'lung_result')
    const fn  = sessionStorage.getItem(st === 'liver' ? 'liver_filename' : 'lung_filename') ?? ''
    const sid = sessionStorage.getItem('liver_scan_id') ?? ''
    if (!raw) { router.replace('/scan'); return }
    try {
      setResult(JSON.parse(raw))
      setFilename(fn)
      setScanId(sid)
    } catch {
      router.replace('/scan')
    }
  }, [router])

  const handleLiverSubmit = async () => {
    if (!result || !actualClass) return
    setSubmitting(true)
    try {
      const conf = result.tumor_probability ?? 0
      await Promise.all([
        submitEvaluation(filename, result.result_class, actualClass, conf, result.slices_analyzed, result.affected_ratio),
        scanId ? saveEvaluation(scanId, actualClass, result.result_class as 'tumor' | 'non-tumor') : Promise.resolve(),
      ])
      setSubmitted(true)
    } catch { /* best-effort */ } finally {
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

  // ── LUNG RESULTS ─────────────────────────────────────────────────────────────
  if (scanType === 'lung') {
    const isCancer  = result.result_class === 'cancer'
    const isNotLung = result.result_class === 'not-lung'
    const cancerPct = result.cancer_probability ?? 0
    const lungConf  = result.lung_confidence ?? 0

    if (isNotLung) {
      return (
        <div className="max-w-2xl mx-auto w-full px-4 py-12 animate-fade-up">
          <div className="rounded-2xl border-2 p-8 text-center mb-6 bg-amber-50 border-amber-200">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Wind className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-amber-700 mb-1">Not a Lung Scan</h1>
            {filename && <p className="text-xs text-slate-400 mb-4 font-mono">{filename}</p>}
            <p className="text-sm text-amber-600 max-w-sm mx-auto leading-relaxed">
              The image was not recognised as a lung CT scan or X-ray and was not analysed for cancer.
            </p>
          </div>
          {result.decision_reason && (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-sm text-slate-600 shadow-sm">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              {result.decision_reason}
            </div>
          )}
          <div className="flex gap-3">
            <Link href="/scan?mode=lung"
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
              <ScanLine className="w-4 h-4" /> Try Another Scan
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 animate-fade-up">

        {/* Lung scan type badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
            <Wind className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-widest">Lung Cancer Detection</span>
        </div>

        {/* Main result card */}
        <div className={`rounded-2xl border-2 p-8 text-center mb-6 ${isCancer ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isCancer ? 'bg-rose-100' : 'bg-emerald-100'}`}>
            {isCancer
              ? <AlertTriangle className="w-8 h-8 text-rose-600" />
              : <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          </div>
          <h1 className={`text-2xl font-bold mb-1 ${isCancer ? 'text-rose-700' : 'text-emerald-700'}`}>
            {result.prediction}
          </h1>
          {filename && <p className="text-xs text-slate-400 mb-6 font-mono">{filename}</p>}

          <div className="text-left max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Cancer Probability</span>
              <span className="font-bold">{cancerPct.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isCancer ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${cancerPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xl font-bold text-slate-800">{cancerPct.toFixed(1)}%</div>
            <div className="text-xs text-slate-400 mt-0.5">Cancer Score</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xl font-bold text-slate-800">{(100 - cancerPct).toFixed(1)}%</div>
            <div className="text-xs text-slate-400 mt-0.5">Clear Score</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xl font-bold text-slate-800">{lungConf.toFixed(1)}%</div>
            <div className="text-xs text-slate-400 mt-0.5">Lung Confidence</div>
          </div>
        </div>

        {/* Decision reason */}
        {result.decision_reason && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-sm text-slate-600 shadow-sm">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            {result.decision_reason}
          </div>
        )}

        {/* Original image */}
        {result.original_image && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              Analysed Image
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <img src={`data:image/png;base64,${result.original_image}`} alt="Analysed lung scan" className="w-full h-auto" />
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Threshold: 0.99 — only raw scores ≥ 0.99 are classified as Cancer Detected.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/scan?mode=lung"
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
            <ScanLine className="w-4 h-4" /> New Lung Scan
          </Link>
          <Link href="/scan?mode=liver"
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
            <Heart className="w-4 h-4" /> Liver Scan
          </Link>
        </div>

      </div>
    )
  }

  // ── LIVER RESULTS ─────────────────────────────────────────────────────────────
  const isTumor    = result.result_class === 'tumor'
  const isNotLiver = result.result_class === 'not-liver'
  const confidence = result.tumor_probability ?? 0
  const hasHeatmap = !!(result.heatmap_image && result.original_image)

  if (isNotLiver) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-12 animate-fade-up">

        {/* Liver badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-widest">Liver Tumor Detection</span>
        </div>

        <div className="rounded-2xl border-2 p-8 text-center mb-6 bg-amber-50 border-amber-200">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-amber-700 mb-1">Not a Liver Scan</h1>
          {filename && <p className="text-xs text-slate-400 mb-4 font-mono">{filename}</p>}
          <p className="text-sm text-amber-600 max-w-sm mx-auto leading-relaxed">
            The scan was not recognised as a liver CT and was not analysed for tumors.
          </p>
        </div>

        {result.liver_probability !== undefined && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Stage 1 — Liver Detection</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">{result.liver_probability}%</div>
                <div className="text-xs text-slate-500 mt-1">Liver Probability</div>
              </div>
              {result.liver_slices_checked !== undefined && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-slate-700">{result.liver_slices_checked}</div>
                  <div className="text-xs text-slate-500 mt-1">Slices Checked</div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
              Threshold: more than 50% of slices must be classified as liver to proceed to tumor analysis.
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
          <Link href="/scan?mode=liver"
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
            <ScanLine className="w-4 h-4" /> Try Another Scan
          </Link>
          <Link href="/metrics"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors text-sm">
            <BarChart2 className="w-4 h-4" /> View Metrics <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12 animate-fade-up">

      {/* Liver badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
          <Heart className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-widest">Liver Tumor Detection</span>
      </div>

      {/* ── Main result card ─────────────────────────────────────── */}
      <div className={`rounded-2xl border-2 p-8 text-center mb-6 ${isTumor ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isTumor ? 'bg-rose-100' : 'bg-emerald-100'}`}>
          {isTumor
            ? <AlertTriangle className="w-8 h-8 text-rose-600" />
            : <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
        </div>
        <h1 className={`text-2xl font-bold mb-1 ${isTumor ? 'text-rose-700' : 'text-emerald-700'}`}>
          {result.prediction}
        </h1>
        {filename && <p className="text-xs text-slate-400 mb-6 font-mono">{filename}</p>}

        <div className="text-left max-w-sm mx-auto">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Confidence Score</span>
            <span className="font-bold">{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isTumor ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Volume stats ─────────────────────────────────────────── */}
      {result.slices_analyzed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Slices Analyzed', value: result.slices_analyzed },
            { label: 'Affected Slices', value: result.affected_slices ?? '—' },
            { label: 'Affected Ratio',  value: result.affected_ratio  ?? '—' },
            { label: 'Max Probability', value: result.max_probability != null ? `${(result.max_probability * 100).toFixed(1)}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {result.decision_reason && (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-sm text-slate-600 shadow-sm">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          {result.decision_reason}
        </div>
      )}

      {/* ── HEATMAP SECTION ──────────────────────────────────────── */}
      {isTumor ? (
        hasHeatmap ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Grad-CAM Activation Heatmap
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
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
              <div className="animate-fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Original CT Slice', tag: null,       src: result.original_image, alt: 'Original CT slice' },
                    { label: 'Activation Heatmap', tag: 'Grad-CAM', src: result.heatmap_image,  alt: 'Grad-CAM heatmap' },
                  ].map(({ label, tag, src, alt }) => (
                    <div key={label} className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-600">{label}</p>
                        {tag && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{tag}</span>}
                      </div>
                      <div className="p-2 bg-white">
                        <img src={`data:image/png;base64,${src}`} alt={alt} className="w-full h-auto rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-12 h-3 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded-full" />
                    Low → High activation
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-rose-500 rounded-full" />
                    Potential tumor region
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Red and yellow areas indicate regions that most influenced the tumor prediction.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3 text-sm text-amber-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            {result.heatmap_error ?? 'Heatmap data not available for this scan.'}
          </div>
        )
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-700 text-sm">No Tumor Detected</h3>
            <p className="text-xs text-emerald-600 mt-0.5">
              Heatmap visualisation is not generated for healthy results.
            </p>
          </div>
        </div>
      )}

      {/* ── Feedback section ─────────────────────────────────────── */}
      {!submitted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-1 text-sm">Was this prediction correct?</h2>
          <p className="text-xs text-slate-400 mb-4">Your feedback is used to calculate evaluation metrics.</p>
          <div className="flex gap-3 mb-5">
            {(['tumor', 'non-tumor'] as const).map(cls => (
              <button key={cls} onClick={() => setActualClass(cls)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  actualClass === cls
                    ? cls === 'tumor'
                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                }`}>
                {cls === 'tumor' ? 'Yes, it is a Tumor' : 'No, it is Healthy'}
              </button>
            ))}
          </div>
          <button
            onClick={handleLiverSubmit}
            disabled={!actualClass || submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Feedback
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 text-center animate-fade-up">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
          <p className="text-emerald-700 text-sm font-semibold">Feedback recorded</p>
          <p className="text-emerald-600 text-xs mt-0.5">Evaluation metrics have been updated.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/scan?mode=liver"
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm">
          <ScanLine className="w-4 h-4" /> New Scan
        </Link>
        <Link href="/metrics"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors text-sm">
          <BarChart2 className="w-4 h-4" /> View Metrics <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  )
}
