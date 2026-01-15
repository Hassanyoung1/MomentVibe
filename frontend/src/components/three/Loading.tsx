'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function LoadingOrb() {
  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  );
}

export function Loading3D({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <div className="w-32 h-32 mb-8">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
            <LoadingOrb />
            <Sparkles
              count={50}
              scale={3}
              size={2}
              speed={0.5}
              color="#ec4899"
            />
          </Suspense>
        </Canvas>
      </div>
      <p className="text-purple-400 text-lg font-medium animate-pulse">{text}</p>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

export function PageLoader({ text }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      {text && (
        <p className="mt-4 text-purple-400 text-lg animate-pulse">{text}</p>
      )}
    </div>
  );
}
