'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, FileImage, X, Loader2, AlertCircle, Info, CheckCircle2, Heart, Wind } from 'lucide-react'
import { predictScan, predictLungScan } from '@/lib/api'
import { saveScan } from '@/lib/firestore'
import { useRequireAuth } from '@/hooks/useRequireAuth'

type OrganMode = 'liver' | 'lung'

const LIVER_ACCEPTED = ['.nii', '.nii.gz', '.jpg', '.jpeg', '.png']
const LUNG_ACCEPTED  = ['.jpg', '.jpeg', '.png']

function isValidFile(file: File, mode: OrganMode) {
  const name = file.name.toLowerCase()
  const exts = mode === 'liver' ? LIVER_ACCEPTED : LUNG_ACCEPTED
  return exts.some(ext => name.endsWith(ext))
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

  // pre-select mode from query param
  useEffect(() => {
    const m = params.get('mode')
    if (m === 'liver' || m === 'lung') setMode(m)
  }, [params])

  const handleModeSwitch = (m: OrganMode) => {
    setMode(m)
    setFile(null)
    setError(null)
  }

  const handleFile = useCallback((f: File, currentMode: OrganMode) => {
    setError(null)
    if (!isValidFile(f, currentMode)) {
      const exts = currentMode === 'liver' ? '.nii, .nii.gz, .jpg, .png' : '.jpg, .png'
      setError(`Unsupported file type. Accepted: ${exts}`)
      return
    }
    setFile(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], mode)
  }, [handleFile, mode])

  const analyze = async () => {
    if (!file || !user) return
    setLoading(true)
    setError(null)
    try {
      if (mode === 'liver') {
        const result = await predictScan(file)
        sessionStorage.setItem('scan_type',      'liver')
        sessionStorage.setItem('liver_result',   JSON.stringify(result))
        sessionStorage.setItem('liver_filename', file.name)
        const scanId = await saveScan(user.uid, file.name, result, 'liver')
        sessionStorage.setItem('liver_scan_id', scanId)
      } else {
        const result = await predictLungScan(file)
        sessionStorage.setItem('scan_type',     'lung')
        sessionStorage.setItem('lung_result',   JSON.stringify(result))
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

  if (authLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    </div>
  )

  const accent = mode === 'liver'
    ? { ring: 'ring-blue-500', border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', icon: 'bg-blue-100 text-blue-600' }
    : { ring: 'ring-teal-500',  border: 'border-teal-300',  bg: 'bg-teal-50',  text: 'text-teal-600',  btn: 'bg-teal-600 hover:bg-teal-700',  icon: 'bg-teal-100 text-teal-600' }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">

      {/* ── Organ Mode Tabs ────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">New Analysis</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeSwitch('liver')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'liver'
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              mode === 'liver' ? 'bg-blue-600' : 'bg-slate-100'
            }`}>
              <Heart className={`w-5 h-5 ${mode === 'liver' ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${mode === 'liver' ? 'text-blue-700' : 'text-slate-600'}`}>
                Liver Tumor
              </p>
              <p className="text-xs text-slate-400">NIfTI + Image</p>
            </div>
          </button>

          <button
            onClick={() => handleModeSwitch('lung')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
              mode === 'lung'
                ? 'border-teal-500 bg-teal-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              mode === 'lung' ? 'bg-teal-600' : 'bg-slate-100'
            }`}>
              <Wind className={`w-5 h-5 ${mode === 'lung' ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm ${mode === 'lung' ? 'text-teal-700' : 'text-slate-600'}`}>
                Lung Cancer
              </p>
              <p className="text-xs text-slate-400">Image only</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'liver' ? 'Liver Tumor Detection' : 'Lung Cancer Detection'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {mode === 'liver'
            ? 'Upload a NIfTI volume or CT image for two-stage liver tumor analysis.'
            : 'Upload a lung CT scan or X-ray image for cancer screening.'}
        </p>
      </div>

      {/* ── Upload zone ─────────────────────────────────────────── */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          loading    ? 'pointer-events-none opacity-60 border-slate-200 bg-white'
          : dragging  ? `${accent.border} ${accent.bg} scale-[1.01]`
          : file      ? `${accent.border} ${accent.bg}/60`
          :             'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/30'
        }`}
      >
        <input ref={inputRef} type="file" className="hidden"
          accept={mode === 'liver' ? '.nii,.nii.gz,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png'}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], mode)} />

        {file ? (
          <div className="animate-fade-up">
            <div className={`w-16 h-16 ${accent.icon} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
              <FileImage className="w-8 h-8" />
            </div>
            <div className={`inline-flex items-center gap-2 ${accent.bg} ${accent.text} text-xs font-semibold px-3 py-1 rounded-full mb-3`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              File ready
            </div>
            <p className="font-semibold text-slate-800 text-lg mb-1 truncate max-w-sm mx-auto">{file.name}</p>
            <p className="text-sm text-slate-400">
              {isNifti ? 'NIfTI Volume — full volumetric analysis' : 'Image — single frame analysis'}
              &nbsp;·&nbsp; {sizeMB} MB
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
            <p className="font-semibold text-slate-700 text-lg mb-1">
              {dragging ? 'Drop your file here' : 'Click or drag & drop'}
            </p>
            <p className="text-sm text-slate-400">
              {mode === 'liver' ? 'NIfTI volumes or CT images' : 'CT scan or chest X-ray image'}
            </p>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="mt-3 flex flex-wrap gap-2 px-1">
        {(mode === 'liver' ? LIVER_ACCEPTED : LUNG_ACCEPTED).map(ext => (
          <span key={ext} className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{ext}</span>
        ))}
        {mode === 'liver' && (
          <span className="text-xs text-slate-400 self-center ml-1">— NIfTI recommended for full analysis</span>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {mode === 'liver' && isNifti && !error && (
        <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          NIfTI volume detected — all slices will be analysed through both pipeline stages.
        </div>
      )}

      {mode === 'lung' && !error && (
        <div className="mt-4 flex items-start gap-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl px-4 py-3 text-sm">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          Two-stage pipeline: Stage 1 verifies the image is a lung scan, Stage 2 screens for cancer at 0.99 threshold.
        </div>
      )}

      <button
        onClick={analyze}
        disabled={!file || loading}
        className={`mt-6 w-full flex items-center justify-center gap-2 ${accent.btn} disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base shadow-sm`}>
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing{isNifti ? ' all slices' : ''}…</>
          : <><Upload className="w-5 h-5" /> {mode === 'liver' ? 'Analyse Liver Scan' : 'Analyse Lung Scan'}</>}
      </button>

      {loading && (
        <div className="mt-4 text-center space-y-1.5">
          <p className="text-sm text-slate-500 font-medium">
            {mode === 'liver'
              ? (isNifti ? 'Running two-stage pipeline across all slices…' : 'Running liver inference on your image…')
              : 'Running two-stage lung cancer pipeline…'}
          </p>
          <p className="text-xs text-slate-400">
            {mode === 'liver' && isNifti
              ? 'Stage 1: liver verification → Stage 2: tumor detection. This may take 1–2 minutes.'
              : 'Stage 1: lung verification → Stage 2: cancer detection. This should take a few seconds.'}
          </p>
        </div>
      )}

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
