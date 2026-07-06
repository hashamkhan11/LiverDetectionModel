'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, FileImage, X, Loader2, AlertCircle, Info, CheckCircle2, Heart, Wind } from 'lucide-react'
import { predictScan, predictLungScan } from '@/lib/api'
import { saveScan } from '@/lib/firestore'
import { useRequireAuth } from '@/hooks/useRequireAuth'

type OrganMode = 'liver' | 'lung'

const LIVER_EXTS = ['.nii', '.nii.gz', '.jpg', '.jpeg', '.png']
const LUNG_EXTS  = ['.jpg', '.jpeg', '.png']

function isValidFile(file: File, mode: OrganMode) {
  const name = file.name.toLowerCase()
  return (mode === 'liver' ? LIVER_EXTS : LUNG_EXTS).some(ext => name.endsWith(ext))
}

function ScanPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading: authLoading } = useRequireAuth()

  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode]         = useState<OrganMode>('liver')
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    const m = params.get('mode')
    if (m === 'liver' || m === 'lung') setMode(m)
  }, [params])

  const handleModeSwitch = (m: OrganMode) => { setMode(m); setFile(null); setError(null) }

  const handleFile = useCallback((f: File, m: OrganMode) => {
    setError(null)
    if (!isValidFile(f, m)) {
      setError(`Unsupported format. Accepted: ${m === 'liver' ? '.nii, .nii.gz, .jpg, .png' : '.jpg, .png'}`)
      return
    }
    setFile(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], mode)
  }, [handleFile, mode])

  const analyze = async () => {
    if (!file || !user) return
    setLoading(true); setError(null)
    try {
      if (mode === 'liver') {
        const result = await predictScan(file)
        sessionStorage.setItem('scan_type', 'liver')
        sessionStorage.setItem('liver_result', JSON.stringify(result))
        sessionStorage.setItem('liver_filename', file.name)
        const scanId = await saveScan(user.uid, file.name, result, 'liver')
        sessionStorage.setItem('liver_scan_id', scanId)
      } else {
        const result = await predictLungScan(file)
        sessionStorage.setItem('scan_type', 'lung')
        sessionStorage.setItem('lung_result', JSON.stringify(result))
        sessionStorage.setItem('lung_filename', file.name)
        await saveScan(user.uid, file.name, result, 'lung')
      }
      router.push('/results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Is the backend running?')
      setLoading(false)
    }
  }

  const isNifti = file?.name.toLowerCase().endsWith('.nii') || file?.name.toLowerCase().endsWith('.nii.gz')
  const sizeMB  = file ? (file.size / 1024 / 1024).toFixed(1) : null
  const isLung  = mode === 'lung'

  if (authLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-start justify-center bg-[#F0F4FF]">
      <div className="w-full max-w-xl px-4 py-12">

        {/* Page header */}
        <div className="mb-8">
          <span className="text-blue-600 text-[11px] font-bold uppercase tracking-widest">New Analysis</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Upload CT Scan</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select an organ type and upload your scan to run the detection pipeline
          </p>
        </div>

        {/* ── Organ tabs ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {([
            { mode: 'liver' as OrganMode, icon: Heart, label: 'Liver Tumor', sub: 'NIfTI + Image', activeColor: 'border-blue-500 bg-blue-600', activeBg: 'bg-blue-50 border-blue-300', activeText: 'text-blue-700' },
            { mode: 'lung'  as OrganMode, icon: Wind,  label: 'Lung Cancer', sub: 'Image only',    activeColor: 'border-teal-500 bg-teal-600',  activeBg: 'bg-teal-50 border-teal-300',   activeText: 'text-teal-700' },
          ]).map(({ mode: m, icon: Icon, label, sub, activeColor, activeBg, activeText }) => (
            <button key={m} onClick={() => handleModeSwitch(m)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                mode === m ? `${activeBg} shadow-sm` : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                mode === m ? activeColor : 'bg-slate-100'
              }`}>
                <Icon className={`w-5 h-5 ${mode === m ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className={`font-semibold text-[13px] ${mode === m ? activeText : 'text-slate-600'}`}>{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Upload zone ─────────────────────────────────────────── */}
        <div
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer select-none ${
            loading   ? 'pointer-events-none opacity-60 border-slate-200 bg-white'
            : dragging ? (isLung ? 'border-teal-400 bg-teal-50/60 scale-[1.01]' : 'border-blue-400 bg-blue-50/60 scale-[1.01]')
            : file     ? (isLung ? 'border-teal-300 bg-teal-50/40' : 'border-blue-300 bg-blue-50/40')
            :             'border-slate-300 bg-white hover:border-slate-400 hover:bg-white/80'
          }`}
        >
          <input ref={inputRef} type="file" className="hidden"
            accept={isLung ? '.jpg,.jpeg,.png' : '.nii,.nii.gz,.jpg,.jpeg,.png'}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], mode)} />

          {file ? (
            <div className="animate-fade-up">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isLung ? 'bg-teal-100' : 'bg-blue-100'}`}>
                <FileImage className={`w-8 h-8 ${isLung ? 'text-teal-600' : 'text-blue-600'}`} />
              </div>
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 ${isLung ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                File ready
              </div>
              <p className="font-semibold text-slate-800 text-lg mb-1 truncate max-w-xs mx-auto">{file.name}</p>
              <p className="text-sm text-slate-400">
                {isNifti ? 'NIfTI Volume — full volumetric analysis' : 'Image — single frame analysis'}
                &nbsp;·&nbsp;{sizeMB} MB
              </p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null) }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors font-medium">
                <X className="w-3.5 h-3.5" /> Remove file
              </button>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700 text-lg mb-1.5">
                {dragging ? 'Drop your file here' : 'Click or drag & drop'}
              </p>
              <p className="text-sm text-slate-400">
                {isLung ? 'CT scan or chest X-ray image' : 'NIfTI volume or CT image'}
              </p>
            </div>
          )}
        </div>

        {/* Accepted formats */}
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          {(isLung ? LUNG_EXTS : LIVER_EXTS).map(ext => (
            <span key={ext} className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">{ext}</span>
          ))}
          {!isLung && <span className="text-xs text-slate-400 ml-1">— NIfTI recommended for full analysis</span>}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
          </div>
        )}

        {!error && !isLung && isNifti && (
          <div className="mt-4 flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            NIfTI volume — all slices will be analysed through both pipeline stages.
          </div>
        )}

        {!error && isLung && (
          <div className="mt-4 flex items-start gap-2.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl px-4 py-3 text-sm">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Stage 1 verifies the image is a lung scan · Stage 2 screens for cancer at 0.99 threshold.
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={!file || loading}
          className={`mt-6 w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-all text-base shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none ${
            isLung
              ? 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-teal-100'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-100'
          }`}>
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing{isNifti ? ' all slices' : ''}…</>
            : <><Upload className="w-5 h-5" /> {isLung ? 'Analyse Lung Scan' : 'Analyse Liver Scan'}</>}
        </button>

        {loading && (
          <div className="mt-5 text-center space-y-1.5">
            <p className="text-sm text-slate-600 font-medium">
              {isLung
                ? 'Running two-stage lung cancer pipeline…'
                : isNifti ? 'Running two-stage pipeline across all slices…' : 'Running liver inference…'}
            </p>
            <p className="text-xs text-slate-400">
              {isLung
                ? 'Stage 1: lung verification → Stage 2: cancer detection'
                : isNifti ? 'Stage 1: verification → Stage 2: tumor detection. May take 1–2 min.' : 'This should take a few seconds.'}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}>
      <ScanPageInner />
    </Suspense>
  )
}
