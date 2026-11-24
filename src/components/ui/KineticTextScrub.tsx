import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

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

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion || !containerRef.current) return

      const container = containerRef.current
      const chars = container.querySelectorAll<HTMLElement>('.about-char')
      if (!chars.length) return

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
        textShadow: '0 0 0px rgba(0, 242, 254, 0)',
        willChange: 'transform, color, text-shadow',
        backfaceVisibility: 'hidden',
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${getPinDistance()}`,
          pin: true,
          pinSpacing: true,
          scrub: window.innerWidth < 992 ? 0.6 : 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
        },
      })

      const totalChars = chars.length
      const letterAnimSpan = 85

      chars.forEach((char, i) => {
        const startTime = (i / totalChars) * letterAnimSpan

        // Stage 1: Active Wave - Scale 1.15, Random ±3-4 deg tilt, Vivid Glowing Cyan
        tl.to(
          char,
          {
            color: '#38bdf8',
            scale: 1.15,
            rotation: () => gsap.utils.random(-4, 4),
            textShadow:
              '0 0 20px #00f2fe, 0 0 38px rgba(0, 242, 254, 0.9), 0.8px 0.8px 0 #00f2fe, -0.8px -0.8px 0 #00f2fe',
            duration: 3.5,
            ease: 'power1.out',
          },
          startTime
        )

        // Stage 2: Settle into permanent website cyan, scale 1, 0 deg tilt
        tl.to(
          char,
          {
            color: '#00f2fe',
            scale: 1,
            rotation: 0,
            textShadow: '0 0 14px rgba(0, 242, 254, 0.45)',
            duration: 3.5,
            ease: 'power1.inOut',
          },
          startTime + 3.5
        )
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
      className={`relative h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden border-t border-white/5 px-2 sm:px-4 ${className}`}
    >
      {/* Accessible readable text for assistive technologies */}
      <p className="sr-only">{fullText}</p>

      {/* Monumental scrubbed kinetic letter stream structured like img2 */}
      <div className="w-full flex flex-col items-center justify-center text-center">
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
                      className="about-char inline-block will-change-[transform,color,text-shadow] text-white"
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
