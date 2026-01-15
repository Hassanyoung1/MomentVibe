'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface GlowingSphereProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  distort?: number;
}

export function GlowingSphere({
  position = [0, 0, 0],
  scale = 1,
  color = '#8b5cf6',
  speed = 2,
  distort = 0.4,
}: GlowingSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const time = state.clock.getElapsedTime();
    
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
    
    // Pulsating glow effect
    const pulse = Math.sin(time * 2) * 0.1 + 1;
    glowRef.current.scale.setScalar(scale * 1.2 * pulse);
  });

  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        viewVector: { value: new THREE.Vector3(0, 0, 1) },
        c: { value: 0.5 },
        p: { value: 4.0 },
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
  }, [color]);

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          metalness={0.2}
          roughness={0.1}
        />
      </Sphere>
      
      {/* Glow effect */}
      <mesh ref={glowRef} scale={scale * 1.2} material={glowMaterial}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
    </group>
  );
}
