'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { eventService } from '@/services/eventService';
import { mediaService } from '@/services/mediaService';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MediaGallery } from '@/components/MediaGallery';
import { AlbumManager } from '@/components/AlbumManager';
import { Guestbook } from '@/components/Guestbook';
import { EventSettings } from '@/components/EventSettings';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components
const EventDetailScene = dynamic(
  () => import('@/components/three/EventDetailScene').then(mod => ({ default: mod.EventDetailScene })),
  { ssr: false, loading: () => <SceneLoading /> }
);

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
  host?: string | {
    _id: string;
    name: string;
    email: string;
  };
  media?: string[];
  guests?: { _id: string; name: string }[];
  qrCodeUrl?: string;
  qrCodeImage?: string;
  guestViewUrl?: string;
}

interface MediaItem {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  title?: string;
  uploadedBy?: string;
  createdAt?: string;
}

type TabType = 'overview' | '3d-gallery' | 'media' | 'albums' | 'guestbook' | 'settings';

function SceneLoading() {
  return (
    <div className="w-full h-[700px] flex items-center justify-center bg-slate-900/50 rounded-xl backdrop-blur-md border border-purple-500/20">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-purple-400 text-lg">Loading 3D Gallery...</p>
      </div>
    </div>
  );
}

function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-purple-400 text-lg">Loading event...</p>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (event && (activeTab === '3d-gallery' || activeTab === 'media')) {
      loadMedia();
    }
  }, [event, activeTab]);

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

  const loadMedia = async () => {
    try {
      setMediaLoading(true);
      const media = await mediaService.getEventMedia(eventId);
      setMediaItems(media);
    } catch (err: any) {
      console.error('Failed to load media:', err);
    } finally {
      setMediaLoading(false);
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

  const handleMediaClick = useCallback((media: any) => {
    console.log('Media clicked:', media);
    // Could open a modal or full-screen viewer
  }, []);

  const handleUpload = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // Check if current user is the host
  // The event.host can be either a string (ObjectId) or populated object
  const getHostId = (event: Event | null): string | undefined => {
    if (!event) return undefined;
    if (typeof event.host === 'string') return event.host;
    if (event.host && typeof event.host === 'object') return event.host._id;
    return event.hostId;
  };
  
  const hostId = getHostId(event);
  const isHost = !!(user && hostId && user.id === hostId);

  // Debug logging only when we have event data
  useEffect(() => {
    if (event) {
      console.log('Host check (event loaded):', { 
        userId: user?.id, 
        hostId, 
        isHost, 
        eventHost: event?.host,
        eventLoaded: !!event 
      });
    }
  }, [event, user, hostId, isHost]);

  if (loading) {
    return <PageLoading />;
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-red-400 text-xl font-bold mb-4">Error Loading Event</h2>
          <p className="text-white mb-6">{error}</p>
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // Transform media for 3D scene
  const media3D = mediaItems.map(m => ({
    id: m._id,
    url: m.url,
    thumbnailUrl: m.thumbnailUrl || m.url,
    type: m.type as 'image' | 'video',
    title: m.title,
    uploadedBy: m.uploadedBy,
    createdAt: m.createdAt,
  }));

  const event3D = {
    id: event._id,
    name: event.name,
    date: event.date,
    description: event.description,
    location: event.location,
    media: media3D,
    guests: event.guests?.map(g => ({ id: g._id, name: g.name })) || [],
    allowDownload: event.allowDownload,
    allowShare: event.allowSharing,
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: '3d-gallery', label: '3D Gallery', icon: '🌐' },
    { key: 'media', label: 'Media', icon: '📸' },
    { key: 'albums', label: 'Albums', icon: '📁' },
    { key: 'guestbook', label: 'Guestbook', icon: '💬' },
    ...(isHost ? [{ key: 'settings' as TabType, label: 'Settings', icon: '⚙️' }] : []),
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2 transition">
              <span>←</span> Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mt-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {event.name}
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl">{event.description}</p>
              </div>
              {isHost && (
                <div className="flex gap-3 shrink-0">
                  <Link href={`/events/${eventId}/edit`}>
                    <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20">
                      ✏️ Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    onClick={handleDeleteEvent}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">📅 Event Date</div>
              <div className="text-lg font-semibold">{new Date(event.date).toLocaleDateString()}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">📍 Location</div>
              <div className="text-lg font-semibold">{event.location || 'Not specified'}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">📸 Media</div>
              <div className="text-lg font-semibold">{mediaItems.length} items</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">⏰ Expires</div>
              <div className="text-lg font-semibold">{new Date(event.expiresAt).toLocaleDateString()}</div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-300 hover:text-white">✕</button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="flex border-b border-purple-500/20 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-b-2 border-purple-500 text-purple-400 bg-purple-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <OverviewTab event={event} eventId={eventId} isHost={isHost || false} />
              )}
              
              {activeTab === '3d-gallery' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">🌐 3D Gallery Experience</h2>
                    <Button onClick={handleUpload} className="bg-gradient-to-r from-purple-600 to-pink-600">
                      📤 Upload Media
                    </Button>
                  </div>
                  <p className="text-slate-400">
                    Explore your photos and videos in an immersive 3D carousel. Click and drag to rotate, scroll to zoom.
                  </p>
                  {mediaLoading ? (
                    <SceneLoading />
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-purple-500/20">
                      <EventDetailScene
                        event={event3D}
                        onMediaClick={handleMediaClick}
                        onBack={handleBack}
                        onUpload={handleUpload}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'media' && (
                <MediaGallery eventId={eventId} isHost={isHost || false} />
              )}
              
              {activeTab === 'albums' && (
                <AlbumManager eventId={eventId} isHost={isHost || false} />
              )}
              
              {activeTab === 'guestbook' && (
                <Guestbook eventId={eventId} />
              )}
              
              {activeTab === 'settings' && isHost && (
                <EventSettings event={event} eventId={eventId} onUpdate={loadEventDetails} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          eventId={eventId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadMedia();
          }}
        />
      )}
    </ProtectedRoute>
  );
}

function OverviewTab({ event, eventId, isHost }: { event: Event; eventId: string; isHost: boolean }) {
  const [qrCode, setQrCode] = useState<{ qrImage: string; qrUploadUrl: string; guestViewUrl?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize QR code from event data when component mounts or event changes
  useEffect(() => {
    if (event.qrCodeImage && event.qrCodeUrl) {
      setQrCode({ 
        qrImage: event.qrCodeImage, 
        qrUploadUrl: event.qrCodeUrl, 
        guestViewUrl: event.guestViewUrl 
      });
    }
  }, [event]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Generating QR for event:', eventId);
      const qr = await eventService.generateGuestQRCode(eventId);
      console.log('QR generated:', qr);
      setQrCode({ qrImage: qr.qrImage, qrUploadUrl: qr.qrUploadUrl });
    } catch (err: unknown) {
      console.error('Failed to generate QR code:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Build guest view URL
  const guestViewUrl = qrCode?.guestViewUrl || `${window.location.origin}/guest/event/${eventId}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Event Overview</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
        </div>
      </div>

      {isHost && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            📱 Guest QR Code
          </h3>
          <p className="text-slate-300 mb-4">
            Share this QR code with guests so they can upload photos, view the gallery, and download pictures.
          </p>
          
          {!qrCode && (
            <Button
              onClick={generateQR}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? '⏳ Generating...' : '✨ Generate QR Code'}
            </Button>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {qrCode && (
            <div className="mt-4">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img src={qrCode.qrImage} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <p className="mt-3 text-sm text-slate-400 text-center">
                    Scan to upload photos
                  </p>
                </div>
                
                {/* Quick Links */}
                <div className="flex-1 space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      📤 Guest Upload Link
                    </h4>
                    <a
                      href={qrCode.qrUploadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all"
                    >
                      {qrCode.qrUploadUrl}
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(qrCode.qrUploadUrl)}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      📸 Guest Gallery Link
                    </h4>
                    <a
                      href={guestViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all"
                    >
                      {guestViewUrl}
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(guestViewUrl)}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                  
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>✅ Guests can upload photos & videos</p>
                    <p>✅ Guests can view all event media</p>
                    <p>{event.allowDownload ? '✅' : '❌'} Guests can download media</p>
                  </div>
                  
                  <Button
                    onClick={generateQR}
                    disabled={loading}
                    variant="outline"
                    className="text-sm"
                  >
                    🔄 Regenerate QR Code
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
            🔐 Permissions
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Download Media</span>
              <span className={`px-3 py-1 rounded-full text-sm ${event.allowDownload ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {event.allowDownload ? '✅ Allowed' : '❌ Disabled'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Share Media</span>
              <span className={`px-3 py-1 rounded-full text-sm ${event.allowSharing ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {event.allowSharing ? '✅ Allowed' : '❌ Disabled'}
              </span>
            </li>
          </ul>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
            📅 Event Timeline
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Event Date</span>
              <span className="text-white font-medium">{new Date(event.date).toLocaleDateString()}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-slate-300">Expires</span>
              <span className="text-white font-medium">{new Date(event.expiresAt).toLocaleDateString()}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ 
  eventId, 
  onClose, 
  onSuccess 
}: { 
  eventId: string; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('eventId', eventId);

      await mediaService.uploadMedia(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📤 Upload Media</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-5xl mb-4">📁</div>
              <p className="text-slate-300">
                {selectedFile ? selectedFile.name : 'Click to select a file'}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Supports images and videos
              </p>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? '⏳ Uploading...' : '✨ Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
