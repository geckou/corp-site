import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/ContactForm'

// This feature will first be implemented on the test page `/contact-test` (set to `noindex`),
// while the existing form on the production site's top page will remain unchanged.
//
// Test Case
// email: test@example.com
// name: テスと 太郎
// message: これはてすとのメッセーぞです。

export default function ContactTestPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main className="bg-red-900 p-8">
      <h1 className="text-2xl font-bold">CONTACT TEST</h1>
      <ContactForm isActive={true} enableTypoCheck={true} />
    </main>
  )
}
