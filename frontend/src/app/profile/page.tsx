'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles, Text, RoundedBox } from '@react-three/drei';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

// Animated avatar sphere
function AvatarSphere({ initial }: { initial: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0, 1.6]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {initial}
      </Text>
    </Float>
  );
}

// Background scene
function ProfileBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={30} scale={15} size={2} speed={0.3} color="#8b5cf6" />
      </Canvas>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // TODO: Implement profile update API call
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative">
        <ProfileBackground />
        
        <div className="relative z-10 min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Your Profile
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Manage your account settings
              </p>
            </div>

            {/* Profile Card */}
            <div className="glass rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-purple-500/30">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-xl font-semibold focus:outline-none focus:border-purple-500"
                        placeholder="Your name"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:border-purple-500"
                        placeholder="Your email"
                        disabled
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
                      <p className="text-slate-400 text-lg">{user?.email}</p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                    >
                      <span>✏️</span> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass rounded-xl p-6 text-center card-hover">
                <div className="text-4xl mb-2">📸</div>
                <div className="text-3xl font-bold text-white mb-1">-</div>
                <div className="text-slate-400">Events Created</div>
              </div>
              <div className="glass rounded-xl p-6 text-center card-hover">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-3xl font-bold text-white mb-1">-</div>
                <div className="text-slate-400">Photos Uploaded</div>
              </div>
              <div className="glass rounded-xl p-6 text-center card-hover">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-3xl font-bold text-white mb-1">-</div>
                <div className="text-slate-400">Total Guests</div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Account Actions</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🏠</span>
                    <div className="text-left">
                      <p className="text-white font-medium">Go to Dashboard</p>
                      <p className="text-slate-400 text-sm">View your events and analytics</p>
                    </div>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-colors">→</span>
                </button>

                <button
                  onClick={() => router.push('/events/create')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">➕</span>
                    <div className="text-left">
                      <p className="text-white font-medium">Create New Event</p>
                      <p className="text-slate-400 text-sm">Start collecting memories</p>
                    </div>
                  </div>
                  <span className="text-slate-500 group-hover:text-white transition-colors">→</span>
                </button>

                <div className="border-t border-slate-700 pt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">🚪</span>
                      <div className="text-left">
                        <p className="text-red-400 font-medium">Logout</p>
                        <p className="text-slate-400 text-sm">Sign out of your account</p>
                      </div>
                    </div>
                    <span className="text-red-400 group-hover:text-red-300 transition-colors">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
