---
name: cinematic-3d-web-systems
description: Universal engineering blueprint for building Awwwards-caliber, cinematic 3D web applications and editorial sites. Applicable to SaaS products, hardware launches, agency sites, and high-tech experiences. Covers synchronized Lenis+GSAP scroll engines, custom Three.js GLSL shaders, GPU-computed cosmic starfields, horizontal/vertical sticky card decks, pinned scroll-scrubbed interactive steppers, and cybernetic micro-interactions.
---

# Cinematic 3D Web Systems Architecture

A universal engineering manual for building high-end, immersive web experiences combining WebGL/Three.js 3D environments with precision GSAP kinetic typography and scroll-driven UI decks.

---

## 1. Dual-Layer Viewport Architecture

To sustain 60–120 FPS under dense interactive content, strictly decouple 3D rendering from DOM layout:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Fixed Background Canvas (fixed inset-0, pointer-events-none, z-0) │
│    - R3F Canvas with PerspectiveCamera (FOV 45, DPR [1, 2]) │
│    - Lighting: Ambient + Directional + Point Lights         │
│    - Primary 3D Hero Mesh (simplex noise displacement)      │
│    - Distant Space Starfield (GPU-accelerated orbits)       │
│    - Radial & Vertical Vignettes (preserves text contrast)  │
├─────────────────────────────────────────────────────────────┤
│ 2. Interactive Foreground DOM (relative z-10)               │
│    - Brand Navigation HUD + Custom Reticle Cursor           │
│    - Kinetic Headline Typography with tilted badges         │
│    - Sweeping SVG Marquee Ribbons & Infinites Tickers       │
│    - Sticky Vertical Feature Decks (Showcase / Spotlights)  │
│    - Pinned Horizontal Stacking Decks (Specs / Workflows)   │
│    - Pinned Scroll-Driven Steppers (Tours / Guided FAQs)   │
│    - Cybernetic Action CTAs & Telemetry Footers             │
└─────────────────────────────────────────────────────────────┘
```

### Core Technology Stack
- **Framework**: Vite + React 19 + TypeScript + Tailwind CSS
- **3D Engine**: `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`
- **Animation & Scroll**: `gsap`, `@gsap/react`, `lenis`
- **Iconography**: `@iconify/react`

---

## 2. Scroll Driver Synchronization: Lenis + GSAP Ticker

Never allow native scroll and virtual smooth-scrolling engines to run independently. Drive Lenis strictly through the GSAP ticker:

```typescript
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

useEffect(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  })

  // Keep ScrollTrigger aware of every Lenis scroll tick
  lenis.on('scroll', ScrollTrigger.update)

  const updateTicker = (time: number) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(updateTicker)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(updateTicker)
    lenis.destroy()
  }
}, [])
```

---

## 3. WebGL 3D Shaders & Celestial Particle Physics

### 3.1 Primary Deformed Shader Mesh
Create an interactive central 3D focal object (e.g. core entity, product sphere, or neural orb) displaced by 3D simplex noise:
- **Vertex Shader**: Computes normal displacement dynamically:
  `displacement = snoise(normal * freq + time * speed) + pointerInfluence + clickDeform`.
- **Fragment Shader**: Mixes dark base materials with luminous perimeter rims using Fresnel power curves:
  `pow(1.0 - dot(viewDir, normal), 3.2)`.

### 3.2 Unidirectional Deep-Space Starfield
Expansive, razor-sharp particles that populate deep cosmic space without clustering in the center.

**Architecture Rules**:
1. **GPU-Computed Orbits**: Compute analytical orbital mechanics in GLSL (`cos(angle) * aRadius`, `sin(angle) * aRadius`) using vertex attributes (`aRadius`, `aSpeed`, `aAngle`, `aElevation`). Never mutate positions on the CPU.
2. **Unidirectional Cohesion**: Ensure all orbital velocity values (`aSpeed`) share positive signs so the celestial field rotates cohesively around a tilted polar axis.
3. **Expansive Radial Range**: Span radii from `12.0` to `75.0+` units, leaving the center stage clear while filling the peripheral void.
4. **Sharp Optical Pinpoint Shader**: Avoid blurry sprite halos. Use razor-sharp circular discs with anti-aliasing:
   ```glsl
   float dist = length(gl_PointCoord - vec2(0.5));
   if (dist > 0.48) discard;
   float edge = smoothstep(0.48, 0.36, dist);
   float sharpCenter = smoothstep(0.2, 0.0, dist) * 0.9;
   gl_FragColor = vec4(uColor * (1.1 + sharpCenter * 0.4), (edge + sharpCenter * 0.4) * vAlpha);
   ```
5. **Retina Display Clarity**: Always configure `<Canvas dpr={[1, 2]}>` to ensure sub-pixel star points remain crisp without browser upscaling blur.

---

## 4. Pinned Horizontal Stacking Deck System

Ideal for feature matrices, system specs, workflow steps, or multi-step capabilities. Cards appear **one by one**, **zoomed in at focal scale**, and stack horizontally over preceding cards:

```
Scroll Direction ──>
[ Card 0 (scale: 0.88, x: -7.0%) ]
  [ Card 1 (scale: 0.94, x: -3.5%) ]
    [ Card 2 (CURRENT FOCAL CARD: scale: 1.0, x: 0%, shadow-[-25px_0_50px]) ]
                                              <── [ Card 3 enters from xPercent: 115 ]
```

### Implementation Pattern
```typescript
const cardElements = gsap.utils.toArray<HTMLElement>('.horizontal-stack-card')
const scrollDistance = (cardElements.length - 1) * 750

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top top',
    end: `+=${scrollDistance}`,
    pin: true,
    scrub: 0.6,
    anticipatePin: 1,
    onUpdate: (self) => {
      const idx = Math.min(Math.floor(self.progress * cardElements.length), cardElements.length - 1)
      setActiveIdx(idx)
      setStackProgress(self.progress)
    },
  },
})

// Initialize: Card 0 is front & focal; Cards 1..N start offscreen right
gsap.set(cardElements[0], { xPercent: 0, scale: 1, opacity: 1, zIndex: 10 })
for (let i = 1; i < cardElements.length; i++) {
  gsap.set(cardElements[i], { xPercent: 115, scale: 0.95, opacity: 0, zIndex: 10 + i })
}

// Sequence horizontal stacking over time
cardElements.forEach((card, i) => {
  if (i === 0) return
  const stepTime = (i - 1) * 1

  // Preceding cards shift left and scale down into the deck
  for (let prev = 0; prev < i; prev++) {
    const depth = i - prev
    tl.to(cardElements[prev], {
      xPercent: -3.5 * depth,
      scale: Math.max(0.85, 1 - depth * 0.04),
      opacity: Math.max(0.25, 1 - depth * 0.22),
      filter: `brightness(${Math.max(0.45, 1 - depth * 0.2)})`,
      ease: 'power2.inOut',
      duration: 1,
    }, stepTime)
  }

  // Incoming card arrives at center stage with full scale & opacity
  tl.to(card, {
    xPercent: 0,
    scale: 1,
    opacity: 1,
    filter: 'brightness(1)',
    ease: 'power2.out',
    duration: 1,
  }, stepTime)
})
```

---

## 5. Pinned Scroll-Driven Steppers & Guided Tours

For interactive product walkthroughs, FAQs, and step-by-step feature breakdowns, **pin the viewport and scrub through items on scroll** instead of requiring clicks:
1. Pin the container with ScrollTrigger (`pin: true`, `scrub: 0.6`).
2. Update active step via progress:
   ```typescript
   const step = Math.min(Math.floor(self.progress * items.length), items.length - 1)
   setActiveIndex(step)
   ```
3. Dynamically highlight active content (accent borders, horizontal slide, auto-expanded technical details).
4. Accompany with a HUD status pillar showing `0X / 0N` and a live progress gauge.

---

## 6. Kinetic Editorial Motion & Micro-Interactions

### 6.1 3D Masked Word Roll-Up (`MaskedText`)
Wrap each word in an `overflow-hidden inline-block` mask. Reveal with 3D rotation and vertical translation:
`gsap.from(words, { y: '125%', rotateX: -40, opacity: 0, stagger: 0.08, ease: 'power4.out' })`.

### 6.2 Matrix Glyphs Scramble (`ScrambleText`)
Cycle random character sets (`!<>-_\\/[]{}—=+*^?#________`) every 30–40ms before locking characters sequentially. Preserve `aria-label` for screen-reader accessibility.

### 6.3 Scroll-Linked Word Illumination (`KineticTextScrub`)
Split narrative statements into word spans. Scrub word opacity from `0.18` (dim) to `1.0` (illuminated) as the section moves across the viewport.

### 6.4 Floating Tilted Context Badges
Anchor high-contrast technical or category tags with subtle deliberate rotations (`-6deg`, `+4deg`, `-3deg`) next to primary headlines for an editorial aesthetic.

### 6.5 Cybernetic Reticle Cursor (`CustomCursor`)
- Dual-ring crosshair lerping toward mouse position.
- Radiates shockwave ripple rings on pointer down.
- Scales up and brightens over interactive DOM elements (`a`, `button`, inputs).

---

## 7. Production Hardening Checklist

- [ ] **Unified Engine**: Exactly one smooth-scroll engine (Lenis) tied directly to `gsap.ticker`.
- [ ] **Zero Layout Thrashing**: Animate only GPU transforms (`transform`, `opacity`). Never animate `width`, `height`, `top`, or `margin`.
- [ ] **Retina Anti-Aliasing**: `<Canvas dpr={[1, 2]}>` configured.
- [ ] **GPU Memory Safety**: Geometry attributes allocated once in `useMemo`. Disposed on unmount.
- [ ] **Contrast Guard**: Background radial/linear vignettes prevent bright 3D shaders from compromising foreground typography readability.
- [ ] **Accessibility (a11y)**: Check `prefers-reduced-motion: reduce` across all GSAP timelines and R3F animation hooks. Provide graceful static fallbacks.
