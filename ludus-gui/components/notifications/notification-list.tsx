import type { Notification } from "@/lib/types"
import { NotificationItem } from "./notification-item"
import { EmptyState } from "@/components/ui/empty-state"
import { Inbox } from "lucide-react"

/**
 * Props for the NotificationList component
 */
interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
}

/**
 * Component for displaying a list of notifications
 */
export function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No Notifications Yet"
        description="You currently have no new notifications. We'll let you know when there's something new!"
        icon={<Inbox className="w-12 h-12" />}
        className="h-auto py-10"
      />
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onMarkAsRead={onMarkAsRead} />
      ))}
    </div>
  )
}
