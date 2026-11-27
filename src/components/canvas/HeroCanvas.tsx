import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeuralCore } from './NeuralCore'
import { DistantOrbitParticles } from './DistantOrbitParticles'

interface HeroCanvasProps {
  onReady?: () => void
}

export function HeroCanvas({ onReady }: HeroCanvasProps) {
  return (
    <div className="fixed inset-x-0 top-0 w-full h-[100lvh] pointer-events-none z-0 overflow-hidden">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: false,
          }}
          onCreated={() => {
            requestAnimationFrame(() => onReady?.())
          }}
          className="w-full h-full"
        >
          <NeuralCore />
          <DistantOrbitParticles />
        </Canvas>
      </Suspense>

      {/* Atmospheric vignette overlays balanced for visible orbital particle radiance and readability */}
      <div className="absolute inset-0 bg-radial from-transparent via-[var(--bg-primary)]/25 to-[var(--bg-primary)]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/30 via-transparent to-[var(--bg-primary)]/80 pointer-events-none" />
    </div>
  )
}
