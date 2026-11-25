import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { usePalette } from '../../theme/palettes'
import { getPinnedOverflow, syncPinnedOverflow } from '../../utils/scrollPan'
import { PixelDispersionCanvas } from '../ui/PixelDispersionCanvas'

gsap.registerPlugin(ScrollTrigger, SplitText)

const MILESTONES = [
  {
    num: '01',
    title: 'C / C++',
    desc: 'Native Wayland IPC, compositor loops, and deterministic memory layouts.',
    tag: 'SYSTEMS',
  },
  {
    num: '02',
    title: 'PYTHON',
    desc: 'YOLOv11 vision pipelines, FastAPI services, and FAISS vector indexing.',
    tag: 'AI & BACKEND',
  },
  {
    num: '03',
    title: 'JAVA / SQL',
    desc: 'Strongly typed OOP architectures and structured relational schemas.',
    tag: 'CORE & DATA',
  },
  {
    num: '04',
    title: 'QML / BASH',
    desc: 'Declarative Linux shell UI in Caelestia and automated system scripting.',
    tag: 'SHELL & UI',
  },
]

export function PipelineSection() {
  const palette = usePalette()
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [activeStep, setActiveStep] = useState<number>(0)
  const entryProgressRef = useRef<number>(0)
  const scrollProgressRef = useRef<number>(0)
  const needsRenderRef = useRef<boolean>(true)
  const textTimelinesRef = useRef<(gsap.core.Timeline | null)[]>([])
  const textPlayedRef = useRef<boolean[]>([false, false, false, false])

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!pathRef.current || !containerRef.current) return

      const pathLength = pathRef.current.getTotalLength()

      if (prefersReducedMotion) {
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: 0 })
        cardsRef.current.forEach((card) => {
          if (card) {
            card.style.opacity = '1'
            card.style.visibility = 'visible'
          }
        })
        setActiveStep(MILESTONES.length - 1)
        return
      }

      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      // Create GSAP SplitText kinetic text loading timelines per card
      textTimelinesRef.current = cardsRef.current.map((card) => {
        if (!card) return null
        const titleEl = card.querySelector<HTMLElement>('[data-piece="title"]')
        const descEl = card.querySelector<HTMLElement>('[data-piece="desc"]')
        if (!titleEl || !descEl) return null

        const titleSplit = SplitText.create(titleEl, { type: 'chars', mask: 'chars' })
        const descSplit = SplitText.create(descEl, { type: 'words', mask: 'words' })

        const textTl = gsap.timeline({ paused: true })
        textTl
          .from(titleSplit.chars, {
            yPercent: 115,
            opacity: 0,
            stagger: 0.03,
            duration: 0.45,
            ease: 'power3.out',
          })
          .from(
            descSplit.words,
            {
              yPercent: 100,
              opacity: 0,
              stagger: 0.018,
              duration: 0.35,
              ease: 'power2.out',
            },
            '-=0.22'
          )
        return textTl
      })

      // Hide DOM cards initially; canvas particles assemble each sequentially
      cardsRef.current.forEach((card) => {
        if (card) {
          card.style.opacity = '0'
          card.style.visibility = 'hidden'
        }
      })

      // Pre-engage card 0 pixel construction once #pipeline scrolls halfway into view
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 55%',
        end: 'top top',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          entryProgressRef.current = self.progress
          needsRenderRef.current = true
        },
        onRefresh: (self) => {
          entryProgressRef.current = self.progress
          needsRenderRef.current = true
        },
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${2800 + getPinnedOverflow(containerRef.current)}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress
            needsRenderRef.current = true
            syncPinnedOverflow(containerRef.current, innerRef.current, self.progress)
            const step = Math.min(
              MILESTONES.length - 1,
              Math.floor(Math.min(1, self.progress / 0.82) * MILESTONES.length)
            )
            setActiveStep((prev) => (prev !== step ? step : prev))
          },
          onRefresh: (self) => {
            scrollProgressRef.current = self.progress
            needsRenderRef.current = true
            syncPinnedOverflow(containerRef.current, innerRef.current, self.progress, true)
          },
        },
      })

      tl.to(
        pathRef.current,
        {
          strokeDashoffset: 0,
          ease: 'none',
          duration: MILESTONES.length,
        },
        0
      ).to({}, { duration: 0.88 })
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      id="pipeline"
      className="relative w-full h-screen flex flex-col overflow-clip border-t border-white/5"
    >
      <PixelDispersionCanvas
        containerRef={containerRef}
        cardsRef={cardsRef}
        items={MILESTONES}
        paletteId={palette.id}
        entryProgressRef={entryProgressRef}
        scrollProgressRef={scrollProgressRef}
        needsRenderRef={needsRenderRef}
        textTimelinesRef={textTimelinesRef}
        textPlayedRef={textPlayedRef}
      />

      <div ref={innerRef} className="relative w-full max-w-7xl mx-auto my-auto py-12 sm:py-16 px-4 sm:px-8 will-change-transform">
        <div className="relative">
          {/* Scroll-drawn SVG pipeline line anchored vertically at container center */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-12 right-12 z-0 pointer-events-none">
            <svg viewBox="0 0 1000 60" fill="none" className="w-full h-auto overflow-visible">
              <path
                d="M 20,30 Q 250,55 500,30 T 980,30"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              <path
                ref={pathRef}
                d="M 20,30 Q 250,55 500,30 T 980,30"
                stroke={palette.primary}
                strokeWidth="4"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 10px ${palette.primary})` }}
              />
            </svg>
          </div>

          {/* Milestone checkpoints - 4 containers strictly assembling from pixel particles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {MILESTONES.map((m, idx) => {
              const isReached = idx <= activeStep
              const isCurrent = idx === activeStep

              return (
                <div
                  key={m.num}
                  ref={(el) => {
                    cardsRef.current[idx] = el
                  }}
                  className={`relative flex flex-col p-6 rounded-2xl border bg-[rgba(var(--bg-secondary-rgb),0.92)] backdrop-blur-md sm:backdrop-blur-xl ${
                    isCurrent
                      ? 'border-cyan-400 shadow-[0_0_24px_rgba(var(--accent-cyan-rgb),0.2)]'
                      : isReached
                        ? 'border-cyan-500/35'
                        : 'border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        data-piece="num"
                        className="w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center bg-cyan-400 text-black shadow-[0_0_12px_var(--accent-cyan)]"
                      >
                        {m.num}
                      </span>
                      <span
                        data-piece="tag"
                        className="font-mono text-xs sm:text-sm font-medium px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300"
                      >
                        {m.tag}
                      </span>
                    </div>

                    <h3
                      data-piece="title"
                      className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-3 text-cyan-300"
                    >
                      {m.title}
                    </h3>
                    <p
                      data-piece="desc"
                      className="text-sm sm:text-base text-slate-300 leading-snug font-sans"
                    >
                      {m.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
