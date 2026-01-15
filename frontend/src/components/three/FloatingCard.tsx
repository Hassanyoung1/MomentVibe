'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Image, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface FloatingCardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  imageUrl?: string;
  title?: string;
  onClick?: () => void;
  scale?: number;
  hoverScale?: number;
}

export function FloatingCard({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  imageUrl,
  title,
  onClick,
  scale = 1,
  hoverScale = 1.1,
}: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: hovered ? hoverScale : scale,
        y: hovered ? hoverScale : scale,
        z: hovered ? hoverScale : scale,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [hovered, scale, hoverScale]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Gentle floating animation
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1;
    groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.3) * 0.05;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[2, 2.5, 0.1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={hovered ? '#a855f7' : '#374151'}
          metalness={0.5}
          roughness={0.3}
        />
      </RoundedBox>
      
      {imageUrl && (
        <Image
          url={imageUrl}
          position={[0, 0.3, 0.06]}
          scale={[1.6, 1.2, 1]}
        />
      )}
      
      {title && (
        <Text
          position={[0, -0.9, 0.06]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          {title}
        </Text>
      )}
      
      {hovered && (
        <pointLight position={[0, 0, 1]} intensity={0.5} color="#a855f7" />
      )}
    </group>
  );
}
