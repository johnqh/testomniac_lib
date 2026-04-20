# Testomniac Lib

Business logic library with Zustand stores for the Testomniac application.

**npm**: `@sudobility/entitytestomniac_lib` (restricted, BUSL-1.1)

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Bun
- **Package Manager**: Bun (do not use npm/yarn/pnpm for installing dependencies)
- **Build**: TypeScript compiler (ESM)
- **Test**: Vitest
- **State**: Zustand 5
- **Data Fetching**: TanStack Query 5

## Project Structure

```
src/
├── index.ts                              # Main exports
└── business/
    ├── index.ts                          # Business layer exports
    ├── stores/
    │   ├── index.ts                      # Store exports
    │   └── scanProgressStore.ts          # Real-time scan progress state
    ├── hooks/
    │   ├── index.ts                      # Hook exports
    │   ├── useScanManager.ts             # Scan submission + progress tracking
    │   ├── useDashboardManager.ts        # Dashboard data orchestration
    │   └── useRunManager.ts              # Individual run data management
    └── utils/
        └── index.ts                      # Business utility exports
```

## Commands

```bash
bun run build          # Build ESM
bun run clean          # Remove dist/
bun test               # Run Vitest tests
bun run typecheck      # TypeScript check
bun run lint           # Run ESLint
bun run verify         # All checks + build (use before commit)
bun run prepublishOnly # Clean + build (runs on publish)
```

## Key Concepts

### scanProgressStore

Zustand store for real-time scan progress tracking. Holds SSE-streamed state updates (phase, counters, events) for the active scan.

### useScanManager

Orchestrates scan submission and real-time progress:

- **Config**: `{ baseUrl, networkClient, token }`
- Wraps `useSubmitScan` mutation from entitytestomniac_client
- Manages SSE connection for scan progress updates
- Updates `scanProgressStore` with live data

### useDashboardManager

Dashboard-level data orchestration:

- **Config**: `{ baseUrl, networkClient, entitySlug, token }`
- Fetches projects and their runs for the current entity
- Provides aggregated dashboard statistics

### useRunManager

Individual run data management:

- **Config**: `{ baseUrl, networkClient, runId, token }`
- Fetches run details, pages, test cases, issues, personas
- Provides run-level statistics and navigation helpers

These hooks are the primary integration point consumed by UI layers (entitytestomniac_app, entityentitytestomniac_app_rn).

## Peer Dependencies

- `react` (>=18)
- `@tanstack/react-query` (>=5)
- `zustand` (>=5)
- `@sudobility/types` — NetworkClient interface

## Architecture

```
entitytestomniac_app / entityentitytestomniac_app_rn
    ↓ uses
@sudobility/entitytestomniac_lib (this package)
    ↓ uses
@sudobility/entitytestomniac_client (API hooks)
    ↓ uses
@sudobility/entitytestomniac_types (type definitions)
```

## Related Projects

- **entitytestomniac_types** — Shared type definitions; imported transitively via entitytestomniac_client
- **entitytestomniac_client** — API client SDK; this library wraps its hooks with business logic and Zustand state
- **entitytestomniac_app** — Web frontend that consumes `useScanManager`, `useDashboardManager`, `useRunManager` from this library
- **entityentitytestomniac_app_rn** — React Native app that consumes these hooks via file: links
- **entitytestomniac_api** — Backend server; this library communicates with it indirectly through entitytestomniac_client

## Coding Patterns

- `useScanManager`, `useDashboardManager`, and `useRunManager` are the primary hooks -- they orchestrate entitytestomniac_client hooks + Zustand store into unified interfaces for UI layers
- `scanProgressStore` holds real-time SSE-streamed scan state -- use it for live progress UI
- Token reactivity: changing the auth token resets store state to prevent stale cross-user data
- `useRef` is used to prevent duplicate fetch calls on React strict-mode double-mount
- Hooks accept a config object with `{ baseUrl, networkClient, token }` plus entity-specific params

## Gotchas

- Zustand store is in-memory only -- there is no persistence; data is lost on page refresh or app restart
- `scanProgressStore` state is ephemeral -- only valid while SSE connection is active
- Token change resets the entire store state -- this is intentional to prevent data leakage between users
- `useRef` guards prevent duplicate fetches on mount; be careful not to break this guard when modifying hooks
- This is a published npm package (`@sudobility/entitytestomniac_lib`) -- coordinate breaking changes with entitytestomniac_app and entityentitytestomniac_app_rn
