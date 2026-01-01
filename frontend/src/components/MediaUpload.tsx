'use client';

import React, { useState } from 'react';
import { mediaService } from '@/services/mediaService';

interface MediaUploadProps {
  eventId: string;
  albumId?: string;
  onUploadComplete?: () => void;
}

export function MediaUpload({ eventId, albumId, onUploadComplete }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess(false);
      
      // Create preview
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

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      await mediaService.uploadMedia({
        eventId,
        file,
        caption: caption || undefined,
        albumId,
      });
      setSuccess(true);
      setFile(null);
      setCaption('');
      setPreview(null);
      if (onUploadComplete) {
        setTimeout(() => {
          onUploadComplete();
          setSuccess(false);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select File
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
          {preview && (
            <div className="mt-4">
              <img src={preview} alt="Preview" className="max-w-xs rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Caption (Optional)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            placeholder="Add a caption..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            Media uploaded successfully!
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setCaption('');
              setPreview(null);
              setError('');
              setSuccess(false);
            }}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}





