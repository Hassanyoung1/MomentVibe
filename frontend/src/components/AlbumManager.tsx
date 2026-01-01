'use client';

import React, { useState, useEffect } from 'react';
import { albumService } from '@/services/albumService';
import { MediaGallery } from './MediaGallery';

interface Album {
  _id: string;
  eventId: string;
  name: string;
  description?: string;
  type?: 'behind-the-scenes' | 'main-event' | 'custom';
  createdAt: string;
  mediaCount?: number;
}

interface AlbumManagerProps {
  eventId: string;
  isHost: boolean;
}

export function AlbumManager({ eventId, isHost }: AlbumManagerProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '' });

  useEffect(() => {
    loadAlbums();
  }, [eventId]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await albumService.getEventAlbums(eventId);
      setAlbums(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.name.trim()) {
      setError('Album name is required');
      return;
    }

    try {
      await albumService.createAlbum(eventId, newAlbum);
      setNewAlbum({ name: '', description: '' });
      setShowCreateForm(false);
      loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Failed to create album');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Are you sure you want to delete this album? Media will not be deleted.')) {
      return;
    }

    try {
      await albumService.deleteAlbum(albumId);
      loadAlbums();
      if (selectedAlbum === albumId) {
        setSelectedAlbum(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete album');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading albums...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Albums</h2>
        {isHost && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            {showCreateForm ? 'Cancel' : '+ Create Album'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {showCreateForm && isHost && (
        <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Album</h3>
          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Album Name *
              </label>
              <input
                type="text"
                value={newAlbum.name}
                onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g., Reception Photos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={newAlbum.description}
                onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Optional description..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              Create Album
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className={`bg-slate-800/50 border rounded-lg p-6 cursor-pointer transition ${
            selectedAlbum === null
              ? 'border-purple-500'
              : 'border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedAlbum(null)}
        >
          <h3 className="text-xl font-semibold mb-2">All Media</h3>
          <p className="text-slate-400 text-sm">View all media in this event</p>
        </div>
        {albums.map((album) => (
          <div
            key={album._id}
            className={`bg-slate-800/50 border rounded-lg p-6 cursor-pointer transition relative group ${
              selectedAlbum === album._id
                ? 'border-purple-500'
                : 'border-slate-700 hover:border-slate-600'
            }`}
            onClick={() => setSelectedAlbum(album._id)}
          >
            {isHost && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAlbum(album._id);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition"
              >
                Delete
              </button>
            )}
            <h3 className="text-xl font-semibold mb-2">{album.name}</h3>
            {album.description && (
              <p className="text-slate-400 text-sm mb-2">{album.description}</p>
            )}
            <p className="text-slate-500 text-xs">
              {album.mediaCount || 0} items
            </p>
          </div>
        ))}
      </div>

      {selectedAlbum !== null && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            {selectedAlbum ? albums.find((a) => a._id === selectedAlbum)?.name : 'All Media'}
          </h3>
          <MediaGallery eventId={eventId} isHost={isHost} albumId={selectedAlbum || undefined} />
        </div>
      )}
    </div>
  );
}





