/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'statics.foxbit.com.br',
      },
    ],
  },
}

module.exports = nextConfig
