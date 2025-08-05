"use client"

import { Bell } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { IconButton, type IconButtonProps } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

/**
 * Props for the NotificationBell component.
 * Extends IconButtonProps to accept all props an IconButton can.
 */
type NotificationBellProps = Omit<IconButtonProps, 'aria-label'> & {
  // We'll generate aria-label internally based on unreadCount
  // className is inherited from IconButtonProps (if it extends ButtonHTMLAttributes)
}

/**
 * Component for the notification bell icon, intended to be used as a SheetTrigger.
 * Displays an unread count badge.
 */
export function NotificationBell({ className, ...props }: NotificationBellProps) {
  const { unreadCount } = useNotifications()

  return (
    <IconButton
      variant="ghost"
      className={cn("relative", className)}
      aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      {...props}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />}
    </IconButton>
  )
}
