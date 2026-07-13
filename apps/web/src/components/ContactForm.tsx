'use client'

import { useRef, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { safeFetchWithErrors } from '@/lib/safe-fetch'

type ContactFormProps = {
  isActive: boolean
  enableTypoCheck?: boolean
}

type TypoCheckResponse = {
  ok: boolean
  issues: Array<{
    field: string
    original: string
    suggestion: string
    reason: string
  }>
}

export const ContactForm = ({
  isActive,
  enableTypoCheck,
}: ContactFormProps) => {
  const [values, setValues] = useState({ email: '', name: '', message: '' })
  const formRef = useRef<HTMLFormElement>(null)

  const inputItems = [
    { key: 'email', label: 'EMAIL', type: 'email' },
    { key: 'name', label: 'NAME', type: 'text' },
    { key: 'message', label: 'MESSAGE', type: 'textarea' },
  ] as const

  const isAllFilled = Object.values(values).every(Boolean)

  const handleChange = (key: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const issueTextFormatter = (issues: TypoCheckResponse['issues']) => {
    return issues
      .map(
        (issue) =>
          `${issue.field}: ${issue.original} → ${issue.suggestion} (${issue.reason})`
      )
      .join('\n')
  }

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const [fetchError, res] = await safeFetchWithErrors(
      apiClient<TypoCheckResponse>('/contact/typo-check', {
        method: 'POST',
        authenticated: false,
        body: { fields: { ...values } },
      })
    )

    if (fetchError) {
      console.error('Error during typo check:', fetchError)
      formRef.current?.submit()
      return
    }

    if (res.error || !res.data) {
      console.error('API error during typo check:', res.error)
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
      action="https://hyperform.jp/api/rZXPtamT"
      className="gap-sp-large contact-form flex w-full flex-col"
      onSubmit={enableTypoCheck ? handleSubmit : undefined}
    >
      {inputItems.map((item, index) => (
        <fieldset
          key={item.key}
          className={`contact-fieldset ${isActive ? 'active' : ''}`}
          style={
            {
              '--field-index': index,
              transitionDelay: `${index * 0.1}s`,
            } as React.CSSProperties
          }
        >
          {item.type !== 'textarea' ? (
            <input
              id={`input-${item.key}`}
              type={item.type}
              name={item.key}
              placeholder=" "
              required
              autoComplete="off"
              className="contact-text-box"
              value={values[item.key]}
              onChange={(e) => handleChange(item.key, e.target.value)}
            />
          ) : (
            <textarea
              id={`textarea-${item.key}`}
              name={item.key}
              placeholder=" "
              required
              autoComplete="off"
              className="contact-textarea"
              value={values[item.key]}
              onChange={(e) => handleChange(item.key, e.target.value)}
            />
          )}
          <label
            htmlFor={
              item.type !== 'textarea'
                ? `input-${item.key}`
                : `textarea-${item.key}`
            }
            className="contact-legend"
          >
            {item.label}
          </label>
        </fieldset>
      ))}

      <button
        className={`contact-button ${isActive ? 'active' : ''} ${isAllFilled ? 'send' : 'fill'}`}
        type="submit"
        disabled={!isAllFilled}
      >
        <span>{isAllFilled ? 'SEND' : 'FILL EVERYTHING'}</span>
      </button>

      <style>{`
        .contact-form > *:nth-child(1) { --input-width: min(calc(var(--bv) * 80 - var(--sp-large)), 100% - var(--sp-medium)); }
        .contact-form > *:nth-child(2) { --input-width: min(calc(var(--bv) * 80 - 2 * var(--sp-large)), 100% - 2 * var(--sp-medium)); }
        .contact-form > *:nth-child(3) { --input-width: min(calc(var(--bv) * 80 - 4 * var(--sp-large)), 100% - 4 * var(--sp-medium)); }
        .contact-form > *:nth-child(4) { --input-width: min(calc(var(--bv) * 80 - 8 * var(--sp-large)), 100% - 8 * var(--sp-medium)); }
        .contact-text-box,
        .contact-textarea {
          inline-size: 100%;
          padding: var(--sp-medium);
          color: var(--white);
          background-color: transparent;
          background-image: linear-gradient(105deg, var(--main-color) 10%, transparent calc(100% - var(--sp-max)));
          opacity: 0;
          transition: all 0.3s ease-in;
        }
        .contact-textarea {
          block-size: 12em;
          border: none;
          resize: none;
          outline: none;
        }
        .contact-legend {
          block-size: 1em;
          margin: auto;
          color: var(--white);
          font-family: var(--font-family-en);
          font-size: var(--fs-form);
          line-height: 1;
          white-space: nowrap;
          position: absolute;
          top: .5em;
          left: var(--sp-medium);
          opacity: .6;
          transition: all .2s ease;
          pointer-events: none;
        }
        .contact-fieldset {
          display: block;
          inline-size: 0;
          position: relative;
          transition: all 0.3s ease;
        }
        .contact-fieldset.active {
          inline-size: 100%;
          max-inline-size: var(--input-width);
        }
        .contact-fieldset.active .contact-text-box,
        .contact-fieldset.active .contact-textarea { opacity: 1; }
        .contact-fieldset:has(input:focus, input:not(:placeholder-shown), textarea:focus, textarea:not(:placeholder-shown)) .contact-legend {
          top: -.7em;
          left: 0;
          opacity: 1;
        }
        .contact-button {
          inline-size: 0;
          padding: var(--sp-small) var(--sp-medium);
          font-family: var(--font-family-en);
          position: relative;
          text-align: right;
          opacity: 0;
          transition: all 0.3s;
        }
        .contact-button.active {
          inline-size: 100%;
          max-inline-size: var(--input-width);
          opacity: 1;
        }
        .contact-button::before,
        .contact-button::after {
          content: '';
          display: block;
          inline-size: calc(100% + var(--sp-medium));
          transform: skew(20deg);
          position: absolute;
          transition: all 0.3s;
        }
        .contact-button::before {
          block-size: 100%;
          background-color: var(--link-color);
          box-shadow: 0 0 0 var(--main-color);
          top: 0;
          right: 0;
        }
        .contact-button::after {
          block-size: calc(var(--bv) / 2);
          background-color: var(--white);
          mix-blend-mode: overlay;
          bottom: var(--sp-medium);
          left: calc(-1 * var(--sp-small) - var(--sp-min));
        }
        .contact-button > span {
          position: relative;
          color: var(--white);
          font-size: var(--fs-form);
          text-shadow: var(--sp-min) 0 0 var(--link-color);
          white-space: nowrap;
          transition: all 0.3s;
          margin-inline-end: calc(-1 * var(--sp-large));
        }
        .contact-button:disabled {
          text-align: left;
          cursor: not-allowed;
        }
        .contact-button:disabled > span {
          text-shadow: 0 0 0 var(--link-color);
          margin-inline-end: 0;
        }
        .contact-button:disabled::before {
          background-color: var(--black);
          box-shadow: var(--sp-min) var(--sp-small) 0 var(--main-color);
          transform: skew(-20deg);
        }
        .contact-button:disabled::after { inline-size: 0; }
      `}</style>
    </form>
  )
}
