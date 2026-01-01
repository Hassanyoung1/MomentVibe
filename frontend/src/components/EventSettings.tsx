'use client';

import React, { useState } from 'react';
import { eventService } from '@/services/eventService';

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  allowDownload: boolean;
  allowSharing: boolean;
  expiresAt: string;
}

interface EventSettingsProps {
  event: Event;
  eventId: string;
  onUpdate: () => void;
}

export function EventSettings({ event, eventId, onUpdate }: EventSettingsProps) {
  const [permissions, setPermissions] = useState({
    allowDownload: event.allowDownload,
    allowSharing: event.allowSharing,
  });
  const [expirationDate, setExpirationDate] = useState(
    new Date(event.expiresAt).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePermissions = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await eventService.updatePermissions(
        eventId,
        permissions.allowDownload,
        permissions.allowSharing
      );
      setSuccess('Permissions updated successfully');
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendExpiration = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await eventService.extendExpiration(eventId, expirationDate);
      setSuccess('Expiration date updated successfully');
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update expiration date');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await eventService.downloadAllMedia(eventId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.name}-media.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess('Download started');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to download media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Event Settings</h2>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Permissions */}
      <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Permissions</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={permissions.allowDownload}
              onChange={(e) =>
                setPermissions({ ...permissions, allowDownload: e.target.checked })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-5 w-5"
            />
            <span className="ml-3 text-slate-300">Allow guests to download media</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={permissions.allowSharing}
              onChange={(e) =>
                setPermissions({ ...permissions, allowSharing: e.target.checked })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-5 w-5"
            />
            <span className="ml-3 text-slate-300">Allow guests to share media</span>
          </label>
          <button
            onClick={handleUpdatePermissions}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Permissions'}
          </button>
        </div>
      </div>

      {/* Expiration */}
      <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Expiration Date</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Expiration Date
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleExtendExpiration}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Extend Expiration'}
          </button>
        </div>
      </div>

      {/* Download All */}
      <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Download All Media</h3>
        <p className="text-slate-400 text-sm mb-4">
          Download all media from this event as a ZIP file.
        </p>
        <button
          onClick={handleDownloadAll}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Preparing...' : 'Download All Media'}
        </button>
      </div>
    </div>
  );
}





