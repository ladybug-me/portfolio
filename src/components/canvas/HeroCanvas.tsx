import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeuralCore } from './NeuralCore'

export function HeroCanvas() {
  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[700px] flex items-center justify-center">
      <Suspense
        fallback={
          <div className="w-48 h-48 rounded-full border border-cyan-500/30 bg-cyan-950/20 animate-pulse flex items-center justify-center text-xs text-cyan-400 font-mono">
            INITIALIZING KERNEL...
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} color="#00f2fe" />
          <pointLight position={[-10, -10, -5]} intensity={0.8} color="#00ffa3" />
          <NeuralCore />
        </Canvas>
      </Suspense>

      {/* Decorative HUD Corner Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-cyan-500/10 border-dashed animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[440px] h-[440px] sm:w-[540px] sm:h-[540px] rounded-full border border-emerald-500/5 animate-[spin_90s_linear_infinite_reverse]" />
      </div>
    </div>
  )
}
