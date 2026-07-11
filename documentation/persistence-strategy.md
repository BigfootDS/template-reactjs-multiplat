# Persistence strategy

## The problem

Desktop Chromium, a regular browser, and a Capacitor WebView do not all expose storage in the same way. A storage choice that looks fine in Electron can be unavailable, quota-limited, or unreliable on a mobile WebView.

Do not let individual React components choose a storage API. Give them an application-facing persistence service instead.

## Start with the data, not the database

Use the smallest store that matches the data:

| Data | Starting point | Notes |
| --- | --- | --- |
| Application settings | Settings repository | One versioned record maps to SQLocal/Kysely or IndexedDB. |
| Structured client data | IndexedDB through an adapter | Good browser baseline for larger local data. |
| Large local files or desktop-heavy data | Evaluate OPFS | Test the target browser and Capacitor WebView first. |
| Relational, migration-heavy data | SQLocal and Kysely | Use migrations and keep a compatible non-OPFS backend. |

## Use an adapter boundary

React code should depend on a small persistence contract, such as `loadSettings`, `updateSettings`, `get`, or `put`. The adapter selects a supported implementation during start-up and can report why a capability is unavailable.

This protects the UI from a platform change, such as using SQLocal on Electron while storing the same settings entity in IndexedDB on Android.

## Check capabilities

Open the `/diagnostics` route before choosing a storage implementation. It reports the
features that matter to data storage:

- IndexedDB availability
- OPFS availability
- worker availability
- cross-origin isolation
- Electron bridge availability
- Capacitor bridge availability
- selected settings persistence backend

That information is more useful than a list of operating-system names. It tells us which storage path is actually safe to initialise.

The route only detects capabilities. It does not create a database, ask for storage
permission, or initialise a native plugin. Every unavailable capability includes a
developer-facing explanation of the safe fallback or the missing configuration, so a
new persistence adapter has an explicit constraint to work from.

## Settings storage in this template

The Settings route persists one typed, normalised record with display, audio, language, and diagnostics groups. The display group includes the user's colour theme; the provider applies it to the document root without exposing a storage API to the UI. React uses a provider and repository facade, never a database query directly.

The facade selects SQLocal with Kysely when cross-origin isolation, OPFS, and workers are available. It selects IndexedDB for Capacitor and as the fallback when the SQLocal runtime is unavailable. SQLocal start-up failures also fall back to IndexedDB instead of accepting memory-only storage.

See [the SQLocal and Kysely settings recipe](sqlocal-kysely-recipe.md) before adding another persisted entity or settings field.
