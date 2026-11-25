import type React from 'react'
import gsap from 'gsap'

const panQuickToCache = new WeakMap<HTMLElement, gsap.QuickToFunc>()
const cardScrollTargets = new WeakMap<HTMLElement, number>()

/**
 * Returns vertical overflow beyond the viewport height for a pinned section.
 */
export function getPinnedOverflow(container: HTMLElement | null): number {
  if (!container) return 0
  return Math.max(0, container.scrollHeight - window.innerHeight)
}

/**
 * Smoothly pans a pinned section's inner wrapper when its content exceeds
 * the viewport height (e.g., under browser text zoom or short screens).
 */
export function syncPinnedOverflow(
  container: HTMLElement | null,
  inner: HTMLElement | null,
  progress: number
) {
  if (!container || !inner) return
  const overflow = getPinnedOverflow(container)
  const targetY = overflow > 0 ? -overflow * progress : 0

  let quickY = panQuickToCache.get(inner)
  if (!quickY) {
    quickY = gsap.quickTo(inner, 'y', { duration: 0.45, ease: 'power3.out' })
    panQuickToCache.set(inner, quickY)
  }
  quickY(targetY)
}

/**
 * Smoothly scrolls an internally scrollable card on wheel until it reaches
 * its top/bottom boundary, then lets page scrolling continue.
 */
export function handleBoundedCardWheel(e: React.WheelEvent<HTMLElement>) {
  const el = e.currentTarget
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 1) return

  const style = window.getComputedStyle(el)
  if (style.position === 'sticky') {
    const stickyTop = parseFloat(style.top)
    if (!Number.isNaN(stickyTop)) {
      const rectTop = el.getBoundingClientRect().top
      if (e.deltaY > 0 && rectTop > stickyTop + 2) return
      if (e.deltaY < 0 && rectTop < stickyTop - 2) return
    }
  }

  const currentTarget = cardScrollTargets.get(el) ?? el.scrollTop
  const scrollingDown = e.deltaY > 0
  const scrollingUp = e.deltaY < 0
  const canScrollDown = scrollingDown && currentTarget < maxScroll - 1
  const canScrollUp = scrollingUp && currentTarget > 1

  if (canScrollDown || canScrollUp) {
    e.preventDefault()
    e.stopPropagation()
    const nextTarget = Math.max(0, Math.min(maxScroll, currentTarget + e.deltaY))
    cardScrollTargets.set(el, nextTarget)
    gsap.to(el, {
      scrollTop: nextTarget,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  } else {
    cardScrollTargets.delete(el)
  }
}
