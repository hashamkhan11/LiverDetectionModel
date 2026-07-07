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
  const [patientName,   setPatientName]   = useState('')
  const [patientAge,    setPatientAge]    = useState('')
  const [patientGender, setPatientGender] = useState('')

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
        sessionStorage.setItem('patient_name',   patientName.trim())
        sessionStorage.setItem('patient_age',    patientAge)
        sessionStorage.setItem('patient_gender', patientGender)
        const scanId = await saveScan(user.uid, file.name, result, 'liver', { name: patientName.trim(), age: patientAge, gender: patientGender })
        sessionStorage.setItem('liver_scan_id', scanId)
      } else {
        const result = await predictLungScan(file)
        sessionStorage.setItem('scan_type', 'lung')
        sessionStorage.setItem('lung_result', JSON.stringify(result))
        sessionStorage.setItem('lung_filename', file.name)
        sessionStorage.setItem('patient_name',   patientName.trim())
        sessionStorage.setItem('patient_age',    patientAge)
        sessionStorage.setItem('patient_gender', patientGender)
        const lungScanId = await saveScan(user.uid, file.name, result, 'lung', { name: patientName.trim(), age: patientAge, gender: patientGender })
        sessionStorage.setItem('lung_scan_id', lungScanId)
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
      <Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" />
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-start justify-center">
      <div className="w-full max-w-xl px-4 py-12">

        {/* Page header */}
        <div className="mb-8">
          <span className="text-[#00C2FF] text-[11px] font-bold uppercase tracking-widest">New Analysis</span>
          <h1 className="text-2xl font-bold text-white mt-1">Upload CT Scan</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select an organ type and upload your scan to run the detection pipeline
          </p>
        </div>

        {/* ── Patient information ─────────────────────────────────── */}
        <div className="bg-[#0A0B14] border border-[#1E2130] rounded-2xl p-5 mb-7">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Patient Information</p>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <label className="text-xs text-slate-500 mb-1.5 block">Full Name <span className="text-rose-400">*</span></label>
              <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)}
                placeholder="e.g. Ahmed Khan"
                className="w-full bg-[#0F1018] border border-[#1E2130] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00C2FF]/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Age <span className="text-rose-400">*</span></label>
              <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)}
                placeholder="45" min={1} max={120}
                className="w-full bg-[#0F1018] border border-[#1E2130] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#00C2FF]/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Gender <span className="text-rose-400">*</span></label>
              <select value={patientGender} onChange={e => setPatientGender(e.target.value)}
                className="w-full bg-[#0F1018] border border-[#1E2130] rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-[#00C2FF]/50 transition-colors">
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Organ tabs ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {([
            { mode: 'liver' as OrganMode, icon: Heart, label: 'Liver Tumor', sub: 'NIfTI + Image',
              activeBorder: 'border-[#818CF8]', activeBg: 'bg-[#818CF8]/10',
              activeIcon: 'bg-[#818CF8]', activeText: 'text-[#818CF8]' },
            { mode: 'lung'  as OrganMode, icon: Wind,  label: 'Lung Cancer', sub: 'Image only',
              activeBorder: 'border-[#2DD4BF]', activeBg: 'bg-[#2DD4BF]/10',
              activeIcon: 'bg-[#2DD4BF]', activeText: 'text-[#2DD4BF]' },
          ]).map(({ mode: m, icon: Icon, label, sub, activeBorder, activeBg, activeIcon, activeText }) => (
            <button key={m} onClick={() => handleModeSwitch(m)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                mode === m ? `${activeBorder} ${activeBg} shadow-sm` : 'border-[#1E2130] bg-[#0F1018] hover:border-[#282B40]'
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                mode === m ? activeIcon : 'bg-[#0A0B14]'
              }`}>
                <Icon className={`w-5 h-5 ${mode === m ? (m === 'lung' ? 'text-[#08090F]' : 'text-white') : 'text-slate-600'}`} />
              </div>
              <div>
                <p className={`font-semibold text-[13px] ${mode === m ? activeText : 'text-slate-500'}`}>{label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
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
            loading   ? 'pointer-events-none opacity-60 border-[#1E2130] bg-[#0A0B14]'
            : dragging ? (isLung ? 'border-[#2DD4BF]/60 bg-[#2DD4BF]/5 scale-[1.01]' : 'border-[#818CF8]/60 bg-[#818CF8]/5 scale-[1.01]')
            : file     ? (isLung ? 'border-[#2DD4BF]/40 bg-[#2DD4BF]/5' : 'border-[#818CF8]/40 bg-[#818CF8]/5')
            :             'border-[#2A2D45] bg-[#0A0B14] hover:border-[#3A3D55] hover:bg-[#0D0E1A]'
          }`}
        >
          <input ref={inputRef} type="file" className="hidden"
            accept={isLung ? '.jpg,.jpeg,.png' : '.nii,.nii.gz,.jpg,.jpeg,.png'}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], mode)} />

          {file ? (
            <div className="animate-fade-up">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isLung ? 'bg-[#2DD4BF]/15' : 'bg-[#818CF8]/15'}`}>
                <FileImage className={`w-8 h-8 ${isLung ? 'text-[#2DD4BF]' : 'text-[#818CF8]'}`} />
              </div>
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 ${isLung ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/25' : 'bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/25'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                File ready
              </div>
              <p className="font-semibold text-slate-200 text-lg mb-1 truncate max-w-xs mx-auto">{file.name}</p>
              <p className="text-sm text-slate-500">
                {isNifti ? 'NIfTI Volume — full volumetric analysis' : 'Image — single frame analysis'}
                &nbsp;·&nbsp;{sizeMB} MB
              </p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null) }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors font-medium">
                <X className="w-3.5 h-3.5" /> Remove file
              </button>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-[#1E2130] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Upload className="w-8 h-8 text-slate-600" />
              </div>
              <p className="font-semibold text-slate-300 text-lg mb-1.5">
                {dragging ? 'Drop your file here' : 'Click or drag & drop'}
              </p>
              <p className="text-sm text-slate-500">
                {isLung ? 'CT scan or chest X-ray image' : 'NIfTI volume or CT image'}
              </p>
            </div>
          )}
        </div>

        {/* Accepted formats */}
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          {(isLung ? LUNG_EXTS : LIVER_EXTS).map(ext => (
            <span key={ext} className="text-[11px] font-mono bg-[#0F1018] text-slate-500 px-2 py-0.5 rounded-md border border-[#1E2130]">{ext}</span>
          ))}
          {!isLung && <span className="text-xs text-slate-600 ml-1">— NIfTI recommended for full analysis</span>}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl px-4 py-3 text-sm animate-fade-up">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
          </div>
        )}

        {!error && !isLung && isNifti && (
          <div className="mt-4 flex items-start gap-2.5 bg-[#818CF8]/10 border border-[#818CF8]/25 text-[#818CF8] rounded-xl px-4 py-3 text-sm animate-fade-up">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            NIfTI volume — all slices will be analysed through both pipeline stages.
          </div>
        )}

        {!error && isLung && (
          <div className="mt-4 flex items-start gap-2.5 bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 text-[#2DD4BF] rounded-xl px-4 py-3 text-sm">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Stage 1 verifies the image is a lung scan · Stage 2 screens for cancer at 0.99 threshold.
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={!file || loading || !patientName.trim() || !patientAge || !patientGender}
          className={`mt-6 w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-all text-base shadow-sm disabled:bg-[#1E2130] disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none ${
            isLung
              ? 'bg-[#2DD4BF] hover:bg-[#14B8A6] active:bg-[#0F9186] text-[#08090F] shadow-[#2DD4BF]/15'
              : 'bg-[#818CF8] hover:bg-[#6D6FD4] active:bg-[#5B5CBA] text-white shadow-[#818CF8]/20'
          }`}>
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing{isNifti ? ' all slices' : ''}…</>
            : <><Upload className="w-5 h-5" /> {isLung ? 'Analyse Lung Scan' : 'Analyse Liver Scan'}</>}
        </button>

        {loading && (
          <div className="mt-5 text-center space-y-1.5">
            <p className="text-sm text-slate-400 font-medium">
              {isLung
                ? 'Running two-stage lung cancer pipeline…'
                : isNifti ? 'Running two-stage pipeline across all slices…' : 'Running liver inference…'}
            </p>
            <p className="text-xs text-slate-500">
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
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" /></div>}>
      <ScanPageInner />
    </Suspense>
  )
}
