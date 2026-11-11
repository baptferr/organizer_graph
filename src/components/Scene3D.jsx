import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { zoneColorForSigns, zoneOf, ZONES } from '../lib/model.js'

const HALF = 5
const SIGNS = [-1, 1]

function Zones() {
  const boxes = useMemo(
    () =>
      SIGNS.flatMap((sx) =>
        SIGNS.flatMap((sy) =>
          SIGNS.map((sz) => ({
            key: `${sx}${sy}${sz}`,
            position: [(sx * HALF) / 2, (sy * HALF) / 2, (sz * HALF) / 2],
            color: zoneColorForSigns(sx, sy, sz),
          })),
        ),
      ),
    [],
  )
  return (
    <group>
      {boxes.map((b) => (
        <mesh key={b.key} position={b.position}>
          <boxGeometry args={[HALF, HALF, HALF]} />
          <meshBasicMaterial color={b.color} transparent opacity={0.09} depthWrite={false} />
        </mesh>
      ))}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(HALF * 2, HALF * 2, HALF * 2)]} />
        <lineBasicMaterial color="#475569" />
      </lineSegments>
    </group>
  )
}

function Axes() {
  const lines = [
    { key: 'x', from: [-HALF, 0, 0], to: [HALF, 0, 0], color: '#f87171' },
    { key: 'y', from: [0, -HALF, 0], to: [0, HALF, 0], color: '#4ade80' },
    { key: 'z', from: [0, 0, -HALF], to: [0, 0, HALF], color: '#60a5fa' },
  ]
  const labels = [
    { text: 'Envie +', position: [HALF + 0.9, 0, 0] },
    { text: 'Envie −', position: [-HALF - 0.9, 0, 0], muted: true },
    { text: 'Complexité +', position: [0, HALF + 0.7, 0] },
    { text: 'Complexité −', position: [0, -HALF - 0.7, 0], muted: true },
    { text: 'Besoin +', position: [0, 0, HALF + 0.9] },
    { text: 'Besoin −', position: [0, 0, -HALF - 0.9], muted: true },
  ]
  return (
    <group>
      {lines.map((l) => (
        <line key={l.key}>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) => self.setFromPoints([new THREE.Vector3(...l.from), new THREE.Vector3(...l.to)])}
          />
          <lineBasicMaterial color={l.color} />
        </line>
      ))}
      {labels.map((l) => (
        <Html key={l.text} position={l.position} center style={{ pointerEvents: 'none' }}>
          <div className={`axis-label${l.muted ? ' muted' : ''}`}>{l.text}</div>
        </Html>
      ))}
    </group>
  )
}

function TaskPoint({ task, selected, priorityScale, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const done = task.status === 'done'
  const color = ZONES[zoneOf(task)].color
  const position = [task.envie / 2, task.complexite / 2, task.besoin / 2]
  const radius = 0.18 * priorityScale * (selected || hovered ? 1.35 : 1)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(task.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected || hovered ? 0.9 : 0.35}
          transparent={done}
          opacity={done ? 0.45 : 1}
        />
      </mesh>
      {done && (
        <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
          <torusGeometry args={[radius * 1.9, 0.022, 12, 40]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      )}
      {(selected || hovered) && (
        <Html position={[0, radius + 0.28, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="point-label">{task.name}</div>
        </Html>
      )}
    </group>
  )
}

export default function Scene3D({ tasks, selectedId, onSelect, priorityMode }) {
  const scales = useMemo(() => {
    if (!priorityMode || tasks.length === 0) return {}
    const scores = tasks.map((t) => t._score)
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const span = max - min || 1
    return Object.fromEntries(tasks.map((t) => [t.id, 0.8 + ((t._score - min) / span) * 1.4]))
  }, [tasks, priorityMode])

  return (
    <div className="scene">
      <Canvas camera={{ position: [9, 6, 11], fov: 50 }} onPointerMissed={() => onSelect(null)}>
        <color attach="background" args={['#0b1120']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 12, 6]} intensity={1.1} />
        <Zones />
        <Axes />
        <gridHelper args={[HALF * 2, 10, '#334155', '#1e293b']} position={[0, -HALF - 0.01, 0]} />
        {tasks.map((t) => (
          <TaskPoint
            key={t.id}
            task={t}
            selected={t.id === selectedId}
            priorityScale={scales[t.id] ?? 1}
            onSelect={onSelect}
          />
        ))}
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={4} maxDistance={30} />
      </Canvas>
    </div>
  )
}
