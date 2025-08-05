# Authentication System Documentation

## Overview

The Ludus GUI implements a flexible authentication system that supports both Supabase-based authentication and a bypass mode for development/self-hosted environments. The system is designed to work seamlessly in offline environments where Supabase may not be available.

## Architecture

### Core Components

1. **Authentication Provider** (`contexts/auth-context.tsx`)
   - Manages user authentication state
   - Provides auth methods (signIn, signOut, signUp)
   - Handles both real Supabase auth and mock authentication

2. **Route Guard** (`components/auth/route-guard.tsx`)
   - Protects routes based on authentication status
   - Handles redirects between public and protected routes
   - Supports bypass mode for disabled authentication

3. **Middleware** (`middleware.ts`)
   - Manages session refresh on server requests
   - Bypasses Supabase operations when auth is disabled
   - Adds debug headers in development mode

4. **Authentication Configuration** (`lib/auth-config.ts`)
   - Centralized configuration for auth behavior
   - Environment variable management
   - Production safety warnings
   - Logging utilities

## Authentication Modes

### 1. Full Supabase Authentication (Default)

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# NEXT_PUBLIC_DISABLE_AUTH should be unset or false
```

**Behavior:**
- Users must authenticate via email/password
- Session management handled by Supabase
- Route protection enforced
- Login/logout flows active

**Components Involved:**
- Supabase client (`lib/utils/supabase/client.ts`)
- Session middleware (`lib/utils/supabase/middleware.ts`)
- Login forms (`components/auth/login-form.tsx`)

### 2. Authentication Bypass Mode

**Environment Variables:**
```bash
NEXT_PUBLIC_DISABLE_AUTH=true
# Optional: Custom mock user
NEXT_PUBLIC_MOCK_USER_ID=custom-user-id
NEXT_PUBLIC_MOCK_USER_EMAIL=user@example.com
```

**Behavior:**
- Authentication is completely bypassed
- Users are always considered authenticated
- No login/logout flows
- Direct access to dashboard
- Mock user object provided to components

**Use Cases:**
- Development environments without Supabase
- Self-hosted deployments in offline environments
- Testing and demonstration purposes

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes* | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | - | Supabase anonymous key |
| `NEXT_PUBLIC_DISABLE_AUTH` | No | `false` | Bypass authentication |
| `NEXT_PUBLIC_MOCK_USER_ID` | No | `mock-user-id` | Mock user ID when auth disabled |
| `NEXT_PUBLIC_MOCK_USER_EMAIL` | No | `mock@ludus.local` | Mock user email when auth disabled |

*Required only when authentication is enabled

### Configuration File

All authentication behavior is controlled through `lib/auth-config.ts`:

```typescript
export const AUTH_CONFIG = {
  isDisabled: process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true',
  mockUser: {
    id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'mock-user-id',
    email: process.env.NEXT_PUBLIC_MOCK_USER_EMAIL || 'mock@ludus.local',
    // ... other User properties
  }
} as const
```

## Route Protection

### Public Routes

Defined in `lib/routes.ts`:
- `/login` - Login page
- `/forgot-password` - Password reset
- `/reset-password` - Password reset confirmation
- Routes starting with `/(auth)` - Auth-related pages

### Protected Routes

All other routes require authentication:
- `/` - Dashboard
- `/ranges` - Range management
- `/templates` - Template management
- `/admin` - Administration
- `/settings` - User settings
- `/editor/*` - Range editor

### Route Guard Logic

The `RouteGuard` component handles route protection:

**When Authentication is Enabled:**
1. Unauthenticated users accessing protected routes → Redirect to `/login`
2. Authenticated users accessing public routes → Redirect to `/` (dashboard)

**When Authentication is Disabled:**
1. All users are considered authenticated
2. Access to public routes (like `/login`) → Redirect to `/` (dashboard)
3. All protected routes are accessible

## Layout Management

The application uses different layouts based on route type and authentication status:

### Layout Types

1. **Minimal Layout** (No Sidebar)
   - Used for authentication pages when auth is enabled
   - Used for editor pages
   - Clean interface without navigation

2. **Sidebar Layout** (With Sidebar)
   - Used for dashboard and main application pages
   - Includes navigation sidebar
   - Full application chrome

### Layout Logic

Located in `app/providers.tsx`:

```typescript
const showMinimalLayout = (isAuthPage && !AUTH_CONFIG.isDisabled) || isEditorPage

if (showMinimalLayout) {
  // Render without sidebar
} else {
  // Render with sidebar
}
```

**Decision Matrix:**

| Route Type | Auth Enabled | Auth Disabled | Layout |
|------------|--------------|---------------|---------|
| Auth pages | ✓ | - | Minimal (no sidebar) |
| Auth pages | - | ✓ | Redirected to dashboard |
| Dashboard | ✓ | ✓ | Sidebar |
| Editor | ✓ | ✓ | Minimal (no sidebar) |

## Security Considerations

### Production Safety

The system includes automatic warnings when authentication is disabled in production:

```typescript
if (AUTH_CONFIG.isDisabled && process.env.NODE_ENV === 'production') {
  console.error('⚠️ WARNING: Authentication is disabled in production!')
}
```

### Environment Variable Exposure

- `NEXT_PUBLIC_*` variables are exposed to the client-side code
- This is necessary for client-side routing decisions
- Sensitive auth keys should use appropriate Supabase RLS policies

### Mock User Security

When authentication is disabled:
- A static mock user is created
- Mock user ID can be customized via environment variables
- No real authentication tokens are involved
- Should only be used in development/self-hosted environments

## Logging and Debugging

### Structured Logging

The system uses the centralized logger (`lib/logger.ts`) for all auth-related logging:

```typescript
// Examples
logAuthBypass('RouteGuard', { pathname, isPublicRoute })
logAuthOperation('signIn', true, { email, bypassed: true })
```

### Debug Headers

In development mode, the middleware adds debug headers:

```http
X-Auth-Bypass: true
X-Auth-Bypass-Context: middleware
```

### Log Contexts

- `AUTH` - General authentication operations
- `RouteGuard` - Route protection and redirects
- `AuthProvider` - Authentication state management
- `Middleware` - Session management

## Development Setup

### Option 1: Local Supabase (Full Authentication)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize and start Supabase:
   ```bash
   supabase init
   supabase start
   ```

3. Configure environment:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   ```

4. Create user account via Supabase Studio at `http://127.0.0.1:54323`

### Option 2: Authentication Bypass (Quick Testing)

1. Configure environment:
   ```bash
   NEXT_PUBLIC_DISABLE_AUTH=true
   ```

2. Start development:
   ```bash
   bun run dev
   ```