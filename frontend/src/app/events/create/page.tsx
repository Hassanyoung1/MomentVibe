'use client';

import React, { useState } from 'react';
import { eventService } from '@/services/eventService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    allowDownload: true,
    allowShare: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const event = await eventService.createEvent(formData);
      router.push(`/events/${event._id}`);
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              placeholder="e.g., Sarah's Wedding"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Event Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g., Banquet Hall, NYC"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-300">Permissions</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="allowDownload"
                checked={formData.allowDownload}
                onChange={handleChange}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              <span className="ml-3 text-slate-300">Allow guests to download media</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="allowShare"
                checked={formData.allowShare}
                onChange={handleChange}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              <span className="ml-3 text-slate-300">Allow guests to share media</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
    </ProtectedRoute>
  );
}
