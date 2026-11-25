import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { getActivePalette, usePalette } from '../../theme/palettes'
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
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const stageTweensRef = useRef<{ stage1: gsap.core.Tween[]; stage2: gsap.core.Tween[] }>({
    stage1: [],
    stage2: [],
  })
  const palette = usePalette()

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !containerRef.current) return

      const container = containerRef.current
      const chars = container.querySelectorAll<HTMLElement>('.about-char')
      if (!chars.length) return

      const activePalette = getActivePalette()
      const getPinDistance = () => {
        const width = window.innerWidth
        if (width < 480) return 1150
        if (width < 992) return 1550
        return 2200
      }

      // Set hardware acceleration & initial solid white state
      gsap.set(chars, {
        color: '#ffffff',
        scale: 1,
        rotation: 0,
        display: 'inline-block',
        transformOrigin: 'center center',
        willChange: 'transform, color',
        backfaceVisibility: 'hidden',
      })

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
      tlRef.current = tl

      const stage1: gsap.core.Tween[] = []
      const stage2: gsap.core.Tween[] = []
      const totalChars = chars.length
      const letterAnimSpan = 85

      chars.forEach((char, i) => {
        const startTime = (i / totalChars) * letterAnimSpan

        // Stage 1: Active Wave - Scale 1.15, Random ±3-4 deg tilt, Vivid Glowing Accent
        const t1 = gsap.to(char, {
          color: activePalette.mid,
          scale: 1.15,
          rotation: () => gsap.utils.random(-4, 4),
          duration: 3.5,
          ease: 'power1.out',
        })
        tl.add(t1, startTime)
        stage1.push(t1)

        // Stage 2: Settle into permanent website primary accent, scale 1, 0 deg tilt
        const t2 = gsap.to(char, {
          color: activePalette.primary,
          scale: 1,
          rotation: 0,
          duration: 3.5,
          ease: 'power1.inOut',
        })
        tl.add(t2, startTime + 3.5)
        stage2.push(t2)
      })

      stageTweensRef.current = { stage1, stage2 }

      // Brief hold at 100% illumination before unpinning
      tl.to({}, { duration: 6 })
    },
    { scope: containerRef }
  )

  // Update illumination colors in-place when palette changes without tearing down ScrollTrigger or pin-spacer
  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    const currentProgress = tl.progress()
    tl.progress(0)
    stageTweensRef.current.stage1.forEach((tween) => {
      tween.vars.color = palette.mid
      tween.invalidate()
    })
    stageTweensRef.current.stage2.forEach((tween) => {
      tween.vars.color = palette.primary
      tween.invalidate()
    })
    tl.progress(currentProgress)
  }, [palette.id, palette.mid, palette.primary])

  const fullText = LINES.join(' ')

  return (
    <section
      ref={containerRef}
      id="statement"
      className={`relative h-screen w-full flex flex-col items-center overflow-clip border-t border-white/5 px-2 sm:px-4 ${className}`}
    >
      {/* Accessible readable text for assistive technologies */}
      <p className="sr-only">{fullText}</p>

      {/* Monumental scrubbed kinetic letter stream structured like img2 */}
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
                      className="about-char inline-block will-change-[transform,color] text-white"
                      style={{
                        display: 'inline-block',
                        transformOrigin: 'center center',
                        backfaceVisibility: 'hidden',
                        color: '#ffffff',
                      }}
                    >
                      {char}
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
