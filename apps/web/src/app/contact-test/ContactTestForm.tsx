'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { safeFetchWithErrors } from '@/lib/safe-fetch'

type TypoCheckResponse = {
  ok: boolean
  issues: Array<{
    field: string
    original: string
    suggestion: string
    reason: string
  }>
}

const inputItems = [
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'message', label: 'Message', type: 'textarea' },
] as const

const fieldStyle: React.CSSProperties = {
  border: '1px solid currentColor',
  backgroundColor: 'transparent',
  color: 'inherit',
  padding: '8px',
  appearance: 'auto',
}

type ApiResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TypoCheckResponse }
  | { status: 'error'; message: string }

export default function ContactTestForm() {
  const [values, setValues] = useState({ email: '', name: '', message: '' })
  const [result, setResult] = useState<ApiResult>({ status: 'idle' })

  const handleChange = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setResult({ status: 'loading' })

    const [fetchError, res] = await safeFetchWithErrors(
      apiClient<TypoCheckResponse>('/contact/typo-check', {
        method: 'POST',
        authenticated: false,
        body: { fields: { ...values } },
      })
    )

    if (fetchError || res.error || !res.data) {
      const message = fetchError
        ? String(fetchError)
        : res.error
          ? JSON.stringify(res.error)
          : 'No data returned'
      setResult({ status: 'error', message })
      return
    }

    setResult({ status: 'success', data: res.data })
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {inputItems.map((item) => (
          <div key={item.key} className="flex flex-col gap-1">
            <label htmlFor={item.key}>{item.label}</label>

            {item.type === 'textarea' ? (
              <textarea
                id={item.key}
                name={item.key}
                required
                rows={6}
                value={values[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                style={fieldStyle}
              />
            ) : (
              <input
                id={item.key}
                name={item.key}
                type={item.type}
                required
                value={values[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                style={fieldStyle}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={result.status === 'loading'}
          style={{
            border: '1px solid currentColor',
            backgroundColor: 'transparent',
            color: 'inherit',
            padding: '8px 16px',
            alignSelf: 'flex-start',
            cursor: result.status === 'loading' ? 'wait' : 'pointer',
            opacity: result.status === 'loading' ? 0.5 : 1,
          }}
        >
          {result.status === 'loading' ? 'Checking...' : 'Typo Check'}
        </button>
      </form>

      {result.status === 'error' && (
        <pre
          style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {result.message}
        </pre>
      )}

      {result.status === 'success' && (
        <div
          style={{
            padding: '12px',
            backgroundColor: result.data.ok ? '#dcfce7' : '#fef9c3',
            color: '#000',
            borderRadius: '4px',
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {result.data.ok
              ? 'OK — タイポなし'
              : `タイポ検出: ${result.data.issues.length} 件`}
          </p>

          {result.data.issues.length > 0 && (
            <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
              {result.data.issues.map((issue, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  <strong>{issue.field}</strong>: {issue.original} →{' '}
                  {issue.suggestion}
                  <br />
                  <span style={{ fontSize: '0.875em', opacity: 0.7 }}>
                    {issue.reason}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <details style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.875em' }}>
              Raw Response
            </summary>
            <pre
              style={{
                marginTop: '4px',
                fontSize: '0.75em',
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
