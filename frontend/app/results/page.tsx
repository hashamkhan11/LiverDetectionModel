'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle, CheckCircle2, ScanLine, BarChart2,
  Loader2, ChevronRight, Info, Eye, EyeOff, XCircle, Wind, Heart,
  Download,
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
  const [downloading, setDownloading] = useState(false)
  const [patientName,   setPatientName]   = useState('')
  const [patientAge,    setPatientAge]    = useState('')
  const [patientGender, setPatientGender] = useState('')

  const handleDownloadPDF = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, mg = 18, cW = W - mg * 2
      let y = mg

      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, W, 36, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('MediScan AI', mg, 17)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text('AI-Assisted Medical Imaging Report', mg, 25)
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      doc.text(dateStr, W - mg, 25, { align: 'right' })
      y = 46

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.text('FILE', mg, y)
      doc.text('SCAN TYPE', mg + cW / 2, y)
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      const fn = filename.length > 38 ? filename.slice(0, 35) + '…' : filename
      doc.text(fn || 'Unknown', mg, y)
      doc.text(scanType === 'liver' ? 'Liver Tumor Detection' : 'Lung Cancer Detection', mg + cW / 2, y)
      y += 10

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.text('PATIENT', mg, y)
      doc.text('AGE', mg + cW * 0.52, y)
      doc.text('GENDER', mg + cW * 0.72, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(15, 23, 42)
      doc.text(patientName || '—', mg, y)
      doc.text(patientAge ? `${patientAge} yrs` : '—', mg + cW * 0.52, y)
      doc.text(patientGender || '—', mg + cW * 0.72, y)
      y += 8

      doc.setDrawColor(226, 232, 240)
      doc.line(mg, y, W - mg, y)
      y += 8

      const isPos = ['tumor', 'cancer'].includes(result.result_class)
      if (isPos) { doc.setFillColor(255, 241, 242); doc.setDrawColor(254, 202, 202) }
      else        { doc.setFillColor(240, 253, 244); doc.setDrawColor(167, 243, 208) }
      doc.roundedRect(mg, y, cW, 24, 3, 3, 'FD')
      const [vr, vg, vb] = isPos ? [190, 18, 60] : [5, 150, 105]
      doc.setTextColor(vr, vg, vb)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(result.prediction, W / 2, y + 11, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      const conf = scanType === 'liver'
        ? (result.tumor_probability ?? 0).toFixed(1)
        : (result.cancer_probability ?? 0).toFixed(1)
      doc.text(`Confidence: ${conf}%`, W / 2, y + 19, { align: 'center' })
      y += 30

      doc.setTextColor(71, 85, 105)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('ANALYSIS DETAILS', mg, y)
      y += 5

      const stats = scanType === 'liver'
        ? [
            ['Slices Analyzed', String(result.slices_analyzed ?? '—')],
            ['Affected Slices',  String(result.affected_slices  ?? '—')],
            ['Affected Ratio',   String(result.affected_ratio   ?? '—')],
            ['Max Probability',  result.max_probability != null ? `${(result.max_probability * 100).toFixed(1)}%` : '—'],
          ]
        : [
            ['Cancer Score',    `${(result.cancer_probability ?? 0).toFixed(1)}%`],
            ['Clear Score',     `${(result.non_cancer_probability ?? 0).toFixed(1)}%`],
            ['Lung Confidence', `${(result.lung_confidence ?? 0).toFixed(1)}%`],
          ]

      const colW = cW / stats.length
      stats.forEach(([label, value], i) => {
        const x = mg + i * colW
        doc.setFillColor(248, 250, 252)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(x, y, colW - 3, 17, 2, 2, 'FD')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(15, 23, 42)
        doc.text(value, x + (colW - 3) / 2, y + 8, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(100, 116, 139)
        doc.text(label, x + (colW - 3) / 2, y + 13.5, { align: 'center' })
      })
      y += 23

      if (result.decision_reason) {
        doc.setFillColor(239, 246, 255)
        doc.setDrawColor(191, 219, 254)
        doc.roundedRect(mg, y, cW, 13, 2, 2, 'FD')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(30, 64, 175)
        const dr = result.decision_reason.length > 95 ? result.decision_reason.slice(0, 92) + '…' : result.decision_reason
        doc.text(dr, mg + 3, y + 8)
        y += 19
      }

      if (result.original_image) {
        doc.setTextColor(71, 85, 105)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.text('IMAGING RESULTS', mg, y)
        y += 5

        const remainH = 297 - mg - 20 - y
        const imgH = Math.min(remainH, 68)

        if (result.heatmap_image) {
          const imgW = (cW - 4) / 2
          doc.setFillColor(0, 0, 0); doc.rect(mg, y, imgW, imgH, 'F')
          doc.addImage('data:image/png;base64,' + result.original_image, 'PNG', mg, y, imgW, imgH)
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
          doc.text('Original CT Image', mg, y + imgH + 4)
          const hx = mg + imgW + 4
          doc.setFillColor(0, 0, 0); doc.rect(hx, y, imgW, imgH, 'F')
          doc.addImage('data:image/png;base64,' + result.heatmap_image, 'PNG', hx, y, imgW, imgH)
          doc.text('Grad-CAM Activation Map', hx, y + imgH + 4)
        } else {
          const imgW = cW / 2
          doc.setFillColor(0, 0, 0); doc.rect(mg, y, imgW, imgH, 'F')
          doc.addImage('data:image/png;base64,' + result.original_image, 'PNG', mg, y, imgW, imgH)
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139)
          doc.text('Original CT Image', mg, y + imgH + 4)
        }
        y += imgH + 10
      }

      const fy = 297 - 12
      doc.setDrawColor(226, 232, 240)
      doc.line(mg, fy - 4, W - mg, fy - 4)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(6.5)
      doc.setTextColor(148, 163, 184)
      doc.text(
        'This report is generated by MediScan AI for research and educational purposes only. It is not a substitute for professional medical diagnosis.',
        W / 2, fy, { align: 'center' }
      )

      const label = scanType === 'liver' ? 'liver' : 'lung'
      const d = new Date().toISOString().split('T')[0]
      doc.save(`MediScan_${label}_report_${d}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    const st = (sessionStorage.getItem('scan_type') as 'liver' | 'lung') ?? 'liver'
    setScanType(st)
    const raw = sessionStorage.getItem(st === 'liver' ? 'liver_result' : 'lung_result')
    const fn  = sessionStorage.getItem(st === 'liver' ? 'liver_filename' : 'lung_filename') ?? ''
    const sid = sessionStorage.getItem('liver_scan_id') ?? ''
    setPatientName(sessionStorage.getItem('patient_name') ?? '')
    setPatientAge(sessionStorage.getItem('patient_age') ?? '')
    setPatientGender(sessionStorage.getItem('patient_gender') ?? '')
    if (!raw) { router.replace('/scan'); return }
    try { setResult(JSON.parse(raw)); setFilename(fn); setScanId(sid) }
    catch { router.replace('/scan') }
  }, [router])

  const handleLiverSubmit = async () => {
    if (!result || !actualClass) return
    setSubmitting(true)
    try {
      await Promise.all([
        submitEvaluation(filename, result.result_class, actualClass, result.tumor_probability ?? 0, result.slices_analyzed, result.affected_ratio),
        scanId ? saveEvaluation(scanId, actualClass, result.result_class as 'tumor' | 'non-tumor') : Promise.resolve(),
      ])
      setSubmitted(true)
    } catch { /* best-effort */ }
    finally { setSubmitting(false) }
  }

  if (authLoading || !result) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" />
    </div>
  )

  const wrapPage = (children: React.ReactNode) => (
    <div className="min-h-[calc(100vh-130px)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">{children}</div>
    </div>
  )

  // ── SHARED ELEMENTS ────────────────────────────────────────────────────────
  const lungBadge = (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-[#2DD4BF]/15 rounded-lg flex items-center justify-center border border-[#2DD4BF]/20">
        <Wind className="w-4 h-4 text-[#2DD4BF]" />
      </div>
      <span className="text-[11px] font-bold text-[#2DD4BF] uppercase tracking-widest">Lung Cancer Detection</span>
    </div>
  )

  const liverBadge = (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-[#818CF8]/15 rounded-lg flex items-center justify-center border border-[#818CF8]/20">
        <Heart className="w-4 h-4 text-[#818CF8]" />
      </div>
      <span className="text-[11px] font-bold text-[#818CF8] uppercase tracking-widest">Liver Tumor Detection</span>
    </div>
  )

  const downloadBtn = (
    <button onClick={handleDownloadPDF} disabled={downloading}
      className="w-full flex items-center justify-center gap-2 bg-[#00C2FF] hover:bg-[#22D3EE] active:bg-[#06B6D4] disabled:bg-[#1E2130] disabled:text-slate-600 disabled:cursor-not-allowed text-[#08090F] font-bold py-3.5 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(0,194,255,0.15)] disabled:shadow-none">
      {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {downloading ? 'Generating PDF…' : 'Download Report (PDF)'}
    </button>
  )

  const heatmapPanel = (organ: 'liver' | 'lung', isPositive: boolean) => {
    if (!result.original_image) return null
    const accentCls = organ === 'lung' ? 'text-[#2DD4BF]' : 'text-[#818CF8]'
    const posLabel  = organ === 'lung' ? 'Cancer Detected' : 'Tumor Detected'
    const negLabel  = organ === 'lung' ? 'No Cancer' : 'No Tumor'
    const posChip   = 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
    const negChip   = 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/25'

    return (
      <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0B14] border-b border-[#1E2130]">
          <div className="flex items-center gap-2">
            <Eye className={`w-4 h-4 ${accentCls}`} />
            <h2 className="font-semibold text-slate-200 text-sm">
              {result.heatmap_image ? 'Grad-CAM Activation Map' : 'Analysed Image'}
            </h2>
          </div>
          {result.heatmap_image && (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPositive ? posChip : negChip}`}>
                {isPositive ? posLabel : negLabel}
              </span>
              <button onClick={() => setShowHeatmap(v => !v)}
                className={`text-xs ${accentCls} font-medium flex items-center gap-1 hover:opacity-75 transition-opacity`}>
                {showHeatmap ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {result.heatmap_image && showHeatmap ? (
            <div className="animate-fade-up space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: organ === 'liver' ? 'Original CT Slice' : 'Original CT Image', tag: null, src: result.original_image },
                  { label: 'Activation Map', tag: 'Grad-CAM', src: result.heatmap_image },
                ].map(({ label, tag, src }) => (
                  <div key={label} className="border border-[#1E2130] rounded-xl overflow-hidden">
                    <div className="bg-[#0A0B14] px-4 py-2.5 border-b border-[#1E2130] flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-400">{label}</p>
                      {tag && <span className="text-[10px] text-slate-500 bg-[#0F1018] border border-[#1E2130] px-2 py-0.5 rounded-md font-mono">{tag}</span>}
                    </div>
                    <div className="bg-black">
                      <img src={`data:image/png;base64,${src}`} alt={label} className="w-full h-auto" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-[#1E2130] text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-12 h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded-full" />
                  Low → High activation
                </div>
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Red zones most influenced the {organ === 'lung' ? 'cancer' : 'tumor'} prediction
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-[#1E2130] rounded-xl overflow-hidden bg-black">
              <img src={`data:image/png;base64,${result.original_image}`} alt="Scan" className="w-full h-auto" />
            </div>
          )}

          {organ === 'lung' && (
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <Info className="w-3 h-3 flex-shrink-0" />
              Threshold: 0.99 — only raw scores ≥ 0.99 are classified as Cancer Detected
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── LUNG RESULTS ───────────────────────────────────────────────────────────
  if (scanType === 'lung') {
    const isCancer  = result.result_class === 'cancer'
    const isNotLung = result.result_class === 'not-lung'
    const cancerPct = result.cancer_probability ?? 0
    const clearPct  = result.non_cancer_probability ?? (100 - cancerPct)
    const lungConf  = result.lung_confidence ?? 0

    if (isNotLung) return wrapPage(
      <>
        {lungBadge}

        <div className="bg-[#0F1018] border border-amber-500/25 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Wind className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-amber-400 mb-2">Not a Lung Scan</h1>
          {filename && <p className="text-xs text-slate-600 mb-3 font-mono truncate">{filename}</p>}
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            This image was not recognised as a lung CT or X-ray. Please upload a valid lung scan.
          </p>
        </div>

        {result.decision_reason && (
          <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl px-5 py-4 flex items-start gap-3 text-sm text-slate-400">
            <Info className="w-4 h-4 text-[#00C2FF] mt-0.5 flex-shrink-0" />
            {result.decision_reason}
          </div>
        )}

        <Link href="/scan?mode=lung"
          className="flex items-center justify-center gap-2 border border-[#1E2130] bg-[#0F1018] text-slate-400 hover:bg-[#131420] font-medium py-3 rounded-xl transition-colors text-sm">
          <ScanLine className="w-4 h-4" /> Try Another Lung Scan
        </Link>
      </>
    )

    return wrapPage(
      <>
        {lungBadge}

        {/* Verdict */}
        <div className={`bg-[#0F1018] border-2 rounded-3xl p-8 ${isCancer ? 'border-rose-500/40' : 'border-[#34D399]/40'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isCancer ? 'bg-rose-500/10' : 'bg-[#34D399]/10'}`}>
            {isCancer
              ? <AlertTriangle className="w-8 h-8 text-rose-400" />
              : <CheckCircle2 className="w-8 h-8 text-[#34D399]" />}
          </div>
          <h1 className={`text-2xl font-bold text-center mb-1 ${isCancer ? 'text-rose-400' : 'text-[#34D399]'}`}>{result.prediction}</h1>
          {filename && <p className="text-xs text-slate-600 text-center mb-6 font-mono truncate">{filename}</p>}

          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Cancer Probability</span>
              <span className={`font-bold ${isCancer ? 'text-rose-400' : 'text-[#34D399]'}`}>{cancerPct.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-[#1E2130] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${isCancer ? 'bg-rose-500' : 'bg-[#34D399]'}`}
                style={{ width: `${cancerPct}%` }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Cancer Score',    value: `${cancerPct.toFixed(1)}%`, sub: 'raw prediction' },
            { label: 'Clear Score',     value: `${clearPct.toFixed(1)}%`,  sub: 'inverse score' },
            { label: 'Lung Confidence', value: `${lungConf.toFixed(1)}%`,  sub: 'Stage 1 output' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-4 text-center hover:border-[#282B40] transition-colors">
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">{label}</div>
              <div className="text-[10px] text-slate-600">{sub}</div>
            </div>
          ))}
        </div>

        {result.decision_reason && (
          <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl px-5 py-4 flex items-start gap-3 text-sm text-slate-400">
            <Info className="w-4 h-4 text-[#00C2FF] mt-0.5 flex-shrink-0" />
            {result.decision_reason}
          </div>
        )}

        {isCancer && heatmapPanel('lung', true)}

        {downloadBtn}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/scan?mode=lung"
            className="flex items-center justify-center gap-2 border border-[#1E2130] bg-[#0F1018] text-slate-400 hover:bg-[#131420] font-medium py-3 rounded-xl transition-colors text-sm">
            <ScanLine className="w-4 h-4" /> New Lung Scan
          </Link>
          <Link href="/scan?mode=liver"
            className="flex items-center justify-center gap-2 border border-[#1E2130] bg-[#0F1018] text-slate-400 hover:bg-[#131420] font-medium py-3 rounded-xl transition-colors text-sm">
            <Heart className="w-4 h-4" /> Liver Scan
          </Link>
        </div>
      </>
    )
  }

  // ── LIVER RESULTS ──────────────────────────────────────────────────────────
  const isTumor    = result.result_class === 'tumor'
  const isNotLiver = result.result_class === 'not-liver'
  const confidence = result.tumor_probability ?? 0
  const hasHeatmap = !!(result.heatmap_image && result.original_image)

  if (isNotLiver) return wrapPage(
    <>
      {liverBadge}

      <div className="bg-[#0F1018] border border-amber-500/25 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <XCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Not a Liver Scan</h1>
        {filename && <p className="text-xs text-slate-600 mb-3 font-mono truncate">{filename}</p>}
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          This scan was not recognised as a liver CT and was not analysed for tumors.
        </p>
      </div>

      {result.liver_probability !== undefined && (
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Stage 1 — Liver Detection Results</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{result.liver_probability}%</div>
              <div className="text-xs text-slate-500 mt-1">Liver Probability</div>
            </div>
            {result.liver_slices_checked !== undefined && (
              <div className="bg-[#0A0B14] border border-[#1E2130] rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{result.liver_slices_checked}</div>
                <div className="text-xs text-slate-500 mt-1">Slices Checked</div>
              </div>
            )}
          </div>
          <div className="mt-4 bg-[#00C2FF]/5 border border-[#00C2FF]/15 rounded-xl p-3.5 flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#00C2FF]" />
            More than 50% of slices must be classified as liver to proceed to tumor analysis.
          </div>
        </div>
      )}

      {result.decision_reason && (
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl px-5 py-4 flex items-start gap-3 text-sm text-slate-400">
          <Info className="w-4 h-4 text-[#00C2FF] mt-0.5 flex-shrink-0" />{result.decision_reason}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/scan?mode=liver"
          className="flex items-center justify-center gap-2 border border-[#1E2130] bg-[#0F1018] text-slate-400 hover:bg-[#131420] font-medium py-3 rounded-xl transition-colors text-sm">
          <ScanLine className="w-4 h-4" /> Try Again
        </Link>
        <Link href="/metrics"
          className="flex items-center justify-center gap-2 bg-[#818CF8] hover:bg-[#6D6FD4] text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-sm">
          <BarChart2 className="w-4 h-4" /> Metrics <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  )

  return wrapPage(
    <>
      {liverBadge}

      {/* Verdict */}
      <div className={`bg-[#0F1018] border-2 rounded-3xl p-8 ${isTumor ? 'border-rose-500/40' : 'border-[#34D399]/40'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isTumor ? 'bg-rose-500/10' : 'bg-[#34D399]/10'}`}>
          {isTumor ? <AlertTriangle className="w-8 h-8 text-rose-400" /> : <CheckCircle2 className="w-8 h-8 text-[#34D399]" />}
        </div>
        <h1 className={`text-2xl font-bold text-center mb-1 ${isTumor ? 'text-rose-400' : 'text-[#34D399]'}`}>{result.prediction}</h1>
        {filename && <p className="text-xs text-slate-600 text-center mb-6 font-mono truncate">{filename}</p>}

        <div className="max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Confidence Score</span>
            <span className={`font-bold ${isTumor ? 'text-rose-400' : 'text-[#34D399]'}`}>{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-[#1E2130] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${isTumor ? 'bg-rose-500' : 'bg-[#34D399]'}`}
              style={{ width: `${confidence}%` }} />
          </div>
        </div>
      </div>

      {/* Volume stats */}
      {result.slices_analyzed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Slices Analyzed', value: result.slices_analyzed },
            { label: 'Affected Slices', value: result.affected_slices ?? '—' },
            { label: 'Affected Ratio',  value: result.affected_ratio  ?? '—' },
            { label: 'Max Probability', value: result.max_probability != null ? `${(result.max_probability * 100).toFixed(1)}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-4 text-center hover:border-[#282B40] transition-colors">
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {result.decision_reason && (
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl px-5 py-4 flex items-start gap-3 text-sm text-slate-400">
          <Info className="w-4 h-4 text-[#00C2FF] mt-0.5 flex-shrink-0" />{result.decision_reason}
        </div>
      )}

      {/* Heatmap / no-tumor panel */}
      {isTumor ? (
        hasHeatmap
          ? heatmapPanel('liver', true)
          : (
            <div className="bg-[#0F1018] border border-amber-500/25 rounded-2xl p-5 flex items-start gap-3 text-sm text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {result.heatmap_error ?? 'Heatmap not available for this scan.'}
            </div>
          )
      ) : (
        <div className="bg-[#34D399]/10 border border-[#34D399]/25 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#34D399]/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#34D399]/20">
            <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#34D399] text-sm">No Tumor Detected</h3>
            <p className="text-xs text-[#34D399]/60 mt-0.5">Activation maps are generated only for positive tumor predictions.</p>
          </div>
        </div>
      )}

      {/* Feedback */}
      {!submitted ? (
        <div className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-6">
          <h2 className="font-semibold text-slate-200 mb-1 text-sm">Was this prediction correct?</h2>
          <p className="text-xs text-slate-500 mb-5">Your feedback is used to calculate evaluation metrics.</p>
          <div className="flex gap-3 mb-5">
            {(['tumor', 'non-tumor'] as const).map(cls => (
              <button key={cls} onClick={() => setActualClass(cls)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  actualClass === cls
                    ? cls === 'tumor'
                      ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                      : 'bg-[#34D399]/15 border-[#34D399]/50 text-[#34D399]'
                    : 'border-[#1E2130] bg-[#0A0B14] text-slate-500 hover:border-[#282B40]'
                }`}>
                {cls === 'tumor' ? 'Yes, Tumor' : 'No, Healthy'}
              </button>
            ))}
          </div>
          <button onClick={handleLiverSubmit} disabled={!actualClass || submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#00C2FF] hover:bg-[#22D3EE] disabled:bg-[#1E2130] disabled:text-slate-600 disabled:cursor-not-allowed text-[#08090F] font-bold py-3 rounded-xl transition-all text-sm shadow-[0_0_16px_rgba(0,194,255,0.2)] disabled:shadow-none">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Feedback
          </button>
        </div>
      ) : (
        <div className="bg-[#34D399]/10 border border-[#34D399]/25 rounded-2xl p-5 text-center animate-fade-up">
          <CheckCircle2 className="w-6 h-6 text-[#34D399] mx-auto mb-1.5" />
          <p className="text-[#34D399] text-sm font-semibold">Feedback recorded</p>
          <p className="text-[#34D399]/60 text-xs mt-0.5">Evaluation metrics updated.</p>
        </div>
      )}

      {downloadBtn}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/scan?mode=liver"
          className="flex items-center justify-center gap-2 border border-[#1E2130] bg-[#0F1018] text-slate-400 hover:bg-[#131420] font-medium py-3 rounded-xl transition-colors text-sm">
          <ScanLine className="w-4 h-4" /> New Scan
        </Link>
        <Link href="/metrics"
          className="flex items-center justify-center gap-2 bg-[#818CF8] hover:bg-[#6D6FD4] text-white font-medium py-3 rounded-xl transition-colors text-sm shadow-sm shadow-[#818CF8]/20">
          <BarChart2 className="w-4 h-4" /> View Metrics <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  )
}
