import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePalette } from '../../theme/palettes'
import { getPinnedOverflow, syncPinnedOverflow } from '../../utils/scrollPan'

gsap.registerPlugin(ScrollTrigger)

interface KineticTextScrubProps {
  text?: string
  className?: string
}

const LINES = [
  'WE STRIP DEAD',
  'ABSTRACTIONS OUT',
  'OF THE DESKTOP.',
  'WE RUN HARD',
  'INFERENCE ON',
  'COLD SILICON.',
  'LATENCY IS A DEFECT.',
]

export function KineticTextScrub({ className = '' }: KineticTextScrubProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const palette = usePalette()

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !containerRef.current) return

      const container = containerRef.current
      const chars = container.querySelectorAll<HTMLElement>('.about-char')
      const baseLayers = container.querySelectorAll<HTMLElement>('.about-char-base')
      const midLayers = container.querySelectorAll<HTMLElement>('.about-char-mid')
      const primaryLayers = container.querySelectorAll<HTMLElement>('.about-char-primary')
      if (!chars.length) return

      const getPinDistance = () => {
        const width = window.innerWidth
        if (width < 480) return 1150
        if (width < 992) return 1550
        return 2200
      }

      // Compositor-only setup: transform on outer char, opacity crossfade on color layers (zero paint)
      gsap.set(chars, {
        scale: 1,
        rotation: 0,
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
      })
      gsap.set(baseLayers, { opacity: 1 })
      gsap.set([midLayers, primaryLayers], { opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${getPinDistance() + getPinnedOverflow(container)}`,
          pin: true,
          pinSpacing: true,
          scrub: window.innerWidth < 992 ? 0.6 : 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            syncPinnedOverflow(container, innerRef.current, self.progress)
          },
          onRefresh: (self) => {
            syncPinnedOverflow(container, innerRef.current, self.progress, true)
          },
        },
      })

      const totalChars = chars.length
      const letterAnimSpan = 85

      chars.forEach((char, i) => {
        const startTime = (i / totalChars) * letterAnimSpan
        const base = baseLayers[i]
        const mid = midLayers[i]
        const primary = primaryLayers[i]

        // Stage 1: Active Wave - Scale 1.15, Random ±4 deg tilt, crossfade white -> mid accent
        tl.to(
          char,
          {
            scale: 1.15,
            rotation: () => gsap.utils.random(-4, 4),
            duration: 3.5,
            ease: 'power1.out',
          },
          startTime
        )
          .to(base, { opacity: 0, duration: 3.5, ease: 'power1.out' }, startTime)
          .to(mid, { opacity: 1, duration: 3.5, ease: 'power1.out' }, startTime)

        // Stage 2: Settle into primary accent, scale 1, 0 deg tilt
        tl.to(
          char,
          {
            scale: 1,
            rotation: 0,
            duration: 3.5,
            ease: 'power1.inOut',
          },
          startTime + 3.5
        )
          .to(mid, { opacity: 0, duration: 3.5, ease: 'power1.inOut' }, startTime + 3.5)
          .to(primary, { opacity: 1, duration: 3.5, ease: 'power1.inOut' }, startTime + 3.5)
      })

      // Brief hold at 100% illumination before unpinning
      tl.to({}, { duration: 6 })
    },
    { scope: containerRef }
  )

  const fullText = LINES.join(' ')

  return (
    <section
      ref={containerRef}
      id="statement"
      className={`relative h-screen w-full flex flex-col items-center overflow-clip border-t border-white/5 px-2 sm:px-4 ${className}`}
    >
      {/* Accessible readable text for assistive technologies */}
      <p className="sr-only">{fullText}</p>

      {/* Monumental scrubbed kinetic letter stream */}
      <div ref={innerRef} className="w-full my-auto py-8 flex flex-col items-center justify-center text-center will-change-transform">
        <p
          aria-hidden="true"
          className="font-black tracking-tight sm:tracking-tighter text-center select-none uppercase w-full flex flex-col items-center justify-center"
          style={{
            fontSize: 'clamp(1.75rem, min(7.2vw, 10.2vh), 7.2rem)',
            lineHeight: 1.08,
          }}
        >
          {LINES.map((line, lineIdx) => (
            <span key={lineIdx} className="block whitespace-nowrap">
              {line.split(' ').map((word, wordIdx) => (
                <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.28em]">
                  {word.split('').map((char, charIdx) => (
                    <span
                      key={charIdx}
                      className="about-char relative inline-block will-change-transform"
                      style={{
                        transformOrigin: 'center center',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <span className="about-char-base inline-block text-white">{char}</span>
                      <span
                        aria-hidden="true"
                        className="about-char-mid pointer-events-none absolute inset-0 inline-block"
                        style={{ color: palette.mid, opacity: 0 }}
                      >
                        {char}
                      </span>
                      <span
                        aria-hidden="true"
                        className="about-char-primary pointer-events-none absolute inset-0 inline-block"
                        style={{ color: palette.primary, opacity: 0 }}
                      >
                        {char}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
