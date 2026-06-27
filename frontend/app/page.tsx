import Link from 'next/link'
import { Upload, BarChart2, Shield, Zap, CheckCircle, ArrowRight, Brain, Activity, Layers } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse-dot" />
            AI-Powered Medical Imaging
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Liver Tumor Detection
            <br />
            <span className="gradient-text">Powered by Deep Learning</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload CT scans and receive instant AI predictions using a two-stage
            ResNet18 pipeline trained on the LiTS dataset — with Grad-CAM visualisation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/scan"
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/50">
              <Upload className="w-4 h-4" />
              Start Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/metrics"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm">
              <BarChart2 className="w-4 h-4" />
              View Metrics
            </Link>
          </div>

          {/* Key stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { label: 'Architecture', value: 'ResNet18' },
              { label: 'Dataset',      value: 'LiTS' },
              { label: 'Detection',    value: '70 / 11%' },
              { label: 'Pipeline',     value: '2 Stages' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-white font-bold text-base md:text-lg">{value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-lg mx-auto">From upload to diagnosis in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload CT Scan',
                desc: 'Upload a NIfTI volume (.nii / .nii.gz) for full volumetric analysis, or a single CT image (.jpg / .png) for quick inspection.',
              },
              {
                step: '02',
                icon: Brain,
                title: 'Two-Stage AI Analysis',
                desc: 'Stage 1 verifies the scan is a liver CT. Stage 2 then analyses every slice with ResNet18 using the 70% / 11% detection logic.',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Instant Results',
                desc: 'Receive a detailed prediction with confidence score, affected ratio, Grad-CAM heatmap, and full decision reasoning.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step}
                className="group bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl p-7 transition-all duration-300 cursor-default">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-5xl font-black text-slate-100 group-hover:text-blue-100 leading-none transition-colors">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two-stage pipeline detail ─────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Architecture</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Two-Stage Pipeline</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-blue-100 rounded-2xl p-7 shadow-sm">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-5 border border-blue-200">
                <Layers className="w-3 h-3" /> Stage 1 — Liver Verification
              </div>
              <ul className="space-y-3">
                {[
                  'Grayscale input (1-channel ResNet18)',
                  'CLAHE contrast enhancement preprocessing',
                  'Liver / Non-Liver binary classification',
                  'Scan rejected if fewer than 50% of slices are liver',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-indigo-100 rounded-2xl p-7 shadow-sm">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-5 border border-indigo-200">
                <Activity className="w-3 h-3" /> Stage 2 — Tumor Detection
              </div>
              <ul className="space-y-3">
                {[
                  'RGB input (3-channel ResNet18, dropout FC head)',
                  'ImageNet normalisation preprocessing',
                  'Slice probability ≥ 70% counts as high-confidence',
                  'Tumor detected if affected slices exceed 11% ratio',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature highlights ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: 'Fast Inference',
                desc: 'Processes full NIfTI volumes with all slices in seconds on CPU — no GPU required.',
              },
              {
                icon: Shield,
                title: 'Research-Grade Logic',
                desc: '70% threshold + 11% ratio — identical detection logic to the published research pipeline.',
              },
              {
                icon: BarChart2,
                title: 'Evaluation Tracking',
                desc: 'Submit ground truth labels and track accuracy, precision, recall, F1, and confusion matrix in real time.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="flex gap-4 p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all cursor-default">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to analyse a scan?</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Upload your CT scan and get AI results in seconds.
            Full NIfTI volume analysis with Grad-CAM visualisation.
          </p>
          <Link href="/scan"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg">
            <Upload className="w-4 h-4" />
            Upload CT Scan
          </Link>
        </div>
      </section>

    </div>
  )
}
