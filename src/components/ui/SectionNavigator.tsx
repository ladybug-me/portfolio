import { useState, useEffect, useRef, useCallback } from 'react'

interface NavItem {
  id: string
  label: string
}

const SECTIONS: NavItem[] = [
  { id: 'hero', label: 'HOME' },
  { id: 'statement', label: 'QUOTE' },
  { id: 'pipeline', label: 'STACK' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'skills', label: 'TOOLING' },
  { id: 'faq', label: 'QUERIES' },
  { id: 'contact', label: 'CONTACT' },
]

export function SectionNavigator() {
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isMobileScrubbing, setIsMobileScrubbing] = useState<boolean>(false)
  const [scrubSectionId, setScrubSectionId] = useState<string>('hero')

  const navRef = useRef<HTMLElement>(null)
  const mobileRailRef = useRef<HTMLDivElement>(null)
  const activeSectionRef = useRef<string>(activeSection)
  const isProgrammaticScrollRef = useRef<boolean>(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isWheelLockedRef = useRef<boolean>(false)
  const wheelLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    activeSectionRef.current = activeSection
  }, [activeSection])

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    setActiveSection(id)
    activeSectionRef.current = id
    isProgrammaticScrollRef.current = true
    isWheelLockedRef.current = true

    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current)
    }
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false
      isWheelLockedRef.current = false
    }, 950)

    let targetY = 0
    if (id !== 'hero') {
      const targetEl = (
        el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
      ) as HTMLElement
      const rect = targetEl.getBoundingClientRect()
      targetY = Math.max(0, rect.top + window.scrollY)
    }

    const win = window as unknown as {
      __lenis?: {
        scrollTo: (
          target: number | HTMLElement | string,
          opts?: {
            duration?: number
            lock?: boolean
            easing?: (t: number) => number
            onComplete?: () => void
          }
        ) => void
      }
    }

    if (win.__lenis) {
      win.__lenis.scrollTo(targetY, {
        duration: 0.85,
        lock: true,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        onComplete: () => {
          isProgrammaticScrollRef.current = false
          isWheelLockedRef.current = false
        },
      })
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }
  }, [])

  // Smooth scroll listener updating active section based on viewport position
  useEffect(() => {
    let rafId: number | null = null

    const handleScroll = () => {
      setIsScrolling(true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 1400)

      if (rafId !== null) return

      rafId = requestAnimationFrame(() => {
        rafId = null

        if (isProgrammaticScrollRef.current) return

        for (let i = SECTIONS.length - 1; i >= 0; i--) {
          const sec = document.getElementById(SECTIONS[i].id)
          if (sec) {
            const rect = sec.getBoundingClientRect()
            if (rect.top <= window.innerHeight * 0.45) {
              setActiveSection((prev) => (prev === SECTIONS[i].id ? prev : SECTIONS[i].id))
              break
            }
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current)
      if (wheelLockTimerRef.current) clearTimeout(wheelLockTimerRef.current)
    }
  }, [])

  // Wheel listener: step through sections cleanly
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (Math.abs(e.deltaY) < 10) return
      if (isWheelLockedRef.current) return

      isWheelLockedRef.current = true
      if (wheelLockTimerRef.current) clearTimeout(wheelLockTimerRef.current)
      wheelLockTimerRef.current = setTimeout(() => {
        isWheelLockedRef.current = false
      }, 850)

      setIsScrolling(true)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 1600)

      const currentIdx = Math.max(
        0,
        SECTIONS.findIndex((s) => s.id === activeSectionRef.current)
      )

      if (e.deltaY > 0) {
        const nextIdx = Math.min(SECTIONS.length - 1, currentIdx + 1)
        if (nextIdx !== currentIdx) {
          scrollToSection(SECTIONS[nextIdx].id)
        } else {
          isWheelLockedRef.current = false
        }
      } else if (e.deltaY < 0) {
        const prevIdx = Math.max(0, currentIdx - 1)
        if (prevIdx !== currentIdx) {
          scrollToSection(SECTIONS[prevIdx].id)
        } else {
          isWheelLockedRef.current = false
        }
      }
    }

    nav.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      nav.removeEventListener('wheel', handleWheel)
    }
  }, [scrollToSection])

  const activeIdx = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === activeSection)
  )
  const isVisible = isScrolling || isHovered

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIdx = Math.min(SECTIONS.length - 1, activeIdx + 1)
      scrollToSection(SECTIONS[nextIdx].id)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIdx = Math.max(0, activeIdx - 1)
      scrollToSection(SECTIONS[prevIdx].id)
    }
  }

  const pickSectionFromClientY = useCallback((clientY: number) => {
    const rail = mobileRailRef.current
    if (!rail) return activeSectionRef.current
    const rect = rail.getBoundingClientRect()
    if (rect.height <= 0) return activeSectionRef.current
    const ratio = Math.max(0, Math.min(0.9999, (clientY - rect.top) / rect.height))
    const idx = Math.min(SECTIONS.length - 1, Math.floor(ratio * SECTIONS.length))
    return SECTIONS[idx].id
  }, [])

  const handleMobilePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const targetId = pickSectionFromClientY(e.clientY)
    setScrubSectionId(targetId)
    setIsMobileScrubbing(true)
  }

  const handleMobilePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobileScrubbing) return
    const targetId = pickSectionFromClientY(e.clientY)
    setScrubSectionId((prev) => (prev !== targetId ? targetId : prev))
  }

  const handleMobilePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobileScrubbing) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    const targetId = pickSectionFromClientY(e.clientY)
    setIsMobileScrubbing(false)
    scrollToSection(targetId)
  }

  return (
    <>
      {/* Mobile Diffused Black Backdrop while Scrubbing */}
      <div
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 pointer-events-none bg-gradient-to-l from-black/80 via-black/45 to-transparent transition-opacity duration-200 ${
          isMobileScrubbing ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Mobile First-Letter Scrollbar Rail (expands on press & drag) */}
      <nav
        aria-label="Mobile Section Navigator"
        className="md:hidden fixed right-2 top-1/2 -translate-y-1/2 z-50 pointer-events-auto select-none"
      >
        <div
          ref={mobileRailRef}
          onPointerDown={handleMobilePointerDown}
          onPointerMove={handleMobilePointerMove}
          onPointerUp={handleMobilePointerEnd}
          onPointerCancel={handleMobilePointerEnd}
          className="touch-none flex flex-col items-end gap-3.5 py-3 pl-6 pr-1.5 cursor-pointer"
        >
          {SECTIONS.map((sec) => {
            const isActive = isMobileScrubbing
              ? scrubSectionId === sec.id
              : activeSection === sec.id

            return (
              <div
                key={sec.id}
                className={`flex items-center justify-end transition-all duration-150 ${
                  isActive
                    ? 'text-cyan-300 font-black scale-110 [text-shadow:0_0_14px_rgba(var(--accent-cyan-rgb),0.9)]'
                    : isMobileScrubbing
                      ? 'text-slate-300/80 font-semibold'
                      : 'text-slate-400/60 font-semibold'
                }`}
              >
                <span
                  className={`uppercase whitespace-nowrap tracking-wider transition-all duration-150 ${
                    isMobileScrubbing
                      ? isActive
                        ? 'text-xl -translate-x-2'
                        : 'text-sm'
                      : isActive
                        ? 'text-base'
                        : 'text-xs'
                  }`}
                >
                  {isMobileScrubbing ? sec.label : sec.label[0]}
                </span>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Desktop/Tablet Floating Typography Rail */}
      <nav
        ref={navRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Section Navigator"
        className={`hidden md:block fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-50 pointer-events-auto select-none outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-2 sm:translate-x-3 opacity-30 hover:opacity-100'
          }`}
      >
        {/* Pure Floating Typography - Zero background containers */}
        <div className="flex flex-col items-end gap-8 sm:gap-10 py-4">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeIdx === idx

            // All inactive sections share uniform alpha and sizing; only active magnifies
            const textSize = isActive
              ? 'text-2xl sm:text-4xl font-black tracking-tight'
              : 'text-xs sm:text-sm font-medium tracking-wider'
            const textTranslate = isActive ? '-translate-x-5 sm:-translate-x-7' : 'translate-x-0'
            const textOpacity = isActive ? 'opacity-100' : 'opacity-35 hover:opacity-85'
            const textColor = isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            const textGlow = isActive
              ? '[text-shadow:0_0_16px_rgba(var(--accent-cyan-rgb),0.95),0_0_35px_rgba(var(--accent-cyan-rgb),0.45)]'
              : ''
            const zIndex = isActive ? 'z-20' : 'z-0'

            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                aria-label={`Jump to ${sec.label}`}
                aria-current={isActive ? 'true' : undefined}
                className={`group relative flex items-center justify-end py-1 px-1 bg-transparent border-0 cursor-pointer origin-right transform-gpu transition-[transform,opacity,color] duration-300 ease-out will-change-transform active:scale-95 ${textSize} ${textTranslate} ${textOpacity} ${textColor} ${textGlow} ${zIndex}`}
              >
                <span className="uppercase whitespace-nowrap transition-colors duration-200">
                  {sec.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
