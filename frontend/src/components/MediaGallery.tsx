'use client';

import React, { useState, useEffect } from 'react';
import { mediaService } from '@/services/mediaService';
import { MediaUpload } from './MediaUpload';

interface Media {
  _id: string;
  fileName: string;
  fileId: string;
  fileType?: 'image' | 'video';
  caption?: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  } | string;
  uploadedAt: string;
  visibility: 'hidden' | 'visible';
  approved: boolean;
  albumId?: string;
  downloads?: number;
}

interface MediaGalleryProps {
  eventId: string;
  isHost: boolean;
  albumId?: string;
}

export function MediaGallery({ eventId, isHost, albumId }: MediaGalleryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    loadMedia();
  }, [eventId, albumId]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getEventMedia(eventId);
      // Filter by album if specified
      const filtered = albumId ? data.filter((m: Media) => m.albumId === albumId) : data;
      setMedia(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mediaId: string) => {
    if (!isHost) return;
    try {
      await mediaService.approveMedia(mediaId);
      loadMedia();
    } catch (err: any) {
      setError(err.message || 'Failed to approve media');
    }
  };

  const handleDownload = async (mediaId: string) => {
    try {
      const blob = await mediaService.downloadMedia(mediaId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-${mediaId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download media');
    }
  };

  const getMediaUrl = (fileId: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${API_BASE_URL}/media/file/${fileId}`;
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading media...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Media Gallery</h2>
        {isHost && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            {showUpload ? 'Cancel Upload' : '+ Upload Media'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {showUpload && isHost && (
        <MediaUpload eventId={eventId} albumId={albumId} onUploadComplete={loadMedia} />
      )}

      {media.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg">
          <p className="text-slate-400">No media uploaded yet.</p>
          {isHost && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              Upload First Media
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item._id}
              className="group relative bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition"
              onClick={() => setSelectedMedia(item)}
            >
              {item.fileType === 'video' ? (
                <video
                  src={getMediaUrl(item.fileId)}
                  className="w-full h-48 object-cover"
                  controls={false}
                />
              ) : (
                <img
                  src={getMediaUrl(item.fileId)}
                  alt={item.caption || item.fileName}
                  className="w-full h-48 object-cover"
                />
              )}
              {!item.approved && isHost && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                  Pending
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                {isHost && !item.approved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(item._id);
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item._id);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Download
                </button>
              </div>
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center z-10"
            >
              ×
            </button>
            {selectedMedia.fileType === 'video' ? (
              <video
                src={getMediaUrl(selectedMedia.fileId)}
                controls
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            ) : (
              <img
                src={getMediaUrl(selectedMedia.fileId)}
                alt={selectedMedia.caption || selectedMedia.fileName}
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            )}
            {selectedMedia.caption && (
              <div className="mt-4 bg-slate-800/90 rounded-lg p-4">
                <p className="text-white">{selectedMedia.caption}</p>
                <p className="text-slate-400 text-sm mt-2">
                  Uploaded by: {typeof selectedMedia.uploadedBy === 'object' ? selectedMedia.uploadedBy.name : 'Unknown'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

