import ContactTestForm from './ContactTestForm'

export default function ContactTestPage() {
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
