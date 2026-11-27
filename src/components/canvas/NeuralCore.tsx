import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getActivePalette, usePalette } from '../../theme/palettes'

gsap.registerPlugin(ScrollTrigger)

// Shader for the central neural core
const coreVertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uClickPulse;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vObjNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
    vec4 x_ = floor(j * (1.0 / 7.0));
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
    vec4 y = y_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vObjNormal = normal;
    vNormal = normalize(normalMatrix * normal);
    
    float noiseFreq = 1.2;
    float noiseSpeed = 0.35;
    float noiseVal = snoise(normal * noiseFreq + vec3(uTime * noiseSpeed));
    
    float distToPointer = length(uv - (uPointer * 0.5 + 0.5));
    float pointerInfluence = smoothstep(0.8, 0.0, distToPointer) * 0.18;
    
    float clickDeform = sin(uTime * 12.0) * uClickPulse * 0.25;
    
    float totalDisplacement = (noiseVal * 0.26) + pointerInfluence + clickDeform;
    vDisplacement = totalDisplacement;
    
    vec3 newPosition = position + normal * totalDisplacement;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const coreFragmentShader = `
  uniform float uTime;
  uniform float uClickPulse;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vObjNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.2);
    
    vec3 colorBase = vec3(0.02, 0.04, 0.07);
    
    float blendFactor = smoothstep(-0.25, 0.35, vDisplacement);
    vec3 coreColor = mix(colorBase, uColorPrimary * 0.35, blendFactor);

    // Fast GPU trig ridge-field for crawling surface lightning veins
    vec3 p = vObjNormal * 4.2 + vec3(uTime * 0.45, -uTime * 0.35, uTime * 0.25);
    float w1 = sin(p.x * 2.3 + sin(p.y * 3.1 + uTime * 3.2)) + cos(p.z * 2.5 - sin(p.x * 2.7 - uTime * 2.4));
    float w2 = cos(p.y * 2.9 + sin(p.z * 3.4 - uTime * 3.8)) - sin(p.x * 2.4 + cos(p.y * 2.1 + uTime * 2.9));
    float ridge1 = pow(clamp(1.0 - abs(w1) * 0.55, 0.0, 1.0), 18.0);
    float ridge2 = pow(clamp(1.0 - abs(w2) * 0.55, 0.0, 1.0), 22.0);
    float arcMask = max(ridge1, ridge2 * 0.85);
    float surge = 0.22 + 0.78 * pow(max(0.0, sin(uTime * 2.1 + sin(uTime * 0.85) * 2.2)), 5.0);
    float surfaceLightning = arcMask * (surge + uClickPulse * 1.1) * (0.55 + fresnel * 0.85);
    vec3 lightningColor = mix(uColorSecondary, vec3(0.95, 0.99, 1.0), clamp(surfaceLightning * 0.65, 0.0, 1.0));
    
    vec3 finalColor = coreColor 
      + (uColorPrimary * (fresnel * 0.9 + uClickPulse * 0.5)) 
      + (uColorSecondary * pow(fresnel, 4.5) * 0.7)
      + (lightningColor * surfaceLightning * 0.95);
    
    float alpha = clamp(0.28 + fresnel * 0.22 + surfaceLightning * 0.32, 0.0, 0.92);
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// GPU-computed 3D jagged lightning arc bolts (1 draw call, zero CPU updates)
const lightningVertexShader = `
  uniform float uTime;
  uniform float uClickPulse;

  attribute float aBoltId;
  attribute float aProgress;
  attribute vec3 aTangent;
  attribute vec3 aRadial;

  varying float vProgress;
  varying float vBoltId;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vProgress = aProgress;
    vBoltId = aBoltId;

    float tick = floor(uTime * 15.0 + aBoltId * 3.17);
    float env = sin(aProgress * 3.14159265);
    float j1 = (hash12(vec2(aProgress * 19.0 + aBoltId * 7.0, tick)) - 0.5) * 2.0;
    float j2 = (hash12(vec2(aProgress * 31.0 + aBoltId * 13.0, tick + 5.7)) - 0.5) * 2.0;
    float amp = (0.19 + uClickPulse * 0.11) * env;

    vec3 displaced = position + aTangent * (j1 * amp) + aRadial * (j2 * amp * 0.72);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

