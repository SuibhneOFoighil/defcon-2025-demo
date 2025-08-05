import type { ReactNode } from "react"

/**
 * Auth layout for login and other authentication pages
 * This layout does NOT include the sidebar
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  // For auth pages, we'll return the children directly
  // This will override the sidebar layout from the providers
  return children
}
