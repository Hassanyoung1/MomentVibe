'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, Text, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleField } from './ParticleField';
import { GlowingSphere } from './GlowingSphere';
import { CameraController, SceneLighting, PostProcessing } from './SceneUtils';

function CameraIcon({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.5;
    meshRef.current.position.y = position[1] + Math.sin(time) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef} position={position}>
        {/* Camera body */}
        <mesh>
          <boxGeometry args={[1.5, 1, 0.8]} />
          <MeshWobbleMaterial
            color="#8b5cf6"
            metalness={0.8}
            roughness={0.2}
            factor={0.2}
            speed={2}
          />
        </mesh>
        
        {/* Camera lens */}
        <mesh position={[0.5, 0, 0.5]}>
          <cylinderGeometry args={[0.3, 0.4, 0.4, 32]} />
          <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Flash */}
        <mesh position={[-0.5, 0.6, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.2]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Viewfinder */}
        <mesh position={[-0.3, 0.6, 0]}>
          <boxGeometry args={[0.2, 0.15, 0.15]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
    </Float>
  );
}

function PhotoFrame({ position, rotation, imageEmoji }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
  imageEmoji: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <group ref={groupRef} position={position} rotation={rotation || [0, 0, 0]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[1.2, 1.5, 0.1]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* Photo area */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1, 1.3]} />
          <meshStandardMaterial 
            color="#1e1b4b" 
            emissive="#4c1d95"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Emoji placeholder */}
        <Text
          position={[0, 0, 0.07]}
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
        >
          {imageEmoji}
        </Text>
      </group>
    </Float>
  );
}

function HeartParticles() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.1;
  });

  return (
    <group ref={groupRef}>
      <Sparkles
        count={100}
        scale={10}
        size={2}
        speed={0.5}
        color="#ec4899"
      />
    </group>
  );
}

function MainTitle() {
  return (
    <group position={[0, 0, -2]}>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#8b5cf6"
      >
        MomentVibe
      </Text>
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.25}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        Capture & Share Moments That Matter
      </Text>
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0f0a1a']} />
          
          <SceneLighting 
            ambientIntensity={0.3}
            mainLightIntensity={0.8}
            accentLightColor="#8b5cf6"
          />
          
          {/* Starfield background */}
          <Stars
            radius={50}
            depth={50}
            count={3000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />
          
          {/* Particle field */}
          <ParticleField count={1500} spread={20} size={0.015} />
          
          {/* Heart sparkles */}
          <HeartParticles />
          
          {/* Glowing spheres */}
          <GlowingSphere position={[-5, 2, -3]} scale={0.5} color="#ec4899" />
          <GlowingSphere position={[5, -1, -2]} scale={0.3} color="#3b82f6" />
          <GlowingSphere position={[3, 3, -4]} scale={0.4} color="#8b5cf6" />
          
          {/* Camera icon */}
          <CameraIcon position={[0, -0.5, 0]} />
          
          {/* Floating photo frames */}
          <PhotoFrame position={[-4, 1, -1]} rotation={[0, 0.3, 0.1]} imageEmoji="📸" />
          <PhotoFrame position={[4, 0.5, -1.5]} rotation={[0, -0.3, -0.1]} imageEmoji="🎉" />
          <PhotoFrame position={[-3, -2, 0]} rotation={[0, 0.2, 0.05]} imageEmoji="💝" />
          <PhotoFrame position={[3.5, -1.5, -0.5]} rotation={[0, -0.2, 0.05]} imageEmoji="🌟" />
          
          {/* Main title */}
          <MainTitle />
          
          {/* Post-processing effects */}
          <PostProcessing 
            bloomIntensity={0.6}
            bloomThreshold={0.7}
            chromaticAberration={false}
            vignette={true}
          />
          
          {/* Camera controls */}
          <CameraController 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
