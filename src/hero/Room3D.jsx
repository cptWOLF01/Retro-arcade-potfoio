import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// Subtle 3D depth behind the cabinets: spinning green starbursts, neon halo rings, drifting pixel motes.
// Rendered at a low pixel ratio and upscaled with image-rendering: pixelated for the chunky look.

function starShape(points = 8, outer = 1, inner = 0.45) {
  const s = new THREE.Shape()
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2, r = i % 2 ? inner : outer
    const x = Math.cos(a) * r, y = Math.sin(a) * r
    i ? s.lineTo(x, y) : s.moveTo(x, y)
  }
  s.closePath()
  return s
}

function Starburst({ position, scale = 1, speed = 0.3, color = '#3dff8a' }) {
  const ref = useRef()
  const geo = useMemo(() => new THREE.ExtrudeGeometry(starShape(), { depth: 0.18, bevelEnabled: false }), [])
  useFrame((_, dt) => { ref.current.rotation.z += dt * speed; ref.current.rotation.y = Math.sin(performance.now() / 1800 + position[0]) * 0.5 })
  return (
    <Float speed={1.4} floatIntensity={0.6} rotationIntensity={0}>
      <mesh ref={ref} position={position} scale={scale} geometry={geo}>
        <meshBasicMaterial color={color} />
      </mesh>
    </Float>
  )
}

function Rings() {
  const g = useRef()
  useFrame((_, dt) => { g.current.rotation.z += dt * 0.08 })
  return (
    <group ref={g} position={[0, 0.6, -5]}>
      {[2.4, 3.3, 4.2].map((r, i) => (
        <mesh key={r}><ringGeometry args={[r, r + 0.06, 6 + i * 2]} /><meshBasicMaterial color={i % 2 ? '#2bb5ff' : '#ff3d8b'} transparent opacity={0.45} /></mesh>
      ))}
    </group>
  )
}

function Motes({ count = 90 }) {
  const ref = useRef()
  const { pos, tex } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - 0.5) * 14; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = -3 + Math.random() * 5 }
    const c = document.createElement('canvas'); c.width = c.height = 4
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 4, 4)
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter
    return { pos, tex }
  }, [count])
  useFrame((s, dt) => {
    const a = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      a.array[i * 3 + 1] += dt * (0.15 + (i % 5) * 0.05)
      if (a.array[i * 3 + 1] > 4) a.array[i * 3 + 1] = -4
    }
    a.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} /></bufferGeometry>
      <pointsMaterial map={tex} size={0.09} color="#fff4d6" transparent opacity={0.8} depthWrite={false} />
    </points>
  )
}

function Rig() {
  useFrame((s) => {
    s.camera.position.x += (s.pointer.x * 0.7 - s.camera.position.x) * 0.05
    s.camera.position.y += (s.pointer.y * 0.4 - s.camera.position.y) * 0.05
    s.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Room3D() {
  return (
    <Canvas dpr={0.4} gl={{ antialias: false, alpha: true }} camera={{ position: [0, 0, 6], fov: 50 }} style={{ imageRendering: 'pixelated' }}>
      <Rig />
      <Rings />
      <Motes />
      <Starburst position={[-3.2, 1.6, -2]} scale={0.7} />
      <Starburst position={[3.4, 0.9, -2.4]} scale={0.9} speed={-0.25} />
      <Starburst position={[-2, -1.6, -3]} scale={0.5} speed={0.4} color="#9dff5a" />
      <Starburst position={[2.3, 2.1, -3]} scale={0.45} speed={-0.35} color="#9dff5a" />
    </Canvas>
  )
}
