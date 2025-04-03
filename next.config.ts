import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors
    // This is not recommended unless you're in development or have a specific reason
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Ignoring ESLint errors
    // This is not recommended for production code
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;