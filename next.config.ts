// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // IMPORTANT: no `output: 'export'`
  reactStrictMode: true,
  // If you use external images, add allowed domains here later.
  // images: { domains: ['example.com'] },
};

export default nextConfig;

