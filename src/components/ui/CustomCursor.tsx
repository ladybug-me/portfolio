import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const fireflyRef = useRef<HTMLDivElement>(null)
  const leftWingRef = useRef<SVGGElement>(null)
  const rightWingRef = useRef<SVGGElement>(null)
  const ripplesRef = useRef<HTMLDivElement>(null)

  // 4 bioluminescent trailing spark motes
  const mote0Ref = useRef<HTMLDivElement>(null)
  const mote1Ref = useRef<HTMLDivElement>(null)
  const mote2Ref = useRef<HTMLDivElement>(null)
  const mote3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only enable on pointer-capable devices
    if (window.matchMedia('(hover: none)').matches) return

    let mouseX = -100
    let mouseY = -100
    let flyX = -100
    let flyY = -100
    let currentRot = 0
    let isClicking = false
    let isHovering = false
    let isVisible = false
    let isFastFlapping = false
    let fastFlapUntil = 0
    let rafId: number

    // Mote positions
    const motes = [
      { x: -100, y: -100 },
      { x: -100, y: -100 },
      { x: -100, y: -100 },
      { x: -100, y: -100 },
    ]

    // Localized watery wave ripples around click point
    const spawnWateryWave = (x: number, y: number) => {
      const container = ripplesRef.current
      if (!container) return

      const waveGroup = document.createElement('div')
      waveGroup.style.position = 'absolute'
      waveGroup.style.left = `${x}px`
      waveGroup.style.top = `${y}px`
      waveGroup.style.width = '0'
      waveGroup.style.height = '0'
      waveGroup.style.pointerEvents = 'none'

      const r1 = document.createElement('div')
      r1.className = 'watery-wave-ring watery-wave-ring-1'

      const r2 = document.createElement('div')
      r2.className = 'watery-wave-ring watery-wave-ring-2'

      const r3 = document.createElement('div')
      r3.className = 'watery-wave-ring watery-wave-ring-3'

      waveGroup.appendChild(r1)
      waveGroup.appendChild(r2)
      waveGroup.appendChild(r3)

      container.appendChild(waveGroup)

      let cleaned = false
      const cleanup = () => {
        if (cleaned) return
        cleaned = true
        waveGroup.remove()
      }

      r1.addEventListener('animationend', cleanup, { once: true })
      setTimeout(cleanup, 950)
    }

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!isVisible) {
        isVisible = true
        flyX = mouseX
        flyY = mouseY
        motes.forEach((m) => {
          m.x = mouseX
          m.y = mouseY
        })
        if (fireflyRef.current) fireflyRef.current.style.opacity = '1'
        ;[mote0Ref, mote1Ref, mote2Ref, mote3Ref].forEach((ref) => {
          if (ref.current) ref.current.style.opacity = '0.7'
        })
      }

      // Check for interactive targets
      const target = e.target as HTMLElement | null
      const interactive = target
        ? Boolean(target.closest('a, button, [role="button"], input, textarea, select, label'))
        : false

      if (interactive !== isHovering) {
        isHovering = interactive
        if (fireflyRef.current) {
          fireflyRef.current.style.filter = isHovering
            ? 'drop-shadow(0 0 10px rgba(0, 255, 163, 0.95)) drop-shadow(0 0 16px rgba(0, 242, 254, 0.7))'
            : 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.85))'
        }
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      isClicking = true
      fastFlapUntil = performance.now() + 650
      spawnWateryWave(e.clientX, e.clientY)
    }

    const handlePointerUp = () => {
      isClicking = false
    }

    const handleMouseLeave = () => {
      isVisible = false
      if (fireflyRef.current) fireflyRef.current.style.opacity = '0'
      ;[mote0Ref, mote1Ref, mote2Ref, mote3Ref].forEach((ref) => {
        if (ref.current) ref.current.style.opacity = '0'
      })
    }

    const handleMouseEnter = () => {
      isVisible = true
      if (fireflyRef.current) fireflyRef.current.style.opacity = '1'
      ;[mote0Ref, mote1Ref, mote2Ref, mote3Ref].forEach((ref) => {
        if (ref.current) ref.current.style.opacity = '0.7'
      })
    }

    // Direct 60fps GPU compositor loop
    const renderLoop = () => {
      if (isVisible) {
        const prevFlyX = flyX
        const prevFlyY = flyY

        // Smooth flight agility towards cursor
        flyX += (mouseX - flyX) * 0.32
        flyY += (mouseY - flyY) * 0.32

        const vx = flyX - prevFlyX
        const vy = flyY - prevFlyY
        const speed = Math.hypot(vx, vy)

        // Banking and orientation in flight direction
        if (speed > 0.8) {
          const targetRot = (Math.atan2(vy, vx) * 180) / Math.PI + 90
          let diff = (targetRot - currentRot) % 360
          if (diff > 180) diff -= 360
          if (diff < -180) diff += 360
          currentRot += diff * 0.22
        } else {
          // Gently return towards upright when hovering
          let diff = (0 - currentRot) % 360
          if (diff > 180) diff -= 360
          if (diff < -180) diff += 360
          currentRot += diff * 0.08
        }

        // Wing fluttering: normally slow, fast on clicks
        const shouldFastFlap = isClicking || performance.now() < fastFlapUntil
        if (shouldFastFlap !== isFastFlapping) {
          isFastFlapping = shouldFastFlap
          if (leftWingRef.current && rightWingRef.current) {
            leftWingRef.current.className.baseVal = isFastFlapping
              ? 'firefly-wing-left-fast'
              : 'firefly-wing-left'
            rightWingRef.current.className.baseVal = isFastFlapping
              ? 'firefly-wing-right-fast'
              : 'firefly-wing-right'
          }
        }

        // Render firefly sprite transform
        if (fireflyRef.current) {
          const baseScale = isClicking ? 0.78 : isHovering ? 1.25 : 1.0
          fireflyRef.current.style.transform = `translate3d(${flyX}px, ${flyY}px, 0) translate(-50%, -50%) rotate(${currentRot}deg) scale(${baseScale})`
        }

        // Cascade bioluminescent spark trail
        motes[0].x += (flyX - motes[0].x) * 0.38
        motes[0].y += (flyY - motes[0].y) * 0.38
        motes[1].x += (motes[0].x - motes[1].x) * 0.34
        motes[1].y += (motes[0].y - motes[1].y) * 0.34
        motes[2].x += (motes[1].x - motes[2].x) * 0.30
        motes[2].y += (motes[1].y - motes[2].y) * 0.30
        motes[3].x += (motes[2].x - motes[3].x) * 0.26
        motes[3].y += (motes[2].y - motes[3].y) * 0.26

        const moteRefs = [mote0Ref, mote1Ref, mote2Ref, mote3Ref]
        const trailOpacityBase = Math.min(1.0, speed * 0.35 + (isHovering ? 0.6 : 0.25))

        motes.forEach((m, idx) => {
          const el = moteRefs[idx].current
          if (el) {
            const op = trailOpacityBase * (1.0 - idx * 0.22)
            el.style.transform = `translate3d(${m.x}px, ${m.y}px, 0) translate(-50%, -50%)`
            el.style.opacity = `${op}`
          }
        })
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Watery Wave Ripples Container */}
      <div ref={ripplesRef} className="absolute inset-0 pointer-events-none" />

      {/* Bioluminescent Trailing Spark Motes */}
      <div
        ref={mote0Ref}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-300 opacity-0 will-change-transform shadow-[0_0_8px_#00f2fe]"
      />
      <div
        ref={mote1Ref}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 will-change-transform shadow-[0_0_6px_#00f2fe]"
      />
      <div
        ref={mote2Ref}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 will-change-transform shadow-[0_0_6px_#00ffa3]"
      />
      <div
        ref={mote3Ref}
        className="fixed top-0 left-0 w-1 h-1 rounded-full bg-emerald-300 opacity-0 will-change-transform shadow-[0_0_4px_#00ffa3]"
      />

      {/* Playful Cyber Firefly / Energy Sprite */}
      <div
        ref={fireflyRef}
        className="fixed top-0 left-0 w-8 h-8 opacity-0 will-change-transform transition-[filter] duration-200 ease-out flex items-center justify-center drop-shadow-[0_0_8px_rgba(0,242,254,0.85)]"
      >
        <svg viewBox="0 0 32 32" className="w-full h-full overflow-visible">
          <defs>
            {/* Wing Gradients */}
            <linearGradient id="fireflyWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffa3" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#00f2fe" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.2" />
            </linearGradient>

            {/* Glowing Core Gradient */}
            <radialGradient id="fireflyCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#00ffa3" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#00f2fe" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Left Wing */}
          <g ref={leftWingRef} className="firefly-wing-left">
            <path
              d="M 15 14 C 6 6 1 12 7 20 C 11 23 15 17 15 14 Z"
              fill="url(#fireflyWingGrad)"
              stroke="#00ffa3"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
          </g>

          {/* Right Wing */}
          <g ref={rightWingRef} className="firefly-wing-right">
            <path
              d="M 17 14 C 26 6 31 12 25 20 C 21 23 17 17 17 14 Z"
              fill="url(#fireflyWingGrad)"
              stroke="#00ffa3"
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />
          </g>

          {/* Curved Holographic Antennae with glowing tips */}
          <path
            d="M 14.5 10.5 Q 11 4 7 6"
            stroke="rgba(0, 242, 254, 0.8)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="7" cy="6" r="1.2" fill="#00ffa3" className="shadow-[0_0_4px_#00ffa3]" />

          <path
            d="M 17.5 10.5 Q 21 4 25 6"
            stroke="rgba(0, 242, 254, 0.8)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="25" cy="6" r="1.2" fill="#00ffa3" className="shadow-[0_0_4px_#00ffa3]" />

          {/* Obsidian Head & Thorax */}
          <circle cx="16" cy="11.5" r="2.4" fill="#030814" stroke="#00f2fe" strokeWidth="0.8" />

          {/* Radiant Bioluminescent Abdomen */}
          <ellipse cx="16" cy="18.5" rx="3.6" ry="6" fill="url(#fireflyCoreGrad)" className="firefly-glow-body" />
          <ellipse cx="16" cy="17.5" rx="1.6" ry="3.2" fill="#ffffff" opacity="0.95" />

          {/* Pixel-perfect center laser pinpoint */}
          <circle cx="16" cy="11.5" r="0.9" fill="#00ffa3" />
        </svg>
      </div>
    </div>
  )
}
