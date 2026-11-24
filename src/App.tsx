import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { HeroCanvas } from './components/canvas/HeroCanvas'
import { CustomCursor } from './components/ui/CustomCursor'
import { Navbar } from './components/ui/Navbar'
import { HeroSection } from './components/sections/HeroSection'
import { ProjectsSection } from './components/sections/ProjectsSection'
import { SkillsMatrix } from './components/sections/SkillsMatrix'
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
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
    }
  }, [])

  useGSAP(
    () => {
      // 1. Hero Entrance Sequence
      gsap.from('.hero-fade', {
        y: 40,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2,
      })

      // 2. Project Cards ScrollTrigger Stagger
      gsap.from('#projects article', {
        scrollTrigger: {
          trigger: '#projects',
          start: 'top 75%',
        },
        y: 50,
        opacity: 0,
        duration: 0.85,
        stagger: 0.16,
        ease: 'power3.out',
      })

      // 3. Technical Matrix Cards Reveal
      gsap.from('#skills > div > div', {
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 0.75,
        stagger: 0.14,
        ease: 'power3.out',
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#07090e] text-[#f0f6fc] selection:bg-cyan-400 selection:text-black">
      {/* Interactive Cybernetic Mouse Follower */}
      <CustomCursor />

      {/* Fullscreen 3D Shader Background with GSAP-Scrubbed Camera Orbit */}
      <HeroCanvas />

      {/* Foreground Content Layers */}
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <ProjectsSection />
        <SkillsMatrix />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default App
