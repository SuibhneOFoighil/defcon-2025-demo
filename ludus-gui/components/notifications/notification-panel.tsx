"use client"

import { useRef } from "react"
import { X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { NotificationList } from "./notification-list"
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * Component for the notification panel content, designed to be used within a Sheet
 */
export function NotificationPanel() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  const panelRef = useRef<HTMLDivElement>(null)

  return (
    <SheetContent
      ref={panelRef}
      showCloseButton={false}
      className="w-full max-w-[90vw] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] p-0 flex flex-col border-border"
      aria-labelledby="notification-panel-title"
      aria-describedby="notification-panel-description"
    >
      {/* Header Section */}
      <SheetHeader className="px-4 sm:px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <SheetTitle id="notification-panel-title" className="text-lg font-semibold text-foreground">
            Notifications
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              size="sm"
              className="text-sm font-medium text-primary hover:text-primary hover:underline p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
            >
              Mark all as read
            </Button>
            <SheetClose asChild>
              <IconButton variant="ghost" size="sm" className="h-8 w-8">
                <X className="h-4 w-4" />
              </IconButton>
            </SheetClose>
          </div>
        </div>
        <SheetDescription id="notification-panel-description" className="sr-only">
          A list of your recent notifications.
        </SheetDescription>
      </SheetHeader>


      {/* Content Section */}
      <ScrollArea className="flex-1 bg-background">
        <div className="p-4">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={(id) => {
              markAsRead(id)
            }}
          />
        </div>
      </ScrollArea>
    </SheetContent>
  )
}
