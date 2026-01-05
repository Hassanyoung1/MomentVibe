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
    // This effect runs only on client side
    try {
      // Check if user is already logged in by checking both token and stored user
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      console.log('AuthProvider init: token exists?', !!token, 'storedUser exists?', !!storedUserStr);
      
      if (token && storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          console.log('AuthProvider: Loading stored user:', storedUser);
          setUser(storedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    } catch (error) {
      console.error('Error in AuthProvider initialization:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      console.log('AuthContext login: Received response', response);
      authService.setToken(response.token);
      console.log('AuthContext login: Token saved to localStorage');
      
      if (response.user) {
        const userData = {
          id: response.user._id || response.user.id,
          name: response.user.name || '',
          email: response.user.email || '',
          role: response.user.role || 'host',
        };
        console.log('AuthContext login: Saving user data:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthContext login: User saved to localStorage');
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
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
