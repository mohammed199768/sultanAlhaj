/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920],
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": ["./inspiring repos/**"],
    },
  },
};

export default nextConfig;
