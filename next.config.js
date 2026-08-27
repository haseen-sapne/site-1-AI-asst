/** @type {import('next').NextConfig} */
const nextConfig = {
  // We use serverExternalPackages instead of the experimental flag now
  serverExternalPackages: ['mongoose'],
};

module.exports = nextConfig;