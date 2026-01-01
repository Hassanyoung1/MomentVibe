'use client';

import React, { useState, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getHostEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading events...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Events</h1>
              <p className="text-slate-400">Welcome back, {user?.name || 'User'}!</p>
            </div>
            <Link
              href="/events/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              + Create Event
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {events.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-2xl font-bold mb-4">No events yet</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Create your first event to start collecting and sharing memories with your guests!
              </p>
              <Link
                href="/events/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition"
              >
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const expired = isExpired(event.expiresAt);
                return (
                  <Link key={event._id} href={`/events/${event._id}`}>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition cursor-pointer h-full flex flex-col">
                      {expired && (
                        <div className="mb-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold">
                          Expired
                        </div>
                      )}
                      <h2 className="text-xl font-semibold mb-2 text-white">{event.name}</h2>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
                        {event.description}
                      </p>
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
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          <span>Expires: {event.expiresAt ? new Date(event.expiresAt).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
