# Testomniac Lib

Business logic library with Zustand stores for the Testomniac application.

**npm**: `@sudobility/testomniac_lib` (restricted, BUSL-1.1)

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
    │   └── scanProgressStore.ts          # Real-time scan progress state (Zustand)
    ├── hooks/
    │   ├── index.ts                      # Hook exports
    │   ├── useScanManager.ts             # Scan submission + SSE progress tracking
    │   ├── useDashboardManager.ts        # Dashboard data orchestration
    │   ├── useRunManager.ts              # Run data management (details, pages, personas)
    │   ├── useEntityManager.ts           # Entity fetching with auto-retry
    │   ├── useEnvironmentManager.ts      # Environment pages/interactions/surfaces
    │   ├── useFindingsAnalysis.ts        # Findings analysis by priority/type
    │   ├── usePageMapData.ts             # Graph nodes/edges from pages & interactions
    │   ├── usePageInteractionGroups.ts   # Group interactions relative to a page
    │   ├── useTestRunsAnalysis.ts        # Test run status counts
    │   ├── useSequenceGenerator.ts       # Test sequence generation
    │   ├── usePersistedState.ts          # Platform-agnostic persisted state hook
    │   └── __tests__/
    │       └── usePersistedState.test.ts # Persisted state tests
    └── utils/
        ├── index.ts                      # Utility exports
        ├── formatDuration.ts             # Convert ms → "1h 5m", "2m 15s"
        ├── formatDate.ts                 # ISO date → locale string
        ├── formatMultilineLog.ts         # Trim multiline strings
        ├── parseExpertiseTitle.ts        # Extract [tag] from finding titles
        ├── validateEmailDomain.ts        # Email domain vs URL domain matching
        ├── pathUtils.ts                  # Normalize & patternize URLs
        └── scheduleUtils.ts             # Schedule descriptions & constants
```

## Commands

```bash
bun run build          # Build ESM (tsc → dist/)
bun run build:watch    # Watch mode build
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
- Wraps `useSubmitScan` mutation from testomniac_client
- Manages SSE connection for scan progress updates
- Updates `scanProgressStore` with live data

### useDashboardManager

Dashboard-level data orchestration:

- **Config**: `{ baseUrl, networkClient, entitySlug, token }`
- Fetches products and their runs for the current entity
- Provides aggregated dashboard statistics

### useRunManager

Individual run data management:

- **Config**: `{ baseUrl, networkClient, runId, token }`
- Fetches run details, pages, test elements, issues, personas
- Provides run-level statistics and navigation helpers

### usePersistedState

Platform-agnostic persisted state hook. Abstracts localStorage (web), chrome.storage (extension), or AsyncStorage (React Native) without changing UI code.

### Analysis Hooks

- `useFindingsAnalysis` — group/count findings by priority and expertise type
- `useTestRunsAnalysis` — count test runs by status (passed, failed, pending)
- `usePageMapData` — build graph visualization data from pages and interactions

## Peer Dependencies

- `react` (>=18)
- `@tanstack/react-query` (>=5)
- `zustand` (>=5)
- `@sudobility/types` — NetworkClient interface

## Architecture

```
testomniac_app / testomniac_app_rn
    ↓ uses
@sudobility/testomniac_lib (this package)
    ↓ uses
@sudobility/testomniac_client (API hooks)
    ↓ uses
@sudobility/testomniac_types (type definitions)
```

## Related Projects

- **testomniac_types** — Shared type definitions; imported transitively via testomniac_client
- **testomniac_client** — API client SDK; this library wraps its hooks with business logic and Zustand state
- **testomniac_app** — Web frontend that consumes hooks from this library
- **testomniac_api** — Backend server; this library communicates with it indirectly through testomniac_client

## Coding Patterns

- `useScanManager`, `useDashboardManager`, and `useRunManager` are the primary hooks — they orchestrate testomniac_client hooks + Zustand store into unified interfaces for UI layers
- `scanProgressStore` holds real-time SSE-streamed scan state — use it for live progress UI
- Token reactivity: changing the auth token resets store state to prevent stale cross-user data
- `useRef` is used to prevent duplicate fetch calls on React strict-mode double-mount
- Hooks accept a config object with `{ baseUrl, networkClient, token }` plus entity-specific params
- All hooks support `enabled` parameter (default `true`) to conditionally skip data fetching

## Gotchas

- Zustand store is in-memory only — there is no persistence; data is lost on page refresh or app restart
- `scanProgressStore` state is ephemeral — only valid while SSE connection is active
- Token change resets the entire store state — this is intentional to prevent data leakage between users
- `useRef` guards prevent duplicate fetches on mount; be careful not to break this guard when modifying hooks
- This is a published npm package — coordinate breaking changes with testomniac_app
