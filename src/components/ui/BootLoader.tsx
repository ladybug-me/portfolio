import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface BootLoaderProps {
  onComplete: () => void
}

const BOOT_STEPS = [
  { status: 'OK', text: 'Mounted /dev/nvme0n1p1 (wayland-compositor)' },
  { status: 'OK', text: 'Started Caelestia IPC Socket (<5ms)' },
  { status: 'OK', text: 'Initialized CUDA & Edge Inference Runtime' },
  { status: 'OK', text: 'Loaded FAISS Vector Index (44,441 items)' },
  { status: 'OK', text: 'Reached target Graphical Interface.' },
]

export function BootLoader({ onComplete }: BootLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const hasExitedRef = useRef(false)
  const [readyToExit, setReadyToExit] = useState(false)

  // Hand off from static #boot-splash and pause scroll while booting
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

  // Boot sequence entrance & progress choreography
  useGSAP(
    () => {
      if (!rootRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const progressObj = { value: 0 }
      const tl = gsap.timeline()

      tl.from('.boot-cmd', {
        autoAlpha: 0,
        y: 8,
        duration: 0.3,
        ease: 'power2.out',
      })
        .from(
          '.boot-line',
          {
            autoAlpha: 0,
            x: -14,
            duration: 0.35,
            stagger: 0.28,
            ease: 'power3.out',
          },
          0.18
        )
        .from(
          '.boot-ok',
          {
            scale: 0.65,
            autoAlpha: 0,
            duration: 0.25,
            stagger: 0.28,
            ease: 'back.out(2)',
          },
          0.18
        )
        .to(
          barRef.current,
          {
            scaleX: 1,
            duration: 1.75,
            ease: 'power2.inOut',
          },
          0.15
        )
        .to(
          progressObj,
          {
            value: 100,
            duration: 1.75,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (percentRef.current) {
                percentRef.current.textContent = `${Math.round(progressObj.value)}%`
              }
            },
          },
          0.15
        )
    },
    { scope: rootRef }
  )

  // Compositor shutter exit once min 2s & page assets are ready
  useGSAP(
    () => {
      if (!readyToExit || hasExitedRef.current || !rootRef.current) return
      hasExitedRef.current = true

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        onComplete()
        return
      }

      gsap
        .timeline({
          onComplete: () => {
            document.body.style.overflow = ''
            const lenis = (window as unknown as { __lenis?: { start: () => void } }).__lenis
            lenis?.start()
            onComplete()
          },
        })
        .to('.boot-shell', {
          autoAlpha: 0,
          y: -16,
          scale: 0.97,
          duration: 0.28,
          ease: 'power2.in',
        })
        .to(
          rootRef.current,
          {
            clipPath: 'inset(50% 0% 50% 0%)',
            autoAlpha: 0,
            duration: 0.65,
            ease: 'expo.inOut',
          },
          '-=0.08'
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
      <div className="boot-shell w-full max-w-xl font-mono text-xs sm:text-sm">
        {/* Terminal Prompt */}
        <div className="boot-cmd flex items-center gap-2 text-slate-400 mb-5">
          <span className="text-cyan-400 font-bold">ladybug-me@arch</span>
          <span className="text-slate-600">:</span>
          <span className="text-emerald-400">~</span>
          <span className="text-slate-500">$ ./init --portfolio</span>
          <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5" />
        </div>

        {/* Minimalist Kernel / Systemd Lines */}
        <div className="space-y-2.5 mb-7">
          {BOOT_STEPS.map((step, idx) => (
            <div key={idx} className="boot-line flex items-baseline gap-3 text-slate-300">
              <span className="boot-ok shrink-0 text-slate-500">
                [ <span className="text-emerald-400 font-semibold">{step.status}</span> ]
              </span>
              <span className="truncate">{step.text}</span>
            </div>
          ))}
        </div>

        {/* Thin Progress Line + Numeric Readout */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 h-[2px] bg-white/10 overflow-hidden rounded-full">
            <div
              ref={barRef}
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 origin-left scale-x-0 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            />
          </div>
          <span ref={percentRef} className="w-10 text-right text-cyan-300 font-semibold tabular-nums">
            0%
          </span>
        </div>
      </div>
    </div>
  )
}
