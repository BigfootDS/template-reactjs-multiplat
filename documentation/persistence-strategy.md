# Persistence strategy

## The problem

Desktop Chromium, a regular browser, and a Capacitor WebView do not all expose storage in the same way. A storage choice that looks fine in Electron can be unavailable, quota-limited, or unreliable on a mobile WebView.

Do not let individual React components choose a storage API. Give them an application-facing persistence service instead.

## Start with the data, not the database

Use the smallest store that matches the data:

| Data | Starting point | Notes |
| --- | --- | --- |
| Small preferences | `localStorage` or a small adapter | Keep a migration path if settings become important. |
| Structured client data | IndexedDB through an adapter | Good browser baseline for larger local data. |
| Large local files or desktop-heavy data | Evaluate OPFS | Test the target browser and Capacitor WebView first. |
| Relational, migration-heavy data | Consider SQLocal and Kysely | Keep this opt-in and verify mobile support before relying on it. |

## Use an adapter boundary

React code should depend on a small persistence contract, such as `loadSettings`, `saveSettings`, `get`, or `put`. The adapter can select a supported implementation during start-up and can report why a capability is unavailable.

This protects the UI from a later change, such as moving settings from `localStorage` to IndexedDB or replacing a browser store on Android.

## Check capabilities

Diagnostics should report the features that matter to data storage:

- IndexedDB availability
- OPFS availability
- worker availability
- cross-origin isolation
- Electron bridge availability
- Capacitor bridge availability

That information is more useful than a list of operating-system names. It tells us which storage path is actually safe to initialise.

## SQLocal and Kysely are a deliberate track

SQLocal and Kysely are useful for an application with schemas, migrations, and complex queries. They are not a free upgrade over a small browser store.

If a project adopts them, register migrations in one place, initialise the database behind the persistence adapter, seed only development data, and dynamically load the browser-only storage path where a Capacitor build needs a different implementation.
