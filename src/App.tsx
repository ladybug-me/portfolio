import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { Navbar } from './components/ui/Navbar'
import { HeroSection } from './components/sections/HeroSection'
import { ProjectsSection } from './components/sections/ProjectsSection'
import { SkillsMatrix } from './components/sections/SkillsMatrix'
import { Footer } from './components/sections/Footer'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize Lenis smooth scroll and synchronize with GSAP ScrollTrigger
  useEffect(() => {
    // Check user reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Add Lenis to GSAP ticker for synchronized 60fps frame loop
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

  // Composed GSAP ScrollTrigger reveals
  useGSAP(
    () => {
      // Reveal project cards with smooth stagger
      gsap.from('#projects article', {
        scrollTrigger: {
          trigger: '#projects',
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })

      // Reveal skills matrix cards
      gsap.from('#skills > div > div', {
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="min-h-screen bg-[#07090e] text-[#f0f6fc] selection:bg-cyan-400 selection:text-black">
      <Navbar />
      <main>
        <HeroSection />
        <ProjectsSection />
        <SkillsMatrix />
      </main>
      <Footer />
    </div>
  )
}

export default App
