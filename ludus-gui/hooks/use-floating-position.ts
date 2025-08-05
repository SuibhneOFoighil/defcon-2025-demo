"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

export type FloatingAlignment = "start" | "center" | "end"

interface UseFloatingPositionProps {
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLElement>
  align?: FloatingAlignment
  offset?: number
  avoidCollisions?: boolean
}

interface Position {
  top: number
  left: number
}

/**
 * Hook for calculating floating element position relative to a trigger element
 */
export function useFloatingPosition({
  triggerRef,
  contentRef,
  align = "center",
  offset = 4,
  avoidCollisions = true,
}: UseFloatingPositionProps) {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })
  const [ready, setReady] = useState(false)

  // Store the initial trigger position for stable positioning
  const initialPositionRef = useRef<{
    triggerRect: DOMRect | null
    contentRect: DOMRect | null
  }>({
    triggerRect: null,
    contentRect: null,
  })

  // Reset position tracking
  const resetPosition = useCallback(() => {
    initialPositionRef.current = {
      triggerRect: null,
      contentRect: null,
    }
    setReady(false)
  }, [])

  // Calculate and update position
  const updatePosition = useCallback(() => {
    // Safety check: ensure refs exist and have current values
    if (!triggerRef?.current || !contentRef?.current) return false

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const contentRect = contentRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Store initial measurements if not already set
    if (!initialPositionRef.current.triggerRect) {
      initialPositionRef.current.triggerRect = { ...triggerRect }
    }
    if (!initialPositionRef.current.contentRect) {
      initialPositionRef.current.contentRect = { ...contentRect }
    }

    // Calculate initial position (below and aligned with trigger)
    let top = triggerRect.bottom + offset
    let left = triggerRect.left

    // Adjust horizontal alignment
    if (align === "center") {
      left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2
    } else if (align === "end") {
      left = triggerRect.right - contentRect.width
    }

    if (avoidCollisions) {
      // Ensure content stays within viewport horizontally
      if (left + contentRect.width > viewportWidth) {
        left = Math.max(8, viewportWidth - contentRect.width - 8)
      }
      if (left < 8) {
        left = 8
      }

      // If content would go below viewport, position it above the trigger
      if (top + contentRect.height > viewportHeight) {
        top = Math.max(8, triggerRect.top - contentRect.height - offset)
      }

      // If content would go above viewport, position it at the top with a small margin
      if (top < 8) {
        top = 8
      }
    }

    setPosition({ top, left })
    setReady(true)
    return true
  }, [triggerRef, contentRef, align, offset, avoidCollisions])

  return {
    position,
    updatePosition,
    resetPosition,
    ready,
  }
}
