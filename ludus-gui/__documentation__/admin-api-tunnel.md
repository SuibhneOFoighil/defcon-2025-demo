# Admin API SSH Tunnel

## Overview
Admin operations in Ludus require connecting through an SSH tunnel to the admin API on port 8081.

## Setup

1. Configure SSH access in `.env.local`:
   ```
   LUDUS_SSH_HOST=your-ludus-server.example.com
   LUDUS_SSH_USER=root
   ```

2. Run development with tunnel:
   ```bash
   bun run dev:with-tunnel
   ```

## How It Works

- The `dev:with-tunnel` script runs both the Next.js dev server and SSH tunnel concurrently
- SSH tunnel forwards local port 8081 to the Ludus server's admin API (127.0.0.1:8081)
- Admin API client connects to `https://127.0.0.1:8081`
- Regular API operations use the standard API URL without tunneling

## Troubleshooting

**ECONNREFUSED errors**: SSH tunnel not running. Use `dev:with-tunnel` instead of `dev`.

**"You must use the ludus-admin server" error**: API detected direct connection. Ensure `LUDUS_API_BASE_URL_ADMIN` is set to `https://127.0.0.1:8081`.

**SSH connection failed**: Verify SSH credentials and host in `.env.local`.