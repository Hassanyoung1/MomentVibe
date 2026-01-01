"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function Feature({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-slate-800/40 border border-purple-500/10 rounded-xl p-6 text-left hover:shadow-lg transition">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-600/20 text-purple-300 text-xl">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">Capture & share moments that matter</h1>
            <p className="text-lg text-slate-300 mb-6">Create event albums, invite guests, and collect photos and reactions — all in one beautiful place.</p>

            <div className="flex gap-4 flex-wrap">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="px-6 py-3 bg-blue-600 rounded-md font-semibold">Go to Dashboard</Link>
                  <Link href="/events/create" className="px-6 py-3 border border-purple-500 text-purple-300 rounded-md">Create Event</Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="px-6 py-3 bg-blue-600 rounded-md font-semibold">Get Started</Link>
                  <Link href="/login" className="px-6 py-3 border border-slate-700 text-slate-200 rounded-md">Login</Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="w-full h-80 bg-gradient-to-tr from-purple-700 to-pink-500 rounded-2xl flex items-center justify-center text-6xl font-bold text-white">📸</div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold mb-6">Why MomentVibe?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature title="Easy Photo Sharing" description="Guests can upload photos and videos directly to event albums from any device." icon="📸" />
            <Feature title="Event Management" description="Create events with expiration, permissions, and custom settings." icon="🎉" />
            <Feature title="Guest Engagement" description="Allow guests to react and leave messages on shared moments." icon="💬" />
            <Feature title="Secure Access" description="JWT-based auth and link-based sharing to control who sees your moments." icon="🔐" />
            <Feature title="Fast & Reliable" description="Built on Next.js and a lightweight backend for speedy delivery." icon="⚡" />
            <Feature title="Mobile Friendly" description="Responsive UI designed for both phones and desktops." icon="📱" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-slate-400 text-sm flex justify-between">
          <div>© {new Date().getFullYear()} MomentVibe</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}