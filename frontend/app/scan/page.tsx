'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileImage, X, Loader2, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { predictScan } from '@/lib/api'
import type { PredictionResult } from '@/lib/types'
import { saveScan } from '@/lib/firestore'
import { useRequireAuth } from '@/hooks/useRequireAuth'

const ACCEPTED = ['.nii', '.nii.gz', '.jpg', '.jpeg', '.png']

function isValidFile(file: File) {
  const name = file.name.toLowerCase()
  return ACCEPTED.some(ext => name.endsWith(ext))
}

export default function ScanPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useRequireAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleFile = useCallback((f: File) => {
    setError(null)
    if (!isValidFile(f)) {
      setError('Unsupported file type. Please upload .nii, .nii.gz, .jpg, or .png')
      return
    }
    setFile(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const analyze = async () => {
    if (!file || !user) return
    setLoading(true)
    setError(null)
    try {
      const result = await predictScan(file)

      sessionStorage.setItem('liver_result',   JSON.stringify(result))
      sessionStorage.setItem('liver_filename', file.name)

      const firestoreResult: PredictionResult = {
        prediction:            result.prediction,
        result_class:          result.result_class,
        tumor_probability:     result.tumor_probability,
        non_tumor_probability: result.non_tumor_probability,
        slices_analyzed:       result.slices_analyzed,
        max_probability:       result.max_probability,
        mean_probability:      result.mean_probability,
        affected_slices:       result.affected_slices,
        affected_ratio:        result.affected_ratio,
        decision_reason:       result.decision_reason,
        heatmap_error:         result.heatmap_error,
        liver_probability:     result.liver_probability,
        liver_slices_checked:  result.liver_slices_checked,
      }

      const scanId = await saveScan(user.uid, file.name, firestoreResult)
      sessionStorage.setItem('liver_scan_id', scanId)

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

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">New Analysis</p>
        <h1 className="text-3xl font-bold text-slate-900">Upload CT Scan</h1>
        <p className="text-slate-500 text-sm mt-2">
          Upload a NIfTI volume or CT image to run the two-stage liver tumor detection pipeline.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          loading    ? 'pointer-events-none opacity-60 border-slate-200 bg-white'
          : dragging  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
          : file      ? 'border-blue-300 bg-blue-50/60'
          :             'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
        }`}
      >
        <input ref={inputRef} type="file" className="hidden"
          accept=".nii,.nii.gz,.jpg,.jpeg,.png"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {file ? (
          <div className="animate-fade-up">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileImage className="w-8 h-8 text-blue-600" />
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              File ready
            </div>
            <p className="font-semibold text-slate-800 text-lg mb-1 truncate max-w-sm mx-auto">{file.name}</p>
            <p className="text-sm text-slate-400">
              {isNifti ? 'NIfTI Volume — full volumetric analysis' : 'CT Image — single slice analysis'}
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
            <p className="text-sm text-slate-400">NIfTI volumes or CT images accepted</p>
          </div>
        )}
      </div>

      {/* Supported formats */}
      <div className="mt-3 flex flex-wrap gap-2 px-1">
        {['.nii', '.nii.gz', '.jpg', '.jpeg', '.png'].map(ext => (
          <span key={ext} className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{ext}</span>
        ))}
        <span className="text-xs text-slate-400 self-center ml-1">— NIfTI recommended for full analysis</span>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {isNifti && !error && (
        <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm animate-fade-up">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          NIfTI volume detected — all slices will be analysed through both pipeline stages.
        </div>
      )}

      <button
        onClick={analyze}
        disabled={!file || loading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base shadow-sm">
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing{isNifti ? ' all slices' : ''}…</>
          : <><Upload className="w-5 h-5" /> Analyse Scan</>}
      </button>

      {loading && (
        <div className="mt-4 text-center space-y-1.5">
          <p className="text-sm text-slate-500 font-medium">
            {isNifti ? 'Running two-stage pipeline across all slices…' : 'Running inference on your image…'}
          </p>
          <p className="text-xs text-slate-400">
            {isNifti ? 'Stage 1: liver verification → Stage 2: tumor detection. This may take 1–2 minutes.' : 'This should only take a few seconds.'}
          </p>
        </div>
      )}

    </div>
  )
}
