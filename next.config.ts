// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',          // generate static HTML into /out
  images: { unoptimized: true }, // allow <Image> during export
  trailingSlash: true,       // avoids folder index issues on static hosts
};

export default nextConfig;

