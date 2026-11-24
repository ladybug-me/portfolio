import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function CircuitPipeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [circuitProgress, setCircuitProgress] = useState<number>(0)

  const milestones = [
    {
      title: 'THERMAL DATASETS',
      desc: 'Defect classification and segmentation on custom solar imagery.',
      stat: 'YOLOv11-seg',
    },
    {
      title: 'CUDA KERNELS',
      desc: 'Memory bandwidth profiling and custom runtime layers for Nvidia Jetson.',
      stat: 'TensorRT & C++',
    },
    {
      title: 'CONSTRAINED SILICON',
      desc: 'Live defect quantification running under tight thermal budgets.',
      stat: 'Raspberry Pi',
    },
    {
      title: 'NATIVE IPC',
      desc: 'Replacing Python D-Bus bridges with asynchronous C++ event loops.',
      stat: '<5ms Latency',
    },
  ]

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !pathRef.current || !containerRef.current) return

      const pathLength = pathRef.current.getTotalLength()

      // Initialize SVG stroke for scroll draw
      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      const totalSteps = milestones.length

      // Pin section and scrub both the circuit trace and progressive milestone activation
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=1100',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setCircuitProgress(self.progress)
          if (pathRef.current) {
            gsap.set(pathRef.current, {
              strokeDashoffset: pathLength * (1 - self.progress),
            })
          }
          const currentStep = Math.min(
            Math.floor(self.progress * totalSteps),
            totalSteps - 1
          )
          setActiveStep(currentStep)
        },
      })
    },
    { scope: containerRef }
  )

  const isComplete = circuitProgress >= 0.88

  return (
    <section
      ref={containerRef}
      id="pipeline"
      className="relative min-h-screen py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-center overflow-hidden border-t border-white/5"
    >
      {/* Header & Circuit Status Indicator */}
      <div className="mb-10 sm:mb-14 text-center max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between font-mono text-xs mb-3 text-cyan-400">
          <span className="tracking-widest uppercase">ARCHITECTURE PIPELINE</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span>ACTIVE MILESTONES:</span>
            <span className="font-bold text-white px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              0{activeStep + 1} / 0{milestones.length}
            </span>
          </div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          FROM RAW SILICON TO THE DISPLAY
        </h2>

        {/* Global Pipeline Scrub Track */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-3 max-w-md mx-auto">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-all duration-150 ease-out"
            style={{ width: `${Math.max(12, circuitProgress * 100)}%` }}
          />
        </div>
      </div>

      <div className="relative w-full">
        {/* Scroll-drawn SVG pipeline line */}
        <div className="hidden lg:block absolute top-[44px] left-8 right-8 z-0 pointer-events-none">
          <svg viewBox="0 0 1000 60" fill="none" className="w-full h-auto overflow-visible">
            {/* Background trace track */}
            <path
              d="M 20,30 Q 250,55 500,30 T 980,30"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            {/* Active drawn circuit line */}
            <path
              ref={pathRef}
              d="M 20,30 Q 250,55 500,30 T 980,30"
              stroke="#00f2fe"
              strokeWidth="4"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_10px_#00f2fe]"
            />
          </svg>
        </div>

        {/* Milestone checkpoints - already viewed cards remain illuminated and visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {milestones.map((m, idx) => {
            const isReached = idx <= activeStep
            const isCurrent = idx === activeStep

            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all duration-500 flex flex-col justify-between ${
                  isReached
                    ? 'glass-panel border-cyan-400/50 bg-slate-900/90 shadow-[0_10px_35px_rgba(0,242,254,0.15)] scale-[1.01]'
                    : 'bg-white/[0.02] border-white/5 opacity-35 scale-[0.98]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? 'bg-cyan-500/30 border-2 border-cyan-400 text-white shadow-[0_0_15px_#00f2fe]'
                          : isReached
                            ? 'bg-cyan-950/80 border border-cyan-400/40 text-cyan-300'
                            : 'bg-white/5 border border-white/10 text-slate-500'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                        isReached
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-slate-500 border-white/5'
                      }`}
                    >
                      {m.stat}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-bold mb-2 transition-colors ${
                      isReached ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{m.desc}</p>
                </div>

                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between text-[10px] font-mono transition-colors ${
                    isReached ? 'border-cyan-500/20 text-cyan-300' : 'border-white/5 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCurrent
                          ? 'bg-cyan-400 animate-ping'
                          : isReached
                            ? 'bg-cyan-400'
                            : 'bg-slate-700'
                      }`}
                    />
                    <span>{isReached ? 'STAGE ENERGIZED' : 'STANDBY'}</span>
                  </div>

                  {isReached && (
                    <span className="text-emerald-400 text-[9px] uppercase tracking-wider font-semibold">
                      READY
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Completion status note */}
      <div className="mt-10 text-center font-mono text-xs text-slate-400">
        <span
          className={`transition-colors duration-300 ${
            isComplete ? 'text-emerald-400 font-bold' : 'text-slate-500'
          }`}
        >
          {isComplete
            ? 'CIRCUIT SYNCHRONIZED • PROCEEDING TO PROJECTS'
            : 'SCROLL TO ENERGIZE PIPELINE STAGES'}
        </span>
      </div>
    </section>
  )
}
