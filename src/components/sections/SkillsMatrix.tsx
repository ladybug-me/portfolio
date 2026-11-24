import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

gsap.registerPlugin(ScrollTrigger)

interface SkillCategory {
  number: string
  title: string
  domain: string
  subtitle: string
  stat: string
  statLabel: string
  skills: string[]
  color: string
  badgeBorder: string
  statBg: string
}

const categories: SkillCategory[] = [
  {
    number: '01',
    title: 'LOW-LEVEL SYSTEMS & GRAPHICS',
    domain: 'SYSTEMS ARCHITECTURE',
    subtitle:
      'High-throughput Linux compositor architectures, low-latency IPC bridges, and memory-safe native runtimes.',
    stat: '<5ms IPC LATENCY',
    statLabel: 'Direct C++ / QML Event Loops',
    skills: ['C++', 'C', 'QML', 'Linux Compositors', 'D-Bus / IPC', 'Wayland', 'Memory Layout', 'GDB / Valgrind'],
    color: 'text-cyan-400 border-cyan-400/40',
    badgeBorder: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
    statBg: 'bg-cyan-950/40 border-cyan-400/30 text-cyan-300',
  },
  {
    number: '02',
    title: 'CUDA & PARALLEL ACCELERATION',
    domain: 'HARDWARE PARALLELISM',
    subtitle:
      'Custom GPU kernels and TensorRT inference pipelines engineered for deterministic low-power edge compute.',
    stat: 'PARALLEL KERNELS',
    statLabel: 'Optimized Memory Bandwidth',
    skills: ['CUDA', 'C++ Runtime', 'TensorRT', 'GPU Thread Scheduling', 'Memory Bandwidth', 'Shared Memory', 'SIMD'],
    color: 'text-emerald-400 border-emerald-400/40',
    badgeBorder: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    statBg: 'bg-emerald-950/40 border-emerald-400/30 text-emerald-300',
  },
  {
    number: '03',
    title: 'EDGE COMPUTER VISION',
    domain: 'EMBEDDED INTELLIGENCE',
    subtitle:
      'Real-time instance segmentation optimized for Jetson Nano, Raspberry Pi, and industrial thermal sensors.',
    stat: 'JETSON & PI HARDWARE',
    statLabel: '9th ICRTAC’26 Paper Author',
    skills: ['YOLOv11-seg', 'Ultralytics', 'PyTorch', 'Thermal Imaging', 'Instance Masks', 'ONNX Runtime', 'Embedded Linux'],
    color: 'text-teal-400 border-teal-400/40',
    badgeBorder: 'border-teal-400/30 bg-teal-500/10 text-teal-300',
    statBg: 'bg-teal-950/40 border-teal-400/30 text-teal-300',
  },
  {
    number: '04',
    title: 'VECTOR SEARCH & LOCAL LLMS',
    domain: 'SEMANTIC RETRIEVAL',
    subtitle:
      'Sub-100ms vector search indexing across 44,441 catalog items with Ollama local inference and embeddings.',
    stat: '44,441 FAISS VECTORS',
    statLabel: 'Sub-100ms Query Latency',
    skills: ['FAISS Indexing', 'FastAPI', 'Ollama LLMs', 'Sentence Transformers', 'SQLite Vectors', 'Async Python'],
    color: 'text-sky-400 border-sky-400/40',
    badgeBorder: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
    statBg: 'bg-sky-950/40 border-sky-400/30 text-sky-300',
  },
  {
    number: '05',
    title: 'INFRASTRUCTURE & KERNEL TOOLING',
    domain: 'RELIABILITY & PLATFORMS',
    subtitle:
      'Reproducible containerization, Linux kernel configuration, and automated Valgrind leak detection pipelines.',
    stat: 'ZERO LEAK STANDARD',
    statLabel: 'Automated CI & Strict Valgrind Checks',
    skills: ['Linux Kernel', 'Docker', 'Git / GitHub', 'Bash Automation', 'Valgrind / GDB', 'SQL / SQLite', 'CMake'],
    color: 'text-purple-400 border-purple-400/40',
    badgeBorder: 'border-purple-400/30 bg-purple-500/10 text-purple-300',
    statBg: 'bg-purple-950/40 border-purple-400/30 text-purple-300',
  },
]

