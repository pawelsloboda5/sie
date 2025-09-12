import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host') || ''
  const primary = process.env.NEXT_PUBLIC_PRIMARY_HOST || process.env.PRIMARY_HOST

  // Canonical host redirect in production; skip Vercel previews and dev
  if (process.env.NODE_ENV === 'production' && primary && !host.endsWith('.vercel.app') && host !== primary) {
    url.host = primary
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/|_next/|.*\\..*).*)",
  ],
}


