"use client"

import { createContext, useContext, type ReactNode, useState, useCallback, useEffect } from "react"
import type { Notification } from "@/lib/types"
import type { AddNotificationInput } from "@/lib/types/notification"
import { useDexieNotifications } from "@/hooks/use-dexie-notifications"

/**
 * Interface for the notification context value
 */
interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  isVisible: boolean
  isLoading: boolean
  openNotifications: () => void
  closeNotifications: () => void
  toggleNotifications: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: AddNotificationInput) => void
  removeNotification: (id: string) => void
  // Enhanced notification helpers
  notifyDeploymentSuccess: (rangeName: string, rangeId: string) => void
  notifyDeploymentFailure: (rangeName: string, rangeId: string, error?: string) => void
  notifyTemplateReady: (templateName: string) => void
  notifySystemAlert: (message: string, metadata?: any) => void
  notifyTestingStarted: (rangeName: string, rangeId: string) => void
  notifyTestingStopped: (rangeName: string, rangeId: string) => void
  notifyTestingStartFailed: (rangeName: string, rangeId: string, error?: string) => void
  notifyTestingStopFailed: (rangeName: string, rangeId: string, error?: string) => void
  notifyPowerOnComplete: (rangeName: string, rangeId: string) => void
  notifyPowerOffComplete: (rangeName: string, rangeId: string) => void
  notifyPowerOnFailed: (rangeName: string, rangeId: string, error?: string) => void
  notifyPowerOffFailed: (rangeName: string, rangeId: string, error?: string) => void
  notifyDestroyComplete: (rangeName: string, rangeId: string) => void
  notifyDestroyFailed: (rangeName: string, rangeId: string, error?: string) => void
}

/**
 * Context for managing notifications
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

/**
 * Fallback local notifications for when Convex is unavailable
 */
const fallbackNotifications: Notification[] = [
  {
    id: "fallback-1",
    userId: "user-123",
    title: "Welcome to Ludus GUI",
    message: "Your cybersecurity range management interface is ready to use.",
    read: false,
    createdAt: Date.now(),
  },
]

/**
 * Props for the NotificationProvider component
 */
interface NotificationProviderProps {
  children: ReactNode
  useFallback?: boolean // Option to force fallback mode for testing
}

/**
 * Provider component for notification state with Convex integration
 * @param props - Component props
 * @returns Provider component
 */
export function NotificationProvider({ children, useFallback = false }: NotificationProviderProps) {
  // Local UI state
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(fallbackNotifications)

  // Dexie integration
  const dexieNotifications = useDexieNotifications()

  // Determine which notifications to use
  const useDexie = !useFallback && !dexieNotifications.isLoading
  const notifications = useDexie ? dexieNotifications.notifications : localNotifications
  const unreadCount = useDexie ? dexieNotifications.unreadCount : localNotifications.filter(n => !n.read).length


  // Handle opening and closing with animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready before animation
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const openNotifications = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeNotifications = useCallback(() => {
    setIsVisible(false)
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setIsOpen(false)
    }, 300) // Match this with the CSS transition duration
  }, [])

  const toggleNotifications = useCallback(() => {
    if (isOpen) {
      closeNotifications()
    } else {
      openNotifications()
    }
  }, [isOpen, openNotifications, closeNotifications])

  // Mark as read function - delegates to appropriate implementation
  const markAsRead = useCallback((id: string) => {
    if (useDexie) {
      dexieNotifications.markAsRead(id)
    } else {
      setLocalNotifications((prev: Notification[]) =>
        prev.map((notification: Notification) => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    }
  }, [useDexie, dexieNotifications])

  // Mark all as read function
  const markAllAsRead = useCallback(() => {
    if (useDexie) {
      dexieNotifications.markAllAsRead()
    } else {
      setLocalNotifications((prev: Notification[]) => 
        prev.map((notification: Notification) => ({ ...notification, read: true }))
      )
    }
  }, [useDexie, dexieNotifications])

  // Add notification function
  const addNotification = useCallback((notification: AddNotificationInput) => {
    if (useDexie) {
      dexieNotifications.addNotification(notification)
    } else {
      const newNotification: Notification = {
        id: Date.now().toString(),
        userId: "user-123",
        title: notification.title,
        message: notification.message,
        read: false,
        createdAt: Date.now(),
      }
      setLocalNotifications((prev: Notification[]) => [newNotification, ...prev])
    }
  }, [useDexie, dexieNotifications])

  const removeNotification = useCallback((id: string) => {
    setLocalNotifications((prev: Notification[]) => prev.filter((notification: Notification) => notification.id !== id))
  }, [])

  // Enhanced notification helpers - use Dexie when available
  const notifyDeploymentSuccess = useCallback((rangeName: string, rangeId: string) => {
    if (useDexie) {
      dexieNotifications.notifyDeploymentSuccess(rangeName, rangeId)
    } else {
      addNotification({
        title: "Deployment Successful",
        message: `Range "${rangeName}" has been deployed successfully.`,
      })
    }
  }, [useDexie, dexieNotifications, addNotification])

  const notifyDeploymentFailure = useCallback((rangeName: string, rangeId: string, error?: string) => {
    if (useDexie) {
      dexieNotifications.notifyDeploymentFailure(rangeName, rangeId, error)
    } else {
      addNotification({
        title: "Deployment Failed",
        message: `Range "${rangeName}" deployment failed.${error ? ` Error: ${error}` : ""}`,
      })
    }
  }, [useDexie, dexieNotifications, addNotification])

  const notifyTemplateReady = useCallback((templateName: string) => {
    if (useDexie) {
      dexieNotifications.notifyTemplateReady(templateName)
    } else {
      addNotification({
        title: "Template Ready",
        message: `Template "${templateName}" is now ready for use.`,
      })
    }
  }, [useDexie, dexieNotifications, addNotification])

  const notifySystemAlert = useCallback((message: string, metadata?: any) => {
    if (useDexie) {
      dexieNotifications.notifySystemAlert(message, metadata)
    } else {
      addNotification({
        title: "System Alert",
        message,
      })
    }
  }, [useDexie, dexieNotifications, addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        isVisible,
        isLoading: dexieNotifications.isLoading,
        openNotifications,
        closeNotifications,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
        notifyDeploymentSuccess,
        notifyDeploymentFailure,
        notifyTemplateReady,
        notifySystemAlert,
        notifyTestingStarted: dexieNotifications.notifyTestingStarted,
        notifyTestingStopped: dexieNotifications.notifyTestingStopped,
        notifyTestingStartFailed: dexieNotifications.notifyTestingStartFailed,
        notifyTestingStopFailed: dexieNotifications.notifyTestingStopFailed,
        notifyPowerOnComplete: dexieNotifications.notifyPowerOnComplete,
        notifyPowerOffComplete: dexieNotifications.notifyPowerOffComplete,
        notifyPowerOnFailed: dexieNotifications.notifyPowerOnFailed,
        notifyPowerOffFailed: dexieNotifications.notifyPowerOffFailed,
        notifyDestroyComplete: dexieNotifications.notifyDestroyComplete,
        notifyDestroyFailed: dexieNotifications.notifyDestroyFailed,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Custom hook for accessing notification state
 * @returns Notification context value
 * @throws Error if used outside of NotificationProvider
 */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }

  return context
}
