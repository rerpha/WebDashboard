import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  transpilePackages: ["jotai"],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
