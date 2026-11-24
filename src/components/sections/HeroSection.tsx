import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // 1. Entrance Choreography (Animate IN - targets inner elements)
      const inTl = gsap.timeline({ delay: 0.1 })

      inTl
        .from('.hero-line-1-inner', {
          y: '140%',
          rotateX: -45,
          opacity: 0,
          duration: 1.15,
          ease: 'power4.out',
        })
        .from(
          '.hero-line-2-inner',
          {
            y: '140%',
            rotateX: 45,
            opacity: 0,
            duration: 1.2,
            ease: 'power4.out',
          },
          '-=0.9'
        )
        .from(
          '.hero-line-3-inner',
          {
            y: 40,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
          },
          '-=0.7'
        )
        .from(
          ['.tilted-badge-1-inner', '.tilted-badge-2-inner', '.tilted-badge-3-inner'],
          {
            scale: 0,
            opacity: 0,
            stagger: 0.1,
            duration: 0.75,
            ease: 'back.out(1.8)',
          },
          '-=0.6'
        )
        .from(
          ['.hero-manifesto-inner', '.hero-cta-inner'],
          {
            y: 25,
            opacity: 0,
            stagger: 0.1,
            duration: 0.75,
            ease: 'power3.out',
          },
          '-=0.5'
        )

      // 2. Continuous Idle Buoyancy for Tilted Badges
      gsap.to('.tilted-badge-1-inner', {
        y: -9,
        duration: 3.0,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2,
      })

      gsap.to('.tilted-badge-2-inner', {
        y: -11,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      })

      gsap.to('.tilted-badge-3-inner', {
        y: -7,
        duration: 2.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.8,
      })

      // 3. Scroll-Scrubbed Departure (Animate OUT - targets outer wrappers to prevent overwrite conflicts)
      const outTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      outTl
        .to(
          '.hero-line-1-wrap',
          {
            xPercent: -35,
            scale: 1.05,
            opacity: 0,
            filter: 'blur(12px)',
            ease: 'power1.in',
          },
          0
        )
        .to(
          '.hero-line-2-wrap',
          {
            xPercent: 35,
            scale: 1.05,
            opacity: 0,
            filter: 'blur(12px)',
            ease: 'power1.in',
          },
          0
        )
        .to(
          '.hero-line-3-wrap',
          {
            yPercent: 45,
            scale: 0.92,
            opacity: 0,
            filter: 'blur(8px)',
            ease: 'power1.in',
          },
          0
        )
        .to(
          '.tilted-badge-1-wrap',
          {
            xPercent: -45,
            yPercent: -35,
            rotation: -25,
            opacity: 0,
            ease: 'power1.in',
          },
          0
        )
        .to(
          '.tilted-badge-2-wrap',
          {
            xPercent: 55,
            yPercent: -20,
            rotation: 30,
            opacity: 0,
            ease: 'power1.in',
          },
          0
        )
        .to(
          '.tilted-badge-3-wrap',
          {
            xPercent: 20,
            yPercent: 50,
            rotation: -18,
            opacity: 0,
            ease: 'power1.in',
          },
          0
        )
        .to(
          '.hero-content-wrap',
          {
            y: -40,
            opacity: 0,
            ease: 'power1.in',
          },
          0
        )
    },
    { scope: heroRef }
  )

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto w-full relative">
        {/* Abstract Monumental Typography Canvas */}
        <div className="relative mb-8 sm:mb-12 select-none">
          {/* Floating Tilted Badges - Layered across abstract letterforms */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Badge 1: Top-Center */}
            <div className="tilted-badge-1-wrap absolute -top-4 sm:-top-8 left-6 sm:left-1/4 will-change-transform">
              <div className="tilted-badge-1-inner px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/50 text-cyan-300 font-mono text-[11px] sm:text-xs font-semibold shadow-[0_4px_24px_rgba(0,242,254,0.3)] -rotate-6 backdrop-blur-md">
                ⚡ Caelestia KDE Maintainer
              </div>
            </div>

            {/* Badge 2: Mid-Right */}
            <div className="tilted-badge-2-wrap absolute top-1/3 sm:top-2/5 right-2 sm:right-8 will-change-transform">
              <div className="tilted-badge-2-inner px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-emerald-400/50 text-emerald-300 font-mono text-[11px] sm:text-xs font-semibold shadow-[0_4px_24px_rgba(0,255,163,0.3)] rotate-6 backdrop-blur-md">
                ★ 9th ICRTAC'26 Paper Author
              </div>
            </div>

            {/* Badge 3: Lower-Left */}
            <div className="tilted-badge-3-wrap absolute bottom-2 sm:bottom-4 left-1/3 sm:left-2/5 will-change-transform">
              <div className="tilted-badge-3-inner px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-white/25 text-slate-200 font-mono text-[11px] sm:text-xs font-semibold shadow-[0_4px_20px_rgba(255,255,255,0.15)] -rotate-3 backdrop-blur-md">
                ◈ DevSoc'26 Top 15 Team
              </div>
            </div>
          </div>

          {/* Monumental Headline Display */}
          <h1 className="flex flex-col tracking-[-0.05em] leading-[0.82] font-black uppercase">
            {/* Line 1: RAJVEER (Solid Brilliant Titanium) */}
            <div className="hero-line-1-wrap overflow-hidden py-1 will-change-transform">
              <span className="hero-line-1-inner block text-[13.5vw] sm:text-[14.5vw] lg:text-[15.5vw] text-white will-change-transform">
                RAJVEER
              </span>
            </div>

            {/* Line 2: SINGH (Hollow Electric Cyan Contour) */}
            <div className="hero-line-2-wrap overflow-hidden py-1 will-change-transform">
              <span className="hero-line-2-inner block text-[13.5vw] sm:text-[14.5vw] lg:text-[15.5vw] text-transparent text-stroke-cyan text-right pr-2 sm:pr-8 will-change-transform drop-shadow-[0_0_24px_rgba(0,242,254,0.35)]">
                SINGH
              </span>
            </div>

            {/* Line 3: Architectural Sub-Monument */}
            <div className="hero-line-3-wrap overflow-hidden pt-3 sm:pt-5 will-change-transform">
              <span className="hero-line-3-inner block text-[3.2vw] sm:text-[3.8vw] lg:text-[4.2vw] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 will-change-transform">
                LINUX RUNTIMES & EDGE COMPUTE
              </span>
            </div>
          </h1>
        </div>

        {/* Content Wrapper for Manifesto & CTAs */}
        <div className="hero-content-wrap will-change-transform">
          {/* Minimalist Engineering Manifesto */}
          <p className="hero-manifesto-inner text-base sm:text-lg md:text-xl lg:text-2xl text-white font-normal max-w-3xl mb-8 sm:mb-12 leading-relaxed will-change-transform">
            I build software where latency and memory are hard constraints. Native Linux desktop architectures, accelerated vision on low-power chips, and fast local retrieval engines.
          </p>

          {/* Clear Action Horizon with Direct Social Anchors */}
          <div className="hero-cta-inner flex flex-wrap items-center gap-4 sm:gap-5 will-change-transform">
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
      </div>
    </section>
  )
}
