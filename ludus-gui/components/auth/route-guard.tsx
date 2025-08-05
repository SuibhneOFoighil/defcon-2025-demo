'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { PUBLIC_ROUTES } from '@/lib/routes'
import { AUTH_CONFIG, logAuthBypass } from '@/lib/auth-config'

interface RouteGuardProps {
  children: React.ReactNode
}

// Helper function to check if a route is public
function isPublicPath(pathname: string, publicRoutes: Record<string, string>): boolean {
  return Object.values(publicRoutes).includes(pathname) || pathname.startsWith('/(auth)')
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = isPublicPath(pathname, PUBLIC_ROUTES)
  const shouldRedirectToLogin = !loading && !user && !isPublicRoute
  const shouldRedirectToDashboard = !loading && user && isPublicRoute && pathname !== '/'

  useEffect(() => {
    if (AUTH_CONFIG.isDisabled) {
      logAuthBypass('RouteGuard', { pathname, isPublicRoute })
      
      // When auth is disabled, redirect away from auth pages to dashboard
      // since users are always considered "logged in"
      if (isPublicRoute && pathname !== '/') {
        router.push('/')
      }
      return
    }
    
    if (!loading) {
      if (shouldRedirectToLogin) {
        // User is not authenticated and trying to access a protected route
        router.push('/login')
      } else if (shouldRedirectToDashboard) {
        // User is authenticated but on a public route (like login page)
        router.push('/')
      }
    }
  }, [user, loading, isPublicRoute, router, pathname, shouldRedirectToLogin, shouldRedirectToDashboard])

  // Skip all checks when auth is disabled
  if (AUTH_CONFIG.isDisabled) {
    return <>{children}</>
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (shouldRedirectToLogin || shouldRedirectToDashboard) {
    return null
  }

  return <>{children}</>
}