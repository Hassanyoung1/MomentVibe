'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken();
    if (token) {
      // Try to get user from localStorage if available
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    authService.setToken(response.token);
    if (response.user) {
      const userData = {
        id: response.user._id || response.user.id,
        name: response.user.name || '',
        email: response.user.email || '',
        role: response.user.role || 'host',
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password });
    // Registration returns a message, user needs to confirm email before logging in
    // If token is present (auto-login), handle it
    if (response.token) {
      authService.setToken(response.token);
      if (response.user) {
        const userData = {
          id: response.user._id || response.user.id,
          name: response.user.name || '',
          email: response.user.email || '',
          role: response.user.role || 'host',
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    // Return response for showing success message
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
