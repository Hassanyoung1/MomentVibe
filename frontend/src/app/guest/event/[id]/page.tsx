'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
import { eventService } from '@/services/eventService';
import { mediaService } from '@/services/mediaService';
import Link from 'next/link';

interface Media {
  _id: string;
  filename: string;
  type: 'photo' | 'video';
  url?: string;
  thumbnailUrl?: string;
  fileId?: string;
  createdAt: string;
}

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  allowDownload: boolean;
  allowSharing: boolean;
}

// Background component
function GuestBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
          <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
          <Sparkles count={50} scale={15} size={2} speed={0.2} color="#ec4899" />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Media card component
function MediaCard({ 
  media, 
  allowDownload, 
  onView 
}: { 
  media: Media; 
  allowDownload: boolean;
  onView: (media: Media) => void;
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const imageUrl = media.url || media.thumbnailUrl || `${API_BASE_URL}/media/file/${media.fileId}`;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!allowDownload) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/media/download/${media._id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.filename || `media-${media._id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div 
      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 transition-all"
      onClick={() => onView(media)}
    >
      {media.type === 'photo' ? (
        <img 
          src={imageUrl} 
          alt={media.filename}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <span className="text-5xl">🎬</span>
            <p className="text-slate-400 text-sm mt-2">Video</p>
          </div>
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
          <span className="text-white text-sm truncate flex-1">
            {media.type === 'photo' ? '📷' : '🎬'} {media.filename?.slice(0, 20)}
          </span>
          {allowDownload && (
            <button
              onClick={handleDownload}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              title="Download"
            >
              ⬇️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Lightbox component
function Lightbox({ 
  media, 
  allowDownload, 
  onClose 
}: { 
  media: Media; 
  allowDownload: boolean;
  onClose: () => void;
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const imageUrl = media.url || `${API_BASE_URL}/media/file/${media.fileId}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/media/download/${media._id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.filename || `media-${media._id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] p-4"
        onClick={e => e.stopPropagation()}
      >
        {media.type === 'photo' ? (
          <img 
            src={imageUrl} 
            alt={media.filename}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        ) : (
          <video 
            src={imageUrl}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-lg"
          />
        )}
        
        <div className="flex justify-center gap-4 mt-4">
          {allowDownload && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              ⬇️ Download
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}

function GuestEventContent() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventData, mediaData] = await Promise.all([
        eventService.getEvent(eventId),
        mediaService.getEventMedia(eventId)
      ]);
      setEvent(eventData);
      setMedia(mediaData);
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event. It may have expired or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading event gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-red-400 text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-slate-300 mb-6">{error || 'The event could not be found or may have expired.'}</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Event Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm mb-4">
            <span>📸</span> Event Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {event.name}
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{event.description}</p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href={`/guest/upload?eventId=${eventId}`}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              📤 Upload Photos
            </Link>
          </div>
          
          {/* Permissions Info */}
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${event.allowDownload ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {event.allowDownload ? '✅ Downloads Enabled' : '❌ Downloads Disabled'}
            </span>
            <span className={`px-3 py-1 rounded-full ${event.allowSharing ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {event.allowSharing ? '✅ Sharing Enabled' : '❌ Sharing Disabled'}
            </span>
          </div>
        </div>

        {/* Media Gallery */}
        {media.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Photos Yet</h3>
            <p className="text-slate-400 mb-6">Be the first to upload photos to this event!</p>
            <Link
              href={`/guest/upload?eventId=${eventId}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all"
            >
              📤 Upload Photos
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                📸 {media.length} Photo{media.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {media.map((item) => (
                <MediaCard
                  key={item._id}
                  media={item}
                  allowDownload={event.allowDownload}
                  onView={setSelectedMedia}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-purple-400 font-medium">MomentVibe</span>
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <Lightbox
          media={selectedMedia}
          allowDownload={event.allowDownload}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}

export default function GuestEventPage() {
  return (
    <div className="min-h-screen relative bg-slate-900">
      <GuestBackground />
      <div className="relative z-10">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        }>
          <GuestEventContent />
        </Suspense>
      </div>
    </div>
  );
}