export function SkillsMatrix() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackWrapperRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const [stackProgress, setStackProgress] = useState<number>(0)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !sectionRef.current || !stackWrapperRef.current) return

      const cards = gsap.utils.toArray<HTMLElement>('.horizontal-stack-card')
      if (cards.length <= 1) return

      // Pin duration: 750px per card step
      const scrollDistance = (cards.length - 1) * 750

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setStackProgress(self.progress)
            const newIndex = Math.min(
              Math.floor(self.progress * cards.length),
              cards.length - 1
            )
            setActiveIdx(newIndex)
          },
        },
      })

      // Initial positions: Card 0 is front & zoomed in; Cards 1..N start offscreen to the right
      gsap.set(cards[0], {
        xPercent: 0,
        scale: 1,
        opacity: 1,
        zIndex: 10,
      })

      for (let i = 1; i < cards.length; i++) {
        gsap.set(cards[i], {
          xPercent: 115,
          scale: 0.95,
          opacity: 0,
          zIndex: 10 + i,
        })
      }

      // Horizontal deck stacking timeline
      cards.forEach((card, i) => {
        if (i === 0) return

        const stepTime = (i - 1) * 1

        // All preceding cards scale down slightly and shift left to form the stack
        for (let prev = 0; prev < i; prev++) {
          const depth = i - prev
          tl.to(
            cards[prev],
            {
              xPercent: -3.5 * depth,
              scale: Math.max(0.85, 1 - depth * 0.04),
              opacity: Math.max(0.25, 1 - depth * 0.22),
              filter: `brightness(${Math.max(0.45, 1 - depth * 0.2)})`,
              ease: 'power2.inOut',
              duration: 1,
            },
            stepTime
          )
        }

        // Current card enters from right, zoomed in at full focal scale
        tl.to(
          card,
          {
            xPercent: 0,
            scale: 1,
            opacity: 1,
            filter: 'brightness(1)',
            ease: 'power2.out',
            duration: 1,
          },
          stepTime
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative min-h-screen py-20 px-4 sm:px-8 border-t border-white/5 flex flex-col justify-center overflow-hidden"
    >
      {/* Editorial Header & Live Stack Indicator */}
      <div className="max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 font-mono text-cyan-400 text-xs">
            <span className="w-12 h-[1px] bg-cyan-400" />
            <ScrambleText text="02 // HORIZONTAL CAPABILITIES STACK" />
          </div>

          {/* Active Card Pill Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 hidden sm:inline">STACK STAGE</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
              0{activeIdx + 1} / 0{categories.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
            <MaskedText text="CORE CAPABILITIES" wordClassName="skills-title-word" />
          </h2>

          {/* Segmented Deck Progress Bar */}
          <div className="flex items-center gap-1.5 w-36 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden self-start sm:self-end mb-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150"
              style={{ width: `${Math.max(15, stackProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Stack Stage (Zoomed-in focal deck) */}
      <div
        ref={stackWrapperRef}
        className="relative max-w-5xl w-full mx-auto h-[540px] sm:h-[480px] lg:h-[450px]"
      >
        {categories.map((cat, idx) => (
          <article
            key={idx}
            className="horizontal-stack-card absolute inset-0 w-full h-full rounded-3xl glass-panel p-6 sm:p-10 lg:p-12 border border-white/10 shadow-[-25px_0_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl will-change-transform flex flex-col justify-between overflow-hidden group hover:border-cyan-400/40 transition-colors"
          >
            {/* Top Row: Domain Badge & Status */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-mono border ${cat.badgeBorder}`}>
                  {cat.domain}
                </span>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                  HARDWARE VALIDATED
                </span>
              </div>

              <span className={`px-3 py-1 rounded-lg text-xs font-mono border ${cat.statBg}`}>
                {cat.stat}
              </span>
            </div>

            {/* Middle Grid: Massive Index, Stat Label & Narrative */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-2">
              {/* Left Column: Number & Stat Context */}
              <div className="lg:col-span-4 flex lg:flex-col items-center lg:items-start justify-between">
                <span className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono text-cyan-500/25 group-hover:text-cyan-400/40 transition-colors">
                  {cat.number}
                </span>
                <div className="mt-2 text-right lg:text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                    BENCHMARK SPEC
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-slate-300 font-semibold">
                    {cat.statLabel}
                  </span>
                </div>
              </div>

              {/* Right Column: Title, Subtitle & Skill Badges */}
              <div className="lg:col-span-8">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 group-hover:text-cyan-300 transition-colors leading-tight">
                  {cat.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed mb-6">
                  {cat.subtitle}
                </p>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 text-slate-200 border border-white/10 group-hover:border-cyan-500/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Stamp */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>SYSTEM DISCIPLINE // PRODUCTION READY</span>
              </span>
              <span className="text-cyan-400">
                STACK 0{idx + 1} OF 0{categories.length} ➔
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
