import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeuralCore } from './NeuralCore'
import { DistantOrbitParticles } from './DistantOrbitParticles'
import { usePalette } from '../../theme/palettes'

export function HeroCanvas() {
  const palette = usePalette()

  return (
    <div className="fixed inset-x-0 top-0 w-full h-[100lvh] pointer-events-none z-0 overflow-hidden">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color={palette.primary} />
          <pointLight position={[-10, -10, -5]} intensity={0.9} color={palette.secondary} />
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
