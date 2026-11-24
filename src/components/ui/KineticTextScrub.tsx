import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface KineticTextScrubProps {
  text: string
  className?: string
}

export function KineticTextScrub({ text, className = '' }: KineticTextScrubProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrubProgress, setScrubProgress] = useState<number>(0)
  const words = text.split(' ')

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !containerRef.current) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=950',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setScrubProgress(self.progress)
          },
        },
      })

      // Scrub word colors progressively across the pinned duration
      tl.fromTo(
        '.scrub-token',
        {
          color: '#1a2233',
          opacity: 0.25,
          scale: 0.98,
        },
        {
          color: '#00f2fe',
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          ease: 'none',
          duration: 1,
        }
      )

      // Brief hold at full illumination before releasing to the next section
      tl.to({}, { duration: 0.25 })
    },
    { scope: containerRef }
  )

  const isCompleted = scrubProgress >= 0.92

  return (
    <section
      ref={containerRef}
      className={`relative min-h-screen py-20 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col justify-center items-center overflow-hidden border-t border-white/5 ${className}`}
    >
      {/* Top Status Header */}
      <div className="w-full max-w-4xl flex items-center justify-between font-mono text-xs mb-8 sm:mb-12">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="tracking-widest uppercase">// RUNTIME PHILOSOPHY</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline">BUFFER ACCUMULATION:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 font-bold text-cyan-300">
            {Math.round(scrubProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Accessible readable text for assistive technologies */}
      <p className="sr-only">{text}</p>

      {/* Scrubbed kinetic word stream - words stay illuminated once reached */}
      <div className="max-w-4xl text-center">
        <p
          aria-hidden="true"
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.3] text-center select-none"
        >
          {words.map((word, idx) => (
            <span
              key={idx}
              className="scrub-token inline-block mr-[0.25em] will-change-[color,opacity,transform] transition-[text-shadow] duration-200"
              style={{
                textShadow:
                  scrubProgress > idx / words.length
                    ? '0 0 22px rgba(0, 242, 254, 0.45)'
                    : 'none',
              }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* Dynamic Progress Track & Release Indicator */}
      <div className="w-full max-w-4xl mt-10 sm:mt-14 flex flex-col items-center gap-3">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-100 ease-out"
            style={{ width: `${Math.min(100, Math.round(scrubProgress * 100))}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full font-mono text-[11px] text-slate-400">
          <span>[ PERSISTENT STREAM SCRUB ]</span>
          <span
            className={`transition-colors duration-300 ${
              isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}
          >
            {isCompleted ? 'STATEMENT COMPLETE // PROCEEDING' : 'SCROLL TO FILL STREAM'}
          </span>
        </div>
      </div>
    </section>
  )
}
