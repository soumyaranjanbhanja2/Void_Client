// src/ui/BackgroundScene.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

export default function BackgroundScene() {
  return (
    <Canvas className="absolute inset-0 -z-10">
      {/* Starfield */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

      {/* Rotating sphere */}
      <mesh rotation={[0.4, 0.2, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="#4c8cff" wireframe />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}