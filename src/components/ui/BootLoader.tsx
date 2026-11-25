import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getActivePalette } from '../../theme/palettes'

gsap.registerPlugin(useGSAP)

interface BootLoaderProps {
  onComplete: () => void
}

const BOOT_STEPS = [
  'BIOS: POST complete, bootable drive located.',
  'Bootloader: Loading Linux kernel into RAM...',
  'Initramfs: Drivers initialized, root filesystem mounted.',
  'Init System: PID 1 active, system services started.',
  'User Login: Session ready.',
]

const SEGMENT_COUNT = 24
const GLITCH_RECTS = Array.from({ length: 10 }, (_, i) => i)

export function BootLoader({ onComplete }: BootLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const statusTextRef = useRef<HTMLSpanElement>(null)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])
  const glitchTlRef = useRef<gsap.core.Timeline | null>(null)
  const hasExitedRef = useRef(false)
  const [readyToExit, setReadyToExit] = useState(false)

  // Hand off from static #boot-splash and lock scroll while booting
  useEffect(() => {
    document.getElementById('boot-splash')?.remove()

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    lenis?.stop()

    let minElapsed = false
    let pageReady = false

    const tryReady = () => {
      if (minElapsed && pageReady) {
        setReadyToExit(true)
      }
    }

    const remainingMinMs = Math.max(0, 2000 - performance.now())
    const minTimer = window.setTimeout(() => {
      minElapsed = true
      tryReady()
    }, remainingMinMs)

    const waitFonts = document.fonts?.ready ?? Promise.resolve()
    const waitLoad =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))

    Promise.all([waitFonts, waitLoad]).then(() => {
      pageReady = true
      tryReady()
    })

    return () => {
      window.clearTimeout(minTimer)
      document.body.style.overflow = prevOverflow
      lenis?.start()
    }
  }, [])

  // Rectangular progress bar + flickering glitch choreography
  useGSAP(
    () => {
      if (!rootRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const progressObj = { value: 0 }
      let lastLitCount = -1
      let lastStepIdx = -1

      // Continuous rectangular glitch flicker loop
      glitchTlRef.current = gsap
        .timeline({ repeat: -1, repeatRefresh: true })
        .to('.boot-glitch-rect', {
          autoAlpha: () => (Math.random() > 0.45 ? gsap.utils.random(0.25, 0.95) : 0),
          xPercent: () => gsap.utils.random(-35, 35),
          yPercent: () => gsap.utils.random(-25, 25),
          scaleX: () => gsap.utils.random(0.4, 2.2),
          scaleY: () => gsap.utils.random(0.5, 1.8),
          duration: 0.06,
          stagger: { each: 0.015, from: 'random' },
          ease: 'steps(1)',
        })
        .to(
          '.boot-bar-frame',
          {
            x: () => (Math.random() > 0.7 ? gsap.utils.random(-3, 3) : 0),
            skewX: () => (Math.random() > 0.78 ? gsap.utils.random(-4, 4) : 0),
            duration: 0.06,
            ease: 'steps(1)',
          },
          '<'
        )

      const mainTl = gsap.timeline()

      mainTl
        .from('.boot-shell', {
          autoAlpha: 0,
          y: 10,
          duration: 0.25,
          ease: 'power2.out',
        })
        .to(
          progressObj,
          {
            value: 100,
            duration: 1.85,
            ease: 'power2.inOut',
            onUpdate: () => {
              const pct = Math.round(progressObj.value)
              if (percentRef.current) {
                percentRef.current.textContent = `${String(pct).padStart(3, '0')}%`
              }

              const litCount = Math.round((pct / 100) * SEGMENT_COUNT)
              if (litCount !== lastLitCount) {
                lastLitCount = litCount
                segmentRefs.current.forEach((seg, idx) => {
                  if (!seg) return
                  const isLit = idx < litCount
                  const active = getActivePalette()
                  seg.style.opacity = isLit ? '1' : '0.12'
                  seg.style.backgroundColor = isLit
                    ? idx >= SEGMENT_COUNT - 4
                      ? active.secondary
                      : active.primary
                    : '#1e293b'
                })
              }

              const stepIdx = Math.min(
                BOOT_STEPS.length - 1,
                Math.floor((pct / 100) * BOOT_STEPS.length)
              )
              if (stepIdx !== lastStepIdx && statusTextRef.current) {
                lastStepIdx = stepIdx
                statusTextRef.current.textContent = BOOT_STEPS[stepIdx]
                gsap.fromTo(
                  statusTextRef.current,
                  { autoAlpha: 0, x: -6 },
                  { autoAlpha: 1, x: 0, duration: 0.18, ease: 'power2.out', overwrite: 'auto' }
                )
              }
            },
          },
          0.08
        )
    },
    { scope: rootRef }
  )

  // Glitch burst + compositor shutter exit once min 2s & page assets are ready
  useGSAP(
    () => {
      if (!readyToExit || hasExitedRef.current || !rootRef.current) return
      hasExitedRef.current = true

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        onComplete()
        return
      }

      glitchTlRef.current?.kill()

      gsap
        .timeline({
          onComplete: () => {
            document.body.style.overflow = ''
            const lenis = (window as unknown as { __lenis?: { start: () => void } }).__lenis
            lenis?.start()
            onComplete()
          },
        })
        .to('.boot-glitch-rect', {
          autoAlpha: 0.9,
          scaleX: 2.6,
          xPercent: () => gsap.utils.random(-50, 50),
          duration: 0.08,
          stagger: 0.01,
          ease: 'steps(1)',
        })
        .to(
          '.boot-shell',
          {
            autoAlpha: 0,
            scale: 0.96,
            skewX: 4,
            duration: 0.22,
            ease: 'power2.in',
          },
          '+=0.04'
        )
        .to(
          rootRef.current,
          {
            clipPath: 'inset(50% 0% 50% 0%)',
            autoAlpha: 0,
            duration: 0.6,
            ease: 'expo.inOut',
          },
          '-=0.06'
        )
    },
    { scope: rootRef, dependencies: [readyToExit] }
  )

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="System booting"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#07090e] px-6 select-none"
    >
      <div className="boot-shell relative w-full max-w-xl font-mono text-xs sm:text-sm">
        {/* Top Terminal Prompt + Percentage */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <span className="text-cyan-400 font-bold">ladybug-me@arch</span>
            <span className="text-slate-600">:</span>
            <span className="text-emerald-400">~</span>
            <span className="text-slate-500">$ ./init</span>
          </div>
          <span
            ref={percentRef}
            className="text-cyan-300 font-bold tracking-wider tabular-nums shrink-0"
          >
            000%
          </span>
        </div>

        {/* Segmented Rectangular Progress Bar with Flickering Glitch Rectangles */}
        <div className="boot-bar-frame relative w-full h-9 sm:h-11 border border-cyan-400/40 bg-[#0a0f18] p-1.5 flex items-stretch gap-1 overflow-hidden shadow-[0_0_25px_rgba(var(--accent-cyan-rgb),0.12)]">
          {Array.from({ length: SEGMENT_COUNT }, (_, idx) => (
            <div
              key={idx}
              ref={(el) => {
                segmentRefs.current[idx] = el
              }}
              className="flex-1 bg-slate-800 opacity-15 transition-colors duration-75"
            />
          ))}

          {/* Rectangular Glitch Overlays */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {GLITCH_RECTS.map((idx) => (
              <div
                key={idx}
                style={{
                  left: `${(idx * 9.5) % 88}%`,
                  top: `${(idx * 23) % 72}%`,
                  width: `${18 + (idx % 4) * 14}px`,
                  height: `${4 + (idx % 3) * 5}px`,
                }}
                className={`boot-glitch-rect absolute opacity-0 ${idx % 3 === 0
                  ? 'bg-cyan-300/80'
                  : idx % 3 === 1
                    ? 'bg-emerald-400/75'
                    : 'bg-white/80'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Single Active Kernel / Systemd Line */}
        <div className="mt-3.5 flex items-center gap-2.5 text-slate-300">
          <span className="shrink-0 text-slate-500">
            [ <span className="text-emerald-400 font-semibold">OK</span> ]
          </span>
          <span ref={statusTextRef} className="truncate text-slate-300">
            {BOOT_STEPS[0]}
          </span>
        </div>
      </div>
    </div>
  )
}
