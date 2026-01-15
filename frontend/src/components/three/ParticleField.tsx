'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
}

export function ParticleField({ 
  count = 2000, 
  color = '#8b5cf6', 
  size = 0.02,
  spread = 15 
}: ParticleFieldProps) {
  const particlesRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const baseColor = new THREE.Color(color);
    const accentColor1 = new THREE.Color('#ec4899'); // pink
    const accentColor2 = new THREE.Color('#3b82f6'); // blue
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random positions in a sphere
      const radius = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Random colors between base, accent1, and accent2
      const colorChoice = Math.random();
      const selectedColor = colorChoice < 0.33 
        ? baseColor 
        : colorChoice < 0.66 
          ? accentColor1 
          : accentColor2;
      
      colors[i3] = selectedColor.r;
      colors[i3 + 1] = selectedColor.g;
      colors[i3 + 2] = selectedColor.b;
    }
    
    return [positions, colors];
  }, [count, color, spread]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.02;
    particlesRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
