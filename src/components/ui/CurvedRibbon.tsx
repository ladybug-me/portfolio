import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function CurvedRibbon() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // Seamless continuous marquee scroll along the curved path
      gsap.to('#ribbon-text-path', {
        attr: { startOffset: '-100%' },
        repeat: -1,
        ease: 'none',
        duration: 18,
      })
    },
    { scope: containerRef }
  )

  const textContent =
    ' • LOW-OVERHEAD LINUX SYSTEMS • HIGH-THROUGHPUT IPC • CUDA PARALLEL ACCELERATION • 9th ICRTAC AUTHOR • FAISS VECTOR INDEXING •'

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-10 my-8 select-none pointer-events-none"
    >
      <svg
        viewBox="0 0 1600 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[180px] overflow-visible"
      >
        <defs>
          {/* Arched ribbon path as seen in Two26 */}
          <path
            id="ribbon-curve"
            d="M -200,180 Q 800,20 1800,180"
          />
        </defs>

        {/* Ambient background glow path */}
        <use
          href="#ribbon-curve"
          stroke="rgba(0, 242, 254, 0.08)"
          strokeWidth="64"
          strokeLinecap="round"
        />

        {/* Main Ribbon Stroke */}
        <use
          href="#ribbon-curve"
          stroke="rgba(0, 242, 254, 0.25)"
          strokeWidth="48"
          strokeLinecap="round"
        />

        {/* Text following the arched curve */}
        <text
          fill="#00f2fe"
          className="font-mono text-[14px] sm:text-[16px] font-bold tracking-[0.25em] uppercase"
        >
          <textPath
            id="ribbon-text-path"
            href="#ribbon-curve"
            startOffset="0%"
          >
            {textContent + textContent + textContent}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
