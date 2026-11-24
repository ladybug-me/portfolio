import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { SphericalPet } from './SphericalPet'

export function PetCanvas() {
  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none z-20 overflow-hidden">
      <Suspense fallback={null}>
        <Canvas
          shadows="percentage"
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
          <ambientLight intensity={0.4} />
          {/* Top-down directional light casting real GPU shadow maps */}
          <directionalLight
            position={[0, 8, 0.35]}
            intensity={2.4}
            color="#ffffff"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={16}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-bias={-0.0003}
            shadow-normalBias={0.015}
          />
          <pointLight position={[-4, 4, 3]} intensity={0.7} color="#00f2fe" />
          <SphericalPet />
        </Canvas>
      </Suspense>
    </div>
  )
}
