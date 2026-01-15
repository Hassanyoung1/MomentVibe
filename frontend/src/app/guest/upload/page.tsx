'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, Environment } from '@react-three/drei';
import { useSearchParams } from 'next/navigation';
import { mediaService } from '@/services/mediaService';
import { eventService } from '@/services/eventService';
import * as THREE from 'three';

// Animated camera icon
function CameraIcon() {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef} position={[2.5, 0, -3]}>
        <mesh>
          <boxGeometry args={[1.2, 0.8, 0.5]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.4, 0.25, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-0.3, 0, 0.3]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

// Upload background
function UploadBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
          
          <CameraIcon />
          
          <Stars radius={50} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={40} scale={12} size={2} speed={0.3} color="#ec4899" />
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Drag and drop zone
function DropZone({ 
  onFileSelect, 
  file, 
  preview,
  disabled 
}: { 
  onFileSelect: (file: File) => void;
  file: File | null;
  preview: string | null;
  disabled: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
        ${isDragging 
          ? 'border-purple-400 bg-purple-500/20' 
          : 'border-slate-600 hover:border-purple-500/50 bg-slate-800/30'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        className="hidden"
        disabled={disabled}
      />
      
      {preview ? (
        <div className="space-y-4">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-64 mx-auto rounded-lg shadow-lg"
          />
          <p className="text-slate-400 text-sm">
            {file?.name} • {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-purple-400 text-sm">Click or drag to replace</p>
        </div>
      ) : file ? (
        <div className="space-y-4">
          <div className="text-6xl">🎬</div>
          <p className="text-white font-medium">{file.name}</p>
          <p className="text-slate-400 text-sm">
            {((file.size || 0) / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-6xl">📷</div>
          <p className="text-white font-medium">
            Drop your photo or video here
          </p>
          <p className="text-slate-400 text-sm">
            or click to browse
          </p>
          <p className="text-slate-500 text-xs">
            Supports: JPG, PNG, GIF, MP4, MOV
          </p>
        </div>
      )}
    </div>
  );
}

function GuestUploadContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [event, setEvent] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    } else {
      setError('Event ID is required');
      setLoading(false);
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const eventData = await eventService.getEvent(eventId!);
      setEvent(eventData);
    } catch (err: any) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setSuccess(false);
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!eventId) {
      setError('Event ID is missing');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      await mediaService.uploadGuestMedia({
        eventId,
        file,
        guestName: guestName || undefined,
        guestEmail: guestEmail || undefined,
      });
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setUploadCount((prev) => prev + 1);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-red-400 text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-slate-300">{error || 'The event could not be found or may have expired.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Event Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-4">
            <span>📸</span> Guest Upload
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {event.name}
            </span>
          </h1>
          <p className="text-slate-400">{event.description}</p>
        </div>

        {/* Upload Card */}
        <div className="glass rounded-2xl p-6 md:p-8">
          {/* Success Counter */}
          {uploadCount > 0 && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <p className="text-green-400">
                🎉 You&apos;ve uploaded <span className="font-bold">{uploadCount}</span> file{uploadCount !== 1 ? 's' : ''} successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-3">
              <span className="text-xl">✅</span>
              Media uploaded successfully! Thank you for sharing.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guest Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Name <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Email <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Drop Zone */}
            <DropZone
              onFileSelect={handleFileSelect}
              file={file}
              preview={preview}
              disabled={uploading}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  Upload Media
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
              <span>💡</span> Tips
            </h3>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• You can upload multiple files by submitting again after each upload</li>
              <li>• For best quality, upload original photos without compression</li>
              <li>• Videos up to 100MB are supported</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-purple-400">MomentVibe</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GuestUploadPage() {
  return (
    <div className="min-h-screen relative">
      <UploadBackground />
      <div className="relative z-10">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        }>
          <GuestUploadContent />
        </Suspense>
      </div>
    </div>
  );
}










