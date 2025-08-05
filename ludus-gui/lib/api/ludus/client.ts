import createClient from 'openapi-fetch';
import type { paths } from './schema';

// For development/testing with self-signed certificates
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  // Disable SSL verification for development/testing
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Create the typed API client for our backend
export const apiClient = createClient<paths>({
  baseUrl: process.env.LUDUS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.LUDUS_API_KEY,
  },
});

// Create admin API client for admin-only endpoints
export const adminApiClient = createClient<paths>({
  baseUrl: process.env.LUDUS_API_BASE_URL_ADMIN,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.LUDUS_API_KEY,
  },
});

// Export the raw client for direct use if needed
export { apiClient as default }; 