# Template Updates From Godmaker Dogfooding

This document summarises reusable improvements that `template-reactjs-multiplat` should consider adopting from `game-godmaker`. The goal is not to turn the template into Godmaker. The goal is to pull back the generic infrastructure that became necessary while building a real React, Electron, and Capacitor product.

The most useful lesson is that the template should become a production-ready app shell, not only a Vite/Electron/Capacitor starter. Godmaker added routes, packaging, testing, persistence, platform detection, localization, UI system conventions, and deployment workflows that are broadly useful for any ReactJS-based PC-and-mobile project.

## Source Areas Reviewed

The comparison focused on these Godmaker areas:

- `package.json`, `vite.config.ts`, `electron-builder.json5`, and `capacitor.config.ts`
- `electron/main.ts`, `electron/preload.ts`, `electron/ipc.ts`, and `shared/constants.ts`
- `src/main.tsx`, app providers, platform utilities, settings, localization, and theme setup
- `src/utils/database`, especially SQLocal/Kysely persistence and migration patterns
- `src/utils/multiplatform`, `src/utils/ipc`, and Electron renderer integration
- `playwright.config.ts`, `tests/e2e`, and CI workflows
- `.github/workflows`, `AGENTS.md`, `CONTEXT.md`, and `Documentation/`

## Adoption Principles

1. Keep the template browser-first. React code should remain valid in a normal web browser unless it deliberately calls a small platform adapter.
2. Prefer reusable app infrastructure over game-specific gameplay systems. Do not copy Godmaker's `gameserver`, domain models, world map, Steam app ID, or game content.
3. Make advanced capabilities opt-in. Steam, Google Play, SQLocal, Mantine, and localization are useful, but not every app needs all of them on day one.
4. Keep platform-specific code behind narrow boundaries. Electron code belongs in `electron/`; Capacitor-specific work belongs in Capacitor/native setup or browser-safe wrappers.
5. Document setup and tradeoffs in the template so generated projects know which pieces are required, optional, or examples.

## Highest-Value Template Updates

### 1. Replace The Demo App With A Real App Shell

The template currently still has the default Vite counter screen in `src/App.tsx`. Godmaker proves that the template should ship with a small but realistic shell:

- A route structure using `react-router`.
- A root app layout that works in browser, Electron, and Capacitor.
- Lazy-loaded example pages so code splitting is demonstrated early.
- A settings page or modal with at least display, audio, language, and app/system sections.
- A credits/licenses page or placeholder path.
- A simple platform diagnostics page for browser/Electron/Capacitor capability checks.

Godmaker-specific screens such as title, lobby, save-file selection, and gameplay should not be copied directly. The generic template equivalent would be "Home", "Settings", "Diagnostics", and "About" pages.

### 2. Add Platform Detection And Router Selection

Godmaker uses `HashRouter` when `window.ipcRenderer` is present and `BrowserRouter` otherwise. This is a useful template pattern because packaged Electron apps load from local files, while web and Capacitor builds can use normal browser routing.

Template update:

- Add a small `src/utils/platform` module for capability detection.
- Select `HashRouter` for Electron and `BrowserRouter` elsewhere.
- Avoid direct platform string checks where browser capability detection is enough.
- Keep platform checks in reusable utilities rather than scattered through React components.

### 3. Formalise Electron IPC

Godmaker moved beyond the generic preload bridge by adding:

- Shared IPC channel names in `shared/constants.ts`.
- A main-process `ipcInit(...)` function.
- Renderer-side wrappers in `src/utils/ipc/electronIpc.ts`.
- Window controls for minimize, maximize, close, fullscreen state, and app restart.

Template update:

- Add a generic shared IPC channel enum.
- Add a typed renderer IPC wrapper.
- Add opt-in helpers for close, minimize, maximize, restart, and fullscreen.
- Keep direct `window.ipcRenderer.send(...)` calls out of normal React screens.

The current preload bridge exposes a broad `ipcRenderer` object. That can stay initially, but the template should guide projects toward named wrappers and channel constants.

### 4. Improve Electron Main-Process Defaults

Godmaker added several production-oriented Electron behaviours that are not game-specific:

- Disable the default app menu when it is not needed.
- Set a Windows app user model ID.
- Handle external links with `shell.openExternal(...)` instead of allowing new Electron windows.
- Open DevTools in development only.
- Use explicit window sizing, minimum dimensions, and title.
- Add cross-origin isolation headers for packaged `file://` builds.

Template update:

- Adopt safe external-link handling by default.
- Add a reusable cross-origin isolation helper for packaged Electron.
- Make window dimensions and title configurable from package metadata.
- Add comments explaining when to use a frameless/custom title bar.
- Keep Steam-specific code out of the template core.

### 5. Add Optional Custom Title Bar Support

Godmaker has a frameless Electron title bar with renderer controls. This is reusable for PC apps that want a native-feeling branded shell.

Template update:

- Add an optional `ElectronTitleBar` component.
- Add CSS variables for title-bar height and body offset.
- Wire the component through generic IPC wrappers.
- Make it disabled by default unless the Electron window uses `titleBarStyle: "hidden"`.

The Godmaker implementation depends on Mantine and localization. The template version should either be plain React/CSS or live in an optional UI-system example.

### 6. Add Playwright E2E Testing

Godmaker added a practical Playwright setup:

- `playwright.config.ts`
- `react:test`, `react:test:e2e`, and `react:test:e2e:ui` scripts
- A preview-server-based test flow
- Browser diagnostics capture
- Tests for browser routes and Electron-like hash routing

Template update:

- Add Playwright as the default end-to-end test runner.
- Include a small smoke test that verifies the app boots, routes render, and hash routing works.
- Add a test helper that can mock `window.ipcRenderer`.
- Update CI to run lint and tests before packaging.

This is one of the safest high-impact updates because it improves confidence without imposing a product architecture.

### 7. Split CI Testing From Release Builds

Godmaker separates testing from build/release automation:

- `ci_testing.yaml` runs lint, Playwright setup, and tests.
- `ci_build.yaml` can be called after tests pass.
- Build workflows pin the semver commit when release automation mutates the repo.
- Release artifacts are uploaded and then reused by deployment jobs.

Template update:

- Add a generic `ci_testing.yaml`.
- Keep `ci_build.yaml` focused on artifact generation.
- Make deployment workflows optional examples.
- Use `npm ci` in CI for reproducible dependency installs.
- Upload Playwright reports on failure or non-cancelled test completion.

### 8. Improve Release And Store Deployment Examples

Godmaker has working examples for GitHub releases, Google Play, and Steam deployment. The template should not hard-code game-specific destinations, but it can provide documented workflow examples.

Template update:

- Keep the existing GitHub release artifact flow, but update it with lessons from Godmaker.
- Add optional example workflows for Google Play upload and Steam upload.
- Move store-specific values to repository variables/secrets.
- Document required secrets and variables in `documentation/`.
- Keep app IDs, package names, Steam app IDs, and release asset names templated.

Steam-specific runtime code such as `steamworks.js` should be a documented optional integration, not a template default dependency.

### 9. Add App Metadata Injection

Godmaker injects product metadata from `package.json` into Vite `process.env` defines:

- Product name
- Product version
- Platform name
- Platform type
- NPM package version

Template update:

- Add a generic `bigfootds` or `app` metadata block to `package.json`.
- Use Vite `define` to expose safe build-time metadata.
- Use this metadata for page titles, diagnostics, Electron window titles, and release naming.

This removes repeated app-name strings across React, Electron, Capacitor, and CI.

### 10. Add Asset And Icon Conventions

Godmaker has concrete asset folders for web, Electron, Android, and store assets:

- `assets/`
- `icons/`
- `public/` icons and manifests
- Electron builder icon configuration
- Capacitor asset generation scripts

Template update:

