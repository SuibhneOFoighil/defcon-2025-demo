# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Requirements

This project is a web-based UI for the Ludus Cyber Range platform, which currently operates via a CLI and REST API. The primary goal is to create a visual, intuitive interface for managing cyber ranges through a drag-and-drop, canvas-based system.

* **Core Functionality**: The UI must enable visual creation, modification, and management of Ludus environments. It should maintain all existing Ludus capabilities.
* **Frontend Technology**: The application must be built with a React-based framework using TypeScript. It will use a canvas library, such as `reactflow`, to support a node-based, zoomable workspace.
* **Backend Integration**: The frontend will integrate fully with the existing Ludus REST API for all operations, using the current API key system for authentication. Some features, like VM state and resource usage, will require new API endpoints that expose data from the Proxmox API.
* **Key Features**:
    * **VM Management**: Drag-and-drop VM creation, property editing, and actions (start, stop, snapshot).
    * **Network Management**: Visual creation of VLANs and interactive creation of firewall rules to control traffic between VLANs and to the internet.
    * **Testing Mode**: Clear visual indicators when "Testing Mode" is active, along with UI elements for managing allowed IPs/domains.
* **Offline Capability**: The entire project must be deployable and operable in an offline, self-hosted environment.

THIS PROJECT MUST BE ENTIRELY SELFHOSTABLE WITHIN AN OFFLINE ENVIRONMENT.

## Development Commands

-   **Install dependencies:** `bun install`
-   **Development:** `bun run dev` (Next.js frontend only)
-   **Development with admin features:** `bun run dev:with-tunnel` (includes SSH tunnel for admin operations)
-   **SSH tunnel only:** `bun run tunnel` (for admin API access)
-   **Build:** `bun run build`
-   **Lint:** `bun run lint`
-   **Type checking:** `bun run typecheck` (full project including stories)
-   **Type checking (app only):** `bun run typecheck:app` (excludes stories, used in pre-commit)
-   **Run tests:** `bun run test` (runs both unit and storybook tests)
-   **Run unit tests only:** `bun run test:unit`
-   **Run storybook tests only:** `bun run test:storybook`
-   **Run single test:** `bunx vitest run [test-file-path]` or use pattern: `bunx vitest run -t "test name pattern"`
-   **IMPORTANT:** Use `bun run test:unit` instead of `bun test` for unit testing. The `bun test` command uses Bun's built-in test runner which lacks the jsdom environment and DOM APIs that React Testing Library requires. Unit tests need Vitest with jsdom configuration.
-   **Storybook development:** `bun run storybook`
-   **Generate API schema types:** `bunx openapi-typescript public/schemas/ludus-api.json -o lib/api/ludus/schema.ts`

## TypeScript Status

The application code is **100% type-safe** with zero TypeScript errors. The pre-commit hook runs `typecheck` which validates only application code (excluding Storybook stories). Use `typecheck` for full project validation including stories.

## Architecture Overview

This is a Next.js 15 application for Ludus Cloud GUI - a cybersecurity range management interface.

### API Integration

-   Uses `openapi-fetch` with TypeScript schema generation from OpenAPI specs
-   API client located at `lib/api/ludus/client.ts` with typed endpoints
-   Next.js API routes in `app/api/ludus/` proxy to backend services
-   Environment variables: `LUDUS_API_BASE_URL` and `LUDUS_API_KEY`
-   Admin features require SSH tunnel: `LUDUS_API_BASE_URL_ADMIN` points to `https://127.0.0.1:8081`

### State Management

-   React Context providers for domain-specific state (ranges, templates, users, groups)
-   TanStack Query for server state management and caching
-   Selection state managed through dedicated context providers in `contexts/`

### UI Architecture

-   Component-driven development with comprehensive Storybook stories
-   Radix UI primitives with custom styling via Tailwind CSS
-   Reusable UI components in `components/ui/`
-   Domain-specific components organized by feature (admin, dashboard, wizards)
-   All components must use CSS variables from `app/tailwind.css` via Tailwind's arbitrary value syntax for theming

### Testing Strategy

-   Vitest for unit tests with separate configs for unit (`vitest.unit.config.ts`) and Storybook (`vitest.storybook.config.ts`)
-   Storybook integration tests using browser testing with Playwright
-   Husky git hooks ensure tests pass before commits
-   Unit tests in `__tests__/` directory mirroring component structure
-   Test fixtures in `__tests__/fixtures/`

### Key Patterns

-   Wizard components for multi-step workflows (range/template creation)
-   Context menu providers for bulk actions and selection management
-   Network topology visualization using ReactFlow
-   Theme system with dark/light mode support via `next-themes`
-   CSS-in-JS theming with Tailwind CSS v4 using PostCSS

### File Organization

-   `app/` - Next.js App Router pages and API routes
-   `components/` - Reusable UI components organized by domain
-   `contexts/` - React Context providers for state management
-   `lib/` - Utilities, API clients, and shared logic
-   `hooks/` - Custom React hooks
-   `stories/` - Storybook stories for all components
-   `__tests__/` - Unit tests
-   `__agents__/` - **for all planning and analysis documents by claude code related to this project. Store as MD files.**

### Component Development Standards

When developing components, refer to the following Cursor rules that are configured for this project:

1. **Component Styling**: All components must use Tailwind CSS utility classes with CSS variables from `app/tailwind.css`. Components must support both light and dark modes.
2. **Storybook Stories**: All components must have comprehensive Storybook stories covering all states and variants, with `play` functions for interactive testing.
3. **Unit Testing**: Components must have unit tests covering happy paths, error states, and user interactions using Vitest and Testing Library.
4. **Performance Optimization**: Prefer memoization over the useState/useEffect pattern whenever possible. Use `useMemo` for expensive computations, `useCallback` for event handlers, and `React.memo` for frequently rendered components. Avoid the pattern of setting state in useEffect based on prop changes - derive state directly with memoization instead.