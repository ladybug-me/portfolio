import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { SphericalPet } from './SphericalPet'

export function PetCanvas() {
  const [isChasing, setIsChasing] = useState(false)

  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none z-20 overflow-hidden">
      {isChasing && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 py-1.5 rounded-full bg-[#0d111a]/75 backdrop-blur-xl border border-cyan-400/35 text-xs sm:text-sm font-mono text-cyan-300 tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.45)] whitespace-nowrap"
        >
          Click the pet to exit chase mode
        </div>
      )}
      <Suspense fallback={null}>
        <Canvas
          shadows="percentage"
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.25]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          style={{ pointerEvents: 'none' }}
          className="w-full h-full pointer-events-none"
        >
          <ambientLight intensity={0.45} />
          {/* Top-down directional light with lightweight 512x512 GPU shadow map */}
          <directionalLight
            position={[0, 8, 0.35]}
            intensity={2.4}
            color="#ffffff"
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-camera-near={1}
            shadow-camera-far={14}
            shadow-camera-left={-4.5}
            shadow-camera-right={4.5}
            shadow-camera-top={4.5}
            shadow-camera-bottom={-4.5}
            shadow-bias={-0.0003}
            shadow-normalBias={0.015}
          />
          <SphericalPet onFollowingChange={setIsChasing} />
        </Canvas>
      </Suspense>
    </div>
  )
}
