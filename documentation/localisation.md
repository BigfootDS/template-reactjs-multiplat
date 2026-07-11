# Localisation

## The scenario

Once a product has more than one language, individual JSON files quickly turn into a maintenance problem. A key can be added to English and quietly missed everywhere else. This template follows the Godmaker pattern instead: one master localisation JSON file is the source of truth, and a script produces the small per-language files used by the app.

The template deliberately ships English only. It proves the whole path without pretending that a real translation workflow exists before a product has translators, review, and content to localise.

## What the template includes

`src/utils/localisation/i18nLocalization.json` is the checked-in master file. Its `json-ready` object maps each language code to its translations and two required metadata values:

- `app_language` is the language name shown in the Settings route.
- `language_direction` is `ltr` or `rtl`, applied to the document root by `LanguageProvider`.

Run this after changing the master file:

```powershell
npm run localisation:split
```

The script writes one JSON file per language and a `manifest.json` into `src/utils/localisation/generated/`. That directory is ignored because it is derived output. Do not hand-edit or commit it. Both `npm run react:dev` and `npm run react:build` run the split step first, so a fresh checkout creates the files before TypeScript or Vite reads them.

## Runtime behaviour

`i18next` is initialised in `src/utils/localisation/i18n.ts`, with `react-i18next` providing `useTranslation()`. English is bundled as the immediate fallback. If a project adds another language, Vite dynamically imports its generated file only when it becomes active.

`LanguageProvider` reads the existing persisted `settings.language.code` field. It changes the active i18next language and updates the document's `lang` and `dir` attributes. The Settings page reads its language options from the generated manifest, so a new language becomes selectable once it is added to the master file and regenerated.

Use keys for user-facing UI content:

```tsx
const { t } = useTranslation()

return <h1>{t('home_heading')}</h1>
```

The template keeps product metadata separate. A translated product title, store listing, or release name needs a product-specific decision rather than being inferred from application UI strings.

## Adding a language

1. Add a language object under `json-ready` in `i18nLocalization.json`. Include every existing key, plus `app_language` and `language_direction`.
2. Run `npm run localisation:split`.
3. Run `npm run react:lint` and `npm run react:test:e2e`.
4. Have a fluent reviewer check the translated copy and the UI at the target language's direction and text length.

The script sorts generated keys and language codes to keep its output deterministic. A future spreadsheet or translation-management export should write the master JSON, then use this same split step. It should not become a second source of truth.

For i18next configuration and interpolation details, see the [official i18next configuration documentation](https://www.i18next.com/overview/configuration-options) and the [react-i18next `useTranslation` documentation](https://react.i18next.com/latest/usetranslation-hook).
