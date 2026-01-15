'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📸</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MomentVibe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-white font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  className="text-slate-300 hover:text-white font-medium transition"
                >
                  Events
                </Link>
                <Link
                  href="/events/create"
                  className="text-slate-300 hover:text-white font-medium transition"
                >
                  Create Event
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline">{user?.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-purple-500/20 rounded-lg shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white font-medium transition"
                >
                  Login
                </Link>
                <Button asChild variant="primary" size="sm">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Events
                </Link>
                <Link
                  href="/events/create"
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Create Event
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
