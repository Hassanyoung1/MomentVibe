'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { ParticleField } from './ParticleField';
import { GlowingSphere } from './GlowingSphere';
import { CameraController, SceneLighting, PostProcessing } from './SceneUtils';

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0f0a1a']} />
          
          <SceneLighting 
            ambientIntensity={0.2}
            mainLightIntensity={0.5}
            accentLightColor="#8b5cf6"
          />
          
          {/* Starfield background */}
          <Stars
            radius={50}
            depth={50}
            count={2000}
            factor={4}
            saturation={0}
            fade
            speed={0.3}
          />
          
          {/* Particle field */}
          <ParticleField count={800} spread={15} size={0.01} />
          
          {/* Sparkles */}
          <Sparkles
            count={50}
            scale={10}
            size={2}
            speed={0.3}
            color="#8b5cf6"
          />
          
          {/* Glowing spheres */}
          <GlowingSphere position={[-6, 3, -5]} scale={0.8} color="#ec4899" />
          <GlowingSphere position={[6, -2, -4]} scale={0.5} color="#3b82f6" />
          <GlowingSphere position={[4, 4, -6]} scale={0.6} color="#8b5cf6" />
          <GlowingSphere position={[-5, -3, -5]} scale={0.4} color="#a855f7" />
          
          {/* Post-processing effects */}
          <PostProcessing 
            bloomIntensity={0.4}
            bloomThreshold={0.8}
            chromaticAberration={false}
            vignette={true}
          />
          
          {/* Camera controls - very limited */}
          <CameraController 
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate={true}
            autoRotateSpeed={0.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
