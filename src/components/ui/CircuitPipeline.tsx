import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { getActivePalette, usePalette } from '../../theme/palettes'

gsap.registerPlugin(ScrollTrigger, SplitText)

interface PixelParticle {
  relX: number
  relY: number
  scatterDx: number
  scatterDy: number
  delay: number
  stepSize: number
  energyColor: string
  midColor: string
  finalColor: string
  isFeature: boolean
}

interface CardSnapshot {
  width: number
  height: number
  particles: PixelParticle[]
}

const MILESTONES = [
  {
    num: '01',
    title: 'C / C++',
    desc: 'Native Wayland IPC, compositor loops, and deterministic memory layouts.',
    tag: 'SYSTEMS',
  },
  {
    num: '02',
    title: 'PYTHON',
    desc: 'YOLOv11 vision pipelines, FastAPI services, and FAISS vector indexing.',
    tag: 'AI & BACKEND',
  },
  {
    num: '03',
    title: 'JAVA / SQL',
    desc: 'Strongly typed OOP architectures and structured relational schemas.',
    tag: 'CORE & DATA',
  },
  {
    num: '04',
    title: 'QML / BASH',
    desc: 'Declarative Linux shell UI in Caelestia and automated system scripting.',
    tag: 'SHELL & UI',
  },
]

/**
 * Rasterize a milestone card's DOM geometry into an offscreen pixel image,
 * then sample it into PixelParticles for reverse pixel-dispersion assembly.
 */
function buildCardPixelSnapshot(
  cardEl: HTMLDivElement,
  milestone: (typeof MILESTONES)[number]
): CardSnapshot {
  const cardRect = cardEl.getBoundingClientRect()
  const w = Math.max(120, Math.round(cardRect.width))
  const h = Math.max(120, Math.round(cardRect.height))

  const offCanvas = document.createElement('canvas')
  offCanvas.width = w
  offCanvas.height = h
  const ctx = offCanvas.getContext('2d')
  if (!ctx) return { width: w, height: h, particles: [] }

  // 1. Draw rounded glass card substrate & glowing border
  const radius = 16
  ctx.beginPath()
  ctx.roundRect(1, 1, w - 2, h - 2, radius)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, 'rgba(9, 21, 32, 0.96)')
  bgGrad.addColorStop(1, 'rgba(5, 11, 20, 0.90)')
  ctx.fillStyle = bgGrad
  ctx.fill()

  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)'
  ctx.stroke()

  // Measure child elements relative to card so canvas picture matches DOM layout
  const relBox = (selector: string) => {
    const el = cardEl.querySelector<HTMLElement>(selector)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      x: r.left - cardRect.left,
      y: r.top - cardRect.top,
      w: r.width,
      h: r.height,
      style: window.getComputedStyle(el),
    }
  }

  // 2. Number Circle Badge
  const numBox = relBox('[data-piece="num"]')
  if (numBox) {
    const cx = numBox.x + numBox.w / 2
    const cy = numBox.y + numBox.h / 2
    ctx.beginPath()
    ctx.arc(cx, cy, numBox.w / 2, 0, Math.PI * 2)
    ctx.fillStyle = getActivePalette().primary
    ctx.fill()

    ctx.fillStyle = '#000000'
    ctx.font = `700 ${numBox.style.fontSize || '12px'} ${numBox.style.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(milestone.num, cx, cy + 0.5)
  }

  // 3. Tech Tag Pill
  const tagBox = relBox('[data-piece="tag"]')
  if (tagBox) {
    ctx.beginPath()
    ctx.roundRect(tagBox.x, tagBox.y, tagBox.w, tagBox.h, tagBox.h / 2)
    ctx.fillStyle = 'rgba(8, 51, 68, 0.55)'
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)'
    ctx.stroke()

    ctx.fillStyle = '#67e8f9'
    ctx.font = `500 ${tagBox.style.fontSize || '10px'} ${tagBox.style.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(milestone.tag, tagBox.x + tagBox.w / 2, tagBox.y + tagBox.h / 2 + 0.5)
  }

  // Title and description load via GSAP SplitText upon container lock
  // Extract raw pixel data and sample into discrete particles
  let imgData: Uint8ClampedArray | null = null
  try {
    imgData = ctx.getImageData(0, 0, w, h).data
  } catch {
    return { width: w, height: h, particles: [] }
  }
  const bgParticles: PixelParticle[] = []
  const featureParticles: PixelParticle[] = []
  const bgStep = 4
  const featureStep = 2
  const seenFeature = new Set<number>()

  // First pass: Identify crisp structural features (borders, text, badges)
  for (let y = 0; y < h; y += featureStep) {
    for (let x = 0; x < w; x += featureStep) {
      const i = (y * w + x) * 4
      const r = imgData[i]
      const g = imgData[i + 1]
      const b = imgData[i + 2]
      const a = imgData[i + 3]
      if (a < 30) continue

      const isEdge = x <= 3 || x >= w - 4 || y <= 3 || y >= h - 4
      const luminance = r * 0.299 + g * 0.587 + b * 0.114
      const isFeature = isEdge || luminance > 48 || g > 75

      if (isFeature) {
        seenFeature.add(y * w + x)
        featureParticles.push(createPixelParticle(x, y, r, g, b, a, featureStep + 0.35, true, w, h))
      }
    }
  }

  // Second pass: Grid sampling of translucent glass body fill (drawn underneath features)
  for (let y = 2; y < h - 2; y += bgStep) {
    for (let x = 2; x < w - 2; x += bgStep) {
      if (seenFeature.has(y * w + x)) continue
      const i = (y * w + x) * 4
      const r = imgData[i]
      const g = imgData[i + 1]
      const b = imgData[i + 2]
      const a = imgData[i + 3]
      if (a < 30) continue

      bgParticles.push(createPixelParticle(x, y, r, g, b, a, bgStep + 0.2, false, w, h))
    }
  }

  // Paint background tiles first, then bright feature pixels cleanly on top
  return { width: w, height: h, particles: [...bgParticles, ...featureParticles] }
}

