/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  images: {
    domains: ['images.unsplash.com', 'unsplash.com']
  }
}

module.exports = nextConfig;