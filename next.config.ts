import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  experimental: {
    // Empty to avoid any experimental feature issues
  },
};

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - reactCompiler is not in the type definition yet
  nextConfig.reactCompiler = true;
}

export default nextConfig;
