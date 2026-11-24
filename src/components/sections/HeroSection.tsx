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

          {/* Social Profiles with Actual Logos */}
          <div className="hero-cta-inner flex items-center gap-3 will-change-transform">
            <a
              href="https://github.com/ladybug-me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-400 hover:text-cyan-400 text-slate-300 transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)] flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="font-mono text-xs font-semibold">GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/rajveer-singh-2304402b6"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-400 hover:text-cyan-400 text-slate-300 transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)] flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
              <span className="font-mono text-xs font-semibold">LinkedIn</span>
            </a>

            <a
              href="mailto:rajveer2027singh@gmail.com"
              aria-label="Send Email"
              className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-400 hover:text-cyan-400 text-slate-300 transition-all shadow-[0_0_15px_rgba(0,242,254,0.1)] flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="font-mono text-xs font-semibold">Email</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
