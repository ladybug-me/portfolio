import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { MaskedText } from '../ui/MaskedText'
import { ScrambleText } from '../ui/ScrambleText'

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // Gentle floating buoyancy for the tilted badge capsules
      gsap.to('.tilted-badge-1', {
        y: -8,
        rotation: -4,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.tilted-badge-2', {
        y: -10,
        rotation: 6,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4,
      })

      gsap.to('.tilted-badge-3', {
        y: -6,
        rotation: -2,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8,
      })
    },
    { scope: heroRef }
  )

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-[95vh] flex flex-col justify-center px-4 sm:px-8 pt-32 pb-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full relative">
        
        {/* Top Status Capsule */}
        <div className="hero-meta inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <ScrambleText text="VIT VELLORE CSE • CGPA 8.83 • ICRTAC'26 RESEARCH AUTHOR" delay={150} />
        </div>

        {/* Massive Editorial Headline with Overlapping Tilted Badge Capsules */}
        <div className="max-w-6xl mb-12 relative">
          {/* Tilted Floating Badge 1 */}
          <div className="tilted-badge-1 absolute -top-5 left-1/4 sm:left-1/3 z-20 hidden sm:inline-block px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold shadow-[0_4px_20px_rgba(0,242,254,0.2)] -rotate-6 backdrop-blur-md select-none">
            ⚡ Linux Compositor & QML
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white leading-[0.95] select-none">
            <span className="block mb-2">
              <MaskedText text="ENGINEERING" wordClassName="hero-word" />
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              <MaskedText text="REAL-TIME SYSTEMS" wordClassName="hero-word" />
            </span>
          </h1>

          {/* Tilted Floating Badge 2 */}
          <div className="tilted-badge-2 absolute top-1/2 right-4 sm:right-16 z-20 hidden md:inline-block px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-semibold shadow-[0_4px_20px_rgba(0,255,163,0.2)] rotate-4 backdrop-blur-md select-none">
            ★ 9th ICRTAC'26 Paper Author
          </div>

          {/* Tilted Floating Badge 3 */}
          <div className="tilted-badge-3 absolute -bottom-4 left-1/3 sm:left-1/2 z-20 hidden sm:inline-block px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/20 text-slate-200 font-mono text-xs font-semibold shadow-lg -rotate-3 backdrop-blur-md select-none">
            ◈ Sub-5ms IPC Latency
          </div>
        </div>

        {/* Minimalist Narrative Statement */}
        <p className="hero-sub text-lg sm:text-2xl text-slate-300 max-w-3xl mb-12 font-light leading-relaxed">
          I'm <strong className="text-white font-medium">Rajveer Singh</strong>. I build low-latency Linux desktop compositors, deploy CUDA inference pipelines to constrained silicon, and structure high-volume vector search.
        </p>

        {/* Spaced Stat Horizon */}
        <div className="hero-meta grid grid-cols-3 gap-6 sm:gap-12 max-w-2xl mb-12 py-6 border-y border-white/10 font-mono">
          <div>
            <span className="text-2xl sm:text-4xl font-bold text-white block mb-1">ICRTAC'26</span>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">Peer-Reviewed Author</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-bold text-white block mb-1">&lt;5ms</span>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">Native C++ IPC</span>
          </div>
          <div>
            <span className="text-2xl sm:text-4xl font-bold text-white block mb-1">44,441</span>
            <span className="text-xs text-cyan-400 uppercase tracking-wider">FAISS Vectors</span>
          </div>
        </div>

        {/* Clear Action Horizon */}
        <div className="hero-cta flex flex-wrap items-center gap-5">
          <a
            href="#projects"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-semibold text-sm hover:opacity-95 transition-all shadow-[0_0_25px_rgba(0,242,254,0.35)] flex items-center gap-2 group"
          >
            <span>Inspect Authored Work</span>
            <svg
              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a
            href="#contact"
            className="px-8 py-4 rounded-xl border border-white/15 hover:border-cyan-400 text-slate-200 font-mono text-sm hover:text-white transition-all glass-panel"
          >
            // Direct Inquiry
          </a>
        </div>

      </div>
    </section>
  )
}
