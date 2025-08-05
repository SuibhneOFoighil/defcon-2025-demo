"use client"

import type React from "react"

import { ThemeProvider } from "@/lib/theme/theme-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { ContextMenuProvider } from "@/components/providers/context-menu-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarNav } from "@/components/sidebar/sidebar-nav"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/auth/route-guard"
import { usePathname } from "next/navigation"
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from "@/lib/routes"
import { AUTH_CONFIG } from "@/lib/auth-config"
// import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Simple auth route check
  const isAuthPage =
    pathname === PUBLIC_ROUTES.LOGIN ||
    pathname === PUBLIC_ROUTES.FORGOT_PASSWORD ||
    pathname === PUBLIC_ROUTES.RESET_PASSWORD ||
    pathname.startsWith("/(auth)")

  // Check if this is an editor route (should not have main sidebar)
  const isViewportDemoPage = pathname.startsWith("/")
  
  // Determine layout based on route type and auth status
  // Show minimal layout for: auth pages when auth is ENABLED, or editor pages
  // When auth is disabled, auth pages should redirect to dashboard (showing sidebar)
  const showMinimalLayout = (isAuthPage && !AUTH_CONFIG.isDisabled) || isViewportDemoPage

  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouteGuard>
            <SidebarProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <ContextMenuProvider>
                      {showMinimalLayout ? (
                        // For auth pages (when auth enabled) and editor pages, just render the children without the sidebar
                        <div className="flex h-screen bg-background">{children}</div>
                      ) : (
                        // For dashboard pages, include the sidebar
                        <div className="flex h-screen bg-background">
                          <SidebarNav />
                          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
                        </div>
                      )}
                  </ContextMenuProvider>
                </TooltipProvider>
              </NotificationProvider>
            </SidebarProvider>
          </RouteGuard>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
