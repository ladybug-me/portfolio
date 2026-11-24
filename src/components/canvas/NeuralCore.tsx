import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  
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
    
    float totalDisplacement = (noiseVal * 0.28) + pointerInfluence;
    vDisplacement = totalDisplacement;
    
    vec3 newPosition = position + normal * totalDisplacement;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.2);
    
    // Deep cosmic core with electric cyan & neon jade highlights
    vec3 colorBase = vec3(0.02, 0.04, 0.07);
    vec3 colorCyan = vec3(0.0, 0.95, 0.99);
    vec3 colorJade = vec3(0.0, 1.0, 0.64);
    
    float blendFactor = smoothstep(-0.25, 0.35, vDisplacement);
    vec3 coreColor = mix(colorBase, colorCyan * 0.35, blendFactor);
    
    vec3 finalColor = coreColor + (colorCyan * fresnel * 0.9) + (colorJade * pow(fresnel, 4.5) * 0.7);
    
    gl_FragColor = vec4(finalColor, 0.82);
  }
`

export function NeuralCore() {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireframeRef = useRef<THREE.Mesh>(null!)
  const pointsRef = useRef<THREE.Points>(null!)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  const particlesGeo = useMemo(() => {
    return new THREE.IcosahedronGeometry(2.7, 10)
  }, [])

  useFrame((state, delta) => {
    uniforms.uTime.value += delta

    // Inertial pointer movement
    const targetX = state.pointer.x * 0.7
    const targetY = state.pointer.y * 0.7
    uniforms.uPointer.value.x += (targetX - uniforms.uPointer.value.x) * 0.05
    uniforms.uPointer.value.y += (targetY - uniforms.uPointer.value.y) * 0.05

    // Drift group based on pointer and subtle breath
    if (groupRef.current) {
      groupRef.current.position.x = 0.6 + uniforms.uPointer.value.x * 0.4
      groupRef.current.position.y = uniforms.uPointer.value.y * 0.3
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.06
      wireframeRef.current.rotation.z += delta * 0.04
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={groupRef} position={[0.6, 0, 0]}>
      {/* Primary Displaced Shader Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.0, 48]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
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

      {/* Orbiting Neural Cloud Points */}
      <points ref={pointsRef} geometry={particlesGeo}>
        <pointsMaterial
          size={0.022}
          color="#00ffa3"
          transparent={true}
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
