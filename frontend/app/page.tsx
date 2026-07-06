import Link from 'next/link'
import {
  ArrowRight, Heart, Wind, CheckCircle,
  Brain, ShieldCheck, BarChart2, Upload,
  Layers, Activity, ChevronRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col bg-[#F0F4FF]">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#080F1E] overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-700/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-700/6 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36">

          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse-dot" />
              <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">Clinical AI Research Platform</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-bold text-white leading-[1.08] tracking-tight mb-6">
              Detect Cancer.<br />
              <span className="gradient-text">Earlier & Smarter.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Two specialised deep learning pipelines for liver tumor detection
              and lung cancer screening — powered by ResNet architectures trained
              on clinical CT data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
              <Link href="/scan?mode=liver"
                className="group flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-800/50">
                <Heart className="w-4 h-4" />
                Liver Tumor Scan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/scan?mode=lung"
                className="group flex items-center gap-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-900/40 hover:shadow-teal-800/50">
                <Wind className="w-4 h-4" />
                Lung Cancer Scan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { value: '2',        label: 'AI Pipelines',    sub: 'Liver + Lung' },
                { value: 'ResNet',   label: 'Architecture',    sub: '18 & 50 layers' },
                { value: '0.99',     label: 'Lung Threshold',  sub: 'High precision' },
                { value: 'Grad-CAM', label: 'Visualisation',   sub: 'Tumor heatmaps' },
              ].map(({ value, label, sub }) => (
                <div key={label} className="glass rounded-2xl p-4 text-center">
                  <div className="text-white font-bold text-xl mb-0.5">{value}</div>
                  <div className="text-slate-300 text-xs font-medium">{label}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#F0F4FF] to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════
          SCAN TYPE CARDS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Detection Modes</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Choose Your Scan Type</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">Each organ uses a specialised pipeline optimised for that modality</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Liver card */}
            <Link href="/scan?mode=liver" className="group block">
              <div className="relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/60 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-100 transition-colors" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      NIfTI + Image
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">Liver Tumor Detection</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Two-stage pipeline with liver verification and tumor classification across all NIfTI slices.
                  </p>

                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Stage 1 — Liver scan verification (ResNet18)',
                      'Stage 2 — Tumor classification (RGB ResNet18)',
                      'Grad-CAM activation heatmap on positive results',
                      'Full volumetric NIfTI analysis supported',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Start Liver Scan <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Lung card */}
            <Link href="/scan?mode=lung" className="group block">
              <div className="relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-100/60 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-teal-100 transition-colors" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200 group-hover:scale-105 transition-transform">
                      <Wind className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                      Image Only
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">Lung Cancer Detection</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Two-stage pipeline with lung image verification and high-precision cancer screening.
                  </p>

                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Stage 1 — Lung image classifier (ResNet18, PyTorch)',
                      'Stage 2 — Cancer detector (ResNet50, Keras)',
                      'High-precision threshold at 0.99 confidence',
                      'CT scans and chest X-rays accepted',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-1.5 text-teal-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Start Lung Scan <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Workflow</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">How It Works</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">From upload to clinical-grade prediction in seconds</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.667%+1.5rem)] right-[calc(16.667%+1.5rem)] h-px bg-gradient-to-r from-blue-100 via-indigo-200 to-blue-100" />

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01', icon: Upload, color: 'bg-blue-600 shadow-blue-200',
                  title: 'Upload Scan',
                  desc: 'Select your organ type and upload a CT scan. Liver supports NIfTI volumes and images; Lung accepts CT images and X-rays.',
                },
                {
                  step: '02', icon: Brain, color: 'bg-indigo-600 shadow-indigo-200',
                  title: 'Two-Stage Analysis',
                  desc: 'Stage 1 verifies the scan is the correct organ type. Stage 2 runs the specialised disease detection model.',
                },
                {
                  step: '03', icon: CheckCircle, color: 'bg-teal-600 shadow-teal-200',
                  title: 'Instant Results',
                  desc: 'Receive confidence scores, decision reasoning, and Grad-CAM visualisation (liver tumors) within seconds.',
                },
              ].map(({ step, icon: Icon, color, title, desc }) => (
                <div key={step} className="text-center">
                  <div className={`relative w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-5`}>
                    <Icon className="w-7 h-7 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-slate-600">{step}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PIPELINE ARCHITECTURE
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Architecture</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Two-Stage Pipelines</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto">Each pipeline independently validates then analyses the scan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Liver pipeline */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">Liver Pipeline</h3>
                  <p className="text-xs text-slate-400">LiTS dataset · NIfTI + Image</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Layers className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">Stage 1 — Verification</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['1-channel grayscale ResNet18', 'CLAHE contrast enhancement', 'Liver / Non-Liver classifier', '> 50% slice threshold to proceed'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-indigo-700 text-xs font-bold uppercase tracking-wider">Stage 2 — Detection</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['3-channel RGB ResNet18 + dropout FC', 'ImageNet normalisation', '70% slice threshold → high confidence', '11% affected ratio → Tumor verdict'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lung pipeline */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Wind className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">Lung Pipeline</h3>
                  <p className="text-xs text-slate-400">CT scans & X-rays · Image only</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-teal-50/80 border border-teal-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Layers className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-teal-700 text-xs font-bold uppercase tracking-wider">Stage 1 — Classifier</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['ResNet18 PyTorch classifier', 'Grayscale → 3-channel conversion', 'Lung / Non-Lung binary output', '> 50% probability to proceed'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1 h-1 rounded-full bg-teal-400 mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Stage 2 — Cancer Detection</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['ResNet50 Keras model (102 MB)', 'High-precision threshold: 0.99', 'Cancer / No Cancer binary output', 'Raw probability score returned'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: ShieldCheck, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
                title: 'Research-Grade Thresholds',
                desc: 'Detection thresholds match published research pipelines for both liver (70%/11%) and lung (0.99) models.',
              },
              {
                icon: Brain, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600',
                title: 'Grad-CAM Heatmaps',
                desc: 'Visual activation maps highlight the exact regions influencing tumor predictions — no black box decisions.',
              },
              {
                icon: BarChart2, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
                title: 'Evaluation Metrics',
                desc: 'Submit ground truth labels and track accuracy, precision, recall, F1 and confusion matrix in real time.',
              },
            ].map(({ icon: Icon, iconBg, iconColor, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-[14px]">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 bg-[#080F1E] overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/10" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to analyse a scan?
          </h2>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-md mx-auto">
            Upload your CT scan and receive AI-powered predictions in seconds. No setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/scan?mode=liver"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/40">
              <Heart className="w-4 h-4" /> Liver Scan
            </Link>
            <Link href="/scan?mode=lung"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-teal-900/40">
              <Wind className="w-4 h-4" /> Lung Scan
            </Link>
            <Link href="/register"
              className="flex items-center gap-2 glass hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
