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

    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('mousedown', handleOutside)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleOutside)
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
      className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-[60] transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-20 hover:opacity-100 focus-within:opacity-100'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Color palette settings"
        aria-expanded={isOpen}
        className="w-10 h-10 rounded-full bg-[#0d111a]/80 backdrop-blur-xl border border-white/15 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      >
        <Icon
          icon="mdi:cog"
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90 text-cyan-300' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Select color palette"
          className="mt-2.5 w-48 rounded-2xl bg-[#0d111a]/92 backdrop-blur-2xl border border-white/15 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.75)] flex flex-col gap-1"
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
                className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-white/25"
                    style={{
                      background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
                      boxShadow: `0 0 8px ${p.primary}`,
                    }}
                  />
                  <span>{p.name}</span>
                </span>
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: p.primary }}
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
