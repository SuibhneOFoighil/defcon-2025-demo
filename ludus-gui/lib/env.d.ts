/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Ludus API Configuration
    LUDUS_API_BASE_URL?: string
    LUDUS_API_KEY?: string
    LUDUS_API_BASE_URL_ADMIN?: string
    
    // SSH Configuration
    LUDUS_SSH_HOST?: string
    LUDUS_SSH_USER?: string
    
    // Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
    
    // Authentication Bypass Configuration
    NEXT_PUBLIC_DISABLE_AUTH?: string
    NEXT_PUBLIC_MOCK_USER_ID?: string
    NEXT_PUBLIC_MOCK_USER_EMAIL?: string
    
    // Logging Configuration
    LOG_LEVEL?: string
    
    // Standard Next.js Environment Variables
    NODE_ENV: 'development' | 'production' | 'test'
  }
}