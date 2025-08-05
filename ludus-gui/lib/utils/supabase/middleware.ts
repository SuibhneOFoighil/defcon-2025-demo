import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'
import { logger } from '@/lib/logger'

export async function updateSession(request: NextRequest) {
  // Skip Supabase operations when auth is disabled
  if (AUTH_CONFIG.isDisabled) {
    return NextResponse.next({ request })
  }

  // Validate Supabase credentials before attempting to create client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const middlewareLogger = logger.child({ context: 'MIDDLEWARE' })
    middlewareLogger.warn({
      url: request.url,
      pathname: request.nextUrl.pathname,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    }, 'Supabase credentials missing in middleware - skipping auth session update')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  await supabase.auth.getUser()

  return supabaseResponse
}