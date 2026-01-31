/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      'undici',
      '@libsql/client',
      '@prisma/adapter-libsql',
      'libsql',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude libsql native modules from webpack bundling
      config.externals = [...(config.externals || []), '@libsql/client', 'libsql']
    }
    return config
  },
}

module.exports = nextConfig
