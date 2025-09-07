import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, forwardRef } from 'react'
import * as THREE from 'three'

// --- Rotating Planet ---
const RotatingPlanet = forwardRef(({ color, distance, radius, speed, name, onClick, isSelected, title, description }, ref) => {
  const pivotRef = useRef()
  const meshRef = useRef()
  const textRef = useRef()
  const { camera } = useThree()

  useFrame(() => {
    if (!isSelected) {
      pivotRef.current.rotation.y += speed
    }
    if (isSelected && textRef.current) {
      textRef.current.lookAt(camera.position)
    }
  })

  return (
    <group ref={pivotRef}>
      <mesh
        ref={(el) => {
          meshRef.current = el
          if (ref) ref.current = el
        }}
        position={[distance, 0, 0]}
        onClick={() => onClick(meshRef.current, name)}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {isSelected && (
        <group ref={textRef} position={[distance, 0, 0]}>
          <Text position={[radius + 1, 0, 0]} fontSize={0.6} color="white" anchorX="left" anchorY="middle">
            {title || name}
          </Text>
          {description && (
            <Text position={[radius + 1, -1, 0]} fontSize={0.45} color="lightgray" anchorX="left" anchorY="middle">
              {description}
            </Text>
          )}
        </group>
      )}
    </group>
  )
})

// --- Orbit Line ---
const OrbitLine = ({ distance }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
    <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
  </mesh>
)

// --- Camera focus ---
const CameraFocus = ({ targetRef, selectedPlanet, resetTrigger }) => {
  const { camera } = useThree()
  const controlsRef = useRef()
  const zoomOutPos = new THREE.Vector3(0, 0, 150)
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
      const offset = selectedPlanet === 'Sun' ? new THREE.Vector3(0, 0, 30) : new THREE.Vector3(0, 0, 10)
      const desiredPos = worldPos.clone().add(offset)
      camera.position.lerp(desiredPos, 0.05)

      const shiftedTarget = worldPos.clone().add(new THREE.Vector3(4, 0, 0))
      controlsRef.current.target.lerp(shiftedTarget, 0.05)
      controlsRef.current.update()
    }
  })

  return <OrbitControls ref={controlsRef} enablePan={false} enableZoom={false} enableRotate />
}

// --- Main App ---
export default function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const planetRefs = useRef({})
  const selectedPlanetRef = useRef(null)
  const resetTrigger = useRef(false)

  const planetData = [
    { name: 'Sun', color: 'yellow', radius: 8, distance: 0, speed: 0, description: "Hi! My name is Elizabeth & I'm a computer science major\nThank you for visiting", title: "Welcome to my website"},
    { name: 'Mercury', color: 'gray', radius: 1.0, distance: 12, speed: 0.001, description: "Right now, I am researching Usable Secuirty & Priacy in the Barnard Usable Security Lab\nI am also working on applying to internships for Summer 2026!", title:"What am I doing?" },
    { name: 'Venus', color: '#f5deb3', radius: 1.6, distance: 20, speed: 0.002, description: "In the summer I teach for Kode With Klossy, a free coding summer camp\nAt Columbia I also have volunterred to teach for Girls Who Code", title: "What have I done?" },
    { name: 'Earth', color: '#3a7bd5', radius: 1.7, distance: 28, speed: 0.0015, description: "I was born & raised in San Francisco!\nNow, I go to Barnard College in New York City", title: "Where am I?" },
    { name: 'Mars', color: '#d14c32', radius: 1.3, distance: 38, speed: 0.001, description: "email: esg2179@barnard.edu\nGitHub: elizabethg16", title: "Where can you find me?"},
    { name: 'Jupiter', color: '#d2a679', radius: 5.0, distance: 50, speed: 0.0008, description: "I have always been fascinated by space (surprise!),\nand I love structural geology & math!", title: "What are my other academic interests?"},
    { name: 'Saturn', color: '#f0e68c', radius: 4.0, distance: 62, speed: 0.0006, description: "I have lived in Rome & London\nI used to fence competitivley", title: "Other Fun Facts!"},
    { name: 'Uranus', color: '#7fffd4', radius: 2.5, distance: 72, speed: 0.0004, description: "I have been involved with theater for as long as I remember!\nRecently I have taken to stage managment\n(the people with the headsets directing the lights and sound)", title:"What do I do (outside CS)"},
    { name: 'Neptune', color: '#4169e1', radius: 2.5, distance: 84, speed: 0.0003, description: "Great question! Post-grad I would like to work in industry,\neither as a SWE or doing research!", title: "What is next for me?"},
  ]

  const handlePlanetClick = (meshRef, planetName) => {
    selectedPlanetRef.current = meshRef
    setSelectedPlanet(planetName)
  }

  const handleBackClick = () => {
    selectedPlanetRef.current = null
    setSelectedPlanet(null)
    resetTrigger.current = true
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div onClick={handleBackClick} style={{ position: 'absolute', top: 10, left: 10, cursor: 'pointer', fontSize: '32px', color: 'white', padding: '6px 10px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '4px', zIndex: 20 }}>←</div>

      <div onClick={() => setMenuOpen(!menuOpen)} style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', fontSize: '20px', color: 'white', padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '4px', zIndex: 20 }}>
        {menuOpen ? '✕ Close' : '☰ Directory'}
      </div>

      {menuOpen && (
        <div style={{ position: 'absolute', top: 50, right: 10, width: '220px', maxHeight: '70%', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.85)', color: 'white', padding: '12px', borderRadius: '8px', zIndex: 20, fontFamily: 'sans-serif' }}>
          <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>Planets</h3>
          {planetData.map((planet) => (
            <div
              key={planet.name}
              onClick={() => handlePlanetClick(planetRefs.current[planet.name], planet.name)}
              style={{
                padding: '6px 8px',
                marginBottom: '6px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: selectedPlanet === planet.name ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
            >
              {planet.name}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 4px', borderRadius: '2px', fontFamily: 'sans-serif', fontSize: '14px', zIndex: 10 }}>Version 1.2</div>

      <Canvas camera={{ position: [0, 0, 150], fov: 50 }} style={{ width: '100%', height: '100%', background: 'black' }}>
        <Stars radius={250} depth={100} count={5000} factor={4} fade />
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
            isSelected={selectedPlanet === planet.name}
            title={planet.title}
            description={planet.description}
          />
        ))}

        <CameraFocus targetRef={selectedPlanetRef} selectedPlanet={selectedPlanet} resetTrigger={resetTrigger} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="white" />
      </Canvas>
    </div>
  )
}
