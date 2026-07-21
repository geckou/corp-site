import type { Request, Response } from 'express'

type OpenAIResponse = {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

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

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
}

function isOriginAllowed(req: Request): boolean {
  const allowedOrigins = getAllowedOrigins()
  if (allowedOrigins.length === 0) {
    return true
  }

  const origin = req.headers.origin
  if (typeof origin === 'string' && allowedOrigins.includes(origin)) {
    return true
  }

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

const SYSTEM_PROMPT = `あなたは入力フォーム（メールアドレス、氏名、問い合わせ本文）のタイポ（打ち間違い）を判定する専門家です。
ユーザーから入力データを受け取り、すべてのフィールドを独立して詳細にチェックし、誤字脱字や不自然な表記がないか判定してください。

**【重要なルール】**
1. 必ず以下の JSON フォーマットのみを出力してください。Markdown の \`\`\`json ... \`\`\` などの装飾や、前後の挨拶文は一切含めないでください。
2. タイポがない場合は "ok" を true にし、"issues" を空の配列 [] にしてください。
3. タイポがある場合は "ok" を false にし、"issues" 配列に該当箇所を記載してください。複数のフィールドや箇所にエラーがある場合は、決して省略せず、すべてを抽出して配列に含めてください。
4. 「氏名 (name)」について：珍しい苗字や名前は許容しますが、「テスと」のような不自然なひらがな・カタカナの混在や、明らかなテスト入力のミス、連続する無意味な文字はタイポとして指摘してください。
5. 「メールアドレス (email)」について：ドメイン名のよくあるスペルミス（例: gmial.com → gmail.com）や、ローカルパートの明らかな打ち間違い（例: tast → test）をチェックしてください。
6. 「本文 (message)」について：文脈から判断して、不自然な文字の混在（例:「てすと」→「テスト」）、明らかなタイプミス（例:「メッセーぞ」→「メッセージ」）を指摘してください。
7. 「理由 (reason)」は日本語で簡潔に記載してください。

**【出力 JSON のフォーマット例】**
{
  "ok": false,
  "issues": [
    {
      "field": "name",
      "original": "テスと 太郎",
      "suggestion": "テスト 太郎",
      "reason": "カタカナとひらがなの不自然な混在"
    },
    {
      "field": "message",
      "original": "これはてすとのメッセーぞです。",
      "suggestion": "これはテストのメッセージです。",
      "reason": "打ち間違い"
    }
  ]
}`

export async function handleTypoCheck(req: Request, res: Response) {
  const TYPO_CHECK_API_KEY = process.env.TYPO_CHECK_API_KEY
  if (!TYPO_CHECK_API_KEY) {
    console.error('TYPO_CHECK_API_KEY is not set')
    res.status(500).json({ ok: false, error: 'Server configuration error' })
    return
  }

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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TYPO_CHECK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `メールアドレス: ${email}\n氏名: ${name}\n問い合わせ本文: ${message}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error(`OpenAI API error: ${response.status} - ${errorBody}`)
      res
        .status(502)
        .json({ ok: false, error: 'Typo check service unavailable' })
      return
    }

    const data = (await response.json()) as OpenAIResponse
    const content = data.choices[0]?.message?.content ?? ''
    res.json(normalizeResult(JSON.parse(content)))
  } catch (error) {
    console.error('Failed to check for typos:', error)
    res.status(502).json({ ok: false, error: 'Typo check service unavailable' })
  }
}
