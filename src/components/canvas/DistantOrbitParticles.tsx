import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const distantOrbitVertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uColor;
  
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aAngle;
  attribute float aElevation;
  attribute float aSize;
  attribute float aPhase;
  
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Unidirectional celestial orbit
    float angle = aAngle + uTime * aSpeed;
    
    // Orbital coordinates across vast deep space
    float x = cos(angle) * aRadius;
    float z = sin(angle) * aRadius;
    float y = aElevation;
    
    // Celestial polar tilt
    const float tilt = 0.42;
    float cosTilt = cos(tilt);
    float sinTilt = sin(tilt);
    vec3 orbitPos = vec3(
      x,
      y * cosTilt - z * sinTilt,
      y * sinTilt + z * cosTilt
    );
    
    // Parallax responsiveness
    orbitPos.x += uPointer.x * 1.4;
    orbitPos.y += uPointer.y * 1.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(orbitPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Sharp pinpoint size scaling
    float twinkle = sin(uTime * 2.4 + aPhase) * 0.35 + 0.65;
    gl_PointSize = clamp((aSize * twinkle * 85.0) / -mvPosition.z, 1.5, 7.5);
    
    vColor = uColor;
    vAlpha = clamp(0.75 + 0.25 * sin(uTime * 1.8 + aPhase * 2.0), 0.5, 1.0);
  }
`

const distantOrbitFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.48) discard;
    
    // Razor-sharp pinpoint star with crisp anti-aliasing
    float edge = smoothstep(0.48, 0.36, dist);
    float sharpCenter = smoothstep(0.2, 0.0, dist) * 0.9;
    
    gl_FragColor = vec4(vColor * (1.1 + sharpCenter * 0.4), (edge + sharpCenter * 0.4) * vAlpha);
  }
`

export function DistantOrbitParticles() {
  const pointsRef = useRef<THREE.Points>(null!)
  const groupRef = useRef<THREE.Group>(null!)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color('#00f2fe') },
    }),
    []
  )

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: distantOrbitVertexShader,
      fragmentShader: distantOrbitFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [uniforms])

  const geometry = useMemo(() => {
    const count = 4500
    const geo = new THREE.BufferGeometry()

    const positions = new Float32Array(count * 3)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)
    const angles = new Float32Array(count)
    const elevations = new Float32Array(count)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Vast radial span: 12.0 to 75.0 units
      const r = 12.0 + Math.pow(Math.random(), 0.75) * 63.0
      radii[i] = r

      // Strict unidirectional orbital speed
      const baseSpeed = (0.045 / Math.sqrt(r * 0.1)) * (0.85 + Math.random() * 0.3)
      speeds[i] = baseSpeed

      // Random starting azimuth angle
      angles[i] = Math.random() * Math.PI * 2

      // Wide vertical span across deep celestial volume
      elevations[i] = (Math.random() - 0.5) * (r * 1.4 + 25.0)

      // Sharp pinpoint size weights
      sizes[i] = 1.2 + Math.random() * 1.8

      // Twinkle phase
      phases[i] = Math.random() * Math.PI * 2

      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1))
    geo.setAttribute('aElevation', new THREE.BufferAttribute(elevations, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

    return geo
  }, [])

  // Parallax rotation tied to scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !groupRef.current) return

    const scrollAnim = gsap.to(groupRef.current.rotation, {
      y: Math.PI * 2.0,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
      },
    })

    return () => {
      scrollAnim.scrollTrigger?.kill()
      scrollAnim.kill()
    }
  }, [])

  useFrame((state, delta) => {
    uniforms.uTime.value += delta

    // Pointer interpolation
    const targetX = state.pointer.x * 0.5
    const targetY = state.pointer.y * 0.5
    uniforms.uPointer.value.x += (targetX - uniforms.uPointer.value.x) * 0.05
    uniforms.uPointer.value.y += (targetY - uniforms.uPointer.value.y) * 0.05

    // Steady orbital field rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}
