'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { safeFetchWithErrors } from '@/lib/safe-fetch'

type TypoIssue = {
  field: string
  original: string
  suggestion: string
  reason: string
}

type TypoCheckResponse = {
  ok: boolean
  issues: TypoIssue[]
}

const inputItems = [
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'message', label: 'Message', type: 'textarea' },
] as const

const fieldLabels: Record<string, string> = {
  email: 'Email',
  name: 'Name',
  message: 'Message',
}

const fieldStyle: React.CSSProperties = {
  border: '1px solid currentColor',
  backgroundColor: 'transparent',
  color: 'inherit',
  padding: '8px',
  appearance: 'auto',
}

const buttonStyle: React.CSSProperties = {
  border: '1px solid currentColor',
  backgroundColor: 'transparent',
  color: 'inherit',
  padding: '8px 16px',
  cursor: 'pointer',
}

type FormState =
  | { status: 'editing' }
  | { status: 'checking' }
  | { status: 'sending' }
  | { status: 'sent' }

// confirm ダイアログ用の文面を組み立てる
function buildConfirmMessage(issues: TypoIssue[]): string {
  const lines = issues.map((issue) => {
    const label = fieldLabels[issue.field] ?? issue.field
    return `・${label}: 「${issue.original}」は「${issue.suggestion}」の間違いではありませんか？（${issue.reason}）`
  })

  return [
    '入力内容に間違いはありませんか？',
    '',
    ...lines,
    '',
    'このまま送信してもよろしいですか？',
  ].join('\n')
}

export default function ContactSampleForm() {
  const [values, setValues] = useState({ email: '', name: '', message: '' })
  const [state, setState] = useState<FormState>({ status: 'editing' })

  const handleChange = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  // サンプルページのため実送信はせず、送信完了だけを表示する
  const send = async () => {
    setState({ status: 'sending' })
    await new Promise((resolve) => setTimeout(resolve, 600))
    setState({ status: 'sent' })
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setState({ status: 'checking' })

    const [fetchError, res] = await safeFetchWithErrors(
      apiClient<TypoCheckResponse>('/contact/typo-check', {
        method: 'POST',
        authenticated: false,
        body: { fields: { ...values } },
      })
    )

    // タイポチェックは補助機能。失敗しても送信自体は止めない
    if (fetchError || res.error || !res.data) {
      await send()
      return
    }

    const issues = res.data.issues ?? []

    if (res.data.ok || issues.length === 0) {
      await send()
      return
    }

    if (window.confirm(buildConfirmMessage(issues))) {
      await send()
      return
    }

    setState({ status: 'editing' })
  }

  const isBusy = state.status === 'checking' || state.status === 'sending'

  if (state.status === 'sent') {
    return (
      <div className="flex flex-col gap-4">
        <div
          style={{
            padding: '16px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            borderRadius: '4px',
          }}
        >
          <p style={{ fontWeight: 'bold' }}>送信しました</p>
          <p style={{ fontSize: '0.875em', marginTop: '4px' }}>
            お問い合わせありがとうございます。担当者より折り返しご連絡いたします。
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setValues({ email: '', name: '', message: '' })
            setState({ status: 'editing' })
          }}
          style={{ ...buttonStyle, alignSelf: 'flex-start' }}
        >
          もう一度入力する
        </button>
      </div>
    )
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
          disabled={isBusy}
          style={{
            ...buttonStyle,
            alignSelf: 'flex-start',
            cursor: isBusy ? 'wait' : 'pointer',
            opacity: isBusy ? 0.5 : 1,
          }}
        >
          {state.status === 'checking'
            ? '確認中...'
            : state.status === 'sending'
              ? '送信中...'
              : '送信する'}
        </button>
      </form>
    </div>
  )
}
