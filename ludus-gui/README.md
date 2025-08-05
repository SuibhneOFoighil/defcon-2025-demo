# Ludus Cloud GUI


## Getting Started

### Quick Setup

1. **Run setup script:**
   ```sh
   ./setup.sh
   ```

2. **Configure environment:**
   Update `.env.local` with your Ludus server details:
   - `LUDUS_API_BASE_URL` - Your Ludus server URL (e.g., `https://10.2.33.97:8080`)
   - `LUDUS_API_KEY` - Your API key from Ludus
   - `LUDUS_SSH_HOST` - Your Ludus server hostname/IP for SSH access
   - `LUDUS_SSH_USER` - SSH username (default: `root`)
   
   Note: `LUDUS_API_BASE_URL_ADMIN` stays as `https://127.0.0.1:8081` for all deployments - the SSH tunnel handles routing to your specific server.

#### Option 1: Disable Authentication (Quick Testing)

For testing on systems without Supabase access, you can disable authentication:

1. **Add to `.env.local`:**
   ```sh
   NEXT_PUBLIC_DISABLE_AUTH=true
   ```

2. **Start development:**
   ```sh
   bun run dev              # For basic features only
   bun run dev:with-tunnel  # For admin features (user/group management)
   ```

The application will bypass all authentication and start directly at the dashboard.

#### Option 2: Setup Local Supabase (Full Authentication)

For full authentication functionality, set up a local Supabase instance:

1. **Install Supabase CLI:**
   ```sh
   npm install -g supabase
   ```

2. **Initialize and start Supabase:**
   ```sh
   supabase init
   supabase start
   ```

3. **Update `.env.local` with local Supabase config:**
   ```sh
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
   ```

4. **Create a user account** via the Supabase Studio at `http://127.0.0.1:54323`

5. **Start development:**
   ```sh
   bun run dev              # For basic features only
   bun run dev:with-tunnel  # For admin features (user/group management)
   ```

See [Supabase Local Development Guide](https://supabase.com/docs/guides/local-development) for detailed setup instructions.

### Admin Features (SSH Tunnel)

Admin operations (user and group management) require an SSH tunnel to the Ludus server. The `dev:with-tunnel` script automatically sets this up by:
- Creating an SSH tunnel from localhost:8081 to your Ludus server's admin API
- Running the development server with admin features enabled

Ensure you have SSH access configured in `.env.local` before using admin features.

### Other Development Commands 
- **Storybook:** `bun run storybook`
- **Type checking:** `bun run typecheck:app`
- **Linting:** `bun run lint`
- **Testing:** `bun run test`

## Maintenance & Quality Framework

- **Testing:**
  - Uses [ViTest](https://vitest.dev/) for unit and component tests.
  - Storybook integration for UI tests and visual regression.
- **Automation:**
  - [Husky](https://typicode.github.io/husky/) hooks automatically run ViTest logic tests and Storybook UI tests on every commit and push, ensuring code quality and preventing regressions.
- **Component-Driven Development:**
  - All UI components are being refactored into Storybook stories for easy review, documentation, and testing.

## API Development

API Schema is generated from the OpenAPI spec in `public/schemas/ludus-api.json` using the following command:
```sh
bunx openapi-typescript public/schemas/ludus-api.json -o lib/api/ludus/schema.ts
```

At some point, we should transition to fetching the schema from the API server.

### API Asks
- Endpoint to list allowed/disallowed domains in testing mode (currently only supports updating range configuration)