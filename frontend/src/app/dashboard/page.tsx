'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { eventService } from '@/services/eventService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';

// Dynamically import Three.js components to avoid SSR issues
const DashboardScene = dynamic(
  () => import('@/components/three/DashboardScene').then(mod => ({ default: mod.DashboardScene })),
  { ssr: false, loading: () => <DashboardLoading /> }
);

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  createdAt: string;
  expiresAt?: string;
  allowDownload?: boolean;
  allowSharing?: boolean;
  media?: string[];
  guests?: string[];
}

function DashboardLoading() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-slate-900/50 rounded-xl backdrop-blur-md border border-purple-500/20">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-purple-400 text-lg">Loading 3D Dashboard...</p>
      </div>
    </div>
  );
}

function EventCard({ event, expired }: { event: Event; expired: boolean }) {
  return (
    <Link href={`/events/${event._id}`}>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition cursor-pointer h-full flex flex-col group">
        {expired && (
          <div className="mb-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold w-fit">
            Expired
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition">{event.name}</h2>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
          {event.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-purple-500/20 rounded-full text-purple-300 text-xs">
            📸 {event.media?.length || 0} photos
          </span>
          <span className="px-2 py-1 bg-pink-500/20 rounded-full text-pink-300 text-xs">
            👥 {event.guests?.length || 0} guests
          </span>
        </div>
        <div className="space-y-2 text-sm text-slate-300 border-t border-slate-700 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getHostEvents();
      setEvents(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load events';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleEventClick = (id: string) => {
    router.push(`/events/${id}`);
  };

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  // Transform events for 3D scene
  const events3D = events.map(event => ({
    id: event._id,
    name: event.name,
    date: event.date,
    description: event.description,
    mediaCount: event.media?.length || 0,
    guestCount: event.guests?.length || 0,
  }));

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <DashboardLoading />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Events
              </h1>
              <p className="text-slate-400">Welcome back, {user?.name || 'User'}! 🎉</p>
            </div>
            <div className="flex gap-3">
              {/* View Toggle */}
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-purple-500/20">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === '3d' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌐 3D View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📋 Grid View
                </button>
              </div>
              
              <Link href="/events/create">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  ✨ Create Event
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
              <button 
                onClick={loadEvents}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Try again
              </button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{events.length}</div>
              <div className="text-sm text-slate-400">Total Events</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-pink-400">
                {events.reduce((sum, e) => sum + (e.media?.length || 0), 0)}
              </div>
              <div className="text-sm text-slate-400">Total Photos</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {events.reduce((sum, e) => sum + (e.guests?.length || 0), 0)}
              </div>
              <div className="text-sm text-slate-400">Total Guests</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {events.filter(e => !isExpired(e.expiresAt)).length}
              </div>
              <div className="text-sm text-slate-400">Active Events</div>
            </div>
          </div>

          {/* Main Content */}
          {viewMode === '3d' ? (
            <div className="rounded-xl overflow-hidden border border-purple-500/20">
              <DashboardScene
                events={events3D}
                onEventClick={handleEventClick}
                onCreateEvent={handleCreateEvent}
                userName={user?.name}
              />
              <div className="bg-slate-800/50 backdrop-blur-md p-4 text-center text-sm text-slate-400 border-t border-purple-500/20">
                🖱️ Click and drag to rotate • Scroll to zoom • Click on events to view details
              </div>
            </div>
          ) : (
            <>
              {events.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl">
                  <div className="text-6xl mb-4">📸</div>
                  <h2 className="text-2xl font-bold mb-4">No events yet</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Create your first event to start collecting and sharing memories with your guests!
                  </p>
                  <Link href="/events/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      ✨ Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      expired={isExpired(event.expiresAt)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
