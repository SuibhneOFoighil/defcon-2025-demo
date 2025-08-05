"use client"

import { useEffect, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FloatingActionBarProps {
  /**
   * Whether the action bar should be visible
   */
  isActive: boolean
  /**
   * Content to display inside the action bar
   */
  children: ReactNode
  /**
   * Optional additional className for styling
   */
  className?: string
}

export function FloatingActionBar({ isActive, children, className }: FloatingActionBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Short delay to allow for smooth animation
    const timer = setTimeout(() => {
      setIsVisible(isActive)
    }, 100)

    return () => clearTimeout(timer)
  }, [isActive])

  if (!isActive) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-lg shadow-lg transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        className,
      )}
    >
      <div className="py-3 px-6">{children}</div>
    </div>
  )
}
