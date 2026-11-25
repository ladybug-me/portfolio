# Rajveer Singh — Portfolio

Interactive 3D portfolio built with React 19, Three.js, GSAP, Lenis, and Tailwind CSS v4.

## Features

- **3D WebGL Scenes**: Fullscreen shader backdrop (`HeroCanvas` with `NeuralCore` and `DistantOrbitParticles`) alongside an autonomous, shadow-mapped 3D companion (`PetCanvas` with `SphericalPet`).
- **Scroll Choreography**: Smooth scrolling via Lenis synchronized with GSAP `ScrollTrigger` animations, masked typography reveals, and `prefers-reduced-motion` fallbacks.
- **Interactive UI**: Custom cursor, section navigator, scroll-linked kinetic text illumination (`KineticTextScrub`), and scroll-drawn SVG circuit pipeline (`CircuitPipeline`).
- **Content Sections**: Hero overview, sticky stacked project showcase, technical capabilities matrix, interactive FAQ accordion, and contact section.

## Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **3D & Shaders**: Three.js, React Three Fiber, Drei
- **Animation & Scroll**: GSAP (`@gsap/react`, `ScrollTrigger`, `SplitText`), Lenis
- **Styling & Icons**: Tailwind CSS v4 (`@tailwindcss/vite`), Iconify
- **Linting**: Oxlint

## Project Structure

```text
├── public/
│   └── assets/          # Static media, project visuals, and Resume.pdf
├── src/
│   ├── components/
│   │   ├── canvas/      # React Three Fiber scenes (HeroCanvas, PetCanvas, NeuralCore, SphericalPet)
│   │   ├── sections/    # Page sections (Hero, Projects, Skills, FAQ, Contact)
│   │   └── ui/          # Interactive UI primitives (CustomCursor, CircuitPipeline, SectionNavigator)
│   ├── App.tsx          # Lenis + GSAP setup and section composition
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles and Tailwind CSS v4 configuration
├── index.html
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/ladybug-me/portfolio.git
cd portfolio
npm install
```

### Development

Start the local Vite development server:

```bash
npm run dev
```

### Production Build & Preview

Type-check, bundle for production, and preview locally:

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```
