// src/ui/NotificationAccent.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function NotificationAccent({ priority }) {
  const color =
    priority === 'high'
      ? '#ff4d4f'
      : priority === 'low'
      ? '#2ecc71'
      : '#f6c343';

  return (
    <div className="h-40 w-full">
      <Canvas>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} />
        <mesh rotation={[0.4, 0.2, 0]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}