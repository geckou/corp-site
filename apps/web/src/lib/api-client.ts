// TODO: Firebase Auth 連携を実装する（@geckou/shared 導入後）
// 現在コーポレートサイトでは未使用

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  authenticated?: boolean
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Cloud Functions API を呼び出す共通ヘルパー
 */
export async function apiClient<T> (
  path: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || `HTTP ${response.status}` }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error  : error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
