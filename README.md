# @sudobility/testomniac_lib

Business logic library with Zustand stores for the Testomniac AI-powered automated UI testing platform.

## Installation

```bash
bun add @sudobility/testomniac_lib
```

## Usage

```typescript
import { useHistoriesManager } from "@sudobility/testomniac_lib";

const {
  histories,
  total,
  percentage,
  isLoading,
  createHistory,
  updateHistory,
  deleteHistory,
} = useHistoriesManager({
  baseUrl: "http://localhost:8022",
  networkClient,
  userId: "firebase-uid",
  token,
  autoFetch: true,
});
```

## API

### useHistoriesManager

Unified hook combining API client hooks + Zustand store + business logic:

- Percentage calculation: `(userSum / globalTotal) * 100`
- Per-user cache isolation via Zustand store
- Auto-fetch on mount (configurable)
- Token reactivity (resets state on user change)

### useHistoriesStore

Zustand store with per-user client-side cache. Operations: `set`, `get`, `add`, `update`, `remove`.

## Development

```bash
bun run build        # Build ESM
bun test             # Run tests
bun run verify       # All checks + build
```

## Related Packages

- `testomniac_types` -- Shared type definitions
- `testomniac_client` -- API client SDK
- `testomniac_api` -- Backend API server
- `testomniac_app` -- Web app consumer
- `testomniac_app_rn` -- React Native app consumer

## License

BUSL-1.1
