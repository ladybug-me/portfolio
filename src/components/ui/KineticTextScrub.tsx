import { useRef } from 'react'
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
  const words = text.split(' ')

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      gsap.fromTo(
        '.scrub-token',
        {
          color: '#1a2233',
          opacity: 0.25,
        },
        {
          color: '#00f2fe',
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: 0.6,
          },
        }
      )
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className={`relative py-28 px-4 sm:px-8 max-w-6xl mx-auto ${className}`}>
      {/* Accessible readable text for assistive technologies */}
      <p className="sr-only">{text}</p>

      {/* Scrubbed kinetic word stream */}
      <p
        aria-hidden="true"
        className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.25] text-center"
      >
        {words.map((word, idx) => (
          <span key={idx} className="scrub-token inline-block mr-[0.25em] will-change-transform">
            {word}
          </span>
        ))}
      </p>
    </div>
  )
}
