import path from 'path'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    BASIC_AUTH_CREDENTIALS: process.env.BASIC_AUTH_CREDENTIALS ?? '',
    CONTACT_TEST_AUTH: process.env.CONTACT_TEST_AUTH ?? '',
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@geckou/shared'],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
}

export default nextConfig
