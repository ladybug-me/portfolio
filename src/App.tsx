import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { HeroCanvas } from './components/canvas/HeroCanvas'
import { PetCanvas } from './components/canvas/PetCanvas'
import { CustomCursor } from './components/ui/CustomCursor'
import { Navbar } from './components/ui/Navbar'
import { HeroSection } from './components/sections/HeroSection'
import { CurvedRibbon } from './components/ui/CurvedRibbon'
import { MarqueeTicker } from './components/ui/MarqueeTicker'
import { KineticTextScrub } from './components/ui/KineticTextScrub'
import { CircuitPipeline } from './components/ui/CircuitPipeline'
import { ProjectsSection } from './components/sections/ProjectsSection'
import { SkillsMatrix } from './components/sections/SkillsMatrix'
import { InteractiveFaq } from './components/sections/InteractiveFaq'
import { Footer } from './components/sections/Footer'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(500, 33)

    const handleResize = () => {
      lenis.resize()
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
    }
  }, [])

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      // 1. Hero 3D Masked Word Roll-Up Entrance Timeline
      const heroTl = gsap.timeline({ delay: 0.15 })

      heroTl
        .from('.hero-word', {
          y: '130%',
          rotateX: -45,
          opacity: 0,
          duration: 1.15,
          stagger: 0.06,
          ease: 'power4.out',
        })
        .from(
          '.hero-sub',
          {
            y: 28,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .from(
          '.hero-meta, .hero-cta',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.5'
        )

      // 2. Projects Section Title Masked Reveal
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
      className="relative min-h-screen bg-[#07090e] text-[#f0f6fc] selection:bg-cyan-400 selection:text-black"
    >
      {/* Interactive Cybernetic Mouse Follower */}
      <CustomCursor />

      {/* Autonomous 3D Spherical Pet Companion */}
      <PetCanvas />

      {/* Fullscreen 3D Shader Background with GSAP-Scrubbed Orbit */}
      <HeroCanvas />

      {/* Foreground Content Layers */}
      <Navbar />
      <main className="relative z-10">
        <HeroSection />

        {/* Curved Ribbon Marquee Sweep */}
        <CurvedRibbon />

        {/* Infinite Kinetic Ticker */}
        <MarqueeTicker />

        {/* Scroll-Linked Word Illumination Statement */}
        <KineticTextScrub text="WE STRIP DEAD ABSTRACTIONS OUT OF THE DESKTOP. WE RUN HARD INFERENCE ON COLD SILICON. LATENCY IS A DEFECT." />

        {/* Scroll-Drawn Circuit Pipeline */}
        <CircuitPipeline />

        {/* Sticky Deck Project Showcase */}
        <ProjectsSection />

        {/* Technical Capabilities Matrix */}
        <SkillsMatrix />

        {/* Interactive Pill-Accordion Q&A */}
        <InteractiveFaq />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default App
