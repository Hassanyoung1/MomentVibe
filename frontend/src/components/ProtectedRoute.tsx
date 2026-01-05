'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // First check: if still loading, wait
    if (isLoading) {
      return;
    }

    // Second check: look at actual authentication state
    const hasToken = authService.getToken() !== null;
    const hasUser = !!user || localStorage.getItem('user') !== null;
    
    console.log('ProtectedRoute check:', {
      isAuthenticated,
      isLoading,
      hasToken,
      hasUser,
      userObj: user
    });

    if (!isAuthenticated && !hasToken && !hasUser) {
      console.log('No authentication found, redirecting to login');
      router.push('/login');
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, isLoading, user, router]);

  // While loading auth context, show loading
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  // If not ready, show loading
  if (!isReady) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  return <>{children}</>;
}
