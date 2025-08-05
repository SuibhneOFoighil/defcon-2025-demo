"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TwoRowHeaderProps {
  // First row props
  showBackButton?: boolean
  onBackClick?: () => void
  backLabel?: string
  notificationBellSlot?: React.ReactNode

  // Second row props
  children?: React.ReactNode
  className?: string
}

export function TwoRowHeader({
  showBackButton = false,
  onBackClick,
  backLabel = "Back",
  notificationBellSlot,
  children,
  className,
}: TwoRowHeaderProps) {
  const router = useRouter()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        "relative border-b border-border bg-card shadow-sm",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/15 after:to-transparent",
      )}
    >
      {/* First row - Navigation controls and notification */}
      <div
        className={cn(
          "flex items-center justify-between px-6 py-2 bg-card",
        )}
      >
        <div>
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-muted-foreground hover:text-foreground"
              aria-label={backLabel}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{backLabel}</span>
            </Button>
          )}
        </div>
        <div>
          {notificationBellSlot}
        </div>
      </div>

      {/* Second row - Page specific content */}
      <div
        className={cn(
          "px-6 py-3 relative",
          "bg-gradient-to-b from-card/90 to-card",
          className,
        )}
      >
        {children}
      </div>
    </header>
  )
}
