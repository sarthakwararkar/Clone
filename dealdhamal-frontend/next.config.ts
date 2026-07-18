import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos.hunter.io',
        pathname: '/**',
      },
      // ─── Affiliate Network CDNs ──────────────────────────────────────────
      // Admitad
      {
        protocol: 'https',
        hostname: '**.admitad.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admitad.com',
        pathname: '/**',
      },
      // vCommission
      {
        protocol: 'https',
        hostname: '**.vcommission.com',
        pathname: '/**',
      },
      // Cuelinks / clnk.in
      {
        protocol: 'https',
        hostname: '**.cuelinks.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.clnk.in',
        pathname: '/**',
      },
      // Wildcard for any other affiliate/merchant image CDN
      // (safe — Next.js still optimises and serves through its own image endpoint)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  typedRoutes: true,
}

export default nextConfig

