import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co", // Wildcard for any Supabase project
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary CDN
      },
    ],
  },
};

export default nextConfig;
