import Link from 'next/link'
import {
  Upload, BarChart2, Shield, Zap, CheckCircle, ArrowRight,
  Brain, Activity, Layers, Heart, Wind,
} from 'lucide-react'

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
            Liver &amp; Lung Cancer
            <br />
            <span className="gradient-text">Detection with Deep Learning</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload CT scans and receive instant AI predictions. Two specialised
            pipelines — liver tumor detection and lung cancer screening — powered
            by ResNet deep learning models.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/scan"
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/50">
              <Upload className="w-4 h-4" />
              Start Scan
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
              { label: 'Liver Model',  value: 'ResNet18' },
              { label: 'Lung Models',  value: 'ResNet18 + 50' },
              { label: 'Dataset',      value: 'LiTS + LIDC' },
              { label: 'Pipelines',    value: '2 Organs' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-white font-bold text-base md:text-lg">{value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organ Selector Cards ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Detection Modes</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose Your Scan Type</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-lg mx-auto">
              Each organ uses a specialised two-stage AI pipeline optimised for that modality
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Liver card */}
            <Link href="/scan?mode=liver"
              className="group bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 cursor-pointer">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Liver Tumor Detection</h3>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">NIfTI + Image</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Stage 1 — Liver verification (ResNet18, grayscale)',
                  'Stage 2 — Tumor classification (ResNet18, RGB)',
                  'Grad-CAM activation heatmap visualisation',
                  'Full volumetric NIfTI analysis supported',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Start Liver Scan <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Lung card */}
            <Link href="/scan?mode=lung"
              className="group bg-gradient-to-br from-teal-50 to-white border-2 border-teal-100 hover:border-teal-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-teal-100 cursor-pointer">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Wind className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Lung Cancer Detection</h3>
                  <span className="text-xs text-teal-600 font-semibold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">Image Only</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Stage 1 — Lung image classifier (ResNet18, PyTorch)',
                  'Stage 2 — Cancer detector (ResNet50, Keras, threshold 0.99)',
                  'Accepts CT scans and chest X-rays (.jpg / .png)',
                  'High-precision cancer probability score',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Start Lung Scan <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-lg mx-auto">From upload to diagnosis in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Your Scan',
                desc: 'Choose your organ type, then upload a CT scan. Liver supports NIfTI volumes and images; Lung supports CT images and X-rays.',
              },
              {
                step: '02',
                icon: Brain,
                title: 'Two-Stage AI Analysis',
                desc: 'Stage 1 verifies the uploaded image is the correct organ type. Stage 2 runs the disease detection model with high-precision scoring.',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Instant Results',
                desc: 'Get a detailed prediction with confidence scores, decision reasoning, and Grad-CAM heatmap (liver tumors) within seconds.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step}
                className="group bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl p-7 transition-all duration-300 cursor-default">
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

      {/* ── Pipeline detail ────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Architecture</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Two-Stage Pipelines</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Liver pipeline */}
            <div className="border border-blue-100 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800">Liver Tumor Detection</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="inline-flex items-center gap-1.5 text-blue-700 text-xs font-bold mb-3">
                    <Layers className="w-3 h-3" /> Stage 1 — Liver Verification
                  </div>
                  <ul className="space-y-1.5">
                    {['1-channel grayscale ResNet18', 'CLAHE preprocessing', 'Liver / Non-Liver binary classifier', '50% slice threshold to proceed'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="inline-flex items-center gap-1.5 text-indigo-700 text-xs font-bold mb-3">
                    <Activity className="w-3 h-3" /> Stage 2 — Tumor Detection
                  </div>
                  <ul className="space-y-1.5">
                    {['3-channel RGB ResNet18 with dropout FC', 'ImageNet normalisation', '70% slice threshold for high confidence', '11% affected ratio for tumor verdict'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lung pipeline */}
            <div className="border border-teal-100 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Wind className="w-4 h-4 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-800">Lung Cancer Detection</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold mb-3">
                    <Layers className="w-3 h-3" /> Stage 1 — Lung Classifier
                  </div>
                  <ul className="space-y-1.5">
                    {['ResNet18 PyTorch classifier', 'Grayscale → RGB conversion', 'Lung / Non-Lung binary classification', '50% probability threshold to proceed'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-3">
                    <Activity className="w-3 h-3" /> Stage 2 — Cancer Detector
                  </div>
                  <ul className="space-y-1.5">
                    {['ResNet50 Keras model (102 MB)', 'High-precision threshold: 0.99', 'Cancer / No Cancer binary output', 'Raw probability score returned'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Feature highlights ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: 'Fast CPU Inference',
                desc: 'Processes full NIfTI volumes across all slices in seconds on CPU — no GPU required.',
              },
              {
                icon: Shield,
                title: 'Research-Grade Logic',
                desc: 'Detection thresholds match published research pipelines for both liver and lung models.',
              },
              {
                icon: BarChart2,
                title: 'Evaluation Tracking',
                desc: 'Submit ground truth labels and track accuracy, precision, recall, F1, and confusion matrix in real time.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="flex gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-default">
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
            Choose liver tumor detection or lung cancer screening.
          </p>
          <Link href="/scan"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg">
            <Upload className="w-4 h-4" />
            Start Analysis
          </Link>
        </div>
      </section>

    </div>
  )
}
