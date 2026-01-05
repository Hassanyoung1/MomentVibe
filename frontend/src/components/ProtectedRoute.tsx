'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Allow a small delay for context to initialize
    if (isLoading) {
      return;
    }

    setHasChecked(true);

    if (!isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login. isLoading:', isLoading, 'user:', user);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading state while checking authentication
  if (isLoading || !hasChecked) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated after check, return null (router is redirecting)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
