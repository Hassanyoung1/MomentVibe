'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Text, Image, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  title?: string;
}

interface MediaGallery3DProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  radius?: number;
  itemSize?: number;
}

function GalleryItem({ 
  item, 
  index, 
  total, 
  radius, 
  itemSize, 
  onClick,
  activeIndex,
  setActiveIndex 
}: { 
  item: MediaItem;
  index: number;
  total: number;
  radius: number;
  itemSize: number;
  onClick?: (item: MediaItem) => void;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const isActive = activeIndex === index;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Float animation
    meshRef.current.position.y = Math.sin(time + index) * 0.1;
    
    // Face center when not active
    if (!isActive) {
      meshRef.current.rotation.y = -angle + Math.PI;
    }
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isActive) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
      onClick?.(item);
    }
  }, [isActive, index, item, onClick, setActiveIndex]);

  return (
    <group
      ref={meshRef}
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh scale={hovered || isActive ? itemSize * 1.1 : itemSize}>
        <planeGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>
      
      {(item.thumbnailUrl || item.url) && (
        <Image
          url={item.thumbnailUrl || item.url}
          scale={[itemSize * 1.4, itemSize * 0.9, 1]}
          position={[0, 0, 0.01]}
        />
      )}
      
      {item.title && (
        <Text
          position={[0, -itemSize * 0.6, 0.02]}
          fontSize={0.1}
          color="white"
          anchorX="center"
        >
          {item.title}
        </Text>
      )}
      
      {hovered && (
        <pointLight position={[0, 0, 0.5]} intensity={0.3} color="#a855f7" />
      )}
      
      {item.type === 'video' && (
        <Billboard position={[0.6, 0.4, 0.02]}>
          <mesh>
            <circleGeometry args={[0.1, 32]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.06} color="white">
            ▶
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export function MediaGallery3D({ 
  items, 
  onItemClick, 
  radius = 4,
  itemSize = 1 
}: MediaGallery3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useFrame((state) => {
    if (!groupRef.current || !autoRotate || activeIndex !== null) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.05;
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setAutoRotate(false)}
      onPointerOut={() => setAutoRotate(true)}
    >
      {items.map((item, index) => (
        <GalleryItem
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          radius={radius}
          itemSize={itemSize}
          onClick={onItemClick}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      ))}
      
      {/* Center pillar */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
