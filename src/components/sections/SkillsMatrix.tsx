import { useRef } from 'react'
import { Icon } from '@iconify/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'
import {
  getPinnedOverflow,
  handleBoundedCardWheel,
  syncPinnedOverflow,
} from '../../utils/scrollPan'

gsap.registerPlugin(ScrollTrigger)

interface SkillCategory {
  icon: string
  title: string
  domain: string
  subtitle: string
  stat: string
  skills: string[]
}

const categories: SkillCategory[] = [
  {
    icon: 'solar:widget-4-bold-duotone',
    title: 'DESKTOP SHELL & PROTOCOLS',
    domain: 'WAYLAND & QT',
    subtitle: 'Custom Quickshell layer-shell surfaces, KDE Plasma 6 applets, and dynamic wallpaper plugin loaders.',
    stat: 'CAELESTIA-KDE',
    skills: ['C++', 'QML', 'Quickshell', 'Wayland', 'D-Bus', 'CMake'],
  },
  {
    icon: 'solar:cpu-bolt-bold-duotone',
    title: 'EDGE INFERENCE & CUDA',
    domain: 'GPU TOOLING',
    subtitle: 'Model weight quantization, TensorRT engine exports, and pinned frame buffers on constrained ARM64 boards.',
    stat: 'ARM64 & CUDA',
    skills: ['YOLOv11-seg', 'Ultralytics', 'PyTorch', 'CUDA', 'Jetson Nano', 'Raspberry Pi'],
  },
  {
    icon: 'solar:database-bold-duotone',
    title: 'SEMANTIC RETRIEVAL & LLMS',
    domain: 'VECTOR & INTENT',
    subtitle: 'Multi-turn outfit intent extraction, dense embedding pipelines, and sub-100ms FAISS index lookups.',
    stat: '44,441 ITEMS',
    skills: ['FAISS', 'SentenceTransformers', 'Ollama', 'SQLite', 'FastAPI', 'Uvicorn'],
  },
  {
    icon: 'solar:server-square-bold-duotone',
    title: 'ASYNC APIS & DATA PIPELINES',
    domain: 'SERVICES & STATE',
    subtitle: 'Live AQI alert scoring, persistent AI memory graphs, and vectorized data pipelines served over async endpoints.',
    stat: 'FASTAPI & FLASK',
    skills: ['FastAPI', 'Flask', 'Uvicorn', 'Backboard', 'NumPy', 'Pandas', 'asyncio'],
  },
  {
    icon: 'solar:code-square-bold-duotone',
    title: 'PACKAGING & LINUX AUTOMATION',
    domain: 'DEVOPS & SHELL',
    subtitle: 'Cross-distro Bash installers, Makefile targets, uv lockfiles, and containerized runtime builds.',
    stat: 'MULTI-DISTRO',
    skills: ['Linux', 'Bash', 'CMake', 'Makefile', 'Docker', 'uv', 'Git'],
  },
]

export function SkillsMatrix() {
  const sectionRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const stackWrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !sectionRef.current || !stackWrapperRef.current) return

      const cards = gsap.utils.toArray<HTMLElement>('.horizontal-stack-card')
      if (cards.length <= 1) return

      // Dynamic scroll distance tailored to window height + any zoomed overflow
      const getScrollDistance = () =>
        (cards.length - 1) * Math.min(window.innerHeight * 0.85, 700) +
        getPinnedOverflow(sectionRef.current)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            syncPinnedOverflow(sectionRef.current, innerRef.current, self.progress)
          },
          onRefresh: (self) => {
            syncPinnedOverflow(sectionRef.current, innerRef.current, self.progress, true)
          },
        },
      })

      // Initial positions: Card 0 is front; Cards 1..N start off-viewport right at opacity 1
      // Keeping all cards visibility:visible and opacity:1 avoids GPU layer upload flashes on mobile
      gsap.set(cards[0], {
        xPercent: 0,
        x: 0,
        scale: 1,
        opacity: 1,
        zIndex: 10,
      })

      for (let i = 1; i < cards.length; i++) {
        gsap.set(cards[i], {
          xPercent: 0,
          x: () => window.innerWidth,
          scale: 1,
          opacity: 1,
          zIndex: 10 + i,
        })
      }

      // Horizontal deck stacking timeline (pure GPU transform only; zero opacity/color/visibility changes)
      cards.forEach((card, i) => {
        if (i === 0) return

        const stepTime = (i - 1) * 1

        // Preceding cards shift left cleanly to form stacked edge tabs
        for (let prev = 0; prev < i; prev++) {
          const depth = i - prev
          tl.to(
            cards[prev],
            {
              xPercent: -2.5 * depth,
              ease: 'power2.inOut',
              duration: 1,
            },
            stepTime
          )
        }

        // Current card slides in smoothly using GPU translateX only
        tl.to(
          card,
          {
            x: 0,
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
      className="relative min-h-screen py-10 sm:py-16 px-4 sm:px-8 border-t border-white/5 flex flex-col justify-center overflow-x-clip"
    >
      <div ref={innerRef} className="w-full will-change-transform">
        {/* Editorial Header */}
        <div className="max-w-5xl mx-auto w-full mb-5 sm:mb-8">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
            <MaskedText text="SYSTEM TOOLING" wordClassName="skills-title-word" />
          </h2>
        </div>

        {/* Horizontal Stack Stage (Minimalist Glassmorphic Deck) */}
        <div
          ref={stackWrapperRef}
          className="relative max-w-5xl w-full mx-auto min-h-[400px] sm:min-h-[440px] lg:min-h-[420px] h-[min(540px,72dvh)]"
        >
        {categories.map((cat, idx) => (
          <article
            key={idx}
            onWheel={handleBoundedCardWheel}
            className="horizontal-stack-card absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl bg-[#0a0f18]/[0.96] sm:bg-[#0d111a]/82 p-5 sm:p-10 lg:p-12 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:backdrop-blur-2xl will-change-transform flex overflow-y-auto overflow-x-hidden group hover:border-cyan-400/40"
          >
            <div className="w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-start lg:items-center">
              {/* Left Column: Centered Solar Icon & Metric */}
              <div className="lg:col-span-4 flex lg:flex-col items-center justify-between lg:justify-center gap-3 sm:gap-4 text-center">
                <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-cyan-500/[0.08] border border-cyan-400/25 flex items-center justify-center text-cyan-300 shadow-[0_0_28px_rgba(0,242,254,0.14)] group-hover:border-cyan-300/50 group-hover:text-cyan-200 transition-colors duration-300">
                  <Icon icon={cat.icon} className="w-7 h-7 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
                </div>
                <span className="text-xs sm:text-base font-mono font-semibold uppercase tracking-widest text-cyan-300/90 lg:mt-2 text-center">
                  {cat.stat}
                </span>
              </div>

              {/* Right Column: Bold Typographic Hierarchy & Container Chips */}
              <div className="lg:col-span-8">
                <span className="block text-xs sm:text-base font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5 sm:mb-3">
                  {cat.domain}
                </span>

                <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2.5 sm:mb-4 group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
                  {cat.title}
                </h3>

                <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-4 sm:mb-6">
                  {cat.subtitle}
                </p>

                {/* Minimalist Glass Containers for Tooling & Languages */}
                <div className="pt-3.5 sm:pt-5 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-3">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-xs sm:text-base font-mono font-medium bg-white/[0.06] text-slate-100 border border-white/15 group-hover:border-cyan-400/35 hover:border-cyan-300 hover:text-cyan-300 transition-colors duration-200"
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
      </div>
    </section>
  )
}
