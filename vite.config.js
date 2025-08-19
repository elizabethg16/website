// App.jsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls, Text } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

function RotatingPlanet({ color, distance, radius, speed, name, onClick, hoveredPlanet, setHoveredPlanet }) {
  const meshRef = useRef()
  const pivotRef = useRef()

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.002
    if (pivotRef.current) pivotRef.current.rotation.y += speed
  })

  return (
    <group ref={pivotRef}>
      <mesh
        ref={meshRef}
        position={[distance, 0, 0]}
        onClick={() => onClick(meshRef.current)}
        raycast={THREE.Mesh.raycast}
        onPointerOver={() => setHoveredPlanet(name)}
        onPointerOut={() => setHoveredPlanet(null)}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Hover highlight */}
      {hoveredPlanet === name && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[radius + 0.1, radius + 0.15, 64]} />
          <meshBasicMaterial color="white" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// Orbit line
function OrbitLine({ distance }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance - 0.02, distance + 0.02, 64]} />
      <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CameraFocus({ zoomTarget, resetTrigger }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const currentPos = useRef(camera.position.clone())
  const zoomOutPos = new THREE.Vector3(0, 0, 120)

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

    if (zoomTarget) {
      currentPos.current.lerp(zoomTarget, 0.05)
      camera.position.copy(currentPos.current)
      controlsRef.current.target.lerp(zoomTarget, 0.05)
      controlsRef.current.update()
    }
  })

  return <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate />
}

export default function App() {
  const [zoomTarget, setZoomTarget] = useState(null)
  const resetTrigger = useRef(false)
  const [hoveredPlanet, setHoveredPlanet] = useState(null)
  const [selectedPlanet, setSelectedPlanet] = useState(null)

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

  const handlePlanetClick = (meshRef, planetName) => {
    const worldPos = new THREE.Vector3()
    meshRef.getWorldPosition(worldPos)
  
    // Calculate a vector from the Sun to the planet
    const direction = new THREE.Vector3().subVectors(worldPos, new THREE.Vector3(0, 0, 0)).normalize()
  
    // Offset the camera so it’s slightly in front of the planet
    const offset = 8 // distance in front of planet
    const targetPos = new THREE.Vector3().copy(worldPos).add(direction.multiplyScalar(offset))
  
    setZoomTarget(targetPos)
    setSelectedPlanet(planetName)
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Back arrow */}
      <div
        onClick={() => {
          setZoomTarget(null)
          setSelectedPlanet(null)
          resetTrigger.current = true
        }}
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

      <Canvas camera={{ position: [0, 0, 120], fov: 50 }} style={{ width: '100%', height: '100%', background: 'black' }}>
        <Stars radius={200} depth={100} count={5000} factor={4} fade />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="yellow" />

        {/* Orbit lines */}
        {planetData.map((planet, i) => i === 0 ? null : <OrbitLine key={i} distance={planet.distance} />)}

        {/* Planets */}
        {planetData.map((planet, i) => (
          <RotatingPlanet
            key={i}
            color={planet.color}
            distance={planet.distance}
            radius={planet.radius}
            speed={planet.speed}
            name={planet.name}
            hoveredPlanet={hoveredPlanet}
            setHoveredPlanet={setHoveredPlanet}
            onClick={(mesh) => handlePlanetClick(mesh, planet.name)}
          />
        ))}

        {/* Show name of clicked planet */}
        {selectedPlanet && zoomTarget && (
          <Text
            position={[zoomTarget.x + 2, zoomTarget.y + 1, zoomTarget.z]}
            fontSize={1}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            {selectedPlanet}
          </Text>
        )}

        <CameraFocus zoomTarget={zoomTarget} resetTrigger={resetTrigger} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="white" />

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>

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
        Version 1.0
      </div>
    </div>
  )
}
