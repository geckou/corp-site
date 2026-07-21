import { auth } from '@/lib/firebase'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  authenticated?: boolean
}

type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

export async function apiClient<T>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, authenticated = true } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authenticated && auth) {
    const user = auth.currentUser

    if (user) {
      const token = await user.getIdToken()
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return {
        data: null,
        error:
          errorData?.error || errorData?.message || `HTTP ${response.status}`,
        status: response.status,
      }
    }

    const data = await response.json()
    return { data, error: null, status: response.status }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    }
  }
}
