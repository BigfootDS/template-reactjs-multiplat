# SQLocal and Kysely settings recipe

## The scenario

The template stores settings as one versioned entity, even though its storage engine changes by platform. Electron and isolated browser builds use SQLite through SQLocal and Kysely. Capacitor-style runtimes use IndexedDB when they do not provide the isolated OPFS environment that SQLocal needs.

The React layer does not know which backend was selected. It calls the settings provider, which calls the repository facade.

## The storage split

| Runtime capability | Backend | Why |
| --- | --- | --- |
| Cross-origin isolation, OPFS, and workers | SQLocal with Kysely | SQLite runs in a worker and stores its database file in OPFS. |
| Capacitor with IndexedDB | IndexedDB | Native WebViews may not expose SQLocal's isolated OPFS requirements. |
| Browser without OPFS isolation but with IndexedDB | IndexedDB | Preferences remain durable instead of falling back to memory. |
| Neither backend | Explicit error | Do not claim a setting has been saved when it cannot survive a restart. |

SQLocal documents its OPFS and cross-origin-isolation requirements in its [setup guide](https://sqlocal.dev/guide/setup). Kysely supplies the typed query and migration layer through SQLocal's [Kysely dialect](https://sqlocal.dev/kysely/setup).

## Files that own the boundary

| File | Responsibility |
| --- | --- |
| `src/utils/settings/settingsModel.ts` | Canonical settings entity, defaults, normalisation, and safe merging. |
| `src/utils/settings/settingsPersistenceEnvironment.ts` | Feature detection and backend choice. |
| `src/utils/settings/settingsPersistence.ts` | Dynamic repository loading and SQLocal to IndexedDB fallback. |
| `src/utils/settings/sqlocalSettingsRepository.ts` | SQLocal client, Kysely database, migrations, and JSON-column mapping. |
| `src/utils/settings/indexedDbSettingsRepository.ts` | IndexedDB record storage for the same entity. |
| `src/contexts/SettingsProvider.tsx` | React loading state and serialised writes. |

## Schema, migration, and seed behaviour

The SQLocal backend declares a typed `settings` table in `settingsDatabaseSchema.ts`. Display, audio, language, and diagnostics groups are JSON columns. Kysely reads those values through `ParseJSONResultsPlugin`; writes serialise each group deliberately.

The first migration lives in `src/utils/settings/migrations/2026-07-10-01-settings.ts` and is registered in `migrations/index.ts`. The repository runs `Migrator.migrateToLatest()` before reading or writing settings.

There is no separate seed file. `loadOrCreate()` is the seed example: it creates the fixed `default` row from `createDefaultSettings()` after migrations complete. This keeps first-run creation idempotent, including React development's extra effect checks.

## Adding a settings field

1. Add the field and its default to `settingsModel.ts`.
2. Extend normalisation so old SQLocal rows and IndexedDB records receive a valid value.
3. Add the typed JSON-column field when it belongs in a new SQL group. Add and register an append-only Kysely migration for existing SQLocal databases.
4. Extend the IndexedDB record through the canonical entity. Its normaliser is the compatibility migration for existing browser records.
5. Add the control through `useSettings`, update the route test, and explain the changed behaviour in the relevant documentation.

Do not call SQLocal, Kysely, or IndexedDB from a React page. A component should only see `settings`, loading and error state, and the provider's typed `update` function.

## Full-screen setting

The display control asks `setApplicationFullscreen()` to perform the action first, then persists the returned state. Electron uses the narrow IPC wrapper. Browser builds use the Fullscreen API, which can refuse requests that were not made during a user action. The provider deliberately does not attempt to restore fullscreen while loading settings.

## Production hosting

The Vite development and preview servers set the COOP and COEP headers that SQLocal needs. A deployed web host must send the same headers. Check the Diagnostics route before treating an SQLocal problem as a migration or query problem.
