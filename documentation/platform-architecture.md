# Platform architecture

## The model

The template is a web application first. Vite produces `dist/`, then Capacitor and Electron package that output for their own platforms. This gives us one user interface and one application model, while still leaving room for platform-only features.

The cost is discipline. A React component that imports Electron or a Node-only package is no longer a normal web component. That becomes painful when the same screen needs to run in a browser, a Capacitor WebView, and Electron.

## Keep platform code at the edges

Put shared user-interface and domain code in `src/`. It must work in a regular browser unless it deliberately calls an adapter.

Put desktop main-process and preload code in `electron/`. Put Capacitor configuration and native changes in `capacitor.config.ts` and the matching native project. Keep the boundary obvious so a contributor can see which runtime owns a piece of code.

When a feature genuinely needs platform behaviour, expose a small browser-safe interface from `src/utils/` and provide the platform implementation behind it. Prefer asking whether a capability exists over checking a platform string.

For example, a persistence adapter can ask whether IndexedDB, OPFS, or a native bridge is available. That tells the app what it can actually do.

## Routing

The template uses normal browser routing for web and Capacitor builds. It switches to `HashRouter` when Electron's preload bridge is available, because packaged Electron builds load from `file://` rather than an HTTP server.

`src/utils/platform.ts` owns capability detection and router selection. It checks the Electron preload bridge and Capacitor's native-platform capability without relying on a user-agent string. Do not scatter Electron or Capacitor checks across page components.

## Electron IPC

The preload bridge exposes a small `window.electronApi` object to the renderer. It does not expose Electron's full `ipcRenderer` object.

When a desktop feature is added:

1. Add the IPC channel name and bridge type to `src/shared/ipc.ts`.
2. Confirm the sender belongs to the active application window, validate the request, and perform the work in `electron/ipc.ts`.
3. Expose the smallest safe preload function needed by the renderer.
4. Call that function through the typed wrapper in `src/utils/ipc/electronIpc.ts`.
5. Keep normal React screens free of direct Electron bridge calls.

The template currently supports minimise, maximise, close, restart, and full-screen state through this boundary. The renderer wrapper returns browser-safe no-op fallbacks when the Electron bridge is unavailable.

## Electron window defaults

Electron reads its title, dimensions, menu preference, and packaged cross-origin isolation setting from the `bigfootds` metadata block in `package.json`. The renderer receives only the safe application name and version at build time. Development-only conveniences, including detached DevTools, stay behind a development check.

The frameless template disables the default application menu because the renderer title bar supplies the window controls. Keep a native menu only when the product has commands that need it.

Treat external links as external. The main process denies renderer-created windows and opens only `https:` and `mailto:` links through the operating system browser. Do not pass arbitrary user-controlled URLs to `shell.openExternal`.

The Electron build uses a frameless window and a renderer title bar with minimise, maximise, full-screen, and close controls. Those buttons use the typed IPC wrapper and only render when the Electron bridge is available. Toggle controls expose their pressed state to assistive technology, while native buttons retain standard keyboard activation.

Packaged file builds set `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` when `bigfootds.electron.crossOriginIsolation` is enabled. This enables cross-origin isolation for APIs that require it, but any remote subresource must have compatible CORS or CORP headers. Disable the setting for a product that cannot meet that constraint, then document the trade-off.

## Capacitor and native configuration

Capacitor consumes the web build in `dist/`. Run the relevant Capacitor sync command after changing web assets, plugins, or native configuration.

The checked-in Capacitor configuration is template data, not production signing configuration. Real app IDs, keystores, passwords, and store credentials belong in local environment setup or CI secrets.

## What does not belong in the default template

Do not copy product-specific runtime systems from Godmaker into the default template. This includes game server code, Steam startup code, Steam app IDs, game data models, game menus, localisation keys, save systems, and visual themes.

Those can become documented recipes when there is a reusable path, but they should not become hidden assumptions for every new app.
