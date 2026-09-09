import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Sample',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function ContactSampleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
