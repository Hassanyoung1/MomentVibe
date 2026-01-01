'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { mediaService } from '@/services/mediaService';
import { eventService } from '@/services/eventService';

export default function GuestUploadPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const guestToken = searchParams.get('guestToken');
  
  const [event, setEvent] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
      setGuestName('');
      setGuestEmail('');
      setPreview(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-4">Event Not Found</h2>
          <p className="text-white">{error || 'The event could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <p className="text-slate-400 mb-8">{event.description}</p>

          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Your Photos & Videos</h2>
            <p className="text-slate-300 text-sm">
              Share your favorite moments from the event! Upload photos and videos to contribute to the event gallery.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              Media uploaded successfully! Thank you for sharing.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select File *
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                required
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="max-w-full rounded-lg" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-sm text-center">
              You can upload multiple files by refreshing this page and uploading again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}





