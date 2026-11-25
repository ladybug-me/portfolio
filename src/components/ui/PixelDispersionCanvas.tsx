import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { getActivePalette, type PaletteId } from '../../theme/palettes'

export interface PixelItemMeta {
  num: string
  tag: string
}

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
  const dist = (isFeature ? 140 : 190) + Math.random() * 280
  const alphaNorm = +(a / 255).toFixed(2)

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

/**
 * Rasterize a card's DOM geometry into an offscreen pixel image,
 * then sample it into PixelParticles for reverse pixel-dispersion assembly.
 */
function buildCardPixelSnapshot(cardEl: HTMLDivElement, meta: PixelItemMeta): CardSnapshot {
  const cardRect = cardEl.getBoundingClientRect()
  const w = Math.max(120, Math.round(cardRect.width))
  const h = Math.max(120, Math.round(cardRect.height))

  const offCanvas = document.createElement('canvas')
  offCanvas.width = w
  offCanvas.height = h
  const ctx = offCanvas.getContext('2d')
  if (!ctx) return { width: w, height: h, particles: [] }

  const activePalette = getActivePalette()
  const radius = 16
  ctx.beginPath()
  ctx.roundRect(1, 1, w - 2, h - 2, radius)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, activePalette.bgSecondary)
  bgGrad.addColorStop(1, activePalette.bgPrimary)
  ctx.fillStyle = bgGrad
  ctx.fill()

  ctx.lineWidth = 1.5
  ctx.strokeStyle = `rgba(${activePalette.primaryRgb}, 0.75)`
  ctx.stroke()

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

  const numBox = relBox('[data-piece="num"]')
  if (numBox) {
    const cx = numBox.x + numBox.w / 2
    const cy = numBox.y + numBox.h / 2
    ctx.beginPath()
    ctx.arc(cx, cy, numBox.w / 2, 0, Math.PI * 2)
    ctx.fillStyle = activePalette.primary
    ctx.fill()

    ctx.fillStyle = '#000000'
    ctx.font = `700 ${numBox.style.fontSize || '12px'} ${numBox.style.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(meta.num, cx, cy + 0.5)
  }

  const tagBox = relBox('[data-piece="tag"]')
  if (tagBox) {
    ctx.beginPath()
    ctx.roundRect(tagBox.x, tagBox.y, tagBox.w, tagBox.h, tagBox.h / 2)
    ctx.fillStyle = `rgba(${activePalette.primaryRgb}, 0.14)`
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = `rgba(${activePalette.primaryRgb}, 0.35)`
    ctx.stroke()

    ctx.fillStyle = activePalette.mid
    ctx.font = `500 ${tagBox.style.fontSize || '10px'} ${tagBox.style.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(meta.tag, tagBox.x + tagBox.w / 2, tagBox.y + tagBox.h / 2 + 0.5)
  }

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

  return { width: w, height: h, particles: [...bgParticles, ...featureParticles] }
}

interface PixelDispersionCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>
  cardsRef: RefObject<(HTMLDivElement | null)[]>
  items: PixelItemMeta[]
  paletteId: PaletteId
  entryProgressRef: RefObject<number>
  scrollProgressRef: RefObject<number>
  needsRenderRef: RefObject<boolean>
  textTimelinesRef: RefObject<(gsap.core.Timeline | null)[]>
  textPlayedRef: RefObject<boolean[]>
}

/**
 * Full-bleed 2D canvas overlay that rasterizes card substrates and assembles
 * them sequentially via reverse pixel-dispersion particles on scroll.
 */