- Document a standard source icon and logo structure.
- Add placeholder source assets in `assets/`.
- Keep generated native/web icon output out of hand-edited areas where possible.
- Add `.gitignore` entries for generated artifacts that should not be committed.
- Explain which assets feed Capacitor, Electron, PWA manifests, and store listings.

## Persistence And Data Recommendations

### 11. Add A Persistence Strategy Guide

Godmaker discovered an important cross-platform issue: desktop Chromium/Electron can use OPFS-backed SQLocal, but Capacitor Android WebView may not behave the same way. The generic lesson is that the template should not pretend one browser storage strategy is universally safe.

Template update:

- Add `documentation/persistence-strategy.md`.
- Explain the difference between localStorage, IndexedDB, OPFS, and SQLite-like browser storage.
- Recommend adapter-based persistence for non-trivial apps.
- Include a platform diagnostics pattern for detecting IndexedDB, OPFS, Workers, cross-origin isolation, Electron, and Capacitor.
- Make clear that React components should call a persistence facade, not storage-specific modules.

### 12. Offer SQLocal/Kysely As An Optional Persistence Track

Godmaker uses SQLocal and Kysely with migrations. That is useful for data-heavy applications, but too heavy for every template user.

Template update:

- Add an optional documented track for `sqlocal` + `kysely`.
- Include a minimal schema, migration registration, seed, and initialization example.
- Keep the default template app working without a database.
- Show how to dynamically import SQLocal-only modules so Capacitor-native paths are not forced through OPFS when unsuitable.

This should be a template recipe, not necessarily a default dependency.

### 13. Add A Settings Persistence Pattern

Godmaker has a settings provider, settings context, and seeded settings. The specific settings are game-shaped, but the pattern is generic.

Template update:

- Add a `SettingsProvider` with a simple default settings shape.
- Include video/display, language/interface, audio, and diagnostics categories as examples.
- Store settings in a small persistence facade.
- Use settings to control fullscreen behaviour in browser and Electron.

If the template does not adopt a full database by default, the settings facade can begin with IndexedDB or localStorage and later document migration to SQLocal/Kysely.

## UI And Localization Recommendations

### 14. Decide Whether Mantine Is A Default Or Optional UI Layer

Godmaker uses Mantine extensively. It made settings, modals, forms, loaders, and layout work faster, but adopting it in the template would make the template more opinionated.

Template options:

- Default Mantine track: add Mantine dependencies, provider, theme file, PostCSS config, and example controls.
- Minimal template track: keep plain CSS by default and provide Mantine as an optional recipe.

If Mantine is adopted, also bring across the PostCSS configuration pattern and a generic `src/utils/theme.ts`. Do not copy Godmaker's visual theme directly.

### 15. Add Localization As An Optional First-Class Pattern

Godmaker uses `i18next` and `react-i18next`, with a split-localization script that turns a larger source JSON file into generated per-language JSON files.

Template update:

- Provide a minimal `i18next` setup.
- Add a `LanguageProvider`.
- Add a small `i18nLocalization.json` source file.
- Add a split script only if the template wants spreadsheet-like or bulk localization workflows.
- Ignore generated localization output in `.gitignore`.
- Use English as the minimum default translation.

The template should not require localization for every string, but it should make the path obvious for projects targeting stores and multiple regions.

### 16. Add License/Credits Data Workflow

Godmaker has a script for generating organized license data and a credits screen pattern. This is broadly useful for packaged PC/mobile apps.

Template update:

- Add a `project:npmcompliance:update` script if the helper is intended to be used across BigfootDS projects.
- Add a generated license data asset location.
- Add a simple credits/about page that can display app metadata and dependency license data.

## Mobile And Capacitor Recommendations

### 17. Improve Capacitor Version And Asset Automation

Godmaker adds `@capawesome/capver` and runs version sync before asset generation.

Template update:

- Add an optional `capacitor:version:sync` script.
- Update `capacitor:android:prepare:assets` to sync version metadata before generating assets when capver is installed.
- Document the `capver` pattern and how it maps package versions to native versions.

