import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getActivePalette } from '../../theme/palettes'

gsap.registerPlugin(useGSAP)

interface BootLoaderProps {
  appProgress?: number
  appReady?: boolean
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
const MAX_WAIT_FAILSAFE_MS = 8000

export function BootLoader({ appProgress = 1, appReady = true, onComplete }: BootLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const statusTextRef = useRef<HTMLSpanElement>(null)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])
  const glitchTlRef = useRef<gsap.core.Timeline | null>(null)
  const progressObjRef = useRef({ value: 0 })
  const hasExitedRef = useRef(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [docLoaded, setDocLoaded] = useState(() => document.readyState === 'complete')
  const [timedOut, setTimedOut] = useState(false)
  const [readyToExit, setReadyToExit] = useState(false)

  const targetPercent = timedOut
    ? 100
    : Math.min(
        100,
        Math.round(
          ((fontsLoaded ? 0.2 : 0) +
            (docLoaded ? 0.2 : 0) +
            Math.max(0, Math.min(1, appProgress)) * 0.6) *
            100
        )
      )
  const allAssetsReady = (fontsLoaded && docLoaded && appReady) || timedOut

  // Hand off smoothly after first painted frame and track document/fonts readiness
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      document.getElementById('boot-splash')?.remove()
    })

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    lenis?.stop()

    let isCancelled = false
    const waitFonts = document.fonts?.ready ?? Promise.resolve()
    waitFonts.then(() => {
      if (!isCancelled) setFontsLoaded(true)
    })

    if (document.readyState !== 'complete') {
      window.addEventListener(
        'load',
        () => {
          if (!isCancelled) setDocLoaded(true)
        },
        { once: true }
      )
    }

    const failsafeTimer = window.setTimeout(() => {
      if (!isCancelled) setTimedOut(true)
    }, MAX_WAIT_FAILSAFE_MS)

    return () => {
      isCancelled = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(failsafeTimer)
      document.body.style.overflow = prevOverflow
      lenis?.start()
    }
  }, [])

  const syncVisualProgress = (pctRaw: number) => {
    const pct = Math.max(0, Math.min(100, Math.round(pctRaw)))
    if (percentRef.current) {
      percentRef.current.textContent = `${String(pct).padStart(3, '0')}%`
    }

    // Use floor so 24/24 segments only light at 100%, keeping bar and percentage strictly in sync
    const litCount = Math.floor((pct / 100) * SEGMENT_COUNT)
    const active = getActivePalette()
    segmentRefs.current.forEach((seg, idx) => {
      if (!seg) return
      const isLit = idx < litCount
      seg.style.opacity = isLit ? '1' : '0.12'
      seg.style.backgroundColor = isLit
        ? idx >= SEGMENT_COUNT - 4
          ? active.secondary
          : active.primary
        : '#1e293b'
    })

    if (!statusTextRef.current) return
    const nextText =
      BOOT_STEPS[Math.min(BOOT_STEPS.length - 1, Math.floor((pct / 100) * BOOT_STEPS.length))]

    if (statusTextRef.current.textContent !== nextText) {
      statusTextRef.current.textContent = nextText
      gsap.fromTo(
        statusTextRef.current,
        { autoAlpha: 0, x: -6 },
        { autoAlpha: 1, x: 0, duration: 0.18, ease: 'power2.out', overwrite: 'auto' }
      )
    }
  }

  // Entrance + continuous glitch loop
  useGSAP(
    () => {
      if (!rootRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

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

      gsap.from('.boot-shell', {
        autoAlpha: 0,
        y: 10,
        duration: 0.25,
        ease: 'power2.out',
      })
    },
    { scope: rootRef }
  )

  // Single unified progress tween driven directly by real asset readiness percentage
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nextValue = allAssetsReady ? 100 : Math.min(99, targetPercent)

    if (prefersReducedMotion) {
      progressObjRef.current.value = nextValue
      syncVisualProgress(nextValue)
      if (allAssetsReady) {
        const id = requestAnimationFrame(() => setReadyToExit(true))
        return () => cancelAnimationFrame(id)
      }
      return
    }

    const delta = Math.max(0, nextValue - progressObjRef.current.value)
    const duration = Math.max(0.35, Math.min(1.4, (delta / 100) * 1.4))

    const tween = gsap.to(progressObjRef.current, {
      value: nextValue,
      duration,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: () => {
        syncVisualProgress(progressObjRef.current.value)
      },
      onComplete: () => {
        syncVisualProgress(nextValue)
        if (allAssetsReady && nextValue >= 100) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setReadyToExit(true)
            })
          })
        }
      },
    })

    return () => {
      tween.kill()
    }
  }, [targetPercent, allAssetsReady])

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
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[var(--bg-primary)] px-6 select-none"
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
              className="flex-1 bg-slate-800 opacity-15"
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
