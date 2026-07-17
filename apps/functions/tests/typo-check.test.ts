import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { handleTypoCheck } from '../src/lib/typo-check'

function createMockRequest(
  body: unknown = {},
  headers: Record<string, string> = {}
): Request {
  return { body, headers } as unknown as Request
}

function createMockResponse(): Response & {
  statusCode: number
  body: unknown
} {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(data: unknown) {
      res.body = data
      return res
    },
  }
  return res as unknown as Response & { statusCode: number; body: unknown }
}

// 上流 AI 判定 API のレスポンスを模擬する（契約: { ok, issues }）。
function makeUpstreamResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
    text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
  }
}

const validFields = {
  fields: {
    email: 'test@example.com',
    name: '山田 太郎',
    message: 'お問い合わせです。',
  },
}

describe('POST /contact/typo-check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TYPO_CHECK_API_URL', 'https://typo-check.example.com/check')
    vi.stubEnv('TYPO_CHECK_API_KEY', 'test-api-key')
    vi.stubEnv('ALLOWED_ORIGINS', '')
  })

  describe('正常系', () => {
    it('タイポなし: ok=true かつ issues=[] を返す', async () => {
      mockFetch.mockResolvedValueOnce(
        makeUpstreamResponse({ ok: true, issues: [] })
      )

      const req = createMockRequest(validFields)
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.body).toEqual({ ok: true, issues: [] })
    })

    it('タイポあり: ok=false かつ issues に該当フィールドを返す', async () => {
      const issues = [
        {
          field: 'email',
          original: 'exmaple.com',
          suggestion: 'example.com',
          reason: 'ドメインの綴り誤り',
        },
      ]
      mockFetch.mockResolvedValueOnce(
        makeUpstreamResponse({ ok: false, issues })
      )

      const req = createMockRequest({
        fields: {
          email: 'test@exmaple.com',
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.body).toEqual({ ok: false, issues })
    })

    it('複数フィールドにタイポがある場合、すべての issues を返す', async () => {
      const issues = [
        {
          field: 'name',
          original: 'テスと 太郎',
          suggestion: 'テスト 太郎',
          reason: 'カタカナとひらがなの不自然な混在',
        },
        {
          field: 'message',
          original: 'メッセーぞ',
          suggestion: 'メッセージ',
          reason: '打ち間違い',
        },
      ]
      mockFetch.mockResolvedValueOnce(
        makeUpstreamResponse({ ok: false, issues })
      )

      const req = createMockRequest({
        fields: {
          email: 'test@example.com',
          name: 'テスと 太郎',
          message: 'これはてすとのメッセーぞです。',
        },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect((res.body as { issues: unknown[] }).issues).toHaveLength(2)
    })
  })

  describe('ドメイン制限', () => {
    it('許可リスト設定時、許可外 Origin は 403 を返す', async () => {
      vi.stubEnv('ALLOWED_ORIGINS', 'https://example.com')

      const req = createMockRequest(validFields, {
        origin: 'https://evil.example.net',
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(403)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('許可リスト設定時、許可 Origin は転送される', async () => {
      vi.stubEnv('ALLOWED_ORIGINS', 'https://example.com,http://localhost:3000')
      mockFetch.mockResolvedValueOnce(
        makeUpstreamResponse({ ok: true, issues: [] })
      )

      const req = createMockRequest(validFields, {
        origin: 'http://localhost:3000',
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('Origin が無くても許可ドメインの Referer なら転送される', async () => {
      vi.stubEnv('ALLOWED_ORIGINS', 'https://example.com')
      mockFetch.mockResolvedValueOnce(
        makeUpstreamResponse({ ok: true, issues: [] })
      )

      const req = createMockRequest(validFields, {
        referer: 'https://example.com/contact',
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(200)
    })
  })

  describe('エラー系', () => {
    it('TYPO_CHECK_API_URL が未設定の場合、500 を返す', async () => {
      vi.stubEnv('TYPO_CHECK_API_URL', '')

      const req = createMockRequest(validFields)
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(500)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('TYPO_CHECK_API_KEY が未設定の場合、500 を返す', async () => {
      vi.stubEnv('TYPO_CHECK_API_KEY', '')

      const req = createMockRequest(validFields)
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(500)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('fields が存在しない場合、400 を返す', async () => {
      const req = createMockRequest({})
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(400)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('fields の一部が欠けている場合、400 を返す', async () => {
      const req = createMockRequest({
        fields: { email: 'test@example.com', name: '山田 太郎' },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(400)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('fields の値が文字列でない場合、400 を返す', async () => {
      const req = createMockRequest({
        fields: {
          email: 123,
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(400)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('上流 AI が 5xx を返した場合、502 を返す', async () => {
      mockFetch.mockResolvedValueOnce(
        makeUpstreamResponse({ error: 'Bad gateway' }, 502)
      )

      const req = createMockRequest(validFields)
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(502)
    })

    it('fetch 自体が例外を投げた場合（ネットワークエラー）、502 を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network error'))

      const req = createMockRequest(validFields)
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(502)
    })

    it('上流レスポンスが不正な JSON の場合、502 を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('invalid json')),
        text: vi.fn().mockResolvedValue(''),
      })

      const req = createMockRequest(validFields)
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(502)
    })
  })
})
