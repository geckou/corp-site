import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { handleTypoCheck } from '../src/lib/typo-check'

function createMockRequest(body: unknown = {}): Request {
  return { body } as Request
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

function makeOpenAIResponse(content: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue({
      choices: [{ message: { content } }],
    }),
  }
}

describe('POST /contact/typo-check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TYPO_CHECK_API_KEY', 'test-api-key')
  })

  describe('正常系', () => {
    it('タイポなし: ok=true かつ issues=[] を返す', async () => {
      const aiResult = JSON.stringify({ ok: true, issues: [] })
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse(aiResult))

      const req = createMockRequest({
        fields: {
          email: 'test@example.com',
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
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
      const aiResult = JSON.stringify({ ok: false, issues })
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse(aiResult))

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
      const aiResult = JSON.stringify({ ok: false, issues })
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse(aiResult))

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

  describe('エラー系', () => {
    it('TYPO_CHECK_API_KEY が未設定の場合、500 を返す', async () => {
      vi.stubEnv('TYPO_CHECK_API_KEY', '')

      const req = createMockRequest({
        fields: {
          email: 'test@example.com',
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
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

    it('上流 AI が 5xx を返した場合、502 ではなく 500 を返す（フォールバック）', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: vi.fn().mockResolvedValue({ error: { message: 'Bad gateway' } }),
      })

      const req = createMockRequest({
        fields: {
          email: 'test@example.com',
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(500)
    })

    it('fetch 自体が例外を投げた場合（ネットワークエラー）、500 を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network error'))

      const req = createMockRequest({
        fields: {
          email: 'test@example.com',
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(500)
    })

    it('AI レスポンスが不正な JSON の場合、500 を返す', async () => {
      mockFetch.mockResolvedValueOnce(makeOpenAIResponse('invalid json'))

      const req = createMockRequest({
        fields: {
          email: 'test@example.com',
          name: '山田 太郎',
          message: 'お問い合わせです。',
        },
      })
      const res = createMockResponse()

      await handleTypoCheck(req, res as unknown as Response)

      expect(res.statusCode).toBe(500)
    })
  })
})
