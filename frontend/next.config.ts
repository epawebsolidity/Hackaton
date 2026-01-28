import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "ik.imagekit.io",
      "sangbuahhati.com", // tambahkan host baru ini
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Semua request ke /api/...
        destination: "http://localhost:8000/api/:path*", // Diteruskan ke backend Express
      },
    ];
  },
};

export default nextConfig;
