import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── App Router (stable in Next.js 14+) ───────────────────────────────────
  // No explicit flag needed — App Router is the default.

  // ── Image optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Share card images from backend storage
      { protocol: 'https', hostname: '*.supabase.co',        pathname: '/storage/**' },
      // User avatars (Google, GitHub OAuth)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ── API rewrites ──────────────────────────────────────────────────────────
  // In development, proxy /api/v1/* to the local FastAPI server.
  // In production, the FastAPI server is behind the same domain (nginx).
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source:      '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },

  // ── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Self-hosted font — long cache
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ── Compiler ──────────────────────────────────────────────────────────────
  compiler: {
    // Remove console.* in production (keep console.error)
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error'] }
      : false,
  },

  // ── Output ────────────────────────────────────────────────────────────────
  // 'standalone' bundles only the files needed to run in a Docker container.
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
};

export default nextConfig;
