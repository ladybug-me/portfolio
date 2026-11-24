import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

interface PlatformData {
  x: number
  y: number
  z: number
  active: boolean
  life: number
  opacity: number
  scaleX: number
}

// 6 compact orbital bio-digital energy motes scaled to the pet's smaller radius
const MOTE_OFFSETS = [
  { speed: 1.8, rX: 0.32, rY: 0.20, rZ: 0.26, phase: 0.0, color: '#00f2fe' },
  { speed: -1.4, rX: 0.35, rY: 0.24, rZ: 0.28, phase: 1.2, color: '#00ffa3' },
  { speed: 2.1, rX: 0.28, rY: 0.18, rZ: 0.30, phase: 2.5, color: '#38bdf8' },
  { speed: -1.9, rX: 0.33, rY: 0.22, rZ: 0.24, phase: 3.8, color: '#00ffa3' },
  { speed: 1.5, rX: 0.36, rY: 0.25, rZ: 0.27, phase: 4.6, color: '#00f2fe' },
  { speed: -2.3, rX: 0.29, rY: 0.19, rZ: 0.25, phase: 5.4, color: '#2dd4bf' },
]

export function SphericalPet() {
  const { viewport } = useThree()

  // Mesh part references
  const petRootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const leftEyeGroupRef = useRef<THREE.Group>(null)
  const rightEyeGroupRef = useRef<THREE.Group>(null)
  const leftPupilRef = useRef<THREE.Mesh>(null)
  const rightPupilRef = useRef<THREE.Mesh>(null)
  const shadowRef = useRef<THREE.Mesh>(null)
  const innerCoreRef = useRef<THREE.Mesh>(null)
  const primaryBandRef = useRef<THREE.Mesh>(null)
  const secondaryBandRef = useRef<THREE.Mesh>(null)
  const motesGroupRef = useRef<THREE.Group>(null)

  // Platform references (static world placement)
  const plat1GroupRef = useRef<THREE.Group>(null)
  const plat2GroupRef = useRef<THREE.Group>(null)
  const plat1MatRef = useRef<THREE.MeshStandardMaterial>(null)
  const plat2MatRef = useRef<THREE.MeshStandardMaterial>(null)
  const plat1RimRef = useRef<THREE.MeshBasicMaterial>(null)
  const plat2RimRef = useRef<THREE.MeshBasicMaterial>(null)

  // Physics state
  const pos = useRef(new THREE.Vector3(0, -1.6, 0))
  const vel = useRef(new THREE.Vector3(0, 0, 0))
  const squash = useRef(new THREE.Vector3(1, 1, 1))
  const squashVel = useRef(new THREE.Vector3(0, 0, 0))

  // Mouse & interaction states
  const targetCursor = useRef(new THREE.Vector3(0, 0, 0))
  const hintPos = useRef<THREE.Vector3 | null>(null)
  const hintTimer = useRef(0)
  const hopCooldown = useRef(0.8)

  // Ecosystem life cycles
  const blinkTimer = useRef(2.5)
  const blinkState = useRef(1.0)
  const idleWanderTimer = useRef(1.5)
  const wanderTargetX = useRef(0)

  // Static platform data
  const platforms = useRef<[PlatformData, PlatformData]>([
    { x: 0, y: -0.8, z: 0, active: false, life: 0, opacity: 0, scaleX: 0 },
    { x: 0, y: 0.1, z: 0, active: false, life: 0, opacity: 0, scaleX: 0 },
  ])
  const platformCooldown = useRef(1.0)

  // Track global pointer events across entire window
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      targetCursor.current.set(
        nx * (viewport.width / 2) * 0.9,
        ny * (viewport.height / 2) * 0.85,
        0
      )
    }

    const handlePointerDown = (e: PointerEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (targetTag === 'input' || targetTag === 'textarea') return

      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1

      // Click is treated as a gentle curiosity hint
      const clickWorld = new THREE.Vector3(
        nx * (viewport.width / 2) * 0.9,
        ny * (viewport.height / 2) * 0.85,
        0
      )
      hintPos.current = clickWorld
      hintTimer.current = 2.4

      // Gentle inquisitive hop towards the hint, strictly bounded
      const dx = clickWorld.x - pos.current.x
      vel.current.x = THREE.MathUtils.clamp(dx * 0.9, -1.2, 1.2)
      vel.current.y = THREE.MathUtils.clamp(1.4 + Math.max(0, clickWorld.y - pos.current.y) * 0.6, 1.2, 2.4)
      vel.current.z = THREE.MathUtils.clamp((0.2 - pos.current.z) * 0.8, -0.15, 0.3)
      squash.current.set(0.88, 1.18, 0.88)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [viewport.width, viewport.height])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = state.clock.elapsedTime
    // Reduced radius: 0.18 (compact, sleek cybernetic scale)
    const petRadius = 0.18
    const floorY = -viewport.height / 2 + petRadius + 0.12
    const maxVisibleY = viewport.height / 2 - petRadius - 0.2
    const maxBoundX = viewport.width / 2 - petRadius - 0.2

    // 1. Ecosystem life: Blinking cycle
    blinkTimer.current -= dt
    if (blinkTimer.current <= 0) {
      blinkState.current = 0.08
      blinkTimer.current = 3.0 + Math.random() * 3.5
    } else {
      blinkState.current = THREE.MathUtils.damp(blinkState.current, 1.0, 16, dt)
    }
    if (leftEyeGroupRef.current && rightEyeGroupRef.current) {
      leftEyeGroupRef.current.scale.y = blinkState.current
      rightEyeGroupRef.current.scale.y = blinkState.current
    }

    // 2. Click hint countdown
    if (hintTimer.current > 0) {
      hintTimer.current -= dt
      if (hintTimer.current <= 0) {
        hintPos.current = null
      }
    }

    // Active gaze focus: hint if active, else cursor
    const activeFocus = hintPos.current || targetCursor.current

    // 3. Static Platform Spawning (Anchored to world coordinates when spawned, NEVER following cursor)
    platformCooldown.current -= dt
    const plats = platforms.current
    const wantsElevatedLedge = activeFocus.y > floorY + 0.9 && pos.current.y < activeFocus.y - 0.4

    if (wantsElevatedLedge && platformCooldown.current <= 0) {
      // Find inactive platform to spawn at a FIXED static world position
      const freePlat = plats.find((p) => !p.active)
      if (freePlat) {
        const stepY = THREE.MathUtils.clamp(
          floorY + (activeFocus.y - floorY) * (freePlat === plats[0] ? 0.45 : 0.8),
          floorY + 0.5,
          maxVisibleY - 0.3
        )
        const stepX = THREE.MathUtils.clamp(
          pos.current.x + (activeFocus.x - pos.current.x) * 0.45,
          -maxBoundX + 0.4,
          maxBoundX - 0.4
        )

        // Lock in static world coordinates
        freePlat.x = stepX
        freePlat.y = stepY
        freePlat.z = 0
        freePlat.active = true
        freePlat.life = 4.5
        platformCooldown.current = 2.0
      }
    }

    // Update static platforms lifetime & visibility
    plats.forEach((p) => {
      if (p.active) {
        p.life -= dt
        if (p.life <= 0) {
          p.active = false
        }
      }
      const targetOp = p.active ? 0.92 : 0
      const targetScale = p.active ? 1.0 : 0
      p.opacity = THREE.MathUtils.damp(p.opacity, targetOp, 6, dt)
      p.scaleX = THREE.MathUtils.damp(p.scaleX, targetScale, 8, dt)
    })

    // Update Platform 1 in scene
    if (plat1GroupRef.current && plat1MatRef.current && plat1RimRef.current) {
      plat1GroupRef.current.position.set(plats[0].x, plats[0].y, plats[0].z)
      plat1GroupRef.current.scale.set(Math.max(0.001, plats[0].scaleX), 1, 1)
      plat1GroupRef.current.visible = plats[0].opacity > 0.01
      plat1MatRef.current.opacity = plats[0].opacity * 0.85
      plat1RimRef.current.opacity = plats[0].opacity * 0.45
    }

    // Update Platform 2 in scene
    if (plat2GroupRef.current && plat2MatRef.current && plat2RimRef.current) {
      plat2GroupRef.current.position.set(plats[1].x, plats[1].y, plats[1].z)
      plat2GroupRef.current.scale.set(Math.max(0.001, plats[1].scaleX), 1, 1)
      plat2GroupRef.current.visible = plats[1].opacity > 0.01
      plat2MatRef.current.opacity = plats[1].opacity * 0.85
      plat2RimRef.current.opacity = plats[1].opacity * 0.45
    }

    // 4. Gravity & Physics Integration
    const gravity = 8.5
    vel.current.y -= gravity * dt

    pos.current.x += vel.current.x * dt
    pos.current.y += vel.current.y * dt
    pos.current.z += vel.current.z * dt

    // Air resistance & lateral damping
    vel.current.x *= Math.pow(0.85, dt * 60)
    vel.current.z *= Math.pow(0.82, dt * 60)

    // Check collision with static platform ledges
    let currentFloor = floorY
    if (vel.current.y <= 0) {
      for (const p of plats) {
        if (p.opacity > 0.4) {
          const halfW = (0.75 * p.scaleX) / 2 + 0.06
          if (
            pos.current.x >= p.x - halfW &&
            pos.current.x <= p.x + halfW &&
            pos.current.y <= p.y + petRadius + 0.06 &&
            pos.current.y >= p.y + petRadius - 0.16
          ) {
            currentFloor = p.y + petRadius
            break
          }
        }
      }
    }

    // Ground / Platform restitution bounce
    if (pos.current.y <= currentFloor) {
      pos.current.y = currentFloor

      if (Math.abs(vel.current.y) > 0.3) {
        vel.current.y = -vel.current.y * 0.58
        squash.current.set(1.2, 0.8, 1.2)
      } else {
        vel.current.y = 0
      }
    }

    // Strict boundary clamps: Pet NEVER jumps out of space
    pos.current.x = THREE.MathUtils.clamp(pos.current.x, -maxBoundX, maxBoundX)
    pos.current.y = THREE.MathUtils.clamp(pos.current.y, floorY, maxVisibleY)
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, -0.2, 0.45)

    // Smooth return of Z to comfortable resting depth
    if (Math.abs(pos.current.z) > 0.03) {
      pos.current.z = THREE.MathUtils.damp(pos.current.z, 0, 3.5, dt)
    }

    // 5. Ecosystem Autonomous Locomotion
    const isOnSurface = Math.abs(pos.current.y - currentFloor) < 0.05
    hopCooldown.current -= dt
    idleWanderTimer.current -= dt

    if (isOnSurface && hopCooldown.current <= 0) {
      let desiredX = pos.current.x
      if (hintPos.current) {
        desiredX = hintPos.current.x
      } else if (Math.abs(targetCursor.current.x - pos.current.x) > 0.5) {
        desiredX = targetCursor.current.x
      } else if (idleWanderTimer.current <= 0) {
        wanderTargetX.current = (Math.random() - 0.5) * maxBoundX * 1.4
        idleWanderTimer.current = 3.0 + Math.random() * 3.0
        desiredX = wanderTargetX.current
      }

      const dx = desiredX - pos.current.x
      if (Math.abs(dx) > 0.28) {
        vel.current.y = 1.7 + Math.random() * 0.35
        vel.current.x = THREE.MathUtils.clamp(dx * 1.1, -1.5, 1.5)
        squash.current.set(0.9, 1.15, 0.9)
        hopCooldown.current = 0.6 + Math.random() * 0.4
      }
    }

    // 6. Harmonic squash-and-stretch spring recovery
    const k = 150
    const damp = 13
    squashVel.current.x += ((1 - squash.current.x) * k - squashVel.current.x * damp) * dt
    squashVel.current.y += ((1 - squash.current.y) * k - squashVel.current.y * damp) * dt
    squashVel.current.z += ((1 - squash.current.z) * k - squashVel.current.z * damp) * dt
    squash.current.addScaledVector(squashVel.current, dt)

    // 7. Organic breathing idle pulse
    const breath = 1.0 + Math.sin(time * 2.8) * 0.025

    // 8. Apply transforms & Horizontal Rotation to Pet
    if (petRootRef.current) {
      petRootRef.current.position.copy(pos.current)
    }
    if (bodyRef.current) {
      bodyRef.current.scale.set(
        squash.current.x * breath,
        squash.current.y * breath,
        squash.current.z * breath
      )

      // Horizontal Yaw & Pitch towards active focus (full horizontal rotation)
      const dx = activeFocus.x - pos.current.x
      const dz = Math.max(0.35, activeFocus.z + 1.2 - pos.current.z)
      const targetYaw = Math.atan2(dx, dz)
      const targetPitch = -Math.atan2(activeFocus.y - pos.current.y, dz) * 0.45
      const targetRoll = -vel.current.x * 0.16 // Banking tilt into horizontal movement

      // Smooth horizontal rotation (yaw) and 3D tilts
      bodyRef.current.rotation.y = THREE.MathUtils.damp(
        bodyRef.current.rotation.y,
        targetYaw,
        7.5,
        dt
      )
      bodyRef.current.rotation.x = THREE.MathUtils.damp(
        bodyRef.current.rotation.x,
        targetPitch + (hintPos.current ? -0.12 : 0),
        7.5,
        dt
      )
      bodyRef.current.rotation.z = THREE.MathUtils.damp(
        bodyRef.current.rotation.z,
        targetRoll,
        9,
        dt
      )
    }

    // 9. Continuous horizontal rotation for equatorial bands & inner core
    if (primaryBandRef.current) {
      primaryBandRef.current.rotation.z += dt * 1.5 + vel.current.x * dt * 3.5
    }
    if (secondaryBandRef.current) {
      secondaryBandRef.current.rotation.z -= dt * 1.2 - vel.current.x * dt * 2.5
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += dt * 1.8 + vel.current.x * dt * 3.0
      const coreScale = 0.58 + Math.sin(time * 3.5) * 0.04
      innerCoreRef.current.scale.set(coreScale, coreScale, coreScale)
    }

    // 10. Continuous Ocular Pupil Tracking
    const eyeWorld = new THREE.Vector3()
    if (bodyRef.current && leftPupilRef.current && rightPupilRef.current) {
      bodyRef.current.getWorldPosition(eyeWorld)
      const dirToTarget = activeFocus.clone().sub(eyeWorld).normalize()

      const pupilX = THREE.MathUtils.clamp(dirToTarget.x * 0.035, -0.016, 0.016)
      const pupilY = THREE.MathUtils.clamp(dirToTarget.y * 0.035, -0.016, 0.016)

      leftPupilRef.current.position.set(pupilX, pupilY, 0.028)
      rightPupilRef.current.position.set(pupilX, pupilY, 0.028)

      // Pupil glow intensity
      const pulseEmissive = hintPos.current ? 2.5 + Math.sin(time * 10) * 0.5 : 1.7
      ;(leftPupilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseEmissive
      ;(rightPupilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseEmissive
    }

    // 11. Micro-Ecosystem: Orbiting bio-digital energy motes
    if (motesGroupRef.current) {
      const motes = motesGroupRef.current.children
      MOTE_OFFSETS.forEach((mote, i) => {
        if (motes[i]) {
          const t = time * mote.speed + mote.phase
          motes[i].position.set(
            Math.cos(t) * mote.rX,
            Math.sin(t * 1.2) * mote.rY,
            Math.sin(t) * mote.rZ
          )
        }
      })
    }

    // 12. Dynamic Contact Shadow on active surface
    if (shadowRef.current) {
      shadowRef.current.position.set(pos.current.x, currentFloor - petRadius + 0.012, pos.current.z)
      const heightAbove = Math.max(0, pos.current.y - currentFloor)
      const shadowScale = THREE.MathUtils.clamp(1.0 - heightAbove * 0.4, 0.25, 1.0)
      shadowRef.current.scale.set(shadowScale, shadowScale, shadowScale)
      const shadowOpacity = THREE.MathUtils.clamp(0.6 - heightAbove * 0.5, 0.05, 0.6)
      ;(shadowRef.current.material as THREE.MeshBasicMaterial).opacity = shadowOpacity
    }
  })

  return (
    <>
      {/* Static Cybernetic Platform Strip 1 */}
      <group ref={plat1GroupRef} visible={false}>
        <mesh>
          <boxGeometry args={[0.75, 0.03, 0.24]} />
          <meshStandardMaterial
            ref={plat1MatRef}
            color="#00f2fe"
            emissive="#00f2fe"
            emissiveIntensity={1.5}
            transparent
            opacity={0}
            roughness={0.15}
            metalness={0.7}
          />
        </mesh>
        <mesh scale={[1.04, 1.35, 1.08]}>
          <boxGeometry args={[0.75, 0.03, 0.24]} />
          <meshBasicMaterial
            ref={plat1RimRef}
            color="#00ffa3"
            wireframe
            transparent
            opacity={0}
          />
        </mesh>
      </group>

      {/* Static Cybernetic Platform Strip 2 */}
      <group ref={plat2GroupRef} visible={false}>
        <mesh>
          <boxGeometry args={[0.7, 0.03, 0.24]} />
          <meshStandardMaterial
            ref={plat2MatRef}
            color="#00ffa3"
            emissive="#00ffa3"
            emissiveIntensity={1.4}
            transparent
            opacity={0}
            roughness={0.15}
            metalness={0.7}
          />
        </mesh>
        <mesh scale={[1.04, 1.35, 1.08]}>
          <boxGeometry args={[0.7, 0.03, 0.24]} />
          <meshBasicMaterial
            ref={plat2RimRef}
            color="#00f2fe"
            wireframe
            transparent
            opacity={0}
          />
        </mesh>
      </group>

      {/* Dynamic Contact Shadow Plane */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* Main Pet Hierarchical Group (Radius: 0.18) */}
      <group ref={petRootRef} position={[0, -1.6, 0]}>
        <group ref={bodyRef}>
          {/* Inner Glowing Bio-Energy Core with Horizontal Rotation */}
          <mesh ref={innerCoreRef}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial
              color="#00ffa3"
              emissive="#00f2fe"
              emissiveIntensity={1.6}
              roughness={0.2}
            />
          </mesh>

          {/* Translucent Frosted Glass Outer Shell (Compact radius 0.18) */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshPhysicalMaterial
              color="#061c28"
              emissive="#00f2fe"
              emissiveIntensity={0.25}
              roughness={0.12}
              metalness={0.2}
              transmission={0.65}
              transparent
              opacity={0.88}
              ior={1.45}
            />
          </mesh>

          {/* Glowing Equatorial Energy Band with Horizontal Spin */}
          <mesh ref={primaryBandRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.182, 0.008, 16, 48]} />
            <meshStandardMaterial
              color="#00f2fe"
              emissive="#00f2fe"
              emissiveIntensity={2.0}
              roughness={0.25}
            />
          </mesh>

          {/* Secondary Emerald Rim Ring with Counter-Spin */}
          <mesh ref={secondaryBandRef} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.181, 0.004, 16, 48]} />
            <meshStandardMaterial
              color="#00ffa3"
              emissive="#00ffa3"
              emissiveIntensity={1.4}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Compact Top Antenna */}
          <group position={[0, 0.18, 0]}>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.005, 0.007, 0.06, 12]} />
              <meshStandardMaterial color="#00f2fe" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Cyan Primary Beacon */}
            <mesh position={[0, 0.07, 0]}>
              <sphereGeometry args={[0.016, 16, 16]} />
              <meshStandardMaterial
                color="#00f2fe"
                emissive="#00f2fe"
                emissiveIntensity={2.5}
                roughness={0.2}
              />
            </mesh>

            {/* Emerald Satellite Mini-Bead */}
            <mesh position={[0.024, 0.08, 0]}>
              <sphereGeometry args={[0.008, 12, 12]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00ffa3"
                emissiveIntensity={2.2}
              />
            </mesh>

            <pointLight position={[0, 0.07, 0]} color="#00f2fe" intensity={0.8} distance={2.0} />
          </group>

          {/* Left Eye Assembly */}
          <group ref={leftEyeGroupRef} position={[-0.06, 0.042, 0.155]}>
            <mesh>
              <sphereGeometry args={[0.042, 18, 18]} />
              <meshStandardMaterial color="#020813" metalness={0.6} roughness={0.12} />
            </mesh>

            <mesh ref={leftPupilRef} position={[0, 0, 0.028]}>
              <sphereGeometry args={[0.022, 16, 16]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00f2fe"
                emissiveIntensity={1.8}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* Right Eye Assembly */}
          <group ref={rightEyeGroupRef} position={[0.06, 0.042, 0.155]}>
            <mesh>
              <sphereGeometry args={[0.042, 18, 18]} />
              <meshStandardMaterial color="#020813" metalness={0.6} roughness={0.12} />
            </mesh>

            <mesh ref={rightPupilRef} position={[0, 0, 0.028]}>
              <sphereGeometry args={[0.022, 16, 16]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00f2fe"
                emissiveIntensity={1.8}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* Micro-Ecosystem: Swarm of 6 bio-digital energy motes orbiting the pet */}
          <group ref={motesGroupRef}>
            {MOTE_OFFSETS.map((mote, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.011, 12, 12]} />
                <meshStandardMaterial
                  color={mote.color}
                  emissive={mote.color}
                  emissiveIntensity={2.8}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </>
  )
}
