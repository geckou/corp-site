import type { Request, Response } from 'express'

type TypoIssue = {
  field: string
  original: string
  suggestion: string
  reason: string
}

type TypoCheckResult = {
  ok: boolean
  issues: TypoIssue[]
}

// ALLOWED_ORIGINS（カンマ区切り）を許可オリジンの配列にする。
// 未設定・空の場合は開発用として全オリジンを許可する。
function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
}

// CORS とは別に、Origin / Referer を明示照合する（非ブラウザ・偽装対策の前段）。
// 許可リスト未設定（開発）のときは許可する。
function isOriginAllowed(req: Request): boolean {
  const allowedOrigins = getAllowedOrigins()
  if (allowedOrigins.length === 0) {
    return true
  }

  const origin = req.headers.origin
  if (typeof origin === 'string' && allowedOrigins.includes(origin)) {
    return true
  }

  // Origin が無い場合は Referer のオリジン部分で照合する。
  const referer = req.headers.referer
  if (typeof referer === 'string') {
    try {
      const refererOrigin = new URL(referer).origin
      if (allowedOrigins.includes(refererOrigin)) {
        return true
      }
    } catch {
      // 不正な Referer は不許可扱い
    }
  }

  return false
}

// 上流 AI 判定 API のレスポンスを { ok, issues } に正規化する。
function normalizeResult(data: unknown): TypoCheckResult {
  const source = (data ?? {}) as { ok?: unknown; issues?: unknown }
  const issues = Array.isArray(source.issues)
    ? (source.issues as TypoIssue[])
    : []

  return {
    ok: source.ok === true || issues.length === 0,
    issues,
  }
}

export async function handleTypoCheck(req: Request, res: Response) {
  const TYPO_CHECK_API_URL = process.env.TYPO_CHECK_API_URL
  const TYPO_CHECK_API_KEY = process.env.TYPO_CHECK_API_KEY
  if (!TYPO_CHECK_API_URL || !TYPO_CHECK_API_KEY) {
    console.error('TYPO_CHECK_API_URL or TYPO_CHECK_API_KEY is not set')
    res.status(500).json({ ok: false, error: 'Server configuration error' })
    return
  }

  // ドメイン制限（許可外オリジンは 403）
  if (!isOriginAllowed(req)) {
    res.status(403).json({ ok: false, error: 'Forbidden origin' })
    return
  }

  const fields = req.body?.fields
  const { email, name, message } = fields ?? {}

  if (
    typeof email !== 'string' ||
    !email ||
    typeof name !== 'string' ||
    !name ||
    typeof message !== 'string' ||
    !message
  ) {
    res.status(400).json({
      ok: false,
      error:
        'Invalid request: fields.email, fields.name, and fields.message are required strings',
    })
    return
  }

  try {
    const response = await fetch(TYPO_CHECK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TYPO_CHECK_API_KEY}`,
      },
      body: JSON.stringify({ fields: { email, name, message } }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error(
        `Upstream typo-check API error: ${response.status} - ${errorBody}`
      )
      res.status(502).json({ ok: false, error: 'Upstream typo check failed' })
      return
    }

    const data = await response.json()
    res.json(normalizeResult(data))
  } catch (error) {
    console.error('Failed to check for typos:', error)
    res.status(502).json({ ok: false, error: 'Upstream typo check failed' })
  }
}
