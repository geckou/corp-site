import { existsSync, readFileSync } from 'fs'
import path from 'path'

import type { NextConfig } from 'next'

// Cloud Build 用: dot ファイル（.env.production）がアップロードされない場合の代替
const buildEnvPath = path.join(__dirname, 'build-env.json')
if (existsSync(buildEnvPath)) {
  const vars = JSON.parse(readFileSync(buildEnvPath, 'utf8')) as Record<
    string,
    string
  >
  for (const [key, value] of Object.entries(vars)) {
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    BASIC_AUTH_CREDENTIALS: process.env.BASIC_AUTH_CREDENTIALS ?? '',
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
