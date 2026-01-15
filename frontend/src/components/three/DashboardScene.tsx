'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Sparkles, Text, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleField } from './ParticleField';
import { EventGrid3D, Event3DCard } from './Event3DCard';
import { CameraController, SceneLighting, PostProcessing } from './SceneUtils';

interface DashboardEvent {
  id: string;
  name: string;
  date: string;
  description?: string;
  mediaCount?: number;
  guestCount?: number;
}

interface DashboardSceneProps {
  events: DashboardEvent[];
  onEventClick?: (id: string) => void;
  onCreateEvent?: () => void;
  userName?: string;
}

function WelcomeText({ userName }: { userName?: string }) {
  return (
    <group position={[0, 4, -5]}>
      <Text
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#8b5cf6"
      >
        {userName ? `Welcome back, ${userName}!` : 'Your Events'}
      </Text>
    </group>
  );
}

function CreateEventButton({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.z = Math.sin(time * 2) * 0.05;
    
    const scale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group
        position={[6, 3, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh ref={meshRef}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial
            color={hovered ? '#a855f7' : '#8b5cf6'}
            emissive="#8b5cf6"
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          +
        </Text>
        
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.15}
          color="#a855f7"
          anchorX="center"
          anchorY="middle"
        >
          Create Event
        </Text>
        
        {hovered && (
          <pointLight position={[0, 0, 1]} intensity={0.5} color="#a855f7" />
        )}
      </group>
    </Float>
  );
}

function StatsPanel({ events }: { events: DashboardEvent[] }) {
  const totalMedia = events.reduce((sum, e) => sum + (e.mediaCount || 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + (e.guestCount || 0), 0);

  return (
    <group position={[-6, 3, 0]}>
      <mesh>
        <planeGeometry args={[2.5, 2]} />
        <meshStandardMaterial 
          color="#1f2937" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      <Text
        position={[0, 0.6, 0.01]}
        fontSize={0.15}
        color="#8b5cf6"
        anchorX="center"
      >
        Dashboard Stats
      </Text>
      
      <Text
        position={[0, 0.2, 0.01]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        🎉 {events.length} Events
      </Text>
      
      <Text
        position={[0, -0.1, 0.01]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        📸 {totalMedia} Photos
      </Text>
      
      <Text
        position={[0, -0.4, 0.01]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        👥 {totalGuests} Guests
      </Text>
    </group>
  );
}

function NoEventsMessage({ onCreateEvent }: { onCreateEvent?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, 0, 0]}>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.25}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        No events yet
      </Text>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.15}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Create your first event to get started!
      </Text>
      
      <group
        position={[0, -1, 0]}
        onClick={onCreateEvent}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <planeGeometry args={[2.5, 0.6]} />
          <meshStandardMaterial
            color={hovered ? '#7c3aed' : '#8b5cf6'}
            emissive="#8b5cf6"
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          + Create Your First Event
        </Text>
      </group>
    </group>
  );
}

function EventsDisplay({ 
  events, 
  onEventClick,
  onCreateEvent 
}: { 
  events: DashboardEvent[];
  onEventClick?: (id: string) => void;
  onCreateEvent?: () => void;
}) {
  if (events.length === 0) {
    return <NoEventsMessage onCreateEvent={onCreateEvent} />;
  }

  return (
    <group position={[0, 0, 0]}>
      {events.map((event, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = (col - 1) * 4;
        const y = -row * 2.8;
        
        return (
          <Event3DCard
            key={event.id}
            {...event}
            position={[x, y, 0]}
            onClick={onEventClick}
            index={index}
          />
        );
      })}
    </group>
  );
}

export function DashboardScene({
  events,
  onEventClick,
  onCreateEvent,
  userName,
}: DashboardSceneProps) {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0f0a1a']} />
          
          <SceneLighting 
            ambientIntensity={0.4}
            mainLightIntensity={0.8}
          />
          
          <Stars
            radius={50}
            depth={50}
            count={1500}
            factor={3}
            fade
            speed={0.3}
          />
          
          <ParticleField count={800} spread={25} size={0.01} />
          
          <WelcomeText userName={userName} />
          <StatsPanel events={events} />
          <CreateEventButton onClick={onCreateEvent} />
          <EventsDisplay 
            events={events} 
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
          />
          
          <PostProcessing 
            bloomIntensity={0.4}
            bloomThreshold={0.8}
            vignette={true}
            chromaticAberration={false}
          />
          
          <CameraController 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={25}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
