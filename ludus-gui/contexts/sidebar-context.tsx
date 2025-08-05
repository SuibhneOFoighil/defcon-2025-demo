"use client"

import { createContext, useContext, type ReactNode, useMemo, useCallback } from "react"
import { useUserPreferences } from "@/hooks/use-user-preferences-local"

/**
 * Interface for the sidebar context value
 */
interface SidebarContextValue {
  expanded: boolean
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
}

/**
 * Context for managing sidebar state
 */
const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

/**
 * Props for the SidebarProvider component
 */
interface SidebarProviderProps {
  children: ReactNode
  defaultExpanded?: boolean
}

/**
 * Provider component for sidebar state
 * @param props - Component props
 * @returns Provider component
 */
export function SidebarProvider({ children, defaultExpanded = true }: SidebarProviderProps) {
  const { preferences, setSidebarExpanded: setExpanded } = useUserPreferences()
  const expanded = preferences?.sidebarExpanded ?? defaultExpanded

  // Memoize functions to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setExpanded(!expanded)
  }, [expanded, setExpanded])

  const setSidebarExpanded = useCallback(
    (value: boolean) => {
      setExpanded(value)
    },
    [setExpanded],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      expanded,
      toggleSidebar,
      setSidebarExpanded,
    }),
    [expanded, toggleSidebar, setSidebarExpanded],
  )

  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
}

/**
 * Custom hook for accessing sidebar state
 * @returns Sidebar context value
 * @throws Error if used outside of SidebarProvider
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext)

  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}
