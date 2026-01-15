'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedText3DProps {
  text: string;
  position?: [number, number, number];
  size?: number;
  color?: string;
  gradientColors?: [string, string];
  animate?: boolean;
}

export function AnimatedText3D({
  text,
  position = [0, 0, 0],
  size = 1,
  color = '#ffffff',
  gradientColors,
  animate = true,
}: AnimatedText3DProps) {
  const textRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    if (gradientColors) {
      return new THREE.ShaderMaterial({
        uniforms: {
          color1: { value: new THREE.Color(gradientColors[0]) },
          color2: { value: new THREE.Color(gradientColors[1]) },
          time: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            float mixValue = (sin(vPosition.x * 2.0 + time) + 1.0) * 0.5;
            vec3 finalColor = mix(color1, color2, mixValue);
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
      });
    }
    return new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.4,
    });
  }, [color, gradientColors]);

  useFrame((state) => {
    if (!textRef.current || !animate) return;
    
    if (gradientColors && 'uniforms' in material) {
      (material as THREE.ShaderMaterial).uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <Float
      speed={animate ? 2 : 0}
      rotationIntensity={animate ? 0.1 : 0}
      floatIntensity={animate ? 0.5 : 0}
    >
      <Center position={position}>
        <Text3D
          ref={textRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={size * 0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={size * 0.02}
          bevelSize={size * 0.02}
          bevelOffset={0}
          bevelSegments={5}
          material={material}
        >
          {text}
        </Text3D>
      </Center>
    </Float>
  );
}

// Simpler text that doesn't require font file
export function GlowingText({
  text,
  position = [0, 0, 0],
  size = 1,
  color = '#a855f7',
}: {
  text: string;
  position?: [number, number, number];
  size?: number;
  color?: string;
}) {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!textRef.current) return;
    const time = state.clock.getElapsedTime();
    textRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
  });

  return (
    <group position={position}>
      {/* Glow layer */}
      <Text
        ref={textRef}
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={size * 0.05}
        outlineColor={color}
        outlineOpacity={0.5}
      >
        {text}
      </Text>
    </group>
  );
}

// Import Text from drei for the GlowingText component
import { Text } from '@react-three/drei';
