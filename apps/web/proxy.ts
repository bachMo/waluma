import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('waluma_access_token')?.value
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}