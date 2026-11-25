import { useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

interface HeroSectionProps {
  ready?: boolean
}

export function HeroSection({ ready = true }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const inTlRef = useRef<gsap.core.Timeline | null>(null)
  const triggerMorphRef = useRef<(() => void) | null>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      let isAlias = false
      let pendingCall: gsap.core.Tween | null = null
      let morphTl: gsap.core.Timeline | null = null

      const triggerMorph = () => {
        pendingCall?.kill()
        morphTl?.kill()
        isAlias = !isAlias
        morphTl = gsap.timeline({
          onComplete: () => {
            pendingCall = gsap.delayedCall(10, triggerMorph)
          },
        })

        if (isAlias) {
          morphTl
            .to('.hero-line-1-inner', {
              duration: 0.95,
              ease: 'none',
              scrambleText: {
                text: 'LADYBUG',
                chars: '01#$%&*@XZVQ',
                revealDelay: 0.08,
                speed: 0.45,
              },
            })
            .to(
              '.hero-line-2-inner',
              {
                duration: 0.95,
                ease: 'none',
                scrambleText: {
                  text: 'ME',
                  chars: '01#$%&*@XZVQ',
                  revealDelay: 0.08,
                  speed: 0.45,
                },
              },
              '<0.1'
            )
        } else {
          morphTl
            .to('.hero-line-1-inner', {
              duration: 0.95,
              ease: 'none',
              scrambleText: {
                text: 'RAJVEER',
                chars: '01#$%&*@XZVQ',
                revealDelay: 0.08,
                speed: 0.45,
              },
            })
            .to(
              '.hero-line-2-inner',
              {
                duration: 0.95,
                ease: 'none',
                scrambleText: {
                  text: 'SINGH',
                  chars: '01#$%&*@XZVQ',
                  revealDelay: 0.08,
                  speed: 0.45,
                },
              },
              '<0.1'
            )
        }
      }

      triggerMorphRef.current = triggerMorph

      // 1. Entrance Choreography (Paused until boot loader completes)
      const inTl = gsap.timeline({
        paused: true,
        delay: 0.04,
        onComplete: () => {
          pendingCall = gsap.delayedCall(10, triggerMorph)
        },
      })
      inTlRef.current = inTl

      inTl
        .fromTo(
          '.hero-line-1-inner',
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1.05,
            ease: 'none',
            scrambleText: {
              text: 'RAJVEER',
              chars: '01#$%&*@XZVQ',
              revealDelay: 0.08,
              speed: 0.45,
            },
          }
        )
        .fromTo(
          '.hero-line-2-inner',
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1.05,
            ease: 'none',
            scrambleText: {
              text: 'SINGH',
              chars: '01#$%&*@XZVQ',
              revealDelay: 0.08,
              speed: 0.45,
            },
          },
          '-=0.75'
        )
        .fromTo(
          '.hero-line-3-inner',
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.95,
            ease: 'none',
            scrambleText: {
              text: 'LINUX RUNTIMES & EDGE COMPUTE',
              chars: 'upperCase',
              revealDelay: 0.1,
              speed: 0.55,
            },
          },
          '-=0.65'
        )
        .from(
          ['.tilted-badge-1-inner', '.tilted-badge-2-inner', '.tilted-badge-3-inner'],
          {
            scale: 0.4,
            y: 16,
            autoAlpha: 0,
            stagger: { each: 0.08, from: 'random' },
            duration: 0.5,
            ease: 'back.out(2)',
          },
          '-=0.55'
        )
        .fromTo(
          '.hero-manifesto-inner',
          {
            y: 16,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          '-=0.45'
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
      return () => {
        pendingCall?.kill()
        morphTl?.kill()
      }
    },
    { scope: heroRef }
  )

  useEffect(() => {
    if (ready) {
      inTlRef.current?.play()
    }
  }, [ready])

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 overflow-hidden"
    >
      <div className="max-w-[1500px] mx-auto w-full relative">
        {/* Abstract Monumental Typography Canvas */}
        <div className="relative mb-8 sm:mb-12 select-none">
          {/* Mobile Non-Overlapping Badges */}
          <div className="flex sm:hidden flex-wrap gap-2 mb-5">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-400/50 text-cyan-300 font-mono text-[10px] font-semibold flex items-center gap-1.5">
              <img
                src={`${import.meta.env.BASE_URL}assets/icons/caelestia.svg`}
                alt=""
                className="w-3 h-3 rounded-full object-contain"
              />
              <span>Caelestia KDE Maintainer</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-semibold">
              ★ 9th ICRTAC'26 Paper Author
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/25 text-slate-200 font-mono text-[10px] font-semibold flex items-center gap-1.5">
              <img
                src={`${import.meta.env.BASE_URL}assets/icons/devsoc.jpg`}
                alt=""
                className="w-3 h-3 rounded-full object-cover"
              />
              <span>DevSoc'26 Top 15 Team</span>
            </span>
          </div>

          {/* Floating Tilted Badges - Desktop/Tablet only */}
          <div className="hidden sm:block absolute inset-0 pointer-events-none z-20">
            {/* Badge 1: Top-Center */}
            <div className="tilted-badge-1-wrap absolute -top-4 sm:-top-8 left-6 sm:left-1/4 will-change-transform">
              <div className="tilted-badge-1-inner px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/50 text-cyan-300 font-mono text-[11px] sm:text-xs font-semibold shadow-[0_4px_24px_rgba(0,242,254,0.3)] -rotate-6 backdrop-blur-md flex items-center gap-2">
                <img
                  src={`${import.meta.env.BASE_URL}assets/icons/caelestia.svg`}
                  alt=""
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-contain"
                />
                <span>Caelestia KDE Maintainer</span>
              </div>
            </div>

            {/* Badge 2: Mid-Right */}
            <div className="tilted-badge-2-wrap absolute top-1/3 sm:top-2/5 right-2 sm:right-8 will-change-transform">
              <div className="tilted-badge-2-inner px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-emerald-400/50 text-emerald-300 font-mono text-[11px] sm:text-xs font-semibold shadow-[0_4px_24px_rgba(0,255,163,0.3)] rotate-6 backdrop-blur-md">
                ★ 9th ICRTAC'26 Paper Author
              </div>
            </div>

            {/* Badge 3: Empty area to the left of SINGH */}
            <div className="tilted-badge-3-wrap absolute top-[46%] sm:top-[52%] left-2 sm:left-8 will-change-transform">
              <div className="tilted-badge-3-inner px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/90 border border-white/25 text-slate-200 font-mono text-[11px] sm:text-xs font-semibold shadow-[0_4px_20px_rgba(255,255,255,0.15)] -rotate-3 backdrop-blur-md flex items-center gap-2">
                <img
                  src={`${import.meta.env.BASE_URL}assets/icons/devsoc.jpg`}
                  alt=""
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover"
                />
                <span>DevSoc'26 Top 15 Team</span>
              </div>
            </div>
          </div>

          {/* Monumental Headline Display */}
          <h1
            onClick={() => triggerMorphRef.current?.()}
            className="flex flex-col tracking-[-0.05em] leading-[0.82] font-black uppercase cursor-pointer"
          >
            {/* Line 1: RAJVEER <-> LADYBUG-ME (Solid Brilliant Titanium) */}
            <div className="hero-line-1-wrap overflow-hidden py-1 will-change-transform">
              <span className="hero-line-1-inner block whitespace-nowrap text-[13vw] sm:text-[14.5vw] lg:text-[15.5vw] text-white will-change-transform">
                RAJVEER
              </span>
            </div>

            {/* Line 2: SINGH <-> RAJVEER SINGH (Hollow Electric Cyan Contour) */}
            <div className="hero-line-2-wrap overflow-hidden py-1 will-change-transform">
              <span className="hero-line-2-inner block whitespace-nowrap text-[13vw] sm:text-[14.5vw] lg:text-[15.5vw] text-transparent text-stroke-cyan text-right pr-2 sm:pr-8 will-change-transform drop-shadow-[0_0_24px_rgba(0,242,254,0.35)]">
                SINGH
              </span>
            </div>

            {/* Line 3: Architectural Sub-Monument */}
            <div className="hero-line-3-wrap overflow-hidden pt-3 sm:pt-5 will-change-transform">
              <span className="hero-line-3-inner block text-[3.6vw] sm:text-[3.8vw] lg:text-[4.2vw] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 will-change-transform">
                LINUX RUNTIMES & EDGE COMPUTE
              </span>
            </div>
          </h1>
        </div>

        {/* Content Wrapper for Magnified Minimalist Education (Subtext & Full Address on Hover) */}
        <div className="hero-content-wrap will-change-transform pointer-events-auto relative z-20">
          <div className="hero-manifesto-inner group pt-6 sm:pt-8 border-t border-white/15 max-w-6xl flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-12 cursor-default">
            {/* Left: Institution + Hover-Revealed Degree & CGPA */}
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors duration-300">
                Vellore Institute of Technology
              </div>
              <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-28 group-hover:opacity-100 group-hover:mt-3 transition-[max-height,opacity,margin-top] duration-300 ease-out">
                <p className="text-base sm:text-lg lg:text-xl text-slate-200 font-medium leading-snug">
                  B.Tech in Computer Science and Engineering, Core (2nd Year)
                  <span className="text-cyan-300 font-mono font-bold ml-3">CGPA 8.83</span>
                </p>
              </div>
            </div>

            {/* Right: Location Icon + Hover-Revealed Full Address & Dates */}
            <div className="md:text-right shrink-0">
              <div className="inline-flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-200 group-hover:text-cyan-300 transition-colors duration-300">
                <Icon
                  icon="mdi:map-marker"
                  className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Vellore</span>
              </div>
              <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-24 group-hover:opacity-100 group-hover:mt-3 transition-[max-height,opacity,margin-top] duration-300 ease-out font-mono text-sm sm:text-base lg:text-lg text-slate-300">
                <div>Tamil Nadu, India</div>
                <div className="text-cyan-400/90 mt-0.5">June 2025 – Present</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
