import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title      : '合同会社Geckou',
  description: 'デザインから開発まで一貫して行なっています。',
  openGraph  : {
    title      : '合同会社Geckou',
    description: 'デザインから開発まで一貫して行なっています。',
    images     : ['/ogp.png'],
    locale     : 'ja_JP',
    type       : 'website',
  },
  icons: {
    icon : '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
