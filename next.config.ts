import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network devices during development
  allowedDevOrigins: [
    "*" // Wildcard pattern for local network
  ],

  images: {
    // Remove deprecated domains, use only remotePatterns for Next.js 15+
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
    // Disable image optimization for external images to avoid 400 errors
    unoptimized: false,
  },

  async headers() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youtubesummaries.cc';
    const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS
      ? process.env.NEXT_PUBLIC_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : [siteUrl];

    // Build CSP header
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.clerk.com https://clerk.com https://cdn.clerk.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.youtubesummaries.cc https://api1.youtubesummaries.cc https://youtube-edge-api.automatehub.workers.dev https://*.automatehub.workers.dev https://*.supabase.co https://*.clerk.accounts.dev https://*.clerk.com https://clerk.com https://cdn.clerk.com https://*.posthog.com https://www.google-analytics.com https://www.googletagmanager.com",
      "frame-src 'self' https://www.youtube.com https://*.youtube.com https://*.clerk.com https://clerk.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
        ],
      },
      {
        // Apply CORS headers to API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === 'production'
              ? allowedOrigins[0] // Use first allowed origin in production
              : "*" // Allow all in development
          },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
