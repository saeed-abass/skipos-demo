/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma client must not be bundled by webpack on the server
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
