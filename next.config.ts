import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [32, 48, 64, 96, 128, 160, 256, 384],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
