import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trailerPos, setTrailerPos] = useState({ x: -100, y: -100 })
  const [isClicking, setIsClicking] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only enable on pointer-capable devices
    if (window.matchMedia('(hover: none)').matches) return

    let currentTrailer = { x: -100, y: -100 }
    let target = { x: -100, y: -100 }
    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      target = { x: e.clientX, y: e.clientY }
      setPos(target)
      if (!isVisible) setIsVisible(true)

      // Check if hovering over clickable elements
      const targetElement = e.target as HTMLElement | null
      const isInteractive = targetElement?.closest('a, button, [role="button"]') !== null
      setIsHovering(isInteractive)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    // Smooth trailer interpolation loop
    const animateTrailer = () => {
      currentTrailer.x += (target.x - currentTrailer.x) * 0.18
      currentTrailer.y += (target.y - currentTrailer.y) * 0.18
      setTrailerPos({ x: currentTrailer.x, y: currentTrailer.y })
      rafId = requestAnimationFrame(animateTrailer)
    }
    rafId = requestAnimationFrame(animateTrailer)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Precision inner center dot */}
      <div
        className="fixed w-2 h-2 rounded-full bg-cyan-400 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 shadow-[0_0_8px_#00f2fe]"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.6 : 1})`,
        }}
      />

      {/* Outer cybernetic tracking reticle */}
      <div
        className="fixed rounded-full border border-cyan-400/40 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out flex items-center justify-center"
        style={{
          left: `${trailerPos.x}px`,
          top: `${trailerPos.y}px`,
          width: isClicking ? '26px' : isHovering ? '48px' : '36px',
          height: isClicking ? '26px' : isHovering ? '48px' : '36px',
          borderColor: isClicking ? '#00ffa3' : isHovering ? '#00f2fe' : 'rgba(0, 242, 254, 0.45)',
          backgroundColor: isClicking ? 'rgba(0, 255, 163, 0.12)' : isHovering ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
          boxShadow: isClicking ? '0 0 16px rgba(0, 255, 163, 0.4)' : isHovering ? '0 0 14px rgba(0, 242, 254, 0.25)' : 'none',
        }}
      >
        {/* Reticle corner marks when hovering */}
        {isHovering && (
          <div className="absolute inset-0 flex items-center justify-between px-0.5">
            <span className="w-1 h-[1px] bg-cyan-400" />
            <span className="w-1 h-[1px] bg-cyan-400" />
          </div>
        )}
      </div>
    </div>
  )
}
