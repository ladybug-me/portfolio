import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SphericalPet } from './SphericalPet'

export function PetCanvas() {
  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none z-20 overflow-hidden">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          className="w-full h-full pointer-events-none"
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-4, 4, 3]} intensity={0.9} color="#00f2fe" />
          <SphericalPet />
        </Canvas>
      </Suspense>
    </div>
  )
}
