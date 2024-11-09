import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  // Only handle /login redirects if already authenticated
  if (request.nextUrl.pathname === '/login') {
    const authStorage = request.cookies.get('auth-storage')?.value
    if (authStorage) {
      try {
        const auth = JSON.parse(authStorage)
        if (auth?.state?.spotify?.accessToken) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch {
        // Invalid JSON in cookie, ignore
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login']
} 