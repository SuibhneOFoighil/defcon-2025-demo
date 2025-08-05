import { User } from '@supabase/supabase-js'
import { logger } from './logger'

// Authentication configuration
export const AUTH_CONFIG = {
  isDisabled: process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true',
  mockUser: {
    id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'mock-user-id',
    email: process.env.NEXT_PUBLIC_MOCK_USER_EMAIL || 'mock@ludus.local',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    identities: [],
    factors: []
  } as User
} as const

// Log auth bypass status and production warnings
const authLogger = logger.child({ context: 'AUTH' })

if (AUTH_CONFIG.isDisabled) {
  if (process.env.NODE_ENV === 'production') {
    authLogger.error({
      environment: process.env.NODE_ENV,
      authDisabled: AUTH_CONFIG.isDisabled
    }, '⚠️ WARNING: Authentication is disabled in production!')
    
    // Also log to console for visibility
    console.error('⚠️ WARNING: Authentication is disabled in production!')
  } else {
    authLogger.info({
      environment: process.env.NODE_ENV,
      authDisabled: AUTH_CONFIG.isDisabled,
      mockUserId: AUTH_CONFIG.mockUser.id,
      mockUserEmail: AUTH_CONFIG.mockUser.email
    }, '🔓 Authentication bypass is active')
  }
}

// Helper function to log auth bypass in different contexts
export function logAuthBypass(context: string, metadata?: Record<string, unknown>) {
  if (AUTH_CONFIG.isDisabled) {
    authLogger.warn({
      context,
      bypassActive: true,
      ...metadata
    }, `🔓 Authentication bypassed in ${context}`)
  }
}

// Helper function to log auth operations
export function logAuthOperation(operation: string, success: boolean, metadata?: Record<string, unknown>) {
  if (AUTH_CONFIG.isDisabled) {
    authLogger.info({
      operation,
      success,
      bypassed: true,
      ...metadata
    }, `Auth operation ${operation} ${success ? 'completed' : 'failed'} (bypassed)`)
  } else {
    authLogger.info({
      operation,
      success,
      bypassed: false,
      ...metadata
    }, `Auth operation ${operation} ${success ? 'completed' : 'failed'}`)
  }
}

// Helper function to validate auth configuration
export function validateAuthConfig() {
  const issues: string[] = []
  
  if (AUTH_CONFIG.isDisabled && process.env.NODE_ENV === 'production') {
    issues.push('Authentication is disabled in production environment')
  }
  
  if (AUTH_CONFIG.isDisabled && !AUTH_CONFIG.mockUser.id) {
    issues.push('Mock user ID is missing when auth is disabled')
  }
  
  if (AUTH_CONFIG.isDisabled && !AUTH_CONFIG.mockUser.email) {
    issues.push('Mock user email is missing when auth is disabled')
  }
  
  if (issues.length > 0) {
    authLogger.error({ issues }, 'Authentication configuration validation failed')
    return false
  }
  
  return true
}

// Run validation on module load
validateAuthConfig()