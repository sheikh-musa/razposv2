/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.spatuladesserts.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 