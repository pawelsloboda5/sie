import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "geolocation=(), camera=()" },
];

const nextConfig: NextConfig = {
  // Expose server env to the client for build-time replacement
  // DEBUG_AI_COPILOT controls visibility of Copilot debug UI
  env: {
    NEXT_PUBLIC_DEBUG_AI_COPILOT: process.env.DEBUG_AI_COPILOT,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
