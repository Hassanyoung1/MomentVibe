'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface CameraControllerProps {
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
}

export function CameraController({
  enableZoom = true,
  enablePan = false,
  enableRotate = true,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  minDistance = 2,
  maxDistance = 20,
}: CameraControllerProps) {
  return (
    <OrbitControls
      enableZoom={enableZoom}
      enablePan={enablePan}
      enableRotate={enableRotate}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      minDistance={minDistance}
      maxDistance={maxDistance}
      dampingFactor={0.05}
      enableDamping
    />
  );
}

interface SceneLightingProps {
  ambientIntensity?: number;
  mainLightIntensity?: number;
  mainLightPosition?: [number, number, number];
  accentLightColor?: string;
}

export function SceneLighting({
  ambientIntensity = 0.5,
  mainLightIntensity = 1,
  mainLightPosition = [10, 10, 5],
  accentLightColor = '#8b5cf6',
}: SceneLightingProps) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={mainLightPosition}
        intensity={mainLightIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color={accentLightColor} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#ec4899"
      />
    </>
  );
}

interface PostProcessingProps {
  bloomIntensity?: number;
  bloomThreshold?: number;
  chromaticAberration?: boolean;
  vignette?: boolean;
}

export function PostProcessing({
  bloomIntensity = 0.5,
  bloomThreshold = 0.8,
  chromaticAberration = true,
  vignette = true,
}: PostProcessingProps) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
      />
      {chromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.002, 0.002)}
        />
      )}
      {vignette && (
        <Vignette
          offset={0.3}
          darkness={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  );
}

export function SceneEnvironment({ preset = 'night' }: { preset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby' }) {
  return <Environment preset={preset} />;
}
