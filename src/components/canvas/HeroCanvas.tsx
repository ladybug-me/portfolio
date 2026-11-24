import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeuralCore } from './NeuralCore'
import { DistantOrbitParticles } from './DistantOrbitParticles'

export function HeroCanvas() {
  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none z-0 overflow-hidden">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00f2fe" />
          <pointLight position={[-10, -10, -5]} intensity={0.9} color="#00ffa3" />
          <NeuralCore />
          <DistantOrbitParticles />
        </Canvas>
      </Suspense>

      {/* Atmospheric vignette overlays balanced for visible orbital particle radiance and readability */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#07090e]/25 to-[#07090e]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/30 via-transparent to-[#07090e]/80 pointer-events-none" />
    </div>
  )
}
