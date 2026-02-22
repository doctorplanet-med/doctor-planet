/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['undici', '@libsql/client', '@prisma/adapter-libsql', 'better-sqlite3', '@prisma/adapter-better-sqlite3'],
  },
  // Reduce webpack cache warnings about optional platform packages (@libsql, @next/swc)
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }
    // Exclude README and LICENSE files from being processed by webpack
    config.module.rules.push({
      test: /\/(README\.md|LICENSE)$/,
      type: 'asset/source',
    })
    return config
  },
}

module.exports = nextConfig
