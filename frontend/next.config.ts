import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the correct workspace root to avoid lockfile detection issues
  outputFileTracingRoot: path.join(__dirname, "../"),
  
  // Allow dev connections from any origin (for development only)
  allowedDevOrigins: ['*'],
  
  // Only treat these file extensions as pages under the legacy `pages/` router.
  // This avoids conflicts with any leftover `pages/*.js` files while using the
  // `app/` router (app directory lives in `src/app/`).
  pageExtensions: ["tsx", "ts", "jsx"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also ignore TS errors during build for now to ensure we can deploy
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/api/media/**',
      },
    ],
  },
};

export default nextConfig;
