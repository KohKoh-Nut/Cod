import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Cod',
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/Cod',
  },
};

export default nextConfig;