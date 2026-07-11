# Credits and licence data

## The scenario

A browser app can include its dependency licence notices in a release without making users hunt through `node_modules`. Open-source projects also often want to acknowledge the people who have contributed through Git. These are different jobs, so the template keeps them as two separate generated snapshots and two independent sections of the `/credits` route. The same route also shows the product name and version from the existing application metadata source.

The page is a small example, not legal advice. A product owner still needs to check its own distribution, notices, and licence obligations before release.

## Dependency licence snapshot

Godmaker's approach is used directly:

```powershell
npm run project:npmcompliance:update
```

That runs `npx @bigfootds/npm-compliance-helper` and writes `src/assets/organisedLicenseData.json`. The helper groups direct dependencies by their licence text, with any included notices. `CreditsPage` renders each group inside a native `<details>` element so the page stays usable even when a licence is long.

Run the command after changing dependencies or the lockfile, then review the JSON diff before committing it. The file is generated, but it is deliberately tracked: it is bundled into the Credits route and a production build must not download a CLI package to render licences. It is not general throwaway build output.

The Credits route is lazy-loaded, so licence text does not increase the initial application bundle. A complete notice snapshot can still exceed Vite's default chunk-size warning when the route is built. Treat that as a useful size signal: assess whether an in-app notice screen suits the product instead of silencing the warning globally.

## Git contributor snapshot

Run this when the project wants to refresh its contributor acknowledgement:

```powershell
npm run project:contributors:update
```

The script runs `git log --all` and writes `src/assets/gitContributors.json`. It publishes Git author names and commit counts only. Email addresses are used neither in the output nor in the Credits page.

`scripts/git-contributor-people.json` is the small, checked-in source that maps Git identities to one primary human name. The generated snapshot nests every identity and its commit count under that primary name, while the Credits page displays only the primary name and total. Add a new person or identity to this file before rerunning the generator. Unmapped identities remain as one-person entries, so a contributor is never silently omitted.

## Keeping or removing either section

The dependency and contributor paths are intentionally separate:

- To remove dependency licences, remove the licence import and section from `CreditsPage.tsx`, the compliance script, and `organisedLicenseData.json`.
- To remove Git contributors, remove the contributor import and section, the contributor script, and `gitContributors.json`.
- To remove the whole page, remove the lazy import, route, and navigation item in `src/App.tsx`, then delete `CreditsPage.tsx` and the two scripts or assets that are no longer used.

Keep the route if the product needs an in-app notice screen. Otherwise, remove it during project setup rather than leaving a stale placeholder in a released product.
