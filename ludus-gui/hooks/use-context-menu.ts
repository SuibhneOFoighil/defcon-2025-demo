"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useContextMenuContext } from "@/components/providers/context-menu-provider"
import { CONTEXT_MENU_TRIGGER_DATA_ATTR } from "@/components/ui/context-menu"

/**
 * Hook for managing context menu state and positioning
 */
export function useContextMenu() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { registerMenu, unregisterMenu } = useContextMenuContext()
  const menuId = React.useId()

  // Register this menu with the global context menu provider
  useEffect(() => {
    const closeHandler = () => {
      setOpen(false)
    }

    if (open) {
      registerMenu(menuId, closeHandler)
    } else {
      unregisterMenu(menuId)
    }

    return () => {
      unregisterMenu(menuId)
    }
  }, [open, menuId, registerMenu, unregisterMenu])

  const toggleMenu = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    setOpen(prev => !prev)
  }

  const closeMenu = () => {
    setOpen(false)
  }

  // Add data attribute to the trigger ref when it's set
  useEffect(() => {
    if (triggerRef.current && open) {
      triggerRef.current.setAttribute(CONTEXT_MENU_TRIGGER_DATA_ATTR, "")
    } else if (triggerRef.current) {
      triggerRef.current.removeAttribute(CONTEXT_MENU_TRIGGER_DATA_ATTR)
    }
  }, [open])

  return {
    open,
    triggerRef,
    closeMenu,
    toggleMenu,
  }
}
