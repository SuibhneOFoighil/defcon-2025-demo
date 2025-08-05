import { PUBLIC_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTE_PATTERNS } from "../routes"

/**
 * Checks if a path is an authentication route
 */
export function isAuthRoute(pathname: string): boolean {
  // Check if the path matches any of the public route patterns
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => {
    if (pattern.includes("*")) {
      // Handle wildcard patterns
      const basePattern = pattern.replace("/:path*", "")
      return pathname.startsWith(basePattern)
    }
    return pathname === pattern
  })
}

/**
 * Returns the path to redirect after login
 */
export function getRedirectAfterLogin(returnUrl?: string | null): string {
  return returnUrl || PROTECTED_ROUTES.HOME
}

/**
 * Returns the path to redirect after logout
 */
export function getRedirectAfterLogout(): string {
  return PUBLIC_ROUTES.LOGIN
}

/**
 * Checks if a user has access to a route based on their role
 */
export function hasRouteAccess(pathname: string, userRole?: string): boolean {
  // Admin routes require admin role
  if (pathname.startsWith(PROTECTED_ROUTES.ADMIN) && userRole !== "admin") {
    return false
  }

  return true
}

/**
 * Generates navigation items based on user role
 */
export function generateNavItems(userRole?: string) {
  const baseItems = [
    {
      name: "Ranges",
      href: PROTECTED_ROUTES.RANGES,
      icon: "Layout",
      exact: true,
    },
    {
      name: "Templates",
      href: PROTECTED_ROUTES.TEMPLATES,
      icon: "FileText",
    },
    {
      name: "Settings",
      href: PROTECTED_ROUTES.SETTINGS,
      icon: "Settings",
    },
  ]

  // Add admin routes for admin users
  if (userRole === "admin") {
    baseItems.push({
      name: "Admin",
      href: PROTECTED_ROUTES.ADMIN,
      icon: "Users",
    })
  }

  return baseItems
}
