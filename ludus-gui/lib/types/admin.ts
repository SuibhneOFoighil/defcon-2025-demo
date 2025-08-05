import type { components } from '@/lib/api/ludus/schema';

// Use the Ludus API UserObject directly
export type LudusUser = components['schemas']['UserObject'];

// Extended User type for UI purposes (adds selection state and id mapping)
export interface User extends LudusUser {
  id: string; // Maps to userID for compatibility with selection logic
  selected?: boolean;
}

// User role types - derived from the API
export type UserRole = "admin" | "user"; // Based on isAdmin boolean in API

// Group data interface
export interface Group {
  id: string
  name: string
  description: string
}