### 18. Move Signing Values Out Of Static Config

Both repos still show placeholder keystore values in `capacitor.config.ts`. Godmaker's comments acknowledge this should move toward environment-backed values.

Template update:

- Keep placeholders safe and clearly non-secret.
- Document local release signing setup.
- Document CI signing via repository secrets.
- Prefer environment-backed config values for real projects.

## Documentation And Agent Guidance

### 19. Add Project Guidance Files

Godmaker's `AGENTS.md` is useful because it tells coding agents and contributors how to work inside a multiplatform React app.

Template update:

- Add a generic `AGENTS.md`.
- Include architecture boundaries: React/browser-first, Electron under `electron/`, Capacitor in native config, IPC through wrappers, generated output ignored.
- Include core commands and verification expectations.
- Include dependency guidance for avoiding Node-only packages in browser code.

Godmaker's `CONTEXT.md` is domain-specific and should not be copied. The generic template equivalent could be `CONTEXT.md` as a placeholder explaining where a product should define project vocabulary and architecture decisions.

### 20. Establish A Documentation Folder

Godmaker uses `Documentation/` for project notes. The template now has this lowercase `documentation/` folder for reusable guidance.

Recommended starter docs:

- `documentation/game-godmaker-dogfooding-updates.md`
- `documentation/persistence-strategy.md`
- `documentation/platform-packaging.md`
- `documentation/ci-cd.md`
- `documentation/store-deployment.md`
- `documentation/assets-and-icons.md`
- `documentation/testing.md`

## Optional Integrations To Keep As Recipes

These Godmaker features are useful but should not become mandatory template defaults:

- Steam runtime integration with `steamworks.js`
- Steam release deployment
- Google Play deployment
- SQLocal/Kysely database stack
- Mantine UI system
- Three.js/WebGL rendering
- Multiplayer broker integration
- Large generated localization workflows
- Game save/lobby/runtime server architecture

Each can be documented as an opt-in recipe or branch of the template.

## Items Not To Copy Into The Template

Do not copy these directly from Godmaker:

- `src/gameserver/` gameplay systems
- Game-specific data models, migrations, prayers, patrons, world map, and progression logic
- Godmaker app IDs, package names, Steam app IDs, product names, and store assets
- Godmaker visual theme, title screens, or game menu copy
- Godmaker-specific localization keys
- Hard-coded signing credentials or placeholder values that look like real credentials
- Steam-specific Electron startup code in the default Electron main process

## Suggested Implementation Order

1. Add documentation and guidance first: `AGENTS.md`, platform docs, testing docs, persistence strategy.
2. Replace the demo app with a small routed app shell.
3. Add platform detection and Electron hash-router selection.
4. Add typed IPC wrappers and safer Electron defaults.
5. Add Playwright smoke tests and CI testing.
6. Add app metadata injection and asset conventions.
7. Add settings persistence and platform diagnostics.
8. Decide whether Mantine and localization are defaults or documented recipes.
9. Add optional persistence, Steam, Google Play, and advanced packaging recipes.

## Open Decisions

- Should the template become opinionated around Mantine, or remain UI-library-neutral?
- Should SQLocal/Kysely be included by default, or only documented as an advanced data track?
- Should the template ship with a custom Electron title bar enabled, or only include it as an opt-in component?
- Should `documentation/` be lowercase across BigfootDS repos, or should the template match Godmaker's `Documentation/` casing?
- Should CI release workflows remain enabled on `main`, or move to `workflow_dispatch` until a generated project has secrets configured?

## Summary

The template should adopt Godmaker's reusable app-shell work, not its game. The strongest updates are routing, platform detection, Electron IPC, safer Electron defaults, Playwright testing, CI separation, app metadata, asset conventions, settings, persistence guidance, and contributor documentation. Advanced systems such as Steam, SQLocal/Kysely, Mantine, localization, and store deployment should be added as deliberate template tracks so generated projects can choose the right level of complexity.
