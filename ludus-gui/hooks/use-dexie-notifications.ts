import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { UINotification, DatabaseNotification, AddNotificationInput } from "@/lib/types/notification";

// Mock user ID - replace with actual auth when implemented
const MOCK_USER_ID = "user-123";

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

// Convert Dexie notification to UI format
const mapDexieNotificationToUI = (dexieNotification: DatabaseNotification): UINotification => ({
  id: dexieNotification.id!.toString(),
  userId: dexieNotification.userId,
  title: dexieNotification.title,
  message: dexieNotification.message,
  time: formatRelativeTime(dexieNotification.createdAt),
  read: dexieNotification.read,
  createdAt: dexieNotification.createdAt,
});

export function useDexieNotifications() {
  // Get notifications from Dexie with live updates
  const dexieNotifications = useLiveQuery(
    () => {
      return db.notifications
        .where('userId')
        .equals(MOCK_USER_ID)
        .reverse()
        .sortBy('createdAt')
        .then(results => results.slice(0, 50)); // Limit to 50 most recent
    },
    [MOCK_USER_ID]
  );

  const unreadCount = useLiveQuery(
    () => {
      return db.notifications
        .where('userId')
        .equals(MOCK_USER_ID)
        .and(notification => !notification.read)
        .count();
    },
    [MOCK_USER_ID]
  );

  // Convert Dexie notifications to UI format
  const notifications: UINotification[] = 
    Array.isArray(dexieNotifications) ? dexieNotifications.map(mapDexieNotificationToUI) : [];

  // Create notification function
  const addNotification = useCallback(async (notification: AddNotificationInput) => {
    try {
      await db.notifications.add({
        userId: MOCK_USER_ID,
        title: notification.title,
        message: notification.message,
        read: false,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await db.notifications.update(parseInt(notificationId), { read: true });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await db.notifications
        .where('userId')
        .equals(MOCK_USER_ID)
        .modify({ read: true });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  // Helper functions for specific notification types
  const notifyDeploymentSuccess = useCallback((rangeName: string, _rangeId: string) => {
    addNotification({
      title: "Deployment Successful",
      message: `Range "${rangeName}" has been deployed successfully.`,
    });
  }, [addNotification]);

  const notifyDeploymentFailure = useCallback((rangeName: string, _rangeId: string, error?: string) => {
    addNotification({
      title: "Deployment Failed",
      message: `Range "${rangeName}" deployment failed.${error ? ` Error: ${error}` : ""}`,
    });
  }, [addNotification]);

  const notifyTemplateReady = useCallback((templateName: string) => {
    addNotification({
      title: "Template Ready",
      message: `Template "${templateName}" is now ready for use.`,
    });
  }, [addNotification]);

  const notifySystemAlert = useCallback((message: string, _metadata?: any) => {
    addNotification({
      title: "System Alert",
      message,
    });
  }, [addNotification]);

  const notifyTestingStarted = useCallback((rangeName: string, _rangeId: string) => {
    addNotification({
      title: "Testing Mode Active",
      message: `Testing mode has been successfully started for range "${rangeName}".`,
    });
  }, [addNotification]);

  const notifyTestingStopped = useCallback((rangeName: string, _rangeId: string) => {
    addNotification({
      title: "Testing Mode Stopped",
      message: `Testing mode has been stopped for range "${rangeName}". Network access is restored.`,
    });
  }, [addNotification]);

  const notifyPowerOnComplete = useCallback((rangeName: string, _rangeId: string) => {
    addNotification({
      title: "VMs Powered On",
      message: `All VMs in range "${rangeName}" have been powered on.`,
    });
  }, [addNotification]);

  const notifyPowerOffComplete = useCallback((rangeName: string, _rangeId: string) => {
    addNotification({
      title: "VMs Powered Off",
      message: `All VMs in range "${rangeName}" have been powered off.`,
    });
  }, [addNotification]);

  const notifyDestroyComplete = useCallback((rangeName: string, _rangeId: string) => {
    addNotification({
      title: "Range Destroyed",
      message: `Range "${rangeName}" and all its resources have been successfully destroyed.`,
    });
  }, [addNotification]);

  const notifyTestingStartFailed = useCallback((rangeName: string, _rangeId: string, error?: string) => {
    addNotification({
      title: "Testing Mode Start Failed",
      message: `Failed to start testing mode for range "${rangeName}".${error ? ` Error: ${error}` : ""}`,
    });
  }, [addNotification]);

  const notifyTestingStopFailed = useCallback((rangeName: string, _rangeId: string, error?: string) => {
    addNotification({
      title: "Testing Mode Stop Failed",
      message: `Failed to stop testing mode for range "${rangeName}".${error ? ` Error: ${error}` : ""}`,
    });
  }, [addNotification]);

  const notifyPowerOnFailed = useCallback((rangeName: string, _rangeId: string, error?: string) => {
    addNotification({
      title: "Power On Failed",
      message: `Failed to power on VMs in range "${rangeName}".${error ? ` Error: ${error}` : ""}`,
    });
  }, [addNotification]);

  const notifyPowerOffFailed = useCallback((rangeName: string, _rangeId: string, error?: string) => {
    addNotification({
      title: "Power Off Failed",
      message: `Failed to power off VMs in range "${rangeName}".${error ? ` Error: ${error}` : ""}`,
    });
  }, [addNotification]);

  const notifyDestroyFailed = useCallback((rangeName: string, _rangeId: string, error?: string) => {
    addNotification({
      title: "Range Destruction Failed",
      message: `Failed to destroy range "${rangeName}".${error ? ` Error: ${error}` : ""}`,
    });
  }, [addNotification]);


  return {
    notifications,
    unreadCount: unreadCount || 0,
    isLoading: dexieNotifications === undefined,
    addNotification,
    markAsRead,
    markAllAsRead,
    // Helper functions
    notifyDeploymentSuccess,
    notifyDeploymentFailure,
    notifyTemplateReady,
    notifySystemAlert,
    notifyTestingStarted,
    notifyTestingStopped,
    notifyTestingStartFailed,
    notifyTestingStopFailed,
    notifyPowerOnComplete,
    notifyPowerOffComplete,
    notifyPowerOnFailed,
    notifyPowerOffFailed,
    notifyDestroyComplete,
    notifyDestroyFailed,
  };
}