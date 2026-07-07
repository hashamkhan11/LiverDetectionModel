import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['jspdf'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}

export default nextConfig
