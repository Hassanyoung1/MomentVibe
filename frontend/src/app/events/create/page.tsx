'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles } from '@react-three/drei';
import { eventService } from '@/services/eventService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

// Animated background sphere
function BackgroundSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={[3, 0, -5]}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial
        color="#8b5cf6"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Floating particles
function FloatingParticles() {
  return (
    <>
      <Stars radius={50} depth={50} count={1000} factor={3} saturation={0} fade speed={1} />
      <Sparkles
        count={50}
        scale={10}
        size={2}
        speed={0.3}
        color="#ec4899"
      />
    </>
  );
}

// 3D Background Scene
function CreateEventBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
          <BackgroundSphere />
        </Float>
        
        <FloatingParticles />
      </Canvas>
    </div>
  );
}

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    allowDownload: true,
    allowSharing: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const event = await eventService.createEvent(formData);
      router.push(`/events/${event._id}`);
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative">
        {/* 3D Background */}
        <CreateEventBackground />
        
        {/* Content Overlay */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Create Your Event
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Set up a new event and start collecting memories
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        step >= s
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`w-12 h-1 rounded transition-all duration-300 ${
                          step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className="glass rounded-2xl p-8 shadow-2xl">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">📝</span> Basic Information
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="e.g., Sarah's Wedding"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        placeholder="Tell your guests what this event is about..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Date & Location */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">📅</span> When & Where
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="e.g., Banquet Hall, NYC"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Permissions */}
                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚙️</span> Permissions
                    </h2>

                    <div className="space-y-4">
                      <label className="flex items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          name="allowDownload"
                          checked={formData.allowDownload}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-700"
                        />
                        <div className="ml-4">
                          <p className="text-white font-medium">Allow Downloads</p>
                          <p className="text-slate-400 text-sm">Guests can download photos and videos</p>
                        </div>
                      </label>

                      <label className="flex items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          name="allowSharing"
                          checked={formData.allowSharing}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-700"
                        />
                        <div className="ml-4">
                          <p className="text-white font-medium">Allow Sharing</p>
                          <p className="text-slate-400 text-sm">Guests can share media to social platforms</p>
                        </div>
                      </label>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <h3 className="text-purple-300 font-semibold mb-3">Event Summary</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-500">Name:</span> {formData.name || 'Not set'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-500">Date:</span> {formData.date || 'Not set'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-500">Location:</span> {formData.location || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
                    >
                      ← Back
                    </button>
                  )}
                  
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={step === 1 && (!formData.name || !formData.description)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <span>🚀</span> Create Event
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Cancel Link */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Cancel and go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </ProtectedRoute>
  );
}
