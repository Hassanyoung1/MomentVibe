'use client';

import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Text, Image, Html, Billboard, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleField } from './ParticleField';
import { MediaGallery3D } from './MediaGallery3D';
import { CameraController, SceneLighting, PostProcessing } from './SceneUtils';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  title?: string;
  uploadedBy?: string;
  createdAt?: string;
}

interface EventDetail {
  id: string;
  name: string;
  date: string;
  description?: string;
  location?: string;
  media: MediaItem[];
  guests: { id: string; name: string }[];
  allowDownload?: boolean;
  allowShare?: boolean;
}

interface EventDetailSceneProps {
  event: EventDetail;
  onMediaClick?: (media: MediaItem) => void;
  onBack?: () => void;
  onUpload?: () => void;
}

function EventHeader({ event }: { event: EventDetail }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <group position={[0, 4, 0]}>
      <Text
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#8b5cf6"
      >
        {event.name}
      </Text>
      
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.18}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        📅 {formattedDate}
      </Text>
      
      {event.location && (
        <Text
          position={[0, -1, 0]}
          fontSize={0.15}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          📍 {event.location}
        </Text>
      )}
    </group>
  );
}

function MediaCounter({ count, type }: { count: number; type: 'photos' | 'videos' }) {
  return (
    <Float speed={1.5} floatIntensity={0.2}>
      <group>
        <mesh>
          <circleGeometry args={[0.5, 32]} />
          <meshStandardMaterial 
            color="#1f2937" 
            transparent 
            opacity={0.9}
          />
        </mesh>
        
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.2}
          color="#8b5cf6"
          anchorX="center"
        >
          {count}
        </Text>
        
        <Text
          position={[0, -0.15, 0.01]}
          fontSize={0.08}
          color="#94a3b8"
          anchorX="center"
        >
          {type}
        </Text>
      </group>
    </Float>
  );
}

function StatsBar({ event }: { event: EventDetail }) {
  const photoCount = event.media.filter(m => m.type === 'image').length;
  const videoCount = event.media.filter(m => m.type === 'video').length;

  return (
    <group position={[-5, 2, 0]}>
      <group position={[0, 0, 0]}>
        <MediaCounter count={photoCount} type="photos" />
      </group>
      <group position={[0, -1.2, 0]}>
        <MediaCounter count={videoCount} type="videos" />
      </group>
      <group position={[0, -2.4, 0]}>
        <Float speed={1.5} floatIntensity={0.2}>
          <mesh>
            <circleGeometry args={[0.5, 32]} />
            <meshStandardMaterial 
              color="#1f2937" 
              transparent 
              opacity={0.9}
            />
          </mesh>
          
          <Text
            position={[0, 0.1, 0.01]}
            fontSize={0.2}
            color="#ec4899"
            anchorX="center"
          >
            {event.guests.length}
          </Text>
          
          <Text
            position={[0, -0.15, 0.01]}
            fontSize={0.08}
            color="#94a3b8"
            anchorX="center"
          >
            guests
          </Text>
        </Float>
      </group>
    </group>
  );
}

function ActionButtons({ 
  onUpload, 
  onBack,
  allowDownload,
  allowShare 
}: { 
  onUpload?: () => void; 
  onBack?: () => void;
  allowDownload?: boolean;
  allowShare?: boolean;
}) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const buttons = [
    { id: 'upload', label: '📤 Upload', color: '#8b5cf6', onClick: onUpload },
    { id: 'back', label: '← Back', color: '#374151', onClick: onBack },
  ];

  if (allowDownload) {
    buttons.splice(1, 0, { id: 'download', label: '⬇️ Download All', color: '#3b82f6', onClick: () => {} });
  }

  return (
    <group position={[5, 2, 0]}>
      {buttons.map((btn, index) => (
        <group
          key={btn.id}
          position={[0, -index * 0.8, 0]}
          onClick={btn.onClick}
          onPointerOver={() => setHoveredButton(btn.id)}
          onPointerOut={() => setHoveredButton(null)}
        >
          <mesh>
            <planeGeometry args={[2, 0.5]} />
            <meshStandardMaterial
              color={hoveredButton === btn.id ? btn.color : '#1f2937'}
              emissive={btn.color}
              emissiveIntensity={hoveredButton === btn.id ? 0.3 : 0.1}
            />
          </mesh>
          
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.12}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {btn.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function EmptyGalleryMessage({ onUpload }: { onUpload?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, 0, 0]}>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="#64748b"
        anchorX="center"
      >
        📷
      </Text>
      
      <Text
        position={[0, 0, 0]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
      >
        No media yet
      </Text>
      
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.12}
        color="#64748b"
        anchorX="center"
        maxWidth={3}
      >
        Be the first to upload photos or videos!
      </Text>
      
      <group
        position={[0, -1, 0]}
        onClick={onUpload}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <planeGeometry args={[2, 0.5]} />
          <meshStandardMaterial
            color={hovered ? '#7c3aed' : '#8b5cf6'}
            emissive="#8b5cf6"
            emissiveIntensity={hovered ? 0.4 : 0.2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.14}
          color="white"
          anchorX="center"
        >
          📤 Upload Media
        </Text>
      </group>
    </group>
  );
}

export function EventDetailScene({
  event,
  onMediaClick,
  onBack,
  onUpload,
}: EventDetailSceneProps) {
  // Filter out media items without valid URLs
  const mediaItems = event.media
    .filter(m => m.url && m.url.trim() !== '')
    .map(m => ({
      id: m.id,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || m.url,
      type: m.type,
      title: m.title || m.uploadedBy,
    }));

  return (
    <div className="w-full h-[700px] relative">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#0f0a1a']} />
          
          <SceneLighting 
            ambientIntensity={0.5}
            mainLightIntensity={1}
          />
          
          <Stars
            radius={50}
            depth={50}
            count={1000}
            factor={3}
            fade
            speed={0.2}
          />
          
          <ParticleField count={600} spread={20} size={0.01} />
          
          <EventHeader event={event} />
          <StatsBar event={event} />
          <ActionButtons 
            onUpload={onUpload}
            onBack={onBack}
            allowDownload={event.allowDownload}
            allowShare={event.allowShare}
          />
          
          {mediaItems.length > 0 ? (
            <MediaGallery3D
              items={mediaItems}
              onItemClick={onMediaClick}
              radius={4}
              itemSize={1.2}
            />
          ) : (
            <EmptyGalleryMessage onUpload={onUpload} />
          )}
          
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
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