const lightningFragmentShader = `
  uniform float uTime;
  uniform float uClickPulse;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;

  varying float vProgress;
  varying float vBoltId;

  void main() {
    float strike = pow(max(0.0, sin(uTime * 2.4 + vBoltId * 1.73 + sin(uTime * 3.9 + vBoltId * 0.9) * 1.4)), 4.0);
    float activeFlash = clamp(strike + uClickPulse * 0.85, 0.0, 1.0);
    if (activeFlash < 0.03) discard;

    float tipFade = sin(vProgress * 3.14159265);
    float alpha = tipFade * activeFlash * 0.85;
    vec3 boltColor = mix(uColorPrimary, mix(uColorSecondary, vec3(0.95, 0.99, 1.0), 0.65), activeFlash);

    gl_FragColor = vec4(boltColor, alpha);
  }
`

// Shaders for the click-interactive particle field
const particlesVertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uClickPulse;
  uniform vec3 uClickPos;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  
  attribute vec3 aRandom;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;
    
    pos.x += sin(uTime * 0.6 + aRandom.x * 6.28) * 0.12;
    pos.y += cos(uTime * 0.5 + aRandom.y * 6.28) * 0.12;
    pos.z += sin(uTime * 0.7 + aRandom.z * 6.28) * 0.12;
    
    vec3 diff = pos - uClickPos;
    float dist = length(diff);
    float shockRadius = (1.0 - uClickPulse) * 4.5;
    float waveDist = abs(dist - shockRadius);
    float wave = smoothstep(1.2, 0.0, waveDist) * uClickPulse;
    
    if (dist > 0.001) {
      pos += normalize(diff) * (wave * 1.6 + uClickPulse * (0.8 / (dist * 0.4 + 1.0)));
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (14.0 * (1.0 + wave * 2.2 + uClickPulse * 1.5)) / -mvPosition.z;
    
    vAlpha = 0.25 + wave * 0.75 + uClickPulse * 0.3;
    vColor = mix(uColorPrimary, uColorSecondary, wave);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particlesFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`

export function NeuralCore() {
  const palette = usePalette()
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireframeRef = useRef<THREE.Mesh>(null!)

  const clickPulseVal = useRef(0)
  const clickPosVal = useRef(new THREE.Vector3(0.6, 0, 0))
  const lastPaletteId = useRef('')
  const lastViewportRef = useRef({ width: 0, aspect: 0, responsiveScale: 1, isMobile: false })

  // GSAP-scrubbed scroll coordinates
  const scrollData = useRef({
    posX: 0.6,
    posY: 0,
    rotY: 0,
    rotX: 0,
    scale: 1,
  })

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uClickPulse: { value: 0 },
      uColorPrimary: { value: new THREE.Color('#00f2fe') },
      uColorSecondary: { value: new THREE.Color('#00ffa3') },
    }),
    []
  )

  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uClickPulse: { value: 0 },
      uClickPos: { value: new THREE.Vector3(0, 0, 0) },
      uColorPrimary: { value: new THREE.Color('#00f2fe') },
      uColorSecondary: { value: new THREE.Color('#00ffa3') },
    }),
    []
  )

  const lightningUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uClickPulse: { value: 0 },
      uColorPrimary: { value: new THREE.Color('#00f2fe') },
      uColorSecondary: { value: new THREE.Color('#00ffa3') },
    }),
    []
  )

  const lightningMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: lightningVertexShader,
        fragmentShader: lightningFragmentShader,
        uniforms: lightningUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [lightningUniforms]
  )

  const lightningGeometry = useMemo(() => {
    const boltCount = 10
    const segmentsPerBolt = 16
    const vertexCount = boltCount * segmentsPerBolt * 2
    const positions = new Float32Array(vertexCount * 3)
    const tangents = new Float32Array(vertexCount * 3)
    const radials = new Float32Array(vertexCount * 3)
    const boltIds = new Float32Array(vertexCount)
    const progressAttr = new Float32Array(vertexCount)

    const startVec = new THREE.Vector3()
    const endVec = new THREE.Vector3()
    const orthoAxis = new THREE.Vector3()
    const pt = new THREE.Vector3()
    const tan = new THREE.Vector3()
    const rad = new THREE.Vector3()

    let vIdx = 0
    for (let b = 0; b < boltCount; b++) {
      // Deterministic golden-ratio distribution for balanced arc coverage
      const y0 = 1 - ((b + 0.5) / boltCount) * 2
      const r0 = Math.sqrt(Math.max(0, 1 - y0 * y0))
      const theta0 = b * 2.3999632297
      startVec.set(Math.cos(theta0) * r0, y0, Math.sin(theta0) * r0).normalize()

      orthoAxis.set(Math.sin(theta0 + 1.3), Math.cos(b * 1.7), -Math.cos(theta0 + 0.7)).normalize()
      endVec.copy(startVec).applyAxisAngle(orthoAxis, 0.95 + (b % 3) * 0.22).normalize()

      for (let s = 0; s < segmentsPerBolt; s++) {
        for (let end = 0; end < 2; end++) {
          const t = (s + end) / segmentsPerBolt
          pt.copy(startVec).lerp(endVec, t).normalize()
          rad.copy(pt)
          const radius = 2.06 + Math.sin(t * Math.PI) * 0.32
          pt.multiplyScalar(radius)

          tan.crossVectors(endVec, startVec)
          if (tan.lengthSq() < 0.0001) tan.set(0, 1, 0)
          tan.normalize()

          positions[vIdx * 3] = pt.x
          positions[vIdx * 3 + 1] = pt.y
          positions[vIdx * 3 + 2] = pt.z
          tangents[vIdx * 3] = tan.x
          tangents[vIdx * 3 + 1] = tan.y
          tangents[vIdx * 3 + 2] = tan.z
          radials[vIdx * 3] = rad.x
          radials[vIdx * 3 + 1] = rad.y
          radials[vIdx * 3 + 2] = rad.z
          boltIds[vIdx] = b
          progressAttr[vIdx] = t
          vIdx++
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aTangent', new THREE.BufferAttribute(tangents, 3))
    geo.setAttribute('aRadial', new THREE.BufferAttribute(radials, 3))
    geo.setAttribute('aBoltId', new THREE.BufferAttribute(boltIds, 1))
    geo.setAttribute('aProgress', new THREE.BufferAttribute(progressAttr, 1))
    return geo
  }, [])

  useEffect(() => {
    return () => {
      lightningGeometry.dispose()
      lightningMaterial.dispose()
    }
  }, [lightningGeometry, lightningMaterial])

  const { particlePositions, particleRandoms } = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - 2 * ((i + 0.5) / count))
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const radius = 2.2 + Math.random() * 2.8

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      randoms[i * 3] = Math.random()
      randoms[i * 3 + 1] = Math.random()
      randoms[i * 3 + 2] = Math.random()
    }

    return { particlePositions: positions, particleRandoms: randoms }
  }, [])

  // Bind GSAP ScrollTrigger to scrub 3D position and rotation across sections
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        endTrigger: '#contact',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    })

    // Scrub across sections: orbit 360°, move left in projects, scale slightly in skills
    tl.to(scrollData.current, {
      posX: -0.85,
      posY: -0.15,
      rotY: Math.PI * 1.5,
      rotX: 0.45,
      scale: 1.15,
      ease: 'power1.inOut',
    })
      .to(scrollData.current, {
        posX: 0.0,
        posY: 0.1,
        rotY: Math.PI * 3.0,
        rotX: -0.3,
        scale: 1.05,
        ease: 'power1.inOut',
      })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  // Trigger subtle lightning surge on pointer click
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const handlePointerDown = () => {
      clickPulseVal.current = 1.0
    }
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useFrame((state, delta) => {
    const active = getActivePalette()
    if (active.id !== lastPaletteId.current) {
      lastPaletteId.current = active.id
      coreUniforms.uColorPrimary.value.set(active.primary)
      coreUniforms.uColorSecondary.value.set(active.secondary)
      particleUniforms.uColorPrimary.value.set(active.primary)
      particleUniforms.uColorSecondary.value.set(active.secondary)
      lightningUniforms.uColorPrimary.value.set(active.primary)
      lightningUniforms.uColorSecondary.value.set(active.secondary)
    }

    const dt = Math.min(delta, 0.05)
    coreUniforms.uTime.value += dt
    particleUniforms.uTime.value += dt
    lightningUniforms.uTime.value += dt

    if (clickPulseVal.current > 0.001) {
      clickPulseVal.current = Math.max(0, clickPulseVal.current - dt * 1.9)
      coreUniforms.uClickPulse.value = clickPulseVal.current
      particleUniforms.uClickPulse.value = clickPulseVal.current
      lightningUniforms.uClickPulse.value = clickPulseVal.current
      particleUniforms.uClickPos.value.copy(clickPosVal.current)
    } else if (coreUniforms.uClickPulse.value !== 0) {
      coreUniforms.uClickPulse.value = 0
      particleUniforms.uClickPulse.value = 0
      lightningUniforms.uClickPulse.value = 0
    }

    const targetX = state.pointer.x * 0.7
    const targetY = state.pointer.y * 0.7
    const lerpFactor = 1 - Math.pow(0.95, dt * 60)
    coreUniforms.uPointer.value.x += (targetX - coreUniforms.uPointer.value.x) * lerpFactor
    coreUniforms.uPointer.value.y += (targetY - coreUniforms.uPointer.value.y) * lerpFactor
    particleUniforms.uPointer.value.copy(coreUniforms.uPointer.value)

    if (groupRef.current) {
      const { aspect, width } = state.viewport
      const vpCache = lastViewportRef.current
      if (vpCache.width !== width || vpCache.aspect !== aspect) {
        const isMobile = aspect < 0.85
        const isTablet = aspect >= 0.85 && aspect < 1.25
        vpCache.width = width
        vpCache.aspect = aspect
        vpCache.isMobile = isMobile
        vpCache.responsiveScale = isMobile
          ? Math.min(0.62, width / 5.2)
          : isTablet
          ? Math.min(0.85, width / 6.5)
          : Math.min(1.2, Math.max(0.85, width / 7.2))
      }

      const { isMobile, responsiveScale } = vpCache
      const currentScale = scrollData.current.scale * responsiveScale

      // Responsive X offset: centered on mobile, offset to right on desktop
      const responsivePosX = isMobile
        ? scrollData.current.posX * 0.2
        : scrollData.current.posX

      const responsivePosY = isMobile
        ? scrollData.current.posY + 0.1
        : scrollData.current.posY

      // Integrate GSAP scroll-scrubbed position with mouse inertia
      groupRef.current.position.x = responsivePosX + coreUniforms.uPointer.value.x * (isMobile ? 0.15 : 0.35)
      groupRef.current.position.y = responsivePosY + coreUniforms.uPointer.value.y * (isMobile ? 0.12 : 0.25)
      groupRef.current.scale.setScalar(currentScale)
      groupRef.current.rotation.y = scrollData.current.rotY + state.clock.elapsedTime * 0.08
      groupRef.current.rotation.x = scrollData.current.rotX + Math.sin(state.clock.elapsedTime * 0.15) * 0.06
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= dt * 0.05
      wireframeRef.current.rotation.z += dt * 0.03
    }
  })

  return (
    <group ref={groupRef} position={[0.6, 0, 0]}>
      {/* Primary Displaced Shader Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.0, 32]} />
        <shaderMaterial
          vertexShader={coreVertexShader}
          fragmentShader={coreFragmentShader}
          uniforms={coreUniforms}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer Cybernetic Wireframe Lattice */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[2.3, 4]} />
        <meshBasicMaterial
          color={palette.primary}
          wireframe={true}
          transparent={true}
          opacity={0.06}
        />
      </mesh>

      {/* GPU-Computed 3D Lightning Arcs */}
      <lineSegments geometry={lightningGeometry} material={lightningMaterial} />

      {/* Interactive Click-Responsive Particle Cloud */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            args={[particleRandoms, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={particlesVertexShader}
          fragmentShader={particlesFragmentShader}
          uniforms={particleUniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
