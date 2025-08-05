"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import type { ActionButtonConfig } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

/**
 * Props for the PageHeader component
 */
interface PageHeaderProps {
  title: string
  titleSuffix?: React.ReactNode
  actionButton?: ActionButtonConfig
  className?: string
  children?: React.ReactNode
  showBackButton?: boolean
  onBackClick?: () => void
}

/**
 * Component for the page header with title, tabs, and action button
 */
export function PageHeader({
  title,
  titleSuffix,
  actionButton,
  className = "",
  children,
  showBackButton = false,
  onBackClick,
}: PageHeaderProps) {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)

  // Handle action button click
  const handleActionClick = () => {
    if (actionButton?.onClick) {
      actionButton.onClick()
    }
  }


  return (
    <Sheet open={isNotificationPanelOpen} onOpenChange={setIsNotificationPanelOpen}>
      <header
        className={cn(
          "relative border-b border-border bg-card shadow-sm",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/15 after:to-transparent",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back button (if needed) and Title */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <h1 className={cn("text-lg font-medium text-foreground text-shadow-sm")}>
                {title}
              </h1>
              {titleSuffix}
            </div>
          </div>


          {/* Right: Action Buttons and Notification Bell */}
          <div className="flex items-center gap-3">
            {children}
            {actionButton && (
              <Button
                onClick={handleActionClick}
                variant="elevated"
              >
                {actionButton.icon && <actionButton.icon className="mr-2 h-4 w-4" />}
                {actionButton.label}
              </Button>
            )}
            <SheetTrigger asChild>
              <NotificationBell />
            </SheetTrigger>
          </div>
        </div>
      </header>
      <NotificationPanel />
    </Sheet>
  )
}
// If the PageHeader component has a fixed height or position that might be affecting scrolling,
// we would update it here. However, since we don't have the full code for this component,
// we're assuming it's correctly implemented and doesn't interfere with scrolling.
