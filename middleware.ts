import { NextResponse, type NextRequest } from 'next/server'

// AUTH DISABLED — dev mode, all routes are open.
// Re-enable by replacing this with: import { updateSession } from '@/lib/supabase/middleware'
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
