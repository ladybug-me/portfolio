import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { PALETTES, setActivePalette, usePalette } from '../../theme/palettes'

gsap.registerPlugin(useGSAP)

export function PaletteSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const palette = usePalette()
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleOutside = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('pointerdown', handleOutside)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('pointerdown', handleOutside)
      window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  useGSAP(
    () => {
      if (!isOpen || !menuRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      gsap.fromTo(
        menuRef.current,
        { autoAlpha: 0, y: -8, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out', clearProps: 'transform' }
      )
    },
    { scope: wrapRef, dependencies: [isOpen] }
  )

  return (
    <div
      ref={wrapRef}
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex flex-col items-end"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Color palette switcher"
        aria-expanded={isOpen}
        className="w-12 h-12 rounded-full bg-[#0d111a]/80 backdrop-blur-2xl border border-white/20 hover:border-cyan-400/60 text-cyan-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95"
      >
        <Icon icon="mdi:palette" className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Select color palette"
          className="mt-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-3xl bg-[#0d111a]/65 backdrop-blur-3xl border border-white/20 p-3 sm:p-4 shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col gap-2"
        >
          {PALETTES.map((p) => {
            const isSelected = p.id === palette.id
            return (
              <button
                key={p.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setActivePalette(p.id)
                  setIsOpen(false)
                }}
                className={`w-full px-5 py-4 rounded-2xl flex items-center justify-between text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white/12 text-white border border-white/20'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white border border-transparent'
                }`}
              >
                <span className="flex items-center gap-4">
                  <span
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 border border-white/30"
                    style={{
                      background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
                      boxShadow: `0 0 12px ${p.primary}`,
                    }}
                  />
                  <span>{p.name}</span>
                </span>
                {isSelected && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: p.primary,
                      boxShadow: `0 0 10px ${p.primary}`,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
