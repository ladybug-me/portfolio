import { useEffect, useRef, useState } from 'react'
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

export function ProjectGalleryModal({ project, onClose }: ProjectGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  const overlayRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mediaWrapRef = useRef<HTMLDivElement>(null)
  const rotateXTo = useRef<gsap.QuickToFunc | null>(null)
  const rotateYTo = useRef<gsap.QuickToFunc | null>(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (project.gallery.length > 1) {
        if (e.key === 'ArrowRight') {
          setDirection(1)
          setActiveIndex((prev) => (prev + 1) % project.gallery.length)
        }
        if (e.key === 'ArrowLeft') {
          setDirection(-1)
          setActiveIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [project.gallery.length, onClose])

  // Blurred backdrop & staggered minimal entrance
  useGSAP(
    () => {
      if (!overlayRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.fromTo(
        overlayRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }
      )
        .fromTo(
          '.gallery-header-item',
          { y: -16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
          0.1
        )
        .fromTo(
          '.gallery-thumb-item',
          { y: 20, scale: 0.72, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            stagger: { each: 0.045, from: 'center' },
            ease: 'back.out(1.6)',
            clearProps: 'transform',
          },
          0.18
        )
    },
    { scope: overlayRef, dependencies: [project.id] }
  )

  // Kinetic 3D iris-wipe media transition
  useGSAP(
    () => {
      if (!mediaWrapRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const clipStart =
        direction === 1
          ? 'polygon(18% 0%, 100% 0%, 100% 100%, 18% 100%)'
          : 'polygon(0% 0%, 82% 0%, 82% 100%, 0% 100%)'

      gsap.fromTo(
        mediaWrapRef.current,
        {
          autoAlpha: 0,
          x: direction * 64,
          scale: 0.88,
          rotationY: direction * -10,
          clipPath: clipStart,
        },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          rotationY: 0,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 0.55,
          ease: 'expo.out',
          clearProps: 'transform,clipPath',
        }
      )
    },
    { scope: stageRef, dependencies: [project.id, activeIndex] }
  )

  // Interactive 3D tilt on stage hover
  useGSAP(
    () => {
      if (!mediaWrapRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      rotateXTo.current = gsap.quickTo(mediaWrapRef.current, 'rotationX', {
        duration: 0.45,
        ease: 'power3.out',
      })
      rotateYTo.current = gsap.quickTo(mediaWrapRef.current, 'rotationY', {
        duration: 0.45,
        ease: 'power3.out',
      })
    },
    { scope: stageRef, dependencies: [project.id] }
  )

  const currentItem = project.gallery[activeIndex] ?? project.gallery[0]
  if (!currentItem) return null

  const hasMultiple = project.gallery.length > 1

  const goPrev = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length)
  }

  const goNext = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % project.gallery.length)
  }

  const handleStageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || !rotateXTo.current || !rotateYTo.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    rotateXTo.current(-ny * 8)
    rotateYTo.current(nx * 10)
  }

  const handleStageLeave = () => {
    rotateXTo.current?.(0)
    rotateYTo.current?.(0)
  }

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} gallery`}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-slate-950/80 backdrop-blur-2xl p-5 sm:p-8 lg:p-12 [perspective:1400px]"
    >
      {/* Minimal Floating Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto"
      >
        <div className="gallery-header-item flex items-baseline gap-3 min-w-0">
          <span className="text-base sm:text-lg font-extrabold font-mono text-cyan-400 shrink-0">
            {project.number}
          </span>
          <span className="text-sm sm:text-base font-medium text-white truncate">{project.title}</span>
          <span className="hidden sm:inline text-xs font-mono text-cyan-300/75 uppercase tracking-wider">
            / {currentItem.label}
          </span>
        </div>

        <div className="gallery-header-item flex items-center gap-4 shrink-0">
          {hasMultiple && (
            <span className="text-xs font-mono text-slate-400">
              {String(activeIndex + 1).padStart(2, '0')} / {String(project.gallery.length).padStart(2, '0')}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-cyan-400/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Media Stage (No Container) */}
      <div
        ref={stageRef}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleStageMove}
        onMouseLeave={handleStageLeave}
        className="relative flex-1 flex items-center justify-center my-4 [perspective:1200px]"
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous media"
            className="absolute left-0 sm:left-4 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-cyan-400/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md"
          >
            <Icon icon="mdi:chevron-left" className="w-6 h-6" />
          </button>
        )}

        <div
          ref={mediaWrapRef}
          className="flex items-center justify-center will-change-transform [transform-style:preserve-3d]"
        >
          {currentItem.type === 'video' ? (
            <video
              key={currentItem.src}
              src={currentItem.src}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="max-w-[88vw] max-h-[68vh] rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.7)] object-contain"
            />
          ) : (
            <img
              key={currentItem.src}
              src={currentItem.src}
              alt={currentItem.label}
              className="max-w-[88vw] max-h-[68vh] rounded-xl object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
            />
          )}
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next media"
            className="absolute right-0 sm:right-4 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-cyan-400/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md"
          >
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Minimal Floating Thumb Strip */}
      {hasMultiple ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-3 overflow-x-auto py-1"
        >
          {project.gallery.map((item, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={item.src}
                type="button"
                onClick={() => {
                  setDirection(idx >= activeIndex ? 1 : -1)
                  setActiveIndex(idx)
                }}
                aria-label={`View ${item.label}`}
                className={`gallery-thumb-item shrink-0 w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer flex items-center justify-center ${isActive
                    ? 'scale-105 opacity-100 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    : 'opacity-45 hover:opacity-90'
                  }`}
              >
                {item.type === 'video' ? (
                  <Icon icon="mdi:play-circle-outline" className="w-6 h-6 text-cyan-300" />
                ) : (
                  <img src={item.src} alt={item.label} className="w-full h-full object-contain" />
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div />
      )}
    </div>,
    document.body
  )
}
