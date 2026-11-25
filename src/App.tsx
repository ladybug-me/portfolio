import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { HeroCanvas } from './components/canvas/HeroCanvas'
import { CustomCursor } from './components/ui/CustomCursor'
import { SectionNavigator } from './components/ui/SectionNavigator'
import { PaletteSwitcher } from './components/ui/PaletteSwitcher'
import { BootLoader } from './components/ui/BootLoader'
import { HeroSection } from './components/sections/HeroSection'
import { KineticTextScrub } from './components/ui/KineticTextScrub'
import { CircuitPipeline } from './components/ui/CircuitPipeline'

const PetCanvas = lazy(() =>
  import('./components/canvas/PetCanvas').then((m) => ({ default: m.PetCanvas }))
)
const ProjectsSection = lazy(() =>
  import('./components/sections/ProjectsSection').then((m) => ({ default: m.ProjectsSection }))
)
const SkillsMatrix = lazy(() =>
  import('./components/sections/SkillsMatrix').then((m) => ({ default: m.SkillsMatrix }))
)
const InteractiveFaq = lazy(() =>
  import('./components/sections/InteractiveFaq').then((m) => ({ default: m.InteractiveFaq }))
)
const ContactSection = lazy(() =>
  import('./components/sections/ContactSection').then((m) => ({ default: m.ContactSection }))
)

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({
  ignoreMobileResize: true,
})

export function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      autoRaf: false,
    })

    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    let lastWidth = window.innerWidth
    let refreshTimer: ReturnType<typeof setTimeout> | null = null

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        lenis.resize()
        ScrollTrigger.sort()
        ScrollTrigger.refresh()
      }, 220)
    }

    const handleResize = () => {
      // Ignore vertical-only mobile address-bar resizes to prevent pin/layout flicker mid-scroll
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      scheduleRefresh()
    }

    let lastContainerHeight = containerRef.current?.scrollHeight ?? 0
    const ro = new ResizeObserver(() => {
      const nextHeight = containerRef.current?.scrollHeight ?? 0
      if (Math.abs(nextHeight - lastContainerHeight) > 80) {
        lastContainerHeight = nextHeight
        scheduleRefresh()
      }
    })
    if (containerRef.current) {
      ro.observe(containerRef.current)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      delete (window as unknown as { __lenis?: Lenis }).__lenis
      if (refreshTimer) clearTimeout(refreshTimer)
      ro.disconnect()
      window.removeEventListener('resize', handleResize)
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
    }
  }, [])

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // 1. Projects Section Title Masked Reveal
      gsap.from('.projects-title-word', {
        scrollTrigger: {
          trigger: '#projects h2',
          start: 'top 85%',
        },
        y: '125%',
        rotateX: -40,
        opacity: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'power4.out',
      })

      // 3. Skills Section Title Masked Reveal
      gsap.from('.skills-title-word', {
        scrollTrigger: {
          trigger: '#skills h2',
          start: 'top 85%',
        },
        y: '125%',
        rotateX: -40,
        opacity: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'power4.out',
      })


      // 5. FAQ Title Masked Reveal
      gsap.from('.faq-title-word', {
        scrollTrigger: {
          trigger: '#faq h2',
          start: 'top 85%',
        },
        y: '125%',
        rotateX: -40,
        opacity: 0,
        duration: 0.95,
        stagger: 0.08,
        ease: 'power4.out',
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[var(--bg-primary)] text-[#f0f6fc] selection:bg-cyan-400 selection:text-black"
    >
      {/* Boot Screen: Minimalist Dark Linux Init */}
      {!bootDone && (
        <BootLoader
          onComplete={() => {
            setBootDone(true)
            ScrollTrigger.refresh()
          }}
        />
      )}

      {/* Interactive Cybernetic Mouse Follower */}
      <CustomCursor />

      {/* Instant 3D Background Shape */}
      <HeroCanvas />

      {/* Deferred 3D Pet Companion */}
      <Suspense fallback={null}>
        <PetCanvas />
      </Suspense>

      {/* Foreground Content Layers */}
      <PaletteSwitcher />
      <SectionNavigator />
      <main className="relative z-10">
        <HeroSection ready={bootDone} />

        {/* Scroll-Linked Word Illumination Statement */}
        <KineticTextScrub text="WE STRIP DEAD ABSTRACTIONS OUT OF THE DESKTOP. WE RUN HARD INFERENCE ON COLD SILICON. LATENCY IS A DEFECT." />

        {/* Scroll-Drawn Circuit Pipeline */}
        <CircuitPipeline />

        {/* Deferred Below-the-Fold Sections */}
        <Suspense fallback={null}>
          <ProjectsSection />
          <SkillsMatrix />
          <InteractiveFaq />
        </Suspense>
      </main>
      <div className="relative z-30">
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </div>
    </div>
  )
}

export default App
