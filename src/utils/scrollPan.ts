import type React from 'react'
import gsap from 'gsap'

const panQuickToCache = new WeakMap<HTMLElement, gsap.QuickToFunc>()
const cardScrollTargets = new WeakMap<HTMLElement, number>()
const overflowCache = new WeakMap<HTMLElement, number>()

/**
 * Returns vertical overflow beyond the viewport height for a pinned section.
 * Caches the measurement so per-frame scroll updates avoid synchronous reflows.
 */
export function getPinnedOverflow(container: HTMLElement | null, measure = true): number {
  if (!container) return 0
  if (!measure && overflowCache.has(container)) {
    return overflowCache.get(container) ?? 0
  }
  const overflow = Math.max(0, container.scrollHeight - window.innerHeight)
  overflowCache.set(container, overflow)
  return overflow
}

/**
 * Smoothly pans a pinned section's inner wrapper when its content exceeds
 * the viewport height (e.g., under browser text zoom or short screens).
 */
export function syncPinnedOverflow(
  container: HTMLElement | null,
  inner: HTMLElement | null,
  progress: number,
  refresh = false
) {
  if (!container || !inner) return
  const overflow = getPinnedOverflow(container, refresh)
  if (overflow <= 0) {
    if (panQuickToCache.has(inner)) {
      panQuickToCache.delete(inner)
      gsap.set(inner, { y: 0, clearProps: 'transform' })
    }
    return
  }

  const targetY = -overflow * progress

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
  const hasDownDistance = currentTarget < maxScroll - 1 || el.scrollTop < maxScroll - 2
  const hasUpDistance = currentTarget > 1 || el.scrollTop > 2
  const canScrollDown = scrollingDown && hasDownDistance
  const canScrollUp = scrollingUp && hasUpDistance

  if (canScrollDown || canScrollUp) {
    e.preventDefault()
    e.stopPropagation()

    // Stop active Lenis smooth-scroll inertia so the page doesn't drift past sticky bounds
    const win = window as unknown as {
      __lenis?: { scrollTo?: (target: number, opts?: { immediate?: boolean }) => void }
    }
    win.__lenis?.scrollTo?.(window.scrollY, { immediate: true })

    const nextTarget = Math.max(0, Math.min(maxScroll, currentTarget + e.deltaY))
    if (nextTarget !== currentTarget) {
      cardScrollTargets.set(el, nextTarget)
      gsap.to(el, {
        scrollTop: nextTarget,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  } else {
    cardScrollTargets.delete(el)
  }
}
