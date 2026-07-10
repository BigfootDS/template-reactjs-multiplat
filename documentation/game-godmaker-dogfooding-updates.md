# Godmaker Dogfooding Adoption Backlog

This is the implementation backlog for reusable lessons from `game-godmaker`. It is not a plan to copy a game into a template.

Architecture rules, platform guidance, testing conventions, persistence notes, release guidance, and optional-integration boundaries now live in the linked documentation. Every item below is a concrete task to complete or a decision to make.

## Completed foundation

- [x] Update the direct dependency set and lockfile.
  - [x] Upgrade TypeScript, React, Vite, Electron, Capacitor, and related build tooling.
  - [x] Replace the TypeScript 7-incompatible ESLint stack with type-aware Oxlint.
- [x] Add the initial browser smoke-test harness.
  - [x] Add Playwright configuration and scripts.
  - [x] Verify that the production preview renders the starter screen and handles a basic interaction.
- [x] Add contributor and architecture documentation.
  - [x] Create `AGENTS.md` with architecture boundaries and verification expectations.
  - [x] Create focused platform, testing, persistence, CI, and optional-integration guides.

## App shell and platform boundaries

- [x] Replace the Vite demo screen with a reusable routed app shell.
  - [x] Add Home, Settings, Diagnostics, and About routes.
  - [x] Add a root layout that works in browser, Electron, and Capacitor builds.
  - [x] Lazy-load example pages to demonstrate code splitting.
  - [x] Add an accessible navigation pattern and a basic not-found route.
- [x] Add platform detection and router selection utilities.
  - [x] Create a browser-safe capability-detection module.
  - [x] Use `HashRouter` in packaged Electron builds and browser routing elsewhere.
  - [x] Move platform checks out of React page components.
- [x] Formalise Electron IPC behind typed wrappers.
  - [x] Define shared IPC channel names.
  - [x] Add a main-process IPC initialisation module with input validation.
  - [x] Replace direct renderer IPC calls with a typed wrapper and browser fallback.
  - [x] Add opt-in window controls for minimise, maximise, close, restart, and full-screen state.
- [x] Harden Electron main-process defaults.
  - [x] Configure explicit window title, dimensions, and minimum dimensions from application metadata.
  - [x] Disable or customise the default menu only when the application design needs it.
  - [x] Open external links in the operating-system browser.
  - [x] Restrict DevTools to development builds.
  - [x] Evaluate cross-origin isolation headers for packaged `file://` builds.
- [x] Decide whether to provide an optional custom Electron title bar.
  - [x] Build a plain React and CSS proof of concept behind the Electron bridge.
  - [x] Enable it only when the Electron window uses a matching frameless configuration.
  - [x] Test keyboard, resize, full-screen, and accessibility behaviour.

## Testing and automation

- [x] Extend Playwright coverage beyond the starter smoke test.
  - [x] Test each app-shell route in the browser.
  - [x] Test Electron-style hash routing.
  - [x] Add a narrow helper for mocking the renderer IPC wrapper.
  - [x] Capture useful browser diagnostics on failure.
- [ ] Split testing CI from release packaging.
  - [ ] Add a CI testing workflow that runs `npm ci`, linting, and Playwright.
  - [ ] Upload Playwright reports when a testing job fails or is not cancelled.
  - [ ] Make build and release jobs depend on the testing workflow.
- [ ] Refine release and store deployment examples.
  - [ ] Update the GitHub release flow to build from the semver commit it creates.
  - [ ] Add optional Google Play and Steam workflow examples.
  - [ ] Move store-specific values to repository variables and secrets.
  - [ ] Document required secrets beside each optional workflow.
- [ ] Decide when release workflows should run.
  - [ ] Choose between automatic `main` releases and manual dispatch for generated projects.
  - [ ] Record the decision in the release workflow and documentation.

## Application metadata and assets

- [ ] Add safe application metadata injection.
  - [x] Define the template metadata shape in `package.json`.
  - [x] Expose the safe name and version fields through Vite.
  - [x] Use the fields for the browser title, Electron window, and diagnostics.
  - [ ] Use the fields for release names.
- [ ] Establish source-asset and generated-asset conventions.
  - [ ] Add placeholder source icons and logos in a documented source location.
  - [ ] Configure Electron and Capacitor tooling to consume the source assets.
  - [ ] Document the generated outputs that must stay ignored.

## Persistence and settings

- [ ] Add a platform diagnostics screen.
  - [ ] Report IndexedDB, OPFS, workers, cross-origin isolation, Electron, and Capacitor capabilities.
  - [ ] Explain unavailable capabilities in developer-facing diagnostics output.
- [ ] Add a lightweight settings persistence pattern.
  - [ ] Define a small settings shape and defaults.
  - [ ] Add a persistence facade with a browser-safe initial implementation.
  - [ ] Add settings examples for display, audio, language, and diagnostics.
  - [ ] Connect full-screen behaviour through the platform adapter.
- [ ] Produce an optional SQLocal and Kysely recipe.
  - [ ] Add a minimal schema, migration registration, and seed example.
  - [ ] Show database initialisation behind the persistence facade.
  - [ ] Document how Capacitor builds select a compatible storage implementation.

## UI, localisation, and compliance

- [ ] Decide whether Mantine is a default dependency or an optional recipe.
  - [ ] Compare the plain-CSS and Mantine template tracks.
  - [ ] Record the decision and its maintenance cost.
  - [ ] Add a theme and provider example only if Mantine becomes a default.
- [ ] Create an optional localisation recipe.
  - [ ] Add a minimal `i18next` and `react-i18next` example.
  - [ ] Add a language provider and one English translation file.
  - [ ] Decide whether generated per-language files and a split script are worth maintaining.
- [ ] Create a dependency licence and credits workflow.
  - [ ] Choose a licence-data generation approach.
  - [ ] Add a generated-data location and ignore rules.
  - [ ] Add an About or Credits page example that displays application and licence metadata.

## Capacitor and documentation decisions

- [ ] Evaluate Capacitor version synchronisation.
  - [ ] Test `@capawesome/capver` against the template's Android build.
  - [ ] Decide how package versions map to Android version fields.
  - [ ] Add a version-sync script only after the mapping is documented and tested.
- [ ] Move real signing configuration out of static application configuration.
  - [ ] Define environment variable names for local signing.
  - [ ] Define repository secrets for CI signing.
  - [ ] Document local and CI release-signing setup without publishing credentials.
- [ ] Confirm the documentation-folder convention.
  - [ ] Decide whether BigfootDS templates standardise on lowercase `documentation/`.
  - [ ] Apply the decision consistently to this template and related guidance.
