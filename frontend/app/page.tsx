import Link from 'next/link'
import {
  ArrowRight, Heart, Wind, CheckCircle,
  Brain, ShieldCheck, BarChart2, Upload,
  Layers, Activity, ChevronRight, ScanLine, Zap,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60" />
        <div className="absolute top-0 left-1/3 w-[800px] h-[600px] bg-[#00C2FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#818CF8]/4 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 md:pt-32 md:pb-36">

          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 bg-[#00C2FF] rounded-full animate-pulse-dot" />
              <span className="text-[#00C2FF] text-xs font-semibold tracking-widest uppercase">Clinical AI Research Platform</span>
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
                className="group flex items-center gap-2.5 bg-[#818CF8] hover:bg-[#6D6FD4] text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#818CF8]/20 hover:shadow-[#818CF8]/30">
                <Heart className="w-4 h-4" />
                Liver Tumor Scan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/scan?mode=lung"
                className="group flex items-center gap-2.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#08090F] font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#2DD4BF]/20">
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
                <div key={label} className="bg-[#0F1018] border border-[#1E2130] rounded-2xl p-4 text-center">
                  <div className="text-white font-bold text-xl mb-0.5">{value}</div>
                  <div className="text-slate-400 text-xs font-medium">{label}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SCAN TYPE CARDS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#00C2FF] text-xs font-bold uppercase tracking-widest">Detection Modes</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Choose Your Scan Type</h2>
            <p className="text-slate-400 mt-3 text-sm max-w-md mx-auto">Each organ uses a specialised pipeline optimised for that modality</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Liver card */}
            <Link href="/scan?mode=liver" className="group block">
              <div className="relative bg-[#0F1018] border border-[#1E2130] rounded-3xl p-8 hover:border-[#818CF8]/40 hover:shadow-[0_0_40px_rgba(129,140,248,0.08)] transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#818CF8]/4 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#818CF8]/8 transition-colors" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-[#818CF8] rounded-2xl flex items-center justify-center shadow-md shadow-[#818CF8]/25 group-hover:scale-105 transition-transform">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#818CF8] bg-[#818CF8]/10 border border-[#818CF8]/25 px-3 py-1 rounded-full">
                      NIfTI + Image
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">Liver Tumor Detection</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Two-stage pipeline with liver verification and tumor classification across all NIfTI slices.
                  </p>

                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Stage 1 — Liver scan verification (ResNet18)',
                      'Stage 2 — Tumor classification (RGB ResNet18)',
                      'Grad-CAM activation heatmap on positive results',
                      'Full volumetric NIfTI analysis supported',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-[#818CF8] mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-1.5 text-[#818CF8] font-semibold text-sm group-hover:gap-2.5 transition-all">
                    Start Liver Scan <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Lung card */}
            <Link href="/scan?mode=lung" className="group block">
              <div className="relative bg-[#0F1018] border border-[#1E2130] rounded-3xl p-8 hover:border-[#2DD4BF]/40 hover:shadow-[0_0_40px_rgba(45,212,191,0.08)] transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#2DD4BF]/4 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#2DD4BF]/8 transition-colors" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-[#2DD4BF] rounded-2xl flex items-center justify-center shadow-md shadow-[#2DD4BF]/25 group-hover:scale-105 transition-transform">
                      <Wind className="w-7 h-7 text-[#08090F]" />
                    </div>
                    <span className="text-xs font-semibold text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 px-3 py-1 rounded-full">
                      Image Only
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">Lung Cancer Detection</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Two-stage pipeline with lung image verification and high-precision cancer screening.
                  </p>

                  <ul className="space-y-2.5 mb-7">
                    {[
                      'Stage 1 — Lung image classifier (ResNet18, PyTorch)',
                      'Stage 2 — Cancer detector (ResNet50, Keras)',
                      'High-precision threshold at 0.99 confidence',
                      'CT scans and chest X-rays accepted',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-[#2DD4BF] mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-1.5 text-[#2DD4BF] font-semibold text-sm group-hover:gap-2.5 transition-all">
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
      <section className="py-20 px-6 bg-[#0A0B14]/60 border-y border-[#161824]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#00C2FF] text-xs font-bold uppercase tracking-widest">Workflow</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">How It Works</h2>
            <p className="text-slate-400 mt-3 text-sm max-w-md mx-auto">From upload to clinical-grade prediction in seconds</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(16.667%+1.5rem)] right-[calc(16.667%+1.5rem)] h-px bg-gradient-to-r from-transparent via-[#1E2130] to-transparent" />

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01', icon: Upload, color: 'bg-[#818CF8] shadow-[#818CF8]/20',
                  title: 'Upload Scan',
                  desc: 'Select your organ type and upload a CT scan. Liver supports NIfTI volumes and images; Lung accepts CT images and X-rays.',
                },
                {
                  step: '02', icon: Brain, color: 'bg-[#00C2FF] shadow-[#00C2FF]/20',
                  title: 'Two-Stage Analysis',
                  desc: 'Stage 1 verifies the scan is the correct organ type. Stage 2 runs the specialised disease detection model.',
                },
                {
                  step: '03', icon: CheckCircle, color: 'bg-[#2DD4BF] shadow-[#2DD4BF]/20',
                  title: 'Instant Results',
                  desc: 'Receive confidence scores, decision reasoning, and Grad-CAM visualisation (liver tumors) within seconds.',
                },
              ].map(({ step, icon: Icon, color, title, desc }) => (
                <div key={step} className="text-center">
                  <div className={`relative w-16 h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-5`}>
                    <Icon className="w-7 h-7 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0F1018] border border-[#1E2130] rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-[#00C2FF]">{step}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
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
            <span className="text-[#00C2FF] text-xs font-bold uppercase tracking-widest">Architecture</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Two-Stage Pipelines</h2>
            <p className="text-slate-400 mt-3 text-sm max-w-md mx-auto">Each pipeline independently validates then analyses the scan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Liver pipeline */}
            <div className="bg-[#0F1018] border border-[#1E2130] rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-[#818CF8]/15 border border-[#818CF8]/25 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#818CF8]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px]">Liver Pipeline</h3>
                  <p className="text-xs text-slate-500">LiTS dataset · NIfTI + Image</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#818CF8]/8 border border-[#818CF8]/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#818CF8] rounded-lg flex items-center justify-center">
                      <Layers className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[#818CF8] text-xs font-bold uppercase tracking-wider">Stage 1 — Verification</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['1-channel grayscale ResNet18', 'CLAHE contrast enhancement', 'Liver / Non-Liver classifier', '> 50% slice threshold to proceed'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-[#818CF8] mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#818CF8]/12 border border-[#818CF8]/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#6D6FD4] rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[#A5B4FC] text-xs font-bold uppercase tracking-wider">Stage 2 — Detection</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['3-channel RGB ResNet18 + dropout FC', 'ImageNet normalisation', '70% slice threshold → high confidence', '11% affected ratio → Tumor verdict'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-[#A5B4FC] mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lung pipeline */}
            <div className="bg-[#0F1018] border border-[#1E2130] rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-[#2DD4BF]/15 border border-[#2DD4BF]/25 rounded-xl flex items-center justify-center">
                  <Wind className="w-5 h-5 text-[#2DD4BF]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px]">Lung Pipeline</h3>
                  <p className="text-xs text-slate-500">CT scans & X-rays · Image only</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#2DD4BF]/8 border border-[#2DD4BF]/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#2DD4BF] rounded-lg flex items-center justify-center">
                      <Layers className="w-3 h-3 text-[#08090F]" />
                    </div>
                    <span className="text-[#2DD4BF] text-xs font-bold uppercase tracking-wider">Stage 1 — Classifier</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['ResNet18 PyTorch classifier', 'Grayscale → 3-channel conversion', 'Lung / Non-Lung binary output', '> 90% probability to proceed'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-[#2DD4BF] mt-2 shrink-0" />{i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#34D399]/8 border border-[#34D399]/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#34D399] rounded-lg flex items-center justify-center">
                      <Activity className="w-3 h-3 text-[#08090F]" />
                    </div>
                    <span className="text-[#34D399] text-xs font-bold uppercase tracking-wider">Stage 2 — Cancer Detection</span>
                  </div>
                  <ul className="space-y-1.5">
                    {['ResNet50 Keras model (102 MB)', 'High-precision threshold: 0.99', 'Cancer / No Cancer binary output', 'Raw probability score returned'].map(i => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-[#34D399] mt-2 shrink-0" />{i}
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
      <section className="py-16 px-6 bg-[#0A0B14]/60 border-t border-[#161824]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: ShieldCheck, iconBg: 'bg-[#00C2FF]/10 border-[#00C2FF]/20', iconColor: 'text-[#00C2FF]',
                title: 'Research-Grade Thresholds',
                desc: 'Detection thresholds match published research pipelines for both liver (70%/11%) and lung (0.99) models.',
              },
              {
                icon: Brain, iconBg: 'bg-[#818CF8]/10 border-[#818CF8]/20', iconColor: 'text-[#818CF8]',
                title: 'Grad-CAM Heatmaps',
                desc: 'Visual activation maps highlight the exact regions influencing tumor predictions — no black box decisions.',
              },
              {
                icon: BarChart2, iconBg: 'bg-[#2DD4BF]/10 border-[#2DD4BF]/20', iconColor: 'text-[#2DD4BF]',
                title: 'Evaluation Metrics',
                desc: 'Submit ground truth labels and track accuracy, precision, recall, F1 and confusion matrix in real time.',
              },
            ].map(({ icon: Icon, iconBg, iconColor, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 rounded-2xl border border-[#1E2130] bg-[#0F1018] hover:border-[#282B40] transition-all">
                <div className={`w-10 h-10 ${iconBg} border rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1 text-[14px]">{title}</h3>
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
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C2FF]/5 via-transparent to-[#818CF8]/4" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#00C2FF]/10 border border-[#00C2FF]/20 rounded-full px-3.5 py-1.5 mb-7">
            <Zap className="w-3.5 h-3.5 text-[#00C2FF]" />
            <span className="text-[#00C2FF] text-xs font-bold uppercase tracking-widest">Get Started Now</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to analyse a scan?
          </h2>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-md mx-auto">
            Upload your CT scan and receive AI-powered predictions in seconds. No setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/scan?mode=liver"
              className="flex items-center gap-2 bg-[#818CF8] hover:bg-[#6D6FD4] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#818CF8]/20">
              <Heart className="w-4 h-4" /> Liver Scan
            </Link>
            <Link href="/scan?mode=lung"
              className="flex items-center gap-2 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#08090F] font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#2DD4BF]/15">
              <Wind className="w-4 h-4" /> Lung Scan
            </Link>
            <Link href="/register"
              className="flex items-center gap-2 border border-[#1E2130] hover:border-[#282B40] hover:bg-[#131420] text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all">
              <ScanLine className="w-4 h-4" /> Get Started Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
