import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Test',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function ContactTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
