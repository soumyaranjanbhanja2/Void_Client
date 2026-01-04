// src/ui/NotificationParticles.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function NotificationParticles({ priority }) {
  // Generate random positions for particles
  const particles = new Float32Array(500).map(() => (Math.random() - 0.5) * 6);

  const color =
    priority === 'high'
      ? '#ff4d4f' // sparks red
      : priority === 'low'
      ? '#2ecc71' // bubbles green
      : '#f6c343'; // arcs yellow

  return (
    <div className="h-40 w-full">
      <Canvas>
        <ambientLight intensity={0.5} />
        <Points positions={particles} stride={3}>
          <PointMaterial
            transparent
            color={color}
            size={0.05}
            sizeAttenuation={true}
            depthWrite={false}
          />
        </Points>
      </Canvas>
    </div>
  );
}