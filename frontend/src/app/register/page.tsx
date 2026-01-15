'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { validators } from '@/utils/validators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';

// Dynamically import Three.js background
const AuthBackground = dynamic(
  () => import('@/components/three/AuthBackground').then(mod => ({ default: mod.AuthBackground })),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validators.name(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validators.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validators.strongPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.message) {
        setSuccess(response.message || 'Registration successful! Please check your email to confirm your account.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else if (response.token) {
        authService.setToken(response.token);
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* 3D Background */}
      <AuthBackground />
      
      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="backdrop-blur-xl bg-slate-900/70 border-purple-500/30 shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <CardTitle className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Join MomentVibe
            </CardTitle>
            <CardDescription className="text-base text-slate-300">
              Create your account and start sharing moments
            </CardDescription>
          </CardHeader>

          <CardContent>
            {generalError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span>
                {generalError}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <span>✅</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                error={errors.name}
                className="bg-slate-800/50 border-slate-600 focus:border-purple-500"
              />

              <Input
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                error={errors.email}
                className="bg-slate-800/50 border-slate-600 focus:border-purple-500"
              />

              <div>
                <Input
                  type="password"
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  error={errors.password}
                  className="bg-slate-800/50 border-slate-600 focus:border-purple-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  At least 8 characters, with uppercase, lowercase, and numbers
                </p>
              </div>

              <Input
                type="password"
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                className="bg-slate-800/50 border-slate-600 focus:border-purple-500"
              />

              <Button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 py-6 text-lg"
                isLoading={isLoading}
              >
                {isLoading ? 'Creating account...' : '🚀 Create Account'}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/70 text-slate-400">or</span>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                  Login here 🔐
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
