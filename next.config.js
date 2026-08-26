/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mongoose', '@google/genai'],
  },
};

module.exports = nextConfig;
