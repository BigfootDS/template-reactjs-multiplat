# Testing

## What exists now

Playwright is the default end-to-end test runner. The browser suite in `tests/e2e/app.spec.ts` builds the app, serves the production preview, confirms that the routed app shell renders, checks primary navigation, and loads each browser route including the not-found page.

Run it with:

```powershell
npm run react:test:e2e
```

The command runs `npm run react:build` first, then Playwright starts `vite preview` on `127.0.0.1:4173`. This catches a broken production build as well as a broken rendered page.

For interactive debugging, use:

```powershell
npm run react:test:e2e:ui
```

Playwright traces are retained on the first retry. The HTML report command is `npm run react:test:e2e:report`.

## Test the behaviour a user can see

Use accessible locators such as headings, buttons, labels, and links. Avoid selectors tied to CSS classes or implementation details unless the screen has no meaningful accessible surface.

Browser-route and Electron-style hash-route coverage belong in the default suite. The Electron-style test exposes a minimal preload bridge before the app loads, then verifies navigation changes the hash. When the renderer gains an IPC wrapper, test the browser fallback and mock the narrow wrapper, not the entire Electron module.

## CI expectation

Testing belongs before release packaging. A testing workflow should install with `npm ci`, run `npm run react:lint`, run `npm run react:test:e2e`, and upload Playwright reports when a job fails or is not cancelled.

The release workflow should consume a known-good commit or a build artifact produced after those checks pass. That keeps a packaging failure separate from a browser regression.
