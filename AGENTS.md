# Working in the ReactJS Multiplatform Template

This repository is a browser-first React template that can also ship through Electron and Capacitor. Keep those three environments deliberately separate. The React app should stay useful in an ordinary browser, even when a project later adds desktop or mobile features.

## Start here

- Read the [README](README.md) for the project layout, commands, and documentation map.
- Read the relevant guide in [`documentation/`](documentation/) before changing platform boundaries, testing, persistence, CI, or assets.
- Treat `documentation/game-godmaker-dogfooding-updates.md` as the maintained adoption backlog. Do not turn a backlog item into a default feature without completing the task and updating the relevant guide.

## Architecture boundaries

- Keep normal React code in `src/` browser-safe. Do not import Electron, Node-only packages, or Capacitor-native APIs directly into shared UI components.
- Keep Electron main-process and preload code in `electron/`. The renderer should call a small, typed wrapper rather than access a broad `window.ipcRenderer` bridge throughout the UI.
- Keep Capacitor-specific configuration and native project changes in `capacitor.config.json` and the relevant native directory. Use capability checks or a platform adapter before calling native-only code.
- When routing is added, use normal browser routing for web and Capacitor builds. Use hash routing for packaged Electron builds that load from `file://`.
- Prefer feature detection over platform-name checks. A capability is more useful than a guess about the operating system.
- Put cross-process IPC channel names in one shared module. Validate inputs in the Electron main process and expose only the operations the renderer needs.

## Electron expectations

- Keep the Electron window configuration explicit: title, dimensions, minimum size, preload path, and security settings should be easy to find in `electron/main.ts`.
- Handle links that leave the app through the system browser rather than opening untrusted Electron windows.
- Keep development-only behaviour, including DevTools, behind a development check.
- Do not add Steam or other product-specific desktop runtime code to the default template. Document it as an optional integration instead.

## Data, assets, and secrets

- Put persistence behind an application-facing adapter. React components should not choose between `localStorage`, IndexedDB, OPFS, or a native store themselves.
- Settings use one versioned entity behind a capability-selected repository: SQLocal and Kysely on isolated OPFS-capable web and Electron builds, IndexedDB on Capacitor-style or fallback runtimes. Keep SQLocal, Kysely, and IndexedDB calls out of React components.
- Use plain CSS for the default UI. Keep shared colour tokens in `src/index.css`, and apply the persisted `display.theme` setting through the document root's `data-theme` attribute. Do not add Mantine or another theme provider unless the generated product explicitly adopts it.
- Localisation uses `src/utils/localisation/i18nLocalization.json` as its only source of truth. Run `npm run localisation:split` after changing it; never edit or commit `src/utils/localisation/generated/`.
- Use `useTranslation()` and stable localisation keys for user-facing UI content. `LanguageProvider` synchronises the persisted `settings.language.code` value with i18next and the document language attributes.
- Credits data in `src/assets/organisedLicenseData.json` and `src/assets/gitContributors.json` is generated but tracked because the lazy Credits route bundles it. Map Git aliases to primary people in `scripts/git-contributor-people.json`, refresh the relevant snapshot after dependency or contributor-history changes, and do not edit either generated file by hand.
- Treat `package.json` `version` as the canonical release version. `npm run capacitor:version:sync` writes its stable `MAJOR.MINOR.PATCH` value into Android through Capver; do not edit Android `versionName` or `versionCode` by hand.
- Treat Mantine, Steam, store deployment, and similar stacks as opt-in directions. They are not default dependencies. A generated project that does not need localisation may remove the included English-only recipe as one deliberate cleanup.
- Keep a source icon and logo outside generated platform output. Do not hand-edit generated Capacitor, Electron, or store assets.
- Never commit signing keys, passwords, API keys, app IDs for a real product, or other credentials. Read values from local environment configuration or CI secrets.

## Commands and verification

Use the smallest relevant command while working, then run the broader checks before hand-off.

| Purpose | Command |
| --- | --- |
| Start the browser app | `npm run react:dev` |
| Lint TypeScript and React code | `npm run react:lint` |
| Build the web and Electron bundles | `npm run react:build` |
| Run the Chromium end-to-end suite | `npm run react:test:e2e` |
| Synchronise Android version fields | `npm run capacitor:version:sync` |
| Check Android version fields | `npm run capacitor:version:check` |
| Open the Playwright test UI | `npm run react:test:e2e:ui` |
| Sync and build Android | `npm run capacitor:android:build` |
| Package a Windows portable build | `npm run electron:build:windows:portable` |

- Use `npm ci` in CI and when you need a clean, lockfile-faithful install. Use `npm install` when intentionally changing dependencies.
- Run `npm run react:lint` and `npm run react:test:e2e` after changes that affect shared UI, routing, Vite configuration, or browser-facing behaviour.
- Run `npm run react:build` after changing TypeScript configuration, Electron code, or build configuration.
- Generated output such as `dist/`, `dist-electron/`, `release/`, `playwright-report/`, and `test-results/` is ignored. Do not edit or commit it.

## Documentation rules

- Update the guide that describes a changed architectural decision or workflow in the same change.
- Keep `README.md` focused on getting a project running and finding its way around.
- Put durable implementation rules here in `AGENTS.md`.
- Put concrete, unfinished work in the dogfooding backlog as checkbox tasks with substeps. Do not hide rules, design notes, or open-ended guidance inside a task list.
