'use client'

import { ContactForm } from '@/components/ContactForm'
// Test Case
// email: test@example.com
// name: テスと 太郎
// message: これはてすとのメッセーぞです。

export default function ContactTestPage() {
  return (
    <main className="bg-red-900 p-8">
      <h1 className="text-2xl font-bold">CONTACT TEST</h1>
      <ContactForm isActive={true} enableTypoCheck={true} />
    </main>
  )
}
