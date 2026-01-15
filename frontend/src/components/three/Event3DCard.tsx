'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface Event3DCardProps {
  id: string;
  name: string;
  date: string;
  description?: string;
  mediaCount?: number;
  guestCount?: number;
  thumbnailUrl?: string;
  position?: [number, number, number];
  onClick?: (id: string) => void;
  index?: number;
}

export function Event3DCard({
  id,
  name,
  date,
  description,
  mediaCount = 0,
  guestCount = 0,
  thumbnailUrl,
  position = [0, 0, 0],
  onClick,
  index = 0,
}: Event3DCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Gentle floating animation with offset based on index
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5 + index * 0.5) * 0.1;
    
    // Scale animation on hover
    const targetScale = hovered ? 1.05 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const handleClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card background */}
      <RoundedBox args={[3, 2, 0.15]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={hovered ? '#4c1d95' : '#1f2937'}
          metalness={0.3}
          roughness={0.7}
          emissive={hovered ? '#7c3aed' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </RoundedBox>

      {/* Accent border */}
      <RoundedBox args={[3.05, 2.05, 0.1]} radius={0.1} smoothness={4} position={[0, 0, -0.05]}>
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={hovered ? 1 : 0.5}
        />
      </RoundedBox>

      {/* Event name */}
      <Text
        position={[0, 0.5, 0.08]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        font="/fonts/Inter-Bold.woff"
      >
        {name}
      </Text>

      {/* Date */}
      <Text
        position={[0, 0.1, 0.08]}
        fontSize={0.12}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        📅 {formattedDate}
      </Text>

      {/* Stats */}
      <group position={[-0.8, -0.3, 0.08]}>
        <Text
          fontSize={0.1}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          📸 {mediaCount} photos
        </Text>
      </group>

      <group position={[0.4, -0.3, 0.08]}>
        <Text
          fontSize={0.1}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          👥 {guestCount} guests
        </Text>
      </group>

      {/* Description preview */}
      {description && (
        <Text
          position={[0, -0.6, 0.08]}
          fontSize={0.08}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          lineHeight={1.4}
        >
          {description.length > 60 ? `${description.slice(0, 60)}...` : description}
        </Text>
      )}

      {/* Glow effect on hover */}
      {hovered && (
        <pointLight position={[0, 0, 1]} intensity={0.5} color="#a855f7" distance={3} />
      )}
    </group>
  );
}

interface EventGridProps {
  events: Event3DCardProps[];
  onEventClick?: (id: string) => void;
  columns?: number;
  spacing?: number;
}

export function EventGrid3D({
  events,
  onEventClick,
  columns = 3,
  spacing = 4,
}: EventGridProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {events.map((event, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = (col - (columns - 1) / 2) * spacing;
        const y = -row * 2.5;
        const z = 0;

        return (
          <Event3DCard
            key={event.id}
            {...event}
            position={[x, y, z]}
            onClick={onEventClick}
            index={index}
          />
        );
      })}
    </group>
  );
}
