import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function MarqueeTicker() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  const items = [
    'NATIVE C++ RUNTIMES',
    'SUB-5MS IPC',
    'EMBEDDED CUDA',
    'YOLOv11-SEG ON SILICON',
    'JETSON NANO & PI',
    'CAELESTIA LINUX SHELL',
    'OLLAMA & FAISS SEARCH',
    'ZERO MEMORY LEAKS',
  ]

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      gsap.to('.marquee-content', {
        xPercent: -50,
        repeat: -1,
        ease: 'none',
        duration: 22,
      })
    },
    { scope: marqueeRef }
  )

  return (
    <div
      ref={marqueeRef}
      className="relative w-full overflow-hidden border-y border-white/5 py-4 bg-cyan-950/10 backdrop-blur-sm"
    >
      <div className="flex whitespace-nowrap marquee-content w-max will-change-transform">
        {/* Render 2 duplicates for seamless infinite loop */}
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 mx-4 font-mono text-xs sm:text-sm tracking-widest text-slate-400">
            <span className="text-cyan-400 font-bold">◈</span>
            <span className="hover:text-cyan-300 transition-colors uppercase">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
