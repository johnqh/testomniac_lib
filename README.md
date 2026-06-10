# @sudobility/testomniac_lib

Business logic library with Zustand stores for the Testomniac application. Provides manager hooks, analysis utilities, and real-time scan progress tracking shared across web and React Native frontends.

## Installation

```bash
bun add @sudobility/testomniac_lib
```

Peer dependencies:

```bash
bun add react @tanstack/react-query zustand @sudobility/types
```

- `react` >= 18
- `@tanstack/react-query` >= 5
- `zustand` >= 5
- `@sudobility/types` -- NetworkClient interface

## Usage

```ts
import {
  useScanManager,
  useDashboardManager,
  useRunManager,
} from '@sudobility/testomniac_lib';

// Orchestrate dashboard data for an entity
const { products, runs, stats } = useDashboardManager({
  baseUrl: 'https://api.example.com',
  networkClient,
  entitySlug: 'my-org',
  token: firebaseIdToken,
});

// Submit a scan and track real-time progress
const { submitScan, progress } = useScanManager({
  baseUrl: 'https://api.example.com',
  networkClient,
  token: firebaseIdToken,
});

// Fetch run details, pages, personas, and test elements
const { run, pages, personas } = useRunManager({
  baseUrl: 'https://api.example.com',
  networkClient,
  runId: 'run-123',
  token: firebaseIdToken,
});
```

## API Overview

### Manager Hooks

| Hook                     | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `useScanManager`         | Scan submission + SSE progress tracking             |
| `useDashboardManager`    | Dashboard data orchestration (products, runs, stats)|
| `useRunManager`          | Run details, pages, personas, test elements         |
| `useEntityManager`       | Entity fetching with auto-retry                     |
| `useEnvironmentManager`  | Environment pages, interactions, and surfaces       |
| `useSequenceGenerator`   | Test sequence generation                            |

### Analysis Hooks

| Hook                       | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `useFindingsAnalysis`      | Group and count findings by priority and type     |
| `useTestRunsAnalysis`      | Count test runs by status (passed, failed, etc.)  |
| `usePageMapData`           | Build graph nodes/edges from pages & interactions |
| `usePageInteractionGroups` | Group interactions relative to a page             |

### State

- **`scanProgressStore`** -- Zustand store for real-time SSE scan progress (phase, counters, events). Ephemeral; only valid while the SSE connection is active.

### Persistence

- **`usePersistedState`** -- Platform-agnostic persisted state hook. Abstracts localStorage (web), chrome.storage (extension), or AsyncStorage (React Native).

### Utilities

| Function               | Description                              |
| ---------------------- | ---------------------------------------- |
| `formatDuration`       | Convert milliseconds to "1h 5m", "2m 15s"|
| `formatDate`           | ISO date to locale-formatted string       |
| `parseExpertiseTitle`  | Extract `[tag]` from finding titles       |
| `validateEmailDomain`  | Match email domain against URL domain     |
| `pathUtils`            | Normalize and patternize URLs             |
| `scheduleUtils`        | Schedule descriptions and constants       |
| `describeInteraction`  | Human-readable interaction descriptions   |

## Architecture

```
testomniac_app / testomniac_app_rn
    |
    v uses
@sudobility/testomniac_lib  (this package)
    |
    v uses
@sudobility/testomniac_client  (API hooks)
    |
    v uses
@sudobility/testomniac_types  (type definitions)
```

## Development

```bash
bun run build          # Build ESM (tsc -> dist/)
bun run clean          # Remove dist/
bun test               # Run Vitest tests
bun run typecheck      # TypeScript check
bun run lint           # Run ESLint
bun run verify         # All checks + build (use before commit)
```

## Related Packages

- **testomniac_types** -- Shared type definitions; imported transitively via testomniac_client
- **testomniac_client** -- API client SDK; this library wraps its hooks with business logic and Zustand state
- **testomniac_app** -- Web frontend that consumes hooks from this library
- **testomniac_app_rn** -- React Native app that consumes hooks from this library
- **testomniac_api** -- Backend server; communicated with indirectly through testomniac_client

## License

BUSL-1.1
