'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';
import { Preload } from '@react-three/drei';

interface SceneProps {
  children: ReactNode;
  className?: string;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

export function Scene({ children, className = '', camera }: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: camera?.position || [0, 0, 5],
          fov: camera?.fov || 75,
        }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