function createPixelParticle(
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
  stepSize: number,
  isFeature: boolean,
  w: number,
  h: number
): PixelParticle {
  const angle = Math.random() * Math.PI * 2
  // Larger scatter distance for dramatic entry
  const dist = (isFeature ? 140 : 190) + Math.random() * 280
  const alphaNorm = +(a / 255).toFixed(2)

  // Spatial wave delay so perimeter/top forms before interior/bottom piece by piece
  const normX = x / w
  const normY = y / h
  const isBorder = x <= 4 || x >= w - 5 || y <= 4 || y >= h - 5
  const baseDelay = isBorder ? normY * 0.14 : 0.12 + (normX * 0.14 + normY * 0.18)
  const delay = Math.min(0.42, baseDelay + Math.random() * 0.06)

  const activePalette = getActivePalette()
  const energyOptions = [
    `rgba(${activePalette.primaryRgb}, 0.95)`,
    `rgba(${activePalette.secondaryRgb}, 0.85)`,
    activePalette.mid,
  ]
  const energyColor = energyOptions[Math.floor(Math.random() * energyOptions.length)]
  const [pr, pg, pb] = activePalette.primaryRgb.split(',').map((v) => Number(v.trim()))
  const mr = Math.round(r * 0.55 + pr * 0.45)
  const mg = Math.round(g * 0.55 + pg * 0.45)
  const mb = Math.round(b * 0.55 + pb * 0.45)

  return {
    relX: x,
    relY: y,
    scatterDx: Math.cos(angle) * dist,
    scatterDy: Math.sin(angle) * dist,
    delay,
    stepSize,
    energyColor,
    midColor: `rgba(${mr}, ${mg}, ${mb}, ${Math.max(0.7, alphaNorm)})`,
    finalColor: `rgba(${r}, ${g}, ${b}, ${alphaNorm})`,
    isFeature,
  }
}

