# CI and releases

## Keep testing and packaging separate

Testing answers whether the application behaves correctly. Packaging answers whether a platform installer can be built. They are related, but they fail for different reasons and should be separate workflows.

The testing workflow should use `npm ci`, lint the source, run the Playwright suite, and preserve the Playwright report when it is useful for diagnosis. The packaging workflow should run only after that work succeeds.

## Release artefacts

Create platform installers from a known-good commit. If release automation changes a version or tag, make the commit reference explicit before subsequent jobs build from it.

Upload build artefacts once, then reuse those artefacts for release publishing. Rebuilding in deployment jobs makes it harder to know which commit produced what users download.

## Store deployment and signing

GitHub release, Google Play, Steam, and similar deployment paths are optional examples, not default template behaviour. Each project needs its own application IDs, release channels, and signing credentials.

Keep those values in repository variables and secrets. Do not place a real signing password, keystore, Steam app ID, or store token in source control. Document the names and expected format of required secrets alongside the workflow that consumes them.

## Version synchronisation

A project that ships through Capacitor can choose to synchronise the package version into the native project before generating assets or building an Android release. This is useful only after the project has chosen a versioning policy and verified how each store interprets the native version fields.
