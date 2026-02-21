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
    serverComponentsExternalPackages: ['undici'],
  },
  // Reduce webpack cache warnings about optional platform packages (@libsql, @next/swc)
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }
    return config
  },
}

module.exports = nextConfig
