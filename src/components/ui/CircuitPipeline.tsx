import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function CircuitPipeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  const milestones = [
    {
      title: 'DATASET & LABELS',
      desc: 'Thermal/RGB custom defect annotation',
      stat: 'YOLOv11-seg',
    },
    {
      title: 'CUDA OPTIMIZATION',
      desc: 'C++ runtime layers for edge GPU',
      stat: 'Nvidia Jetson',
    },
    {
      title: 'EDGE DEPLOYMENT',
      desc: 'Hardware integration & verification',
      stat: 'Raspberry Pi',
    },
    {
      title: 'NATIVE LINUX IPC',
      desc: 'High-throughput D-Bus replacement',
      stat: '<5ms Latency',
    },
  ]

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !pathRef.current) return

      const pathLength = pathRef.current.getTotalLength()

      // Initialize stroke for scroll draw
      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      // Draw stroke dynamically as user scrolls down the pipeline
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: 0.8,
        },
      })

      // Illuminate nodes as the stroke reaches them
      gsap.utils.toArray<HTMLElement>('.pipeline-node').forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0.3, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 65%',
              toggleActions: 'play reverse play reverse',
            },
          }
        )
      })
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="relative py-28 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-20 text-center">
        <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase block mb-3">
          // ARCHITECTURE PIPELINE
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          FROM RAW SILICON TO COMPOSITOR
        </h2>
      </div>

      <div className="relative">
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
              className="filter drop-shadow-[0_0_8px_#00f2fe]"
            />
          </svg>
        </div>

        {/* Milestone checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="pipeline-node glass-panel glass-panel-hover p-6 rounded-2xl border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {m.stat}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>VERIFIED RUNTIME</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
