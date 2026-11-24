import { useRef } from 'react'
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
  skills: string[]
}

const categories: SkillCategory[] = [
  {
    number: '01',
    title: 'SYSTEMS & COMPOSITORS',
    domain: 'NATIVE RUNTIMES',
    subtitle: 'Native Wayland compositors, lock-free sockets, and strict memory layouts.',
    stat: '<5ms IPC LATENCY',
    skills: ['C++', 'C', 'QML', 'Wayland', 'D-Bus', 'POSIX Threads', 'Valgrind'],
  },
  {
    number: '02',
    title: 'GPU KERNELS & PARALLELISM',
    domain: 'HARDWARE COMPUTE',
    subtitle: 'Custom CUDA kernels and TensorRT engines built to saturate device memory bandwidth.',
    stat: 'BANDWIDTH BOUND',
    skills: ['CUDA', 'TensorRT', 'cuBLAS', 'SIMD', 'PTX', 'Nsight Compute'],
  },
  {
    number: '03',
    title: 'EDGE COMPUTER VISION',
    domain: 'EMBEDDED INFERENCE',
    subtitle: 'Real-time thermal defect segmentation holding frame rate on Jetson and Raspberry Pi.',
    stat: "9th ICRTAC'26",
    skills: ['YOLOv11-seg', 'Ultralytics', 'PyTorch', 'OpenCV', 'Jetson Nano', 'Raspberry Pi'],
  },
  {
    number: '04',
    title: 'VECTOR INDEXING & LOCAL LLMS',
    domain: 'SEMANTIC RETRIEVAL',
    subtitle: 'Sub-100ms vector lookups across 44,441 records with local model orchestration.',
    stat: '44,441 VECTORS',
    skills: ['FAISS', 'FastAPI', 'Ollama', 'SentenceTransformers', 'SQLite', 'asyncio'],
  },
  {
    number: '05',
    title: 'LINUX TOOLING & DIAGNOSTICS',
    domain: 'SYSTEM RELIABILITY',
    subtitle: 'Kernel configuration, reproducible containers, and automated memory leak audits.',
    stat: 'ZERO LEAK POLICY',
    skills: ['Linux Kernel', 'CMake', 'Docker', 'Git', 'GDB', 'Valgrind', 'Bash'],
  },
]

export function SkillsMatrix() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackWrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !sectionRef.current || !stackWrapperRef.current) return

      const cards = gsap.utils.toArray<HTMLElement>('.horizontal-stack-card')
      if (cards.length <= 1) return

      // Dynamic scroll distance tailored to window height
      const getScrollDistance = () => (cards.length - 1) * Math.min(window.innerHeight * 0.85, 700)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
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
        // Avoid CSS `filter` on backdrop-blur elements (prevents black compositor artifact)
        for (let prev = 0; prev < i; prev++) {
          const depth = i - prev
          tl.to(
            cards[prev],
            {
              xPercent: -4 * depth,
              scale: Math.max(0.86, 1 - depth * 0.035),
              opacity: Math.max(0.45, 1 - depth * 0.16),
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
      {/* Editorial Header */}
      <div className="max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center gap-3 font-mono text-cyan-400 text-sm sm:text-base mb-4">
          <span className="w-12 h-[1px] bg-cyan-400" />
          <ScrambleText text="02 • TOOLING MATRIX" />
          <span className="w-12 h-[1px] bg-cyan-400" />
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          <MaskedText text="SYSTEM TOOLING" wordClassName="skills-title-word" />
        </h2>
      </div>

      {/* Horizontal Stack Stage (Minimalist Glassmorphic Deck) */}
      <div
        ref={stackWrapperRef}
        className="relative max-w-5xl w-full mx-auto h-[500px] sm:h-[440px] lg:h-[420px] max-h-[75vh]"
      >
        {categories.map((cat, idx) => (
          <article
            key={idx}
            className="horizontal-stack-card absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl bg-[#07101d]/60 p-6 sm:p-10 lg:p-12 border border-white/15 shadow-[-25px_0_50px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.14)] backdrop-blur-3xl will-change-transform flex items-center overflow-hidden group hover:border-cyan-400/40 transition-colors duration-300"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start lg:items-center">
              {/* Left Column: Minimalist Index & Metric */}
              <div className="lg:col-span-4 flex lg:flex-col items-baseline lg:items-start justify-between gap-2">
                <span className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tighter text-cyan-400/25 group-hover:text-cyan-400/45 transition-colors duration-300 leading-none">
                  {cat.number}
                </span>
                <span className="text-sm sm:text-base font-mono font-semibold uppercase tracking-widest text-cyan-300/90 lg:mt-4">
                  {cat.stat}
                </span>
              </div>

              {/* Right Column: Bold Typographic Hierarchy & Container Chips */}
              <div className="lg:col-span-8">
                <span className="block text-sm sm:text-base font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2 sm:mb-3">
                  {cat.domain}
                </span>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3 sm:mb-4 group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
                  {cat.title}
                </h3>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-6">
                  {cat.subtitle}
                </p>

                {/* Minimalist Glass Containers for Tooling & Languages */}
                <div className="pt-4 sm:pt-5 border-t border-white/10 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3.5 py-1.5 rounded-lg text-sm sm:text-base font-mono font-medium bg-white/[0.05] text-slate-100 border border-white/15 backdrop-blur-md group-hover:border-cyan-400/35 hover:border-cyan-300 hover:text-cyan-300 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
