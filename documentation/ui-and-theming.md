# UI and theming

## Default approach

This template uses plain, modern CSS by default. It intentionally provides only a small app shell so a generated project can establish its own visual language rather than inherit a component library's design decisions.

Shared colour tokens live in `src/index.css`. Components use those tokens from `src/App.css`; they do not depend on a React theme provider. The template includes light and dark token sets as a small, working example of theming, not as a prescribed product design.

## Persisted colour theme

`display.theme` is a `light` or `dark` field on the versioned Settings entity. `SettingsProvider` loads that entity through the platform-selected repository, writes the selected value to `data-theme` on the document root, and applies the same value immediately after a settings update.

The light tokens are the `:root` defaults and dark tokens are defined by `:root[data-theme='dark']`. `color-scheme` is set alongside the tokens so native controls can follow the selected scheme. Existing settings rows that predate the field normalise to the light theme, so the addition does not require a separate migration.

The Settings route demonstrates changing and persisting the preference. New theme-aware CSS should use the existing custom properties rather than hard-coded colours. Add a token when a value is genuinely shared, and keep page-specific presentation close to the page stylesheet.

## Why Mantine is optional

Mantine is not a default dependency in this template. It is a good choice when a project explicitly wants its component catalogue, provider-based theme system, and established form and modal patterns. That choice also brings a dependency, upgrade work, a bundle cost, and a stronger visual and API opinion than a neutral starter needs.

| Template track | Best fit | Ongoing cost | Theme mechanism |
| --- | --- | --- | --- |
| Plain CSS | A project that wants a small, neutral starting point and full control of its design system. | Maintain only the CSS and components the product uses. | CSS custom properties on `:root` and a `data-theme` attribute. |
| Mantine | A project that deliberately adopts Mantine's components and conventions. | Maintain the package, its provider, its version upgrades, and any overrides. | Mantine provider and theme configuration. |

If a generated project adopts Mantine, add it at that product's boundary with its provider and a project-specific component plan. Do not add Mantine alongside the default CSS tokens just to render the template shell.
