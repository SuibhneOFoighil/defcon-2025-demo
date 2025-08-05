"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"

/**
 * Props for the NotificationItem component
 */
interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  className?: string
}

/**
 * Component for displaying a single notification
 */
export function NotificationItem({ notification, onMarkAsRead, className }: NotificationItemProps) {
  const { id, title, message, read } = notification
  const [isExpanded, setIsExpanded] = useState(false)

  // Format the time display
  const formatTime = (createdAt: number) => {
    const now = Date.now()
    const diff = now - createdAt
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const time = formatTime(notification.createdAt)

  // Calculate if message needs truncation (more than 150 characters or 3 lines)
  const needsTruncation = useMemo(() => {
    return message && (message.length > 150 || message.split('\n').length > 3)
  }, [message])

  // Get truncated message (first 150 chars or 3 lines, whichever comes first)
  const truncatedMessage = useMemo(() => {
    if (!needsTruncation || !message) return message
    
    const lines = message.split('\n')
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n') + '...'
    }
    
    if (message.length > 150) {
      return message.slice(0, 150) + '...'
    }
    
    return message
  }, [message, needsTruncation])

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-card p-4 shadow-sm",
        !read && "border-l-4 border-l-primary",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">{time}</span>
      </div>

      {message && (
        needsTruncation ? (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="mt-1">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {isExpanded ? message : truncatedMessage}
              </p>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-1 h-3 w-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3 w-3" />
                      Show more
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </Collapsible>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap break-words">
            {message}
          </p>
        )
      )}

      {!read && onMarkAsRead && (
        <div className="mt-3 flex items-center justify-end">
          <Button
            variant="link"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={handleMarkAsRead}
          >
            Mark as read
          </Button>
        </div>
      )}
    </div>
  )
}
