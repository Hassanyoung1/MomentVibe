'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              MomentVibe
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-slate-300 hover:text-white font-medium transition">
                  Dashboard
                </Link>
                <Link href="/events/create" className="text-slate-300 hover:text-white font-medium transition">
                  Create Event
                </Link>
                <div className="relative group">
                  <button className="text-slate-300 hover:text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition">
                    {user?.name || 'Account'} ▼
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-purple-500/20 rounded-lg shadow-xl hidden group-hover:block">
                    <div className="px-4 py-2 text-slate-400 text-sm border-b border-slate-700">
                      {user?.email}
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-slate-300 hover:bg-slate-700 transition">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white font-medium transition">
                  Login
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
