// Simplified notification type definitions

// Single notification interface for all use cases
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: number;
}

// Database notification interface (extends base with optional numeric ID for Dexie)
export interface DatabaseNotification extends Omit<Notification, 'id'> {
  id?: number;
}

// UI notification interface (extends base with formatted time)
export interface UINotification extends Notification {
  time: string;
}

// Add notification input type
export interface AddNotificationInput {
  title: string;
  message?: string;
}

