"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { useFloatingPosition } from "@/hooks/use-floating-position"
import { useAnimationState } from "@/hooks/use-animation-state"

// Animation constants
const EXIT_ANIMATION_DURATION = 150 // ms for exit animation
const ANIMATION_CLASS_ENTER = "context-menu-enter"
const ANIMATION_CLASS_EXIT = "context-menu-exit"

// Constants for context menu
const CONTEXT_MENU_DATA_ATTR = "data-context-menu"
const CONTEXT_MENU_TRIGGER_DATA_ATTR = "data-context-menu-trigger"

interface ContextMenuProps {
  children: React.ReactNode
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
  className?: string
  align?: "start" | "center" | "end"
}

/**
 * A context menu component that is anchored to a trigger element
 */
export function ContextMenu({ children, open, onClose, triggerRef, className, align = "end" }: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)
  const isClosingRef = React.useRef(false)
  const [isPositioned, setIsPositioned] = React.useState(false)
  const [transformOrigin, setTransformOrigin] = React.useState("top center")

  // Handle mounting
  React.useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // Animation state management
  const { animationClass, isExiting, startExit, startEnter, cleanup } = useAnimationState({
    enterClass: ANIMATION_CLASS_ENTER,
    exitClass: ANIMATION_CLASS_EXIT,
    duration: EXIT_ANIMATION_DURATION,
    onExitComplete: () => {
      onClose()
      isClosingRef.current = false
    },
  })

  // Position management with improved logic
  const { position, updatePosition, resetPosition, ready } = useFloatingPosition({
    triggerRef: triggerRef as React.RefObject<HTMLElement>,
    contentRef: menuRef as React.RefObject<HTMLElement>,
    align,
  })

  // Handle closing with animation
  const handleClose = React.useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    startExit()
  }, [startExit])

  // Outside click handling is managed by ContextMenuProvider
  // Removed redundant useOutsideClick to prevent conflicts

  // Handle scroll events
  React.useEffect(() => {
    if (!open || isExiting) return

    const closeOnScroll = () => {
      handleClose()
    }

    window.addEventListener("scroll", closeOnScroll, { capture: true, passive: true })

    return () => {
      window.removeEventListener("scroll", closeOnScroll, { capture: true })
    }
  }, [open, isExiting, handleClose])

  // Reset state when menu opens or closes
  React.useEffect(() => {
    if (open) {
      setIsPositioned(false)
      resetPosition()
    } else {
      setIsPositioned(false)
    }
  }, [open, resetPosition])

  // Calculate position and set transform origin
  React.useEffect(() => {
    if (!triggerRef?.current || !open || !mounted || isExiting) return

    // Calculate position once DOM is ready
    const positionTimer = setTimeout(() => {
      const success = updatePosition()
      if (success && triggerRef.current && menuRef.current) {
        // Calculate transform origin based on trigger position
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const menuRect = menuRef.current.getBoundingClientRect()

        // Determine horizontal origin
        let horizontalOrigin = "center"
        if (align === "start") {
          horizontalOrigin = "left"
        } else if (align === "end") {
          horizontalOrigin = "right"
        }

        // Determine vertical origin based on whether menu is above or below trigger
        const verticalOrigin = menuRect.top >= triggerRect.bottom ? "top" : "bottom"

        setTransformOrigin(`${verticalOrigin} ${horizontalOrigin}`)
        setIsPositioned(true)

        // Start animation after position is set
        startEnter()
      }
    }, 10)

    return () => {
      clearTimeout(positionTimer)
    }
  }, [triggerRef, menuRef, open, mounted, isExiting, updatePosition, align, startEnter])

  // Update position on window resize
  React.useEffect(() => {
    if (!open || !isPositioned) return

    const handleResize = () => {
      updatePosition()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [open, isPositioned, updatePosition])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Don't render anything if not mounted or not open and not exiting
  if (!mounted || (!open && !isExiting)) return null

  return createPortal(
    <div
      ref={menuRef}
      data-context-menu
      className={cn(
        "fixed z-50 min-w-[180px] overflow-hidden rounded-md border shadow-lg",
        "border-[hsl(var(--context-menu-border))] bg-[hsl(var(--context-menu-bg))]",
        isPositioned ? animationClass : "opacity-0",
        className,
      )}
      style={
        {
          top: `${position.top}px`,
          left: `${position.left}px`,
          visibility: ready ? "visible" : "hidden",
          "--transform-origin": transformOrigin,
        } as React.CSSProperties
      }
      onClick={(e) => {
        // Only prevent propagation for clicks on the menu container itself,
        // not on menu items (which should handle their own propagation)
        if (e.target === e.currentTarget) {
          e.stopPropagation()
        }
      }}
    >
      <div className="py-1">{children}</div>
    </div>,
    document.body,
  )
}

interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  destructive?: boolean
}

/**
 * An item in the context menu
 */
export function ContextMenuItem({ className, children, icon, destructive = false, ...props }: ContextMenuItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center px-3 py-2.5 text-sm outline-none",
        "text-[hsl(var(--context-menu-text))] hover:bg-[hsl(var(--context-menu-hover))] focus:bg-[hsl(var(--context-menu-hover))]",
        destructive && "text-[hsl(var(--destructive))]",
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "mr-3 flex h-4 w-4 items-center justify-center",
            destructive ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--context-menu-icon))]",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{children}</span>
    </button>
  )
}

/**
 * A separator line for the context menu
 */
export function ContextMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-[hsl(var(--context-menu-separator))]", className)} />
}

// Export constants for use in other components
export { CONTEXT_MENU_DATA_ATTR, CONTEXT_MENU_TRIGGER_DATA_ATTR }
