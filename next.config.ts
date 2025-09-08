/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Keep ESLint enabled but with fixed errors
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript strict but with fixed errors
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;