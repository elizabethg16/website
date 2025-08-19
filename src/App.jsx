// App.jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Text } from '@react-three/drei'
import { useRef } from 'react'

function RotatingPlanet() {
  const planetRef = useRef()
  const textRef = useRef()

  // Rotate both the sphere and the text slowly
  useFrame(() => {
    if (planetRef.current) planetRef.current.rotation.y += 0.002
    if (textRef.current) textRef.current.rotation.y += 0.002
  })

  return (
    <>
      {/* Orange sphere */}
      <mesh ref={planetRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Text in front of the sphere */}
      <Text
        ref={textRef}
        position={[0, 0, 2.5]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        this is my website in progress!
      </Text>
    </>
  )
}

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ width: '100vw', height: '100vh', background: 'black' }}
    >
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade />

      {/* Rotating sphere and text */}
      <RotatingPlanet />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="orange" />
    </Canvas>
  )
}
