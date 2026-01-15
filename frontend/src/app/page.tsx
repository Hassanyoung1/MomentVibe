"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function Feature({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card hover className="text-left">
      <CardContent>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-600/20 text-3xl">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-300">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-white">
      <Container className="py-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              Capture & Share
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Moments That Matter
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Create beautiful event albums, invite your guests, and collect photos, videos, and memories — all in one seamless experience.
            </p>

            <div className="flex gap-4 flex-wrap pt-4">
              {isAuthenticated ? (
                <>
                  <Button size="lg" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/events/create">Create Event</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 rounded-3xl shadow-2xl flex items-center justify-center text-8xl transform hover:scale-105 transition-transform duration-300">
                📸
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center text-5xl">
                🎉
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MomentVibe?</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to capture, share, and cherish your special moments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature 
              title="Easy Photo Sharing" 
              description="Guests upload photos and videos directly to your event albums from any device with zero hassle." 
              icon="📸" 
            />
            <Feature 
              title="Smart Event Management" 
              description="Create events with custom expiration, guest permissions, and privacy settings tailored to your needs." 
              icon="🎉" 
            />
            <Feature 
              title="Guest Engagement" 
              description="Let guests react, comment, and leave heartfelt messages on your shared moments." 
              icon="💬" 
            />
            <Feature 
              title="Secure & Private" 
              description="JWT authentication and link-based sharing ensure only invited guests access your albums." 
              icon="🔐" 
            />
            <Feature 
              title="Lightning Fast" 
              description="Built with Next.js and optimized backend infrastructure for instant loading and smooth experience." 
              icon="⚡" 
            />
            <Feature 
              title="Mobile First" 
              description="Fully responsive design that works beautifully on phones, tablets, and desktops." 
              icon="📱" 
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="py-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Capturing Moments?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users creating unforgettable memories with MomentVibe
              </p>
              {!isAuthenticated && (
                <Button size="lg" asChild>
                  <Link href="/register">Create Your First Event</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      </Container>
    </div>
  );
}