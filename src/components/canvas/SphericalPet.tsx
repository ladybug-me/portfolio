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

// 6 compact orbital bio-digital energy motes
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
  const innerCoreRef = useRef<THREE.Mesh>(null)
  const primaryBandRef = useRef<THREE.Mesh>(null)
  const secondaryBandRef = useRef<THREE.Mesh>(null)
  const motesGroupRef = useRef<THREE.Group>(null)

  // Real Three.js GPU shadow receiving floor plane reference
  const floorReceiverRef = useRef<THREE.Mesh>(null)

  // Platform references (static world placement)
  const plat1GroupRef = useRef<THREE.Group>(null)
  const plat2GroupRef = useRef<THREE.Group>(null)
  const plat1MatRef = useRef<THREE.MeshStandardMaterial>(null)
  const plat2MatRef = useRef<THREE.MeshStandardMaterial>(null)
  const plat1RimRef = useRef<THREE.MeshBasicMaterial>(null)
  const plat2RimRef = useRef<THREE.MeshBasicMaterial>(null)
  const plat1GlowMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const plat2GlowMatRef = useRef<THREE.MeshBasicMaterial>(null)

  // Eyelids and happy 😊 expression references
  const leftEyeBallRef = useRef<THREE.Mesh>(null)
  const rightEyeBallRef = useRef<THREE.Mesh>(null)
  const leftSmileLidRef = useRef<THREE.Mesh>(null)
  const rightSmileLidRef = useRef<THREE.Mesh>(null)
  const leftSmileGlowRef = useRef<THREE.Mesh>(null)
  const rightSmileGlowRef = useRef<THREE.Mesh>(null)
  const leftBlushRef = useRef<THREE.Mesh>(null)
  const rightBlushRef = useRef<THREE.Mesh>(null)
  const leftBlushMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const rightBlushMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // Autonomous Happy 😊 animation state (Completely random, not bound to any action)
  const happyTimer = useRef(3.5)
  const happyState = useRef(0)
  const happyDuration = useRef(0)

  // Physics state
  const pos = useRef(new THREE.Vector3(0, -1.6, 0))
  const vel = useRef(new THREE.Vector3(0, 0, 0))
  const squash = useRef(new THREE.Vector3(1, 1, 1))
  const squashVel = useRef(new THREE.Vector3(0, 0, 0))

  // Mouse & interaction states
  const targetCursor = useRef(new THREE.Vector3(0, 0, 0))
  const clickPulseTimer = useRef(0)
  const hopCooldown = useRef(0.8)

  // Following state: DOES NOT follow on initial entry
  const isFollowing = useRef(false)
  const lastEmptyClickTime = useRef(0)

  // Ecosystem life cycles
  const blinkTimer = useRef(2.5)
  const blinkState = useRef(1.0)

  // Static platform data
  const platforms = useRef<[PlatformData, PlatformData]>([
    { x: 0, y: -0.8, z: 0, active: false, life: 0, opacity: 0, scaleX: 0 },
    { x: 0, y: 0.1, z: 0, active: false, life: 0, opacity: 0, scaleX: 0 },
  ])
  const platformCooldown = useRef(1.0)

  // Pre-allocated vectors to eliminate garbage collection inside 60fps useFrame loop
  const tempEyeWorld = useRef(new THREE.Vector3())
  const tempDirToTarget = useRef(new THREE.Vector3())

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

      const clickWorldX = nx * (viewport.width / 2) * 0.9
      const clickWorldY = ny * (viewport.height / 2) * 0.85

      targetCursor.current.set(clickWorldX, clickWorldY, 0)
      const distToPet = Math.hypot(clickWorldX - pos.current.x, clickWorldY - pos.current.y)

      if (distToPet < 0.38) {
        // Click directly on pet: stop following
        isFollowing.current = false
        vel.current.x = 0
        squash.current.set(1.24, 0.76, 1.24)
        clickPulseTimer.current = 0.8
        lastEmptyClickTime.current = 0
      } else {
        // Click on empty space: single click jump
        const dx = clickWorldX - pos.current.x
        vel.current.x = THREE.MathUtils.clamp(dx * 0.9, -1.2, 1.2)
        vel.current.y = THREE.MathUtils.clamp(1.5 + Math.max(0, clickWorldY - pos.current.y) * 0.6, 1.3, 2.4)
        vel.current.z = THREE.MathUtils.clamp((0.2 - pos.current.z) * 0.8, -0.15, 0.3)
        squash.current.set(0.88, 1.18, 0.88)
        clickPulseTimer.current = 0.6

        // Double-click on empty space: enable following
        const now = performance.now()
        if (now - lastEmptyClickTime.current < 340) {
          isFollowing.current = true
          vel.current.y = 2.2
          lastEmptyClickTime.current = 0
        } else {
          lastEmptyClickTime.current = now
        }
      }
    }

    const handleDblClick = (e: MouseEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (targetTag === 'input' || targetTag === 'textarea') return

      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      const clickWorldX = nx * (viewport.width / 2) * 0.9
      const clickWorldY = ny * (viewport.height / 2) * 0.85

      const distToPet = Math.hypot(clickWorldX - pos.current.x, clickWorldY - pos.current.y)
      if (distToPet >= 0.38) {
        isFollowing.current = true
        vel.current.y = 2.2
        squash.current.set(0.85, 1.25, 0.85)
        clickPulseTimer.current = 1.0
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('dblclick', handleDblClick, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('dblclick', handleDblClick)
    }
  }, [viewport.width, viewport.height])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033)
    const time = state.clock.elapsedTime
    const petRadius = 0.18
    const floorY = -viewport.height / 2 + petRadius + 0.12
    const maxVisibleY = viewport.height / 2 - petRadius - 0.2
    const maxBoundX = viewport.width / 2 - petRadius - 0.2

    // 1. Autonomous Ecosystem life: Fully Random Blinking & Happy 😊 Expression cycle
    // A. Regular Natural Blink (Purely random, not bound to any action)
    blinkTimer.current -= dt
    if (blinkTimer.current <= 0) {
      blinkState.current = 0.0
      blinkTimer.current = 2.6 + Math.random() * 3.4
    } else {
      blinkState.current = THREE.MathUtils.damp(blinkState.current, 1.0, 18, dt)
    }

    // B. Periodic Happy 😊 Smile Occurrence (Completely random & independent)
    happyTimer.current -= dt
    if (happyTimer.current <= 0) {
      happyDuration.current = 1.0 + Math.random() * 0.5 // Hold happy smile for ~1.0s - 1.5s
      happyTimer.current = 4.5 + Math.random() * 5.5 // Triggers naturally every 4.5 - 10 seconds
    }

    if (happyDuration.current > 0) {
      happyDuration.current -= dt
      happyState.current = THREE.MathUtils.damp(happyState.current, 1.0, 10, dt)
    } else {
      happyState.current = THREE.MathUtils.damp(happyState.current, 0.0, 8, dt)
    }

    const blinkClose = Math.max(1.0 - blinkState.current, 0)
    const happy = happyState.current

    // Pupil closure & visibility (hidden when closed or smiling)
    const pupilOpenFactor = THREE.MathUtils.clamp((1.0 - blinkClose) * (1.0 - happy), 0, 1)
    if (leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.scale.y = pupilOpenFactor
      rightPupilRef.current.scale.y = pupilOpenFactor
      leftPupilRef.current.visible = pupilOpenFactor > 0.08
      rightPupilRef.current.visible = pupilOpenFactor > 0.08
    }

    // The whole black ball acts as the eyelid:
    // On regular blink: squashes vertically into a closed eyelid slit
    // On happy smile: morphs smoothly into the arched smiling eyelid (⌒ ⌒)
    const ballSquashY = THREE.MathUtils.clamp((1.0 - blinkClose * 0.93) * (1.0 - happy), 0, 1)
    const ballSquashX = THREE.MathUtils.lerp(1.0, 1.25, blinkClose)
    const ballOffsetY = -0.006 * blinkClose

    if (leftEyeBallRef.current && rightEyeBallRef.current) {
      leftEyeBallRef.current.scale.set(ballSquashX, ballSquashY, 1.05)
      rightEyeBallRef.current.scale.set(ballSquashX, ballSquashY, 1.05)
      leftEyeBallRef.current.position.y = ballOffsetY
      rightEyeBallRef.current.position.y = ballOffsetY
      leftEyeBallRef.current.visible = ballSquashY > 0.02
      rightEyeBallRef.current.visible = ballSquashY > 0.02
    }

    // Happy 😊 smiling black eyelids and cybernetic glowing crescents (⌒ ⌒)
    const isSmiling = happy > 0.08
    const smileScale = THREE.MathUtils.clamp(happy * 1.2, 0.001, 1.08)
    if (leftSmileLidRef.current && rightSmileLidRef.current) {
      leftSmileLidRef.current.visible = isSmiling
      rightSmileLidRef.current.visible = isSmiling
      leftSmileLidRef.current.scale.set(smileScale, smileScale, smileScale)
      rightSmileLidRef.current.scale.set(smileScale, smileScale, smileScale)
    }

    if (leftSmileGlowRef.current && rightSmileGlowRef.current) {
      leftSmileGlowRef.current.visible = isSmiling
      rightSmileGlowRef.current.visible = isSmiling
      leftSmileGlowRef.current.scale.set(smileScale, smileScale, smileScale)
      rightSmileGlowRef.current.scale.set(smileScale, smileScale, smileScale)
    }

    // Cute anime outward slant for smiling eyes (\ and /)
    if (leftEyeGroupRef.current && rightEyeGroupRef.current) {
      leftEyeGroupRef.current.rotation.z = -0.15 * happy
      rightEyeGroupRef.current.rotation.z = 0.15 * happy
    }

    // Cute pink blush cheeks underneath the eyes
    if (leftBlushRef.current && rightBlushRef.current) {
      leftBlushRef.current.visible = isSmiling
      rightBlushRef.current.visible = isSmiling
      if (leftBlushMatRef.current && rightBlushMatRef.current) {
        const blushOp = THREE.MathUtils.clamp(happy * 0.85, 0, 0.85)
        leftBlushMatRef.current.opacity = blushOp
        rightBlushMatRef.current.opacity = blushOp
      }
    }

    // 2. Click pulse decay
    if (clickPulseTimer.current > 0) {
      clickPulseTimer.current -= dt
    }

    // Gaze ALWAYS directly tracks the live cursor in 60fps real-time
    const activeFocus = targetCursor.current

    // 3. Static Platform Spawning (Only when following and target is elevated)
    platformCooldown.current -= dt
    const plats = platforms.current
    const wantsElevatedLedge =
      isFollowing.current &&
      activeFocus.y > floorY + 0.9 &&
      pos.current.y < activeFocus.y - 0.4

    if (wantsElevatedLedge && platformCooldown.current <= 0) {
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
      p.opacity = THREE.MathUtils.damp(p.opacity, targetOp, 8, dt)
      p.scaleX = THREE.MathUtils.damp(p.scaleX, targetScale, 10, dt)
    })

    // Update Platform 1 in scene
    if (plat1GroupRef.current && plat1MatRef.current && plat1RimRef.current) {
      plat1GroupRef.current.position.set(plats[0].x, plats[0].y, plats[0].z)
      plat1GroupRef.current.scale.set(Math.max(0.001, plats[0].scaleX), 1, 1)
      plat1GroupRef.current.visible = plats[0].opacity > 0.01
      plat1MatRef.current.opacity = plats[0].opacity * 0.92
      plat1RimRef.current.opacity = plats[0].opacity * 0.95
      if (plat1GlowMatRef.current) {
        plat1GlowMatRef.current.opacity = plats[0].opacity * (0.42 + Math.sin(time * 3.5) * 0.1)
      }
    }

    // Update Platform 2 in scene
    if (plat2GroupRef.current && plat2MatRef.current && plat2RimRef.current) {
      plat2GroupRef.current.position.set(plats[1].x, plats[1].y, plats[1].z)
      plat2GroupRef.current.scale.set(Math.max(0.001, plats[1].scaleX), 1, 1)
      plat2GroupRef.current.visible = plats[1].opacity > 0.01
      plat2MatRef.current.opacity = plats[1].opacity * 0.92
      plat2RimRef.current.opacity = plats[1].opacity * 0.95
      if (plat2GlowMatRef.current) {
        plat2GlowMatRef.current.opacity = plats[1].opacity * (0.42 + Math.cos(time * 3.5) * 0.1)
      }
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

    if (Math.abs(pos.current.z) > 0.03) {
      pos.current.z = THREE.MathUtils.damp(pos.current.z, 0, 4, dt)
    }

    // 5. Following Locomotion: ONLY when isFollowing is active
    const isOnSurface = Math.abs(pos.current.y - currentFloor) < 0.05
    hopCooldown.current -= dt

    if (isOnSurface && hopCooldown.current <= 0 && isFollowing.current) {
      const dx = targetCursor.current.x - pos.current.x
      if (Math.abs(dx) > 0.34) {
        vel.current.y = 1.7 + Math.random() * 0.35
        vel.current.x = THREE.MathUtils.clamp(dx * 1.1, -1.5, 1.5)
        squash.current.set(0.9, 1.15, 0.9)
        hopCooldown.current = 0.55 + Math.random() * 0.35
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

    // 8. Apply transforms & Real-Time Horizontal Rotation to Pet
    if (petRootRef.current) {
      petRootRef.current.position.copy(pos.current)
    }
    if (bodyRef.current) {
      bodyRef.current.scale.set(
        squash.current.x * breath,
        squash.current.y * breath,
        squash.current.z * breath
      )

      // Horizontal Yaw & Pitch towards cursor with high responsiveness
      const dx = activeFocus.x - pos.current.x
      const dz = Math.max(0.35, activeFocus.z + 1.2 - pos.current.z)
      const targetYaw = Math.atan2(dx, dz)
      const targetPitch = -Math.atan2(activeFocus.y - pos.current.y, dz) * 0.45
      const targetRoll = -vel.current.x * 0.16

      bodyRef.current.rotation.y = THREE.MathUtils.damp(
        bodyRef.current.rotation.y,
        targetYaw,
        20,
        dt
      )
      bodyRef.current.rotation.x = THREE.MathUtils.damp(
        bodyRef.current.rotation.x,
        targetPitch,
        20,
        dt
      )
      bodyRef.current.rotation.z = THREE.MathUtils.damp(
        bodyRef.current.rotation.z,
        targetRoll,
        16,
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

    // 10. Instantaneous Ocular Pupil Tracking (Zero garbage allocation)
    if (bodyRef.current && leftPupilRef.current && rightPupilRef.current) {
      bodyRef.current.getWorldPosition(tempEyeWorld.current)
      tempDirToTarget.current.copy(activeFocus).sub(tempEyeWorld.current).normalize()

      const pupilX = THREE.MathUtils.clamp(tempDirToTarget.current.x * 0.035, -0.016, 0.016)
      const pupilY = THREE.MathUtils.clamp(tempDirToTarget.current.y * 0.035, -0.016, 0.016)

      leftPupilRef.current.position.set(pupilX, pupilY, 0.028)
      rightPupilRef.current.position.set(pupilX, pupilY, 0.028)

      const isPulsing = clickPulseTimer.current > 0
      const pulseEmissive = isPulsing ? 2.6 + Math.sin(time * 12) * 0.5 : 1.7
      ;(leftPupilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseEmissive
      ;(rightPupilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulseEmissive
    }

    // 11. Micro-Ecosystem: Orbiting bio-digital energy motes
    if (motesGroupRef.current) {
      const motes = motesGroupRef.current.children
      for (let i = 0; i < motes.length; i++) {
        const mote = MOTE_OFFSETS[i]
        const t = time * mote.speed + mote.phase
        motes[i].position.set(
          Math.cos(t) * mote.rX,
          Math.sin(t * 1.2) * mote.rY,
          Math.sin(t) * mote.rZ
        )
      }
    }

    // 12. GPU Shadow Receiving Floor Height Sync
    if (floorReceiverRef.current) {
      floorReceiverRef.current.position.y = floorY - petRadius
    }
  })

  return (
    <>
      {/* Static Cybernetic Platform Strip 1 (Glowing with Additive Bloom Corona) */}
      <group ref={plat1GroupRef} visible={false}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.75, 0.04, 0.32]} />
          <meshStandardMaterial
            ref={plat1MatRef}
            color="#003844"
            emissive="#00f2fe"
            emissiveIntensity={1.0}
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh scale={[1.025, 1.08, 1.05]}>
          <boxGeometry args={[0.75, 0.04, 0.32]} />
          <meshBasicMaterial
            ref={plat1RimRef}
            color="#00f2fe"
            wireframe
            transparent
            opacity={0}
          />
        </mesh>
        <mesh scale={[1.16, 2.2, 1.28]}>
          <boxGeometry args={[0.75, 0.04, 0.32]} />
          <meshBasicMaterial
            ref={plat1GlowMatRef}
            color="#00f2fe"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Static Cybernetic Platform Strip 2 (Glowing with Additive Bloom Corona) */}
      <group ref={plat2GroupRef} visible={false}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.7, 0.04, 0.32]} />
          <meshStandardMaterial
            ref={plat2MatRef}
            color="#003844"
            emissive="#00ffa3"
            emissiveIntensity={1.0}
            roughness={0.2}
            metalness={0.6}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh scale={[1.025, 1.08, 1.05]}>
          <boxGeometry args={[0.7, 0.04, 0.32]} />
          <meshBasicMaterial
            ref={plat2RimRef}
            color="#00ffa3"
            wireframe
            transparent
            opacity={0}
          />
        </mesh>
        <mesh scale={[1.16, 2.2, 1.28]}>
          <boxGeometry args={[0.7, 0.04, 0.32]} />
          <meshBasicMaterial
            ref={plat2GlowMatRef}
            color="#00ffa3"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* High-Performance Localized Shadow Receiving Floor Plane */}
      <mesh
        ref={floorReceiverRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 2.2]} />
        <shadowMaterial transparent opacity={0.65} />
      </mesh>

      {/* Main Pet Hierarchical Group (Radius: 0.18) */}
      <group ref={petRootRef} position={[0, -1.6, 0]}>
        <group ref={bodyRef}>
          {/* Inner Glowing Bio-Energy Core with Horizontal Rotation */}
          <mesh ref={innerCoreRef} castShadow>
            <sphereGeometry args={[0.12, 14, 14]} />
            <meshStandardMaterial
              color="#00ffa3"
              emissive="#00f2fe"
              emissiveIntensity={1.6}
              roughness={0.2}
            />
          </mesh>

          {/* High-Performance Translucent Frosted Glass Outer Shell (Zero transmission overhead) */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.18, 18, 18]} />
            <meshStandardMaterial
              color="#061c28"
              emissive="#00f2fe"
              emissiveIntensity={0.25}
              roughness={0.14}
              metalness={0.25}
              transparent
              opacity={0.86}
            />
          </mesh>

          {/* Glowing Equatorial Energy Band with Horizontal Spin */}
          <mesh ref={primaryBandRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.182, 0.008, 8, 24]} />
            <meshStandardMaterial
              color="#00f2fe"
              emissive="#00f2fe"
              emissiveIntensity={2.0}
              roughness={0.25}
            />
          </mesh>

          {/* Secondary Emerald Rim Ring with Counter-Spin */}
          <mesh ref={secondaryBandRef} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.181, 0.004, 8, 24]} />
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
              <cylinderGeometry args={[0.005, 0.007, 0.06, 8]} />
              <meshStandardMaterial color="#00f2fe" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Cyan Primary Beacon */}
            <mesh position={[0, 0.07, 0]}>
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshStandardMaterial
                color="#00f2fe"
                emissive="#00f2fe"
                emissiveIntensity={2.5}
                roughness={0.2}
              />
            </mesh>

            {/* Emerald Satellite Mini-Bead */}
            <mesh position={[0.024, 0.08, 0]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00ffa3"
                emissiveIntensity={2.2}
              />
            </mesh>
          </group>

          {/* Left Eye Assembly: The entire black ball acts as articulated eyelids */}
          <group ref={leftEyeGroupRef} position={[-0.06, 0.042, 0.155]}>
            {/* The Black Ball itself (Squashes into eyelid on blink, morphs into smile on 😊) */}
            <mesh ref={leftEyeBallRef}>
              <sphereGeometry args={[0.042, 16, 14]} />
              <meshStandardMaterial color="#020813" metalness={0.65} roughness={0.12} />
            </mesh>

            {/* Inquisitive Glowing Round Pupil */}
            <mesh ref={leftPupilRef} position={[0, 0, 0.024]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00f2fe"
                emissiveIntensity={2.0}
                roughness={0.2}
              />
            </mesh>

            {/* Happy 😊 Smiling Black Eyelid Arc (⌒) */}
            <mesh ref={leftSmileLidRef} position={[0, -0.008, 0.026]} visible={false}>
              <torusGeometry args={[0.0315, 0.0068, 10, 24, Math.PI]} />
              <meshStandardMaterial color="#020813" metalness={0.65} roughness={0.12} />
            </mesh>

            {/* Glowing Cyber Accent Rim for the smile */}
            <mesh ref={leftSmileGlowRef} position={[0, -0.0095, 0.028]} visible={false}>
              <torusGeometry args={[0.031, 0.003, 8, 24, Math.PI]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00f2fe"
                emissiveIntensity={2.8}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* Right Eye Assembly: The entire black ball acts as articulated eyelids */}
          <group ref={rightEyeGroupRef} position={[0.06, 0.042, 0.155]}>
            {/* The Black Ball itself (Squashes into eyelid on blink, morphs into smile on 😊) */}
            <mesh ref={rightEyeBallRef}>
              <sphereGeometry args={[0.042, 16, 14]} />
              <meshStandardMaterial color="#020813" metalness={0.65} roughness={0.12} />
            </mesh>

            {/* Inquisitive Glowing Round Pupil */}
            <mesh ref={rightPupilRef} position={[0, 0, 0.024]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00f2fe"
                emissiveIntensity={2.0}
                roughness={0.2}
              />
            </mesh>

            {/* Happy 😊 Smiling Black Eyelid Arc (⌒) */}
            <mesh ref={rightSmileLidRef} position={[0, -0.008, 0.026]} visible={false}>
              <torusGeometry args={[0.0315, 0.0068, 10, 24, Math.PI]} />
              <meshStandardMaterial color="#020813" metalness={0.65} roughness={0.12} />
            </mesh>

            {/* Glowing Cyber Accent Rim for the smile */}
            <mesh ref={rightSmileGlowRef} position={[0, -0.0095, 0.028]} visible={false}>
              <torusGeometry args={[0.031, 0.003, 8, 24, Math.PI]} />
              <meshStandardMaterial
                color="#00ffa3"
                emissive="#00f2fe"
                emissiveIntensity={2.8}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* Adorable Cheerful Blush Spots (Illuminates during 😊 smile) */}
          <mesh ref={leftBlushRef} position={[-0.072, 0.008, 0.16]} scale={[1.3, 0.75, 0.4]} visible={false}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial
              ref={leftBlushMatRef}
              color="#ff3b6c"
              emissive="#ff3b6c"
              emissiveIntensity={2.4}
              transparent
              opacity={0}
            />
          </mesh>
          <mesh ref={rightBlushRef} position={[0.072, 0.008, 0.16]} scale={[1.3, 0.75, 0.4]} visible={false}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial
              ref={rightBlushMatRef}
              color="#ff3b6c"
              emissive="#ff3b6c"
              emissiveIntensity={2.4}
              transparent
              opacity={0}
            />
          </mesh>

          {/* Micro-Ecosystem: Swarm of 6 bio-digital energy motes */}
          <group ref={motesGroupRef}>
            {MOTE_OFFSETS.map((mote, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.011, 8, 8]} />
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
