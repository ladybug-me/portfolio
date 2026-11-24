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
      className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-36 pb-12 sm:pb-16 lg:pb-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full relative">

        {/* Top Status Capsule & Telemetry */}
        <div className="hero-meta flex flex-wrap items-center gap-3 mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] sm:text-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ScrambleText text="VIT VELLORE • B.TECH CSE (CORE) • CGPA 8.83" delay={150} />
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 font-mono text-[11px] sm:text-xs backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>9TH ICRTAC'26 ACCEPTED AUTHOR</span>
          </div>
        </div>

        {/* Responsive Badge Strip for Mobile / Tablet (< xl) */}
        <div className="flex flex-wrap items-center gap-2 mb-4 xl:hidden">
          <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-semibold backdrop-blur-md">
            ⚡ Caelestia KDE Maintainer
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-400/40 text-emerald-300 font-mono text-[11px] font-semibold backdrop-blur-md">
            ★ 9th ICRTAC'26 Paper Author
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-white/20 text-slate-200 font-mono text-[11px] font-semibold backdrop-blur-md">
            ◈ DevSoc'26 Top 15 Team
          </span>
        </div>

        {/* Massive Editorial Headline with Overlapping Tilted Floating Badges on Desktop */}
        <div className="max-w-6xl mb-8 sm:mb-12 relative">
          {/* Floating Badges (Desktop xl+) */}
          <div className="hidden xl:block">
            <div className="tilted-badge-1 absolute -top-6 left-1/3 z-20 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold shadow-[0_4px_20px_rgba(0,242,254,0.2)] -rotate-6 backdrop-blur-md select-none pointer-events-none">
              ⚡ Caelestia KDE Maintainer
            </div>
            <div className="tilted-badge-2 absolute top-1/2 -right-4 z-20 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-semibold shadow-[0_4px_20px_rgba(0,255,163,0.2)] rotate-4 backdrop-blur-md select-none pointer-events-none">
              ★ 9th ICRTAC'26 Paper Author
            </div>
            <div className="tilted-badge-3 absolute -bottom-5 left-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/20 text-slate-200 font-mono text-xs font-semibold shadow-lg -rotate-3 backdrop-blur-md select-none pointer-events-none">
              ◈ DevSoc'26 Top 15 Team
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight sm:tracking-tighter text-white leading-[0.96] select-none break-words">
            <span className="block mb-2 sm:mb-3">
              <MaskedText text="RAJVEER SINGH" wordClassName="hero-word" />
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <MaskedText text="LINUX RUNTIMES & EDGE COMPUTE" wordClassName="hero-word" />
            </span>
          </h1>
        </div>

        {/* Minimalist Narrative Statement */}
        <p className="hero-sub text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mb-8 sm:mb-12 font-light leading-relaxed">
          I build software where latency and memory are hard constraints. My work spans native Linux desktop architectures, accelerated vision on low-power chips, and fast local retrieval engines.
        </p>

        {/* 4-Metric Stat Horizon */}
        <div className="hero-meta grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mb-8 sm:mb-12 py-4 sm:py-6 border-y border-white/10 font-mono">
          <div>
            <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white block mb-0.5 sm:mb-1">ICRTAC'26</span>
            <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider">Accepted Paper</span>
          </div>
          <div>
            <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white block mb-0.5 sm:mb-1">8.83</span>
            <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider">VIT Vellore CGPA</span>
          </div>
          <div>
            <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white block mb-0.5 sm:mb-1">&lt;5ms</span>
            <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider">Native C++ IPC</span>
          </div>
          <div>
            <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-white block mb-0.5 sm:mb-1">44,441</span>
            <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider">FAISS Vectors</span>
          </div>
        </div>

        {/* Clear Action Horizon with Direct Social Anchors */}
        <div className="hero-cta flex flex-wrap items-center gap-4 sm:gap-5">
          <a
            href="#projects"
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-black font-semibold text-xs sm:text-sm hover:opacity-95 transition-all shadow-[0_0_25px_rgba(0,242,254,0.35)] flex items-center gap-2 group"
          >
            <span>Explore Authored Work</span>
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
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl border border-white/15 hover:border-cyan-400 text-slate-200 font-mono text-xs sm:text-sm hover:text-white transition-all glass-panel"
          >
            // Contact Rajveer
          </a>

          {/* Quick External Profiles */}
          <div className="flex items-center gap-4 font-mono text-xs text-slate-400 sm:ml-4">
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a
              href="https://github.com/ladybug-me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <span className="text-cyan-400">↗</span>
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://www.linkedin.com/in/rajveer-singh-2304402b6"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <span className="text-cyan-400">↗</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
