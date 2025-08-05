"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { CONTEXT_MENU_DATA_ATTR, CONTEXT_MENU_TRIGGER_DATA_ATTR } from "@/components/ui/context-menu"
import { componentLogger } from "@/lib/logger"

interface ContextMenuContextType {
  closeAllMenus: () => void
  registerMenu: (id: string, closeHandler: () => void) => void
  unregisterMenu: (id: string) => void
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined)

/**
 * Provider component for managing global context menu state
 */
export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<Record<string, () => void>>({})
  const menusRef = useRef<Record<string, () => void>>({})
  const isClosingAllRef = useRef(false)
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keep a ref to the menus for use in event handlers
  useEffect(() => {
    menusRef.current = menus
  }, [menus])

  // Close all open context menus
  const closeAllMenus = useCallback(() => {
    if (isClosingAllRef.current || Object.keys(menusRef.current).length === 0) return

    isClosingAllRef.current = true
    Object.values(menusRef.current).forEach((closeHandler) => closeHandler())

    // Reset the closing state after a short delay
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current)
    }

    cooldownTimeoutRef.current = setTimeout(() => {
      isClosingAllRef.current = false
    }, 150) // Match animation duration
  }, [])

  // Register a new context menu
  const registerMenu = useCallback((id: string, closeHandler: () => void) => {
    setMenus((prev) => ({ ...prev, [id]: closeHandler }))
  }, [])

  // Unregister a context menu
  const unregisterMenu = useCallback((id: string) => {
    setMenus((prev) => {
      const newMenus = { ...prev }
      delete newMenus[id]
      return newMenus
    })
  }, [])

  // Close all menus when clicking on the document body
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (isClosingAllRef.current) return

      // Skip if the click is on a menu or trigger
      const target = e.target as HTMLElement
      if (!target || !target.closest) return

      try {
        // More reliable selector checking
        const isMenuClick = target.closest(`[${CONTEXT_MENU_DATA_ATTR}]`) !== null
        const isTriggerClick = target.closest(`[${CONTEXT_MENU_TRIGGER_DATA_ATTR}]`) !== null

        // Only close menus if clicking outside of any menu or trigger
        if (!isMenuClick && !isTriggerClick) {
          closeAllMenus()
        }
      } catch (error) {
        // Fallback: if selectors fail, assume outside click and close menus
        componentLogger.warn({ error, component: 'ContextMenuProvider' }, 'Context menu selector error, closing menus')
        closeAllMenus()
      }
    }

    // Use capture phase to ensure this runs before other handlers
    document.addEventListener("mousedown", handleDocumentClick, { capture: true })

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick, { capture: true })
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
    }
  }, [closeAllMenus])

  return (
    <ContextMenuContext.Provider value={{ closeAllMenus, registerMenu, unregisterMenu }}>
      {children}
    </ContextMenuContext.Provider>
  )
}

/**
 * Hook for accessing the context menu context
 */
export function useContextMenuContext() {
  const context = useContext(ContextMenuContext)
  if (!context) {
    throw new Error("useContextMenuContext must be used within a ContextMenuProvider")
  }
  return context
}
