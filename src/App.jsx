// App.jsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, forwardRef } from 'react'
import * as THREE from 'three'

// Rotating planet component
const RotatingPlanet = forwardRef(({ color, distance, radius, speed, name, onClick, isZoomed }, ref) => {
  const pivotRef = useRef()

  useFrame(() => {
    if (!isZoomed && pivotRef.current) pivotRef.current.rotation.y += speed
  })

  return (
    <group ref={(el) => { pivotRef.current = el; if (ref) ref.current = pivotRef.current }}>
      <mesh
        position={[distance, 0, 0]}
        onClick={() => onClick(pivotRef.current, name)}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
})

// Orbit lines
const OrbitLine = ({ distance }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[distance - 0.02, distance + 0.02, 64]} />
    <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
  </mesh>
)

// Camera follow
const CameraFocus = ({ targetRef, selectedPlanet, resetTrigger }) => {
  const { camera } = useThree()
  const controlsRef = useRef()
  const zoomOutPos = new THREE.Vector3(0, 0, 120)
  const currentPos = useRef(camera.position.clone())

  useFrame(() => {
    if (!controlsRef.current) return

    if (resetTrigger.current) {
      currentPos.current.lerp(zoomOutPos, 0.05)
      camera.position.copy(currentPos.current)
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05)
      controlsRef.current.update()
      if (camera.position.distanceTo(zoomOutPos) < 0.5) resetTrigger.current = false
      return
    }

    if (targetRef?.current) {
      const worldPos = new THREE.Vector3()
      targetRef.current.getWorldPosition(worldPos)

      // Offset: Sun zoom farther, others in front
      const offset = selectedPlanet === 'Sun' ? new THREE.Vector3(0, 0, 30) : new THREE.Vector3(0, 0, 10)
      const desiredPos = worldPos.clone().add(offset)

      camera.position.lerp(desiredPos, 0.05)
      controlsRef.current.target.lerp(worldPos, 0.05)
      controlsRef.current.update()
    }
  })
//testing
  return <OrbitControls ref={controlsRef} enablePan={false} enableZoom={false} enableRotate />
}

// Main App
export default function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const planetRefs = useRef({})
  const selectedPlanetRef = useRef(null)
  const resetTrigger = useRef(false)

  const planetData = [
    { name: 'Sun', color: 'yellow', radius: 5, distance: 0, speed: 0 },
    { name: 'Mercury', color: 'gray', radius: 0.9, distance: 12, speed: 0.001 },
    { name: 'Venus', color: 'blue', radius: 1, distance: 20, speed: 0.002 },
    { name: 'Earth', color: 'red', radius: 0.8, distance: 28, speed: 0.0015 },
    { name: 'Mars', color: 'orange', radius: 1.2, distance: 38, speed: 0.001 },
    { name: 'Jupiter', color: 'goldenrod', radius: 1.1, distance: 50, speed: 0.0008 },
    { name: 'Saturn', color: 'lightblue', radius: 0.7, distance: 62, speed: 0.0006 },
    { name: 'Uranus', color: 'darkblue', radius: 1.3, distance: 72, speed: 0.0004 },
    { name: 'Neptune', color: 'purple', radius: 0.9, distance: 84, speed: 0.0003 },
  ]

  const handlePlanetClick = (pivotRef, planetName) => {
    selectedPlanetRef.current = pivotRef
    setSelectedPlanet(planetName)
  }

  const handleBackClick = () => {
    selectedPlanetRef.current = null
    setSelectedPlanet(null)
    resetTrigger.current = true
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Back button */}
      <div
        onClick={handleBackClick}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          cursor: 'pointer',
          fontSize: '32px',
          color: 'white',
          userSelect: 'none',
          padding: '6px 10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '4px',
          zIndex: 10,
        }}
      >
        ←
      </div>

      {/* Version number */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '2px',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          zIndex: 10,
        }}
      >
        Version 1.0 (you can only click on the sun)
      </div>

      <Canvas camera={{ position: [0, 0, 120], fov: 50 }} style={{ width: '100%', height: '100%', background: 'black' }}>
        <Stars radius={200} depth={100} count={5000} factor={4} fade />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="yellow" />

        {planetData.map((planet, i) => i === 0 ? null : <OrbitLine key={i} distance={planet.distance} />)}

        {planetData.map((planet) => (
          <RotatingPlanet
            key={planet.name}
            ref={(pivot) => { planetRefs.current[planet.name] = pivot }}
            color={planet.color}
            distance={planet.distance}
            radius={planet.radius}
            speed={planet.speed}
            name={planet.name}
            onClick={handlePlanetClick}
            isZoomed={selectedPlanet !== null}
          />
        ))}

        {/* Floating text */}
        {selectedPlanet && selectedPlanetRef.current && (() => {
          const pos = new THREE.Vector3()
          selectedPlanetRef.current.getWorldPosition(pos)

          if (selectedPlanet === 'Sun') {
            const cameraPos = new THREE.Vector3(0, 0, 100)
            const direction = cameraPos.clone().sub(pos).normalize()
            const textPos = pos.clone().add(direction.multiplyScalar(5)) // farther out

            return [
              'Welcome to my personal website!',
              'My name is elizabeth and I am a CS major!',
              'Much more to come soon'
            ].map((line, idx) => (
              <Text
                key={idx}
                position={[textPos.x, textPos.y - idx * 1.2, textPos.z]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
                lookAt={[0, 0, 120]}
              >
                {line}
              </Text>
            ))
          } else {
            pos.x += 2
            pos.y += 1
            return (
              <Text position={[pos.x, pos.y, pos.z]} fontSize={1} color="white" anchorX="left" anchorY="middle">
                {selectedPlanet}
              </Text>
            )
          }
        })()}

        <CameraFocus targetRef={selectedPlanetRef} selectedPlanet={selectedPlanet} resetTrigger={resetTrigger} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="white" />
      </Canvas>
    </div>
  )
}
