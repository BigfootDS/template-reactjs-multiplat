# Metadata, assets, and optional integrations

## One source of product metadata

Application name and version tend to be repeated in the browser title, Electron window, diagnostics screen, package output, and release workflow. The template keeps its canonical values in the `bigfootds` block in `package.json`, including the Bigfoot Fetcher fields `productName`, `platformName`, and `platformType`.

Vite exposes only the safe metadata through `__APP_METADATA__` and makes the same fields available through the renderer's `process.env` object. This matches the configuration shape used by `@bigfootds/bigfoot-fetcher`, while loading only `VITE_` environment variables so a local secret is not accidentally bundled.

Electron also reads its window dimensions, menu preference, and packaged cross-origin isolation policy from the Electron metadata block. Keep product-specific credentials out of this metadata.

Do not expose secrets through Vite defines. The renderer bundle is public to the user.

## Asset conventions

Keep hand-authored source artwork in a clearly named asset or icon directory. Generate web, Electron, Android, and store-specific output from those sources where tooling supports it.

Generated native icons and splash images are build output. Do not hand-edit them, and do not rely on a generated file as the only copy of a product logo.

Document which source asset feeds each target when adding a platform or store. A contributor should be able to replace the product icon without hunting through generated Android resource folders.

## Optional integration policy

The default template remains deliberately small. Add one of these directions only when a project needs it and its trade-offs are accepted:

| Direction | When it earns its place |
| --- | --- |
| Mantine | The project wants an opinionated React component system, theme provider, and form/modal patterns. |
| i18next | The product has real multi-language content and a translation workflow. |
| SQLocal and Kysely | The product needs relational local data, migrations, and queries beyond a small preference store. |
| Steam runtime and deployment | The desktop product ships through Steam and has a real app ID and release process. |
| Google Play deployment | The Android product has a release track, signing setup, and service-account credentials. |
| Dependency licence screen | The product needs to present generated third-party licence data in an About or Credits screen. |

Do not import a game-specific visual theme, game state, multiplayer system, or store integration simply because it existed in Godmaker. The reusable lesson is the boundary and workflow, not the product code.