export function PixelDispersionCanvas({
  containerRef,
  cardsRef,
  items,
  paletteId,
  entryProgressRef,
  scrollProgressRef,
  needsRenderRef,
  textTimelinesRef,
  textPlayedRef,
}: PixelDispersionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snapshotsRef = useRef<CardSnapshot[]>([])

  const rebuildSnapshots = useCallback(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length !== items.length) return
    snapshotsRef.current = cards.map((card, idx) => buildCardPixelSnapshot(card, items[idx]))
    needsRenderRef.current = true
  }, [cardsRef, items, needsRenderRef])

  useEffect(() => {
    rebuildSnapshots()
  }, [paletteId, rebuildSnapshots])

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

    let snapRaf = 0
    let lastCardWidth = cardsRef.current[0]?.getBoundingClientRect().width ?? 0
    const cardObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? lastCardWidth
      if (Math.abs(nextWidth - lastCardWidth) < 2) return
      lastCardWidth = nextWidth
      cancelAnimationFrame(snapRaf)
      snapRaf = requestAnimationFrame(init)
    })
    cardsRef.current.forEach((card) => {
      if (card) cardObserver.observe(card)
    })

    let lastWinWidth = window.innerWidth
    const handleSnapResize = () => {
      if (window.innerWidth === lastWinWidth) return
      lastWinWidth = window.innerWidth
      rebuildSnapshots()
    }

    window.addEventListener('resize', handleSnapResize)
    return () => {
      isMounted = false
      cancelAnimationFrame(snapRaf)
      cardObserver.disconnect()
      window.removeEventListener('resize', handleSnapResize)
    }
  }, [cardsRef, rebuildSnapshots])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || prefersReducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let lastCanvasBoxW = 0
    let lastCanvasBoxH = 0

    const syncCanvasSize = (force = false) => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (
        !force &&
        lastCanvasBoxW > 0 &&
        Math.abs(rect.width - lastCanvasBoxW) < 2 &&
        Math.abs(rect.height - lastCanvasBoxH) < 120
      ) {
        return
      }
      lastCanvasBoxW = rect.width
      lastCanvasBoxH = rect.height
      const targetW = Math.max(1, Math.round(rect.width * dpr))
      const targetH = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        needsRenderRef.current = true
      }
    }

    syncCanvasSize(true)
    const resizeObserver = new ResizeObserver(() => syncCanvasSize(false))
    resizeObserver.observe(container)
    const handleCanvasResize = () => syncCanvasSize(false)
    window.addEventListener('resize', handleCanvasResize)

    const render = () => {
      animId = requestAnimationFrame(render)
      syncCanvasSize(false)
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
      // Reserve the final ~15% of progress so the last card's text finishes
      // animating before the pinned section unpins and page scroll resumes.
      const assembleEnd = 0.85
      const assembleProgress = Math.min(1, progress / assembleEnd)
      const totalCards = items.length
      const isMobile = contRect.width < 768

      cardsRef.current.forEach((card, idx) => {
        if (!card) return
        const snap = snapshotsRef.current[idx]
        if (!snap) return

        const segStart = idx / totalCards
        const segEnd = (idx + 1) / totalCards
        const rawT =
          idx === 0
            ? Math.max(0.06, assembleProgress / segEnd)
            : (assembleProgress - segStart) / (segEnd - segStart)
        const localT = Math.max(0, Math.min(1, rawT))

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
          const textTl = textTimelinesRef.current[idx]
          if (!textPlayedRef.current[idx]) {
            textPlayedRef.current[idx] = true
            textTl?.play()
          }
          // Ensure the last card's text animation completes before unpinning
          if (idx === totalCards - 1 && textTl) {
            const minTextProgress = Math.max(
              0,
              Math.min(1, (scrollProgressRef.current - 0.80) / 0.16)
            )
            if (textTl.progress() < minTextProgress) {
              textTl.progress(minTextProgress)
            }
          }
          return
        }

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

          const inv = 1 - pT
          const easeOut = 1 - inv * inv * inv
          const invEase = 1 - easeOut

          const widthScale = Math.min(1, contRect.width / 1280)
          const spaceX = 1 + invEase * (isMobile ? 0.95 : 1.85 * widthScale)
          const spaceY = 1 + invEase * (isMobile ? 0.75 : 1.35 * widthScale)

          const dx = (p.relX - halfW) * spaceX
          const dy = (p.relY - halfH) * spaceY

          const twist = invEase * 0.38 * swirlDir
          const cosT = Math.cos(twist)
          const sinT = Math.sin(twist)
          const rx = dx * cosT - dy * sinT
          const ry = dx * sinT + dy * cosT

          const scatterFalloff = inv * inv
          const px = left + halfW + rx + p.scatterDx * scatterFalloff
          const py = top + halfH + ry + p.scatterDy * scatterFalloff

          if (pT < 0.48) {
            ctx.fillStyle = p.energyColor
          } else if (pT < 0.78) {
            ctx.fillStyle = p.midColor
          } else {
            ctx.fillStyle = p.finalColor
          }

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
      window.removeEventListener('resize', handleCanvasResize)
    }
  }, [
    cardsRef,
    containerRef,
    entryProgressRef,
    items.length,
    needsRenderRef,
    scrollProgressRef,
    textPlayedRef,
    textTimelinesRef,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  )
}
