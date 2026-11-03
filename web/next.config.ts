import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // El curso largo de Bosques se ocultó: anuncios y enlaces viejos no pueden caer en un 404.
      {
        source: "/cursos/bosques-comestibles-semipresencial",
        destination: "/cursos/monte-comestible",
        permanent: false,
      },
    ];
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
