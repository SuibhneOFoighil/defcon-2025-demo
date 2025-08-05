import { updateSession } from '@/lib/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG, logAuthBypass } from '@/lib/auth-config'

export async function middleware(request: NextRequest) {
  // Skip auth middleware when auth is disabled
  if (AUTH_CONFIG.isDisabled) {
    logAuthBypass('Middleware', { 
      url: request.url, 
      pathname: request.nextUrl.pathname,
      method: request.method 
    })
    
    const response = NextResponse.next()
    
    // Add debug header in development
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Auth-Bypass', 'true')
      response.headers.set('X-Auth-Bypass-Context', 'middleware')
    }
    
    return response
  }
  
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}