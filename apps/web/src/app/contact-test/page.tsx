import { notFound } from 'next/navigation'
import ContactTestForm from './ContactTestForm'

// This feature will first be implemented on the test page `/contact-test` (set to `noindex`),
// while the existing form on the production site's top page will remain unchanged.
//
// Test Case
// email: test@example.com
// name: テスと 太郎
// message: これはてすとのメッセーぞです。

export default function ContactTestPage() {
  // dev/stg のみ表示。next build では NODE_ENV が常に 'production' になり
  // デプロイ環境を判別できないため、Basic 認証情報の有無で判定する
  // （BASIC_AUTH_CREDENTIALS は dev/stg のみ設定、公開環境の production は未設定）。
  if (!process.env.BASIC_AUTH_CREDENTIALS) {
    notFound()
  }

  return (
    <main
      className="p-8"
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#000000',
      }}
    >
      <div className="mx-auto max-w-xl">
        <h1 className="mb-4 text-xl">Contact Test</h1>
        <ContactTestForm />
      </div>
    </main>
  )
}
