import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic 認証チェック（BASIC_AUTH_CREDENTIALS が設定されている環境のみ有効）
function checkBasicAuth(request: NextRequest): NextResponse | null {
  const credentials = process.env.BASIC_AUTH_CREDENTIALS

  if (!credentials) return null

  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')

    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)

      if (decoded === credentials) return null
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Restricted"' },
  })
}

// 認証が必要なパス
const PROTECTED_PATHS = ['/dashboard']

export function middleware(request: NextRequest) {
  // Basic 認証（dev/stg 環境のみ）
  const basicAuthResponse = checkBasicAuth(request)

  if (basicAuthResponse) return basicAuthResponse

  // ルート保護
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get('session')

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
