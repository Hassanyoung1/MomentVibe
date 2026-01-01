'use client';

import React, { useState, useEffect } from 'react';
import { guestbookService } from '@/services/guestbookService';

interface GuestbookMessage {
  _id: string;
  eventId: string;
  guestName: string;
  guestEmail?: string;
  message: string;
  createdAt: string;
  reactions?: {
    like?: number;
    love?: number;
    laugh?: number;
  };
}

interface GuestbookProps {
  eventId: string;
}

const REACTION_EMOJIS = [
  { emoji: '👍', type: 'like' },
  { emoji: '❤️', type: 'love' },
  { emoji: '😂', type: 'laugh' },
];

export function Guestbook({ eventId }: GuestbookProps) {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [eventId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await guestbookService.getMessages(eventId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load guestbook messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName.trim() || !formData.message.trim()) {
      setError('Name and message are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await guestbookService.addMessage(
        eventId,
        formData.guestName,
        formData.message,
        formData.guestEmail || undefined
      );
      setFormData({ guestName: '', guestEmail: '', message: '' });
      setShowForm(false);
      loadMessages();
    } catch (err: any) {
      setError(err.message || 'Failed to add message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Map emoji to reaction type for backend
      const reactionTypeMap: Record<string, string> = {
        '👍': 'like',
        '❤️': 'love',
        '😂': 'laugh',
        '😊': 'smile',
        '🎉': 'celebrate',
      };
      const reactionType = reactionTypeMap[emoji] || 'like';
      await guestbookService.addReaction(messageId, reactionType);
      loadMessages();
    } catch (err: any) {
      console.error('Failed to add reaction:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading guestbook...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Guestbook</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
          {showForm ? 'Cancel' : '+ Add Message'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Leave a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                placeholder="Share your thoughts..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Message'}
            </button>
          </form>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg">
          <p className="text-slate-400">No messages yet. Be the first to leave a message!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-white">{message.guestName}</h4>
                  <p className="text-sm text-slate-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-slate-300 mb-4 whitespace-pre-wrap">{message.message}</p>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                {REACTION_EMOJIS.map((reaction) => {
                  const count = message.reactions?.[reaction.type as keyof typeof message.reactions] || 0;
                  return (
                    <button
                      key={reaction.type}
                      onClick={() => handleReaction(message._id, reaction.emoji)}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition"
                    >
                      <span>{reaction.emoji}</span>
                      {count > 0 && <span className="text-sm text-slate-300">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