export function CircuitPipeline() {
  const palette = usePalette()
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeStep, setActiveStep] = useState<number>(0)
  const entryProgressRef = useRef<number>(0)
  const scrollProgressRef = useRef<number>(0)
  const snapshotsRef = useRef<CardSnapshot[]>([])
  const needsRenderRef = useRef<boolean>(true)
  const textTimelinesRef = useRef<(gsap.core.Timeline | null)[]>([])
  const textPlayedRef = useRef<boolean[]>([false, false, false, false])

  const rebuildSnapshots = useCallback(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length !== MILESTONES.length) return
    snapshotsRef.current = cards.map((card, idx) => buildCardPixelSnapshot(card, MILESTONES[idx]))
    needsRenderRef.current = true
  }, [])

  useEffect(() => {
    rebuildSnapshots()
  }, [palette.id, rebuildSnapshots])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let isMounted = true
    const init = () => {
      if (isMounted) rebuildSnapshots()
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init)
    } else {
      init()
    }

    window.addEventListener('resize', rebuildSnapshots)
    return () => {
      isMounted = false
      window.removeEventListener('resize', rebuildSnapshots)
    }
  }, [rebuildSnapshots])

  // Real-time Reverse Pixel Dispersion Particle Renderer
  useEffect(() => {
    rebuildSnapshots()
  }, [palette.id, rebuildSnapshots])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || prefersReducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const syncCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetW = Math.max(1, Math.round(rect.width * dpr))
      const targetH = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        needsRenderRef.current = true
      }
    }

    syncCanvasSize()
    const resizeObserver = new ResizeObserver(syncCanvasSize)
    resizeObserver.observe(container)
    window.addEventListener('resize', syncCanvasSize)

    const render = () => {
      animId = requestAnimationFrame(render)
      syncCanvasSize()
      if (!needsRenderRef.current) return

      const contRect = container.getBoundingClientRect()
      if (contRect.bottom < -120 || contRect.top > window.innerHeight + 120) {
        return
      }

      needsRenderRef.current = false
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()

      const progress = Math.min(
        1,
        entryProgressRef.current * 0.18 + scrollProgressRef.current * 0.82
      )
      const totalCards = MILESTONES.length
      const isMobile = contRect.width < 768

      cardsRef.current.forEach((card, idx) => {
        if (!card) return
        const snap = snapshotsRef.current[idx]
        if (!snap) return

        // Map scroll progress cleanly to each container's formation segment [0, 1]
        // Container 0 starts slightly engaged (0.06) at scroll=0 so particles are visible on arrival
        const segStart = idx / totalCards
        const segEnd = (idx + 1) / totalCards
        const rawT =
          idx === 0
            ? Math.max(0.06, progress / segEnd)
            : (progress - segStart) / (segEnd - segStart)
        const localT = Math.max(0, Math.min(1, rawT))

        // Strict invisibility rule: upcoming container must not be visible at all
        if (rawT <= 0.005) {
          card.style.opacity = '0'
          card.style.visibility = 'hidden'
          if (textPlayedRef.current[idx]) {
            textPlayedRef.current[idx] = false
            textTimelinesRef.current[idx]?.pause(0)
          }
          return
        }

        // Completely assembled, or canvas pixel sampling blocked by privacy shield: lock crisp live DOM card
        if (localT >= 0.90 || snap.particles.length === 0) {
          card.style.opacity = '1'
          card.style.visibility = 'visible'
          if (!textPlayedRef.current[idx]) {
            textPlayedRef.current[idx] = true
            textTimelinesRef.current[idx]?.play()
          }
          return
        }

        // During particle assembly (0 < localT < 0.90):
        // Keep DOM card invisible (zero fade-in); particles literally draw the container
        card.style.opacity = '0'
        card.style.visibility = 'hidden'
        if (textPlayedRef.current[idx]) {
          textPlayedRef.current[idx] = false
          textTimelinesRef.current[idx]?.pause(0)
        }

        const cardRect = card.getBoundingClientRect()
        const left = cardRect.left - contRect.left
        const top = cardRect.top - contRect.top
        const halfW = snap.width * 0.5
        const halfH = snap.height * 0.5
        const swirlDir = idx % 2 === 0 ? 1 : -1

        const particles = snap.particles
        const len = particles.length

        for (let i = 0; i < len; i++) {
          const p = particles[i]
          const pT = Math.max(0, Math.min(1, (localT - p.delay) / (0.94 - p.delay)))
          if (pT <= 0) continue

          // Smooth deceleration as pixel approaches final slot
          const inv = 1 - pT
          const easeOut = 1 - inv * inv * inv
          const invEase = 1 - easeOut

          // 1. Asymmetric spacing expansion (scales proportionally with available width)
          const widthScale = Math.min(1, contRect.width / 1280)
          const spaceX = 1 + invEase * (isMobile ? 0.95 : 1.85 * widthScale)
          const spaceY = 1 + invEase * (isMobile ? 0.75 : 1.35 * widthScale)

          const dx = (p.relX - halfW) * spaceX
          const dy = (p.relY - halfH) * spaceY

          // 2. Vortex deformation twist that untwists to 0 deg upon docking
          const twist = invEase * 0.38 * swirlDir
          const cosT = Math.cos(twist)
          const sinT = Math.sin(twist)
          const rx = dx * cosT - dy * sinT
          const ry = dx * sinT + dy * cosT

          // 3. Turbulent dispersion scatter decaying faster than grid spacing
          const scatterFalloff = inv * inv
          const px = left + halfW + rx + p.scatterDx * scatterFalloff
          const py = top + halfH + ry + p.scatterDy * scatterFalloff

          // Pixel transitions from glowing theme-cyan particle to exact raster pixel color
          if (pT < 0.48) {
            ctx.fillStyle = p.energyColor
          } else if (pT < 0.78) {
            ctx.fillStyle = p.midColor
          } else {
            ctx.fillStyle = p.finalColor
          }

          // Size settles cleanly to exact tile step size so spacing gaps reach 0px
          const drawSize =
            pT < 0.75
              ? p.isFeature
                ? 2.2 + invEase * 1.4
                : 1.9 + invEase * 1.1
              : p.stepSize

          ctx.fillRect(px, py, drawSize, drawSize)
        }
      })
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncCanvasSize)
    }
  }, [])

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!pathRef.current || !containerRef.current) return

      const pathLength = pathRef.current.getTotalLength()

      if (prefersReducedMotion) {
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: 0 })
        cardsRef.current.forEach((card) => {
          if (card) {
            card.style.opacity = '1'
            card.style.visibility = 'visible'
          }
        })
        setActiveStep(MILESTONES.length - 1)
        return
      }

      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      // Create GSAP SplitText kinetic text loading timelines per card
      textTimelinesRef.current = cardsRef.current.map((card) => {
        if (!card) return null
        const titleEl = card.querySelector<HTMLElement>('[data-piece="title"]')
        const descEl = card.querySelector<HTMLElement>('[data-piece="desc"]')
        if (!titleEl || !descEl) return null

        const titleSplit = SplitText.create(titleEl, { type: 'chars', mask: 'chars' })
        const descSplit = SplitText.create(descEl, { type: 'words', mask: 'words' })

        const textTl = gsap.timeline({ paused: true })
        textTl
          .from(titleSplit.chars, {
            yPercent: 115,
            opacity: 0,
            stagger: 0.03,
            duration: 0.45,
            ease: 'power3.out',
          })
          .from(
            descSplit.words,
            {
              yPercent: 100,
              opacity: 0,
              stagger: 0.018,
              duration: 0.35,
              ease: 'power2.out',
            },
            '-=0.22'
          )
        return textTl
      })

      // Hide DOM cards initially; canvas particles assemble each sequentially
      cardsRef.current.forEach((card) => {
        if (card) {
          card.style.opacity = '0'
          card.style.visibility = 'hidden'
        }
      })

      // Pre-engage card 0 pixel construction once #pipeline scrolls halfway into view
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 55%',
        end: 'top top',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          entryProgressRef.current = self.progress
          needsRenderRef.current = true
        },
        onRefresh: (self) => {
          entryProgressRef.current = self.progress
          needsRenderRef.current = true
        },
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=2400',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress
            needsRenderRef.current = true
            const step = Math.min(
              MILESTONES.length - 1,
              Math.floor(self.progress * MILESTONES.length)
            )
            setActiveStep((prev) => (prev !== step ? step : prev))
          },
          onRefresh: (self) => {
            scrollProgressRef.current = self.progress
            needsRenderRef.current = true
          },
        },
      })

      tl.to(
        pathRef.current,
        {
          strokeDashoffset: 0,
          ease: 'none',
          duration: MILESTONES.length,
        },
        0
      )
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      id="pipeline"
      className="relative w-full min-h-screen py-16 sm:py-24 flex flex-col justify-center overflow-x-clip border-t border-white/5"
    >
      {/* Full-width Particle Canvas Overlay: Never clips overflowing scattered particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8">
        {/* Scroll-drawn SVG pipeline line */}
        <div className="hidden lg:block absolute top-[44px] left-16 right-16 z-0 pointer-events-none">
          <svg viewBox="0 0 1000 60" fill="none" className="w-full h-auto overflow-visible">
            <path
              d="M 20,30 Q 250,55 500,30 T 980,30"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3"
              strokeDasharray="6 6"
            />
            <path
              ref={pathRef}
              d="M 20,30 Q 250,55 500,30 T 980,30"
              stroke={palette.primary}
              strokeWidth="4"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 10px ${palette.primary})` }}
            />
          </svg>
        </div>

        {/* Milestone checkpoints - 4 containers strictly assembling from pixel particles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {MILESTONES.map((m, idx) => {
            const isReached = idx <= activeStep
            const isCurrent = idx === activeStep

            return (
              <div
                key={m.num}
                ref={(el) => {
                  cardsRef.current[idx] = el
                }}
                className={`relative flex flex-col p-6 rounded-2xl border backdrop-blur-xl ${
                  isCurrent
                    ? 'bg-[#091520]/95 border-cyan-400 shadow-[0_0_24px_rgba(0,242,254,0.2)]'
                    : isReached
                      ? 'bg-[#050b14]/85 border-cyan-500/35'
                      : 'bg-[#050b14]/40 border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      data-piece="num"
                      className="w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center bg-cyan-400 text-black shadow-[0_0_12px_#00f2fe]"
                    >
                      {m.num}
                    </span>
                    <span
                      data-piece="tag"
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300"
                    >
                      {m.tag}
                    </span>
                  </div>

                  <h3
                    data-piece="title"
                    className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-3 text-cyan-300"
                  >
                    {m.title}
                  </h3>
                  <p
                    data-piece="desc"
                    className="text-sm sm:text-base text-slate-300 leading-snug font-sans"
                  >
                    {m.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
