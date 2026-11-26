import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Authorization ヘッダーの Base64 部分の最大長（過大な値による例外を防ぐ）
const MAX_BASIC_AUTH_HEADER_LENGTH = 1024

// 共有 CDN に認証済み応答をキャッシュさせないためのヘッダー値
// （Firebase Hosting の framework-backed CDN による Basic 認証貫通を防ぐ）
const NO_STORE_CACHE_CONTROL = 'private, no-store'

function matchBasicAuth(request: NextRequest, credentials: string): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const basicAuthMatch = authHeader.trim().match(/^Basic\s+(\S+)$/i)
  const encoded = basicAuthMatch?.[1]

  if (!encoded || encoded.length > MAX_BASIC_AUTH_HEADER_LENGTH) return false

  try {
    const decoded = atob(encoded)
    const [user, ...passwordParts] = decoded.split(':')
    const password = passwordParts.join(':')
    return `${user}:${password}` === credentials
  } catch {
    return false
  }
}

type BasicAuthResult = 'allow' | 'unauthorized' | 'disabled'

function evaluateBasicAuth(
  request: NextRequest,
  credentials: string | undefined
): BasicAuthResult {
  if (!credentials) return 'disabled'
  return matchBasicAuth(request, credentials) ? 'allow' : 'unauthorized'
}

// 認証が必要なパス
const PROTECTED_PATHS = ['/dashboard']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // サイト全体の Basic 認証（BASIC_AUTH_CREDENTIALS が設定されている環境のみ）
  const basicAuth = evaluateBasicAuth(
    request,
    process.env.BASIC_AUTH_CREDENTIALS
  )

  if (basicAuth === 'unauthorized') {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Restricted"',
        'Cache-Control': NO_STORE_CACHE_CONTROL,
      },
    })
  }

  const authEnabled = basicAuth !== 'disabled'

  const withNoStore = (response: NextResponse) => {
    if (authEnabled) {
      response.headers.set('Cache-Control', NO_STORE_CACHE_CONTROL)
    }

    return response
  }

  // ルート保護
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!isProtected) return withNoStore(NextResponse.next())

  // Cookie からセッショントークンを取得
  const session = request.cookies.get('session')

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return withNoStore(NextResponse.redirect(loginUrl))
  }

  return withNoStore(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|_next/webpack-hmr|api/|favicon\\.ico|robots\\.txt|app-ads\\.txt|sitemap\\.xml).*)',
  ],
}
