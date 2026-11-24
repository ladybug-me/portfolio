import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Shader for the central neural core
const coreVertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uClickPulse;
  
  varying vec2 vUv;
  varying vec3 vNormal;
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
    vNormal = normalize(normalMatrix * normal);
    
    float noiseFreq = 1.2;
    float noiseSpeed = 0.35;
    float noiseVal = snoise(normal * noiseFreq + vec3(uTime * noiseSpeed));
    
    float distToPointer = length(uv - (uPointer * 0.5 + 0.5));
    float pointerInfluence = smoothstep(0.8, 0.0, distToPointer) * 0.18;
    
    // Click pulse expansion
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
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.2);
    
    vec3 colorBase = vec3(0.02, 0.04, 0.07);
    vec3 colorCyan = vec3(0.0, 0.95, 0.99);
    vec3 colorJade = vec3(0.0, 1.0, 0.64);
    
    float blendFactor = smoothstep(-0.25, 0.35, vDisplacement);
    vec3 coreColor = mix(colorBase, colorCyan * 0.35, blendFactor);
    
    // Intensify luminance during mouse clicks
    vec3 finalColor = coreColor 
      + (colorCyan * (fresnel * 0.9 + uClickPulse * 0.5)) 
      + (colorJade * pow(fresnel, 4.5) * 0.7);
    
    gl_FragColor = vec4(finalColor, 0.82 + uClickPulse * 0.15);
  }
`

// Shaders for the click-interactive particle field
const particlesVertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uClickPulse;
  uniform vec3 uClickPos;
  
  attribute vec3 aRandom;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;
    
    // Ambient rotational float
    pos.x += sin(uTime * 0.6 + aRandom.x * 6.28) * 0.12;
    pos.y += cos(uTime * 0.5 + aRandom.y * 6.28) * 0.12;
    pos.z += sin(uTime * 0.7 + aRandom.z * 6.28) * 0.12;
    
    // Interactive mouse click shockwave
    vec3 diff = pos - uClickPos;
    float dist = length(diff);
    float shockRadius = (1.0 - uClickPulse) * 4.5;
    float waveDist = abs(dist - shockRadius);
    float wave = smoothstep(1.2, 0.0, waveDist) * uClickPulse;
    
    // Displace outward from click epicenter
    if (dist > 0.001) {
      pos += normalize(diff) * (wave * 1.6 + uClickPulse * (0.8 / (dist * 0.4 + 1.0)));
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (14.0 * (1.0 + wave * 2.2 + uClickPulse * 1.5)) / -mvPosition.z;
    
    vAlpha = 0.25 + wave * 0.75 + uClickPulse * 0.3;
    vColor = mix(vec3(0.0, 0.95, 0.99), vec3(0.0, 1.0, 0.64), wave);
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
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireframeRef = useRef<THREE.Mesh>(null!)

  const clickPulseVal = useRef(0)
  const clickPosVal = useRef(new THREE.Vector3(0.6, 0, 0))

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uClickPulse: { value: 0 },
    }),
    []
  )

  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uClickPulse: { value: 0 },
      uClickPos: { value: new THREE.Vector3(0, 0, 0) },
    }),
    []
  )

  // Generate 1,500 interactive particles surrounding the core
  const { particlePositions, particleRandoms } = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Golden spiral distribution across spherical shell
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

  // Listen to mouse clicks across the window to trigger particle impulse
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      clickPulseVal.current = 1.0

      // Map click screen coordinates into approximate 3D world space (Z=0)
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      clickPosVal.current.set(nx * 4.0, ny * 2.5, 0)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useFrame((state, delta) => {
    coreUniforms.uTime.value += delta
    particleUniforms.uTime.value += delta

    // Smoothly decay click shockwave pulse
    clickPulseVal.current = Math.max(0, clickPulseVal.current - delta * 1.5)
    coreUniforms.uClickPulse.value = clickPulseVal.current
    particleUniforms.uClickPulse.value = clickPulseVal.current
    particleUniforms.uClickPos.value.copy(clickPosVal.current)

    // Inertial pointer movement
    const targetX = state.pointer.x * 0.7
    const targetY = state.pointer.y * 0.7
    coreUniforms.uPointer.value.x += (targetX - coreUniforms.uPointer.value.x) * 0.05
    coreUniforms.uPointer.value.y += (targetY - coreUniforms.uPointer.value.y) * 0.05
    particleUniforms.uPointer.value.copy(coreUniforms.uPointer.value)

    // Drift group based on pointer and subtle breath
    if (groupRef.current) {
      groupRef.current.position.x = 0.6 + coreUniforms.uPointer.value.x * 0.4
      groupRef.current.position.y = coreUniforms.uPointer.value.y * 0.3
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.1 + clickPulseVal.current * 0.3)
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.06
      wireframeRef.current.rotation.z += delta * 0.04
    }
  })

  return (
    <group ref={groupRef} position={[0.6, 0, 0]}>
      {/* Primary Displaced Shader Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.0, 48]} />
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
          color="#00f2fe"
          wireframe={true}
          transparent={true}
          opacity={0.12}
        />
      </mesh>

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
