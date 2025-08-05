// Comprehensive route configuration

// Public routes that don't require authentication
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
}

// Protected routes that require authentication
export const PROTECTED_ROUTES = {
  HOME: "/ranges", // Ranges is now the home/primary route
  RANGES: "/ranges",
  ROLES: "/roles",
  BLUEPRINTS: "/blueprints",
  TEMPLATES: "/templates",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_GROUPS: "/admin/groups",
  SETTINGS: "/settings",
  EDITOR_BASE: "/editor",
}

// Route groups
export const ROUTE_GROUPS = {
  AUTH: "/(auth)",
  DASHBOARD: "/(dashboard)",
}

// Combined routes for easy access
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
}

// Route patterns for middleware matching
export const PUBLIC_ROUTE_PATTERNS = ["/login", "/forgot-password", "/reset-password", "/(auth)/:path*"]
