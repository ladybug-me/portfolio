import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only enable on pointer-capable devices
    if (window.matchMedia('(hover: none)').matches) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let isClicking = false
    let isHovering = false
    let isVisible = false
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!isVisible) {
        isVisible = true
        if (dotRef.current) dotRef.current.style.opacity = '1'
        if (ringRef.current) ringRef.current.style.opacity = '1'
      }

      // Fast check for interactive elements without deep recursive DOM queries
      const target = e.target as HTMLElement | null
      const interactive = target ? Boolean(target.closest('a, button, [role="button"], input, textarea')) : false
      if (interactive !== isHovering) {
        isHovering = interactive
        if (ringRef.current) {
          ringRef.current.style.width = isHovering ? '48px' : '36px'
          ringRef.current.style.height = isHovering ? '48px' : '36px'
          ringRef.current.style.borderColor = isHovering ? '#00f2fe' : 'rgba(0, 242, 254, 0.45)'
          ringRef.current.style.backgroundColor = isHovering ? 'rgba(0, 242, 254, 0.08)' : 'transparent'
          ringRef.current.style.boxShadow = isHovering ? '0 0 14px rgba(0, 242, 254, 0.25)' : 'none'
        }
      }
    }

    const handleMouseDown = () => {
      isClicking = true
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(0.75)`
        ringRef.current.style.borderColor = '#00ffa3'
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(0.6)`
      }
    }

    const handleMouseUp = () => {
      isClicking = false
      if (ringRef.current) {
        ringRef.current.style.borderColor = isHovering ? '#00f2fe' : 'rgba(0, 242, 254, 0.45)'
      }
    }

    const handleMouseLeave = () => {
      isVisible = false
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
    }

    const handleMouseEnter = () => {
      isVisible = true
      if (dotRef.current) dotRef.current.style.opacity = '1'
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    // Direct GPU Compositor transform loop (0 React re-renders)
    const renderLoop = () => {
      if (isVisible) {
        // Direct translate3d on compositor layer
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isClicking ? 0.6 : 1})`
        }

        ringX += (mouseX - ringX) * 0.2
        ringY += (mouseY - ringY) * 0.2
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${isClicking ? 0.75 : 1})`
        }
      }

      rafId = requestAnimationFrame(renderLoop)
    }

    rafId = requestAnimationFrame(renderLoop)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Precision inner center dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 opacity-0 will-change-transform shadow-[0_0_8px_#00f2fe]"
      />

      {/* Outer cybernetic tracking reticle */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-9 h-9 rounded-full border border-cyan-400/45 opacity-0 will-change-transform transition-[width,height,border-color,background-color,box-shadow] duration-150 ease-out flex items-center justify-center"
      />
    </div>
  )
}
