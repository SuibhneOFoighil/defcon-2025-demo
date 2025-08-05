/**
 * Shared utilities for range status display and badge styling
 */

export type RangeStatus = "SUCCESS" | "FAILURE" | "ERROR" | "PENDING" | "ACTIVE" | "NEVER DEPLOYED" | "UNKNOWN" | "DEPLOYING"

export type BadgeVariant = "default" | "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "info" | "orange" | "pink" | "gray"

/**
 * Maps range status to appropriate badge variant for consistent styling
 */
export const getStateBadgeVariant = (state: string | undefined): BadgeVariant => {
  switch (state?.toUpperCase()) {
    case "SUCCESS": 
      return "success"
    case "FAILURE":
    case "ERROR": 
      return "danger"
    case "DEPLOYING": 
      return "warning"
    case "ACTIVE": 
      return "info"
    case "NEVER DEPLOYED": 
      return "outline"
    default: 
      return "default"
  }
}

/**
 * Normalizes range status for display with proper capitalization
 */
export const normalizeStateForDisplay = (state: string | undefined): string => {
  if (!state) return "Unknown"
  
  switch (state.toUpperCase()) {
    case "SUCCESS": 
      return "Success"
    case "FAILURE": 
      return "Failure"
    case "ERROR": 
      return "Error"
    case "PENDING": 
      return "Pending"
    case "ACTIVE": 
      return "Active"
    case "NEVER DEPLOYED": 
      return "Never Deployed"
    default: 
      return state
  }
}