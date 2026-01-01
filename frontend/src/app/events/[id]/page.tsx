'use client';

import React, { useState, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import { mediaService } from '@/services/mediaService';
import { albumService } from '@/services/albumService';
import { guestbookService } from '@/services/guestbookService';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MediaGallery } from '@/components/MediaGallery';
import { AlbumManager } from '@/components/AlbumManager';
import { Guestbook } from '@/components/Guestbook';
import { EventSettings } from '@/components/EventSettings';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import Link from 'next/link';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  allowDownload: boolean;
  allowSharing: boolean;
  expiresAt: string;
  hostId?: string;
  host?: {
    _id: string;
    name: string;
    email: string;
  };
}

type TabType = 'overview' | 'media' | 'albums' | 'guestbook' | 'settings';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const eventData = await eventService.getEvent(eventId);
      setEvent(eventData);
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    try {
      await eventService.deleteEvent(eventId);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  const isHost = user && event && (user.id === event.hostId || user.id === event.host?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-4">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
                <p className="text-slate-300 text-lg">{event.description}</p>
              </div>
              {isHost && (
                <div className="flex gap-3">
                  <Link
                    href={`/events/${eventId}/edit`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-1">Event Date</div>
              <div className="text-xl font-semibold">{new Date(event.date).toLocaleDateString()}</div>
            </div>
            {event.location && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                <div className="text-slate-400 text-sm mb-1">Location</div>
                <div className="text-xl font-semibold">{event.location}</div>
              </div>
            )}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-1">Expires</div>
              <div className="text-xl font-semibold">{new Date(event.expiresAt).toLocaleDateString()}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <div className="text-slate-400 text-sm mb-1">Permissions</div>
              <div className="text-sm">
                <div>Download: {event.allowDownload ? '✅' : '❌'}</div>
                <div>Share: {event.allowSharing ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="flex border-b border-purple-500/20 overflow-x-auto">
              {(['overview', 'media', 'albums', 'guestbook', 'settings'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium capitalize transition whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-500 text-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <OverviewTab event={event} eventId={eventId} isHost={isHost || false} />
              )}
              {activeTab === 'media' && <MediaGallery eventId={eventId} isHost={isHost || false} />}
              {activeTab === 'albums' && <AlbumManager eventId={eventId} isHost={isHost || false} />}
              {activeTab === 'guestbook' && <Guestbook eventId={eventId} />}
              {activeTab === 'settings' && isHost && (
                <EventSettings event={event} eventId={eventId} onUpdate={loadEventDetails} />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function OverviewTab({ event, eventId, isHost }: { event: Event; eventId: string; isHost: boolean }) {
  const [qrCode, setQrCode] = useState<{ qrImage: string; qrUploadUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    try {
      setLoading(true);
      const qr = await eventService.generateGuestQRCode(eventId);
      setQrCode({ qrImage: qr.qrImage, qrUploadUrl: qr.qrUploadUrl });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Event Overview</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300">{event.description}</p>
        </div>
      </div>

      {isHost && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Guest Upload QR Code</h3>
          <p className="text-slate-300 mb-4">
            Generate a QR code that guests can scan to upload photos and videos to this event.
          </p>
          <button
            onClick={generateQR}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
          {qrCode && (
            <div className="mt-6 flex flex-col items-center">
              <img src={qrCode.qrImage} alt="QR Code" className="w-64 h-64 bg-white p-4 rounded-lg" />
              <p className="mt-4 text-sm text-slate-400">Share this QR code with your guests</p>
              <a
                href={qrCode.qrUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Open Upload Page →
              </a>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Permissions</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>Download: {event.allowDownload ? 'Allowed' : 'Not Allowed'}</li>
            <li>Sharing: {event.allowSharing ? 'Allowed' : 'Not Allowed'}</li>
          </ul>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Event Details</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>Date: {new Date(event.date).toLocaleDateString()}</li>
            <li>Expires: {new Date(event.expiresAt).toLocaleDateString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
