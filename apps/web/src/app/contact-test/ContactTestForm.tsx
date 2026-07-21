'use client'

import { useRef, useState } from 'react'
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

// globals.css が input/textarea/button のボーダー・文字色をリセットするため、
// 素の見た目を保つ最小限のスタイルをインラインで上書きする（背景は透明のまま）。
const fieldStyle: React.CSSProperties = {
  border: '1px solid currentColor',
  backgroundColor: 'transparent',
  color: 'inherit',
  padding: '8px',
  appearance: 'auto',
}

export default function ContactTestForm() {
  const [values, setValues] = useState({ email: '', name: '', message: '' })
  const formRef = useRef<HTMLFormElement>(null)

  const handleChange = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const issueTextFormatter = (issues: TypoCheckResponse['issues']) =>
    issues
      .map(
        (issue) =>
          `${issue.field}: ${issue.original} → ${issue.suggestion} (${issue.reason})`
      )
      .join('\n')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const [fetchError, res] = await safeFetchWithErrors(
      apiClient<TypoCheckResponse>('/contact/typo-check', {
        method: 'POST',
        authenticated: false,
        body: { fields: { ...values } },
      })
    )

    if (fetchError || res.error || !res.data) {
      console.error('typo check failed:', fetchError ?? res.error)
      formRef.current?.submit()
      return
    }

    const { ok, issues } = res.data
    if (!ok) {
      const proceed = confirm(
        `入力内容にタイポの可能性があります:\n${issueTextFormatter(issues)}\n\nこのまま送信しますか？`
      )
      if (!proceed) return
    }

    formRef.current?.submit()
  }

  return (
    <form
      ref={formRef}
      method="post"
      action="https://hyperform.jp/api/zbvrBVp1"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
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
        style={{
          border: '1px solid currentColor',
          backgroundColor: 'transparent',
          color: 'inherit',
          padding: '8px 16px',
          alignSelf: 'flex-start',
          cursor: 'pointer',
        }}
      >
        送信
      </button>
    </form>
  )
}
