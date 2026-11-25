import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export interface GalleryMediaItem {
  src: string
  label: string
  type: 'image' | 'video'
}

export interface GalleryProject {
  id: string
  number: string
  title: string
  badge: string
  gallery: GalleryMediaItem[]
}

interface ProjectGalleryModalProps {
  project: GalleryProject
  onClose: () => void
}

function FloatingMediaCard({
  item,
  single,
  onSelect,
}: {
  item: GalleryMediaItem
  single: boolean
  onSelect: () => void
}) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const rotateXTo = useRef<gsap.QuickToFunc | null>(null)
  const rotateYTo = useRef<gsap.QuickToFunc | null>(null)

  useGSAP(
    () => {
      if (!cardRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      rotateXTo.current = gsap.quickTo(cardRef.current, 'rotationX', {
        duration: 0.35,
        ease: 'power3.out',
      })
      rotateYTo.current = gsap.quickTo(cardRef.current, 'rotationY', {
        duration: 0.35,
        ease: 'power3.out',
      })
    },
    { scope: cardRef }
  )

  const handleMouseEnter = () => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1.04,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current || !rotateXTo.current || !rotateYTo.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    rotateXTo.current(-ny * 14)
    rotateYTo.current(nx * 16)
  }

  const handleMouseLeave = () => {
    rotateXTo.current?.(0)
    rotateYTo.current?.(0)
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const sizeClass = single
    ? 'w-[86vw] sm:w-[76vw] max-h-[75vh]'
    : 'w-[84vw] sm:w-[44vw] lg:w-[29vw] max-h-[36vh] sm:max-h-[41vh]'

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={item.label}
      className={`gallery-grid-item group relative cursor-pointer focus:outline-none will-change-transform [transform-style:preserve-3d] transition-[border-color,box-shadow] duration-300 rounded-2xl border border-white/20 hover:border-cyan-400/60 overflow-hidden bg-slate-950/30 shadow-[0_20px_50px_rgba(0,0,0,0.65)] hover:shadow-[0_24px_60px_rgba(34,211,238,0.28)] flex items-center justify-center ${sizeClass}`}
    >
      {item.type === 'video' ? (
        <video
          src={item.src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <img
          src={item.src}
          alt={item.label}
          className="w-full h-full object-contain"
        />
      )}
    </button>
  )
}

export function ProjectGalleryModal({ project, onClose }: ProjectGalleryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const magnifiedRef = useRef<HTMLDivElement>(null)
  const isAnimatingOut = useRef(false)

  const animateCloseGrid = useCallback(() => {
    if (isAnimatingOut.current) return
    isAnimatingOut.current = true
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = gridRef.current?.querySelectorAll('.gallery-grid-item')
    if (prefersReducedMotion || !items || items.length === 0) {
      onClose()
      return
    }
    gsap.to(items, {
      autoAlpha: 0,
      scale: 0.78,
      y: 28,
      rotationX: -10,
      duration: 0.28,
      stagger: { each: 0.035, from: 'edges' },
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: onClose,
    })
  }, [onClose])

  const animateBackToGrid = () => {
    if (isAnimatingOut.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !magnifiedRef.current) {
      setSelectedIndex(null)
      return
    }
    isAnimatingOut.current = true
    gsap.to(magnifiedRef.current, {
      autoAlpha: 0,
      scale: 0.84,
      duration: 0.22,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        isAnimatingOut.current = false
        setSelectedIndex(null)
      },
    })
  }

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedIndex !== null) {
          animateBackToGrid()
        } else {
          animateCloseGrid()
        }
      }
      if (selectedIndex !== null) {
        if (e.key === 'ArrowRight' && selectedIndex < project.gallery.length - 1) {
          setSelectedIndex(selectedIndex + 1)
        }
        if (e.key === 'ArrowLeft' && selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedIndex, project.gallery.length, animateCloseGrid])

  // Stage 1: Floating unblurred grid entrance
  useGSAP(
    () => {
      if (selectedIndex !== null || !gridRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      gsap.fromTo(
        '.gallery-grid-item',
        {
          autoAlpha: 0,
          scale: 0.75,
          y: 36,
          rotationX: 12,
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 0.55,
          stagger: { each: 0.06, from: 'center' },
          ease: 'back.out(1.4)',
          clearProps: 'transform',
        }
      )
    },
    { scope: overlayRef, dependencies: [project.id, selectedIndex] }
  )

  // Stage 2: 75% magnified reveal (no mouse tilt)
  useGSAP(
    () => {
      if (selectedIndex === null || !magnifiedRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      gsap.fromTo(
        magnifiedRef.current,
        {
          autoAlpha: 0,
          scale: 0.8,
          clipPath: 'inset(10% 8% 10% 8% round 16px)',
        },
        {
          autoAlpha: 1,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0% round 16px)',
          duration: 0.45,
          ease: 'expo.out',
          clearProps: 'transform,clipPath',
        }
      )
    },
    { scope: overlayRef, dependencies: [project.id, selectedIndex] }
  )

  const selectedItem = selectedIndex !== null ? project.gallery[selectedIndex] : null
  const hasPrev = selectedIndex !== null && selectedIndex > 0
  const hasNext = selectedIndex !== null && selectedIndex < project.gallery.length - 1

  const handleEmptySpaceClick = () => {
    if (selectedIndex !== null) {
      animateBackToGrid()
    } else {
      animateCloseGrid()
    }
  }

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} gallery`}
      onClick={handleEmptySpaceClick}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 [perspective:1400px] transition-[backdrop-filter,background-color] duration-300 ${
        selectedItem ? 'bg-slate-950/20 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      {selectedItem ? (
        <>
          {hasPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
              }}
              aria-label="Previous media"
              className="group fixed inset-y-0 left-0 z-20 w-[12vw] sm:w-[14vw] flex items-center justify-start pl-2 sm:pl-5 text-white/55 hover:text-cyan-300 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <Icon
                icon="mdi:chevron-left"
                className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)] group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          )}

          <div
            ref={magnifiedRef}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center will-change-transform rounded-2xl border border-white/25 overflow-hidden bg-slate-950/30 shadow-[0_25px_70px_rgba(0,0,0,0.75)]"
          >
            {selectedItem.type === 'video' ? (
              <video
                key={selectedItem.src}
                src={selectedItem.src}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="max-w-[75vw] max-h-[75vh] object-contain"
              />
            ) : (
              <img
                key={selectedItem.src}
                src={selectedItem.src}
                alt={selectedItem.label}
                className="max-w-[75vw] max-h-[75vh] object-contain"
              />
            )}
          </div>

          {hasNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) =>
                  prev !== null && prev < project.gallery.length - 1 ? prev + 1 : prev
                )
              }}
              aria-label="Next media"
              className="group fixed inset-y-0 right-0 z-20 w-[12vw] sm:w-[14vw] flex items-center justify-end pr-2 sm:pr-5 text-white/55 hover:text-cyan-300 transition-all duration-200 cursor-pointer focus:outline-none"
            >
              <Icon
                icon="mdi:chevron-right"
                className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)] group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          )}
        </>
      ) : (
        <div
          ref={gridRef}
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 max-w-[94vw] max-h-[90vh] w-full [perspective:1200px]"
        >
          {project.gallery.map((item, idx) => (
            <FloatingMediaCard
              key={item.src}
              item={item}
              single={project.gallery.length === 1}
              onSelect={() => setSelectedIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}
