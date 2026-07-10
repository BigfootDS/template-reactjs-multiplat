# CI and releases

## Keep testing and packaging separate

Testing answers whether the application behaves correctly. Packaging answers whether a platform installer can be built. They are related, but they fail for different reasons and should be separate workflows.

`CI - Test` runs for pull requests targeting `main` and pushes to `main`. It uses `npm ci` against the committed lockfile, lints the source, installs Chromium, runs the Playwright suite, and uploads the HTML report and failure artifacts for every run that is not cancelled. The one-off release-age override lets CI install the reviewed versions in the lockfile without weakening the local dependency-age policy.

`CI - Test` and `Release - Build` are reusable workflows. The two release triggers below call them rather than copying their jobs, which keeps automatic and manual release behaviour in sync.

## Choose one release trigger before publishing

The template deliberately includes both release triggers. Pick one before the first production release, then delete the other trigger file:

| Keep this file | It does | Delete this file |
| --- | --- | --- |
| `.github/workflows/cd_release_automatic.yaml` | Creates a release after `CI - Test` succeeds on `main`. | `.github/workflows/cd_release_manual.yaml` |
| `.github/workflows/cd_release_manual.yaml` | Adds a Run workflow button. It requires `main`, an explicit confirmation, and a fresh reusable test run before it releases. | `.github/workflows/cd_release_automatic.yaml` |

Keep `.github/workflows/ci_test.yaml` and `.github/workflows/ci_build.yaml` in either case. They are the shared test and release-build implementations. Leaving both trigger files in place is valid for experimentation, but a manual run after an automatic release creates another version, which is rarely what a product team wants.

## Release artefacts

`Release - Build` creates the version bump, reads `bigfootds.productName` and the bumped package `version` for the human-facing GitHub release title, records the auto-commit SHA as `latest_commit`, then checks out that exact SHA in every packaging and publishing job. That means the version in `package.json`, the release tag, and every uploaded installer come from the same commit.

Upload build artefacts once, then reuse those artefacts for release publishing. Rebuilding in deployment jobs makes it harder to know which commit produced what users download.

The workflow reads `APP_NAME` from a repository variable. Set it to the file-name-safe product name used by the Android, Windows, and Linux artefact steps. It is not a secret, but it is still product configuration and does not belong in a reusable template.

The primary packaging workflow also requires these GitHub Actions secrets:

| Secret | Used for |
| --- | --- |
| `GOOGLEPLAY_SIGNINGKEYBASE64` | Base64-encoded Android keystore for the signed AAB. |
| `GOOGLEPLAY_KEYALIAS` | Alias of the Android signing key. |
| `GOOGLEPLAY_KEYSTOREPASS` | Keystore password. |
| `GOOGLEPLAY_KEYSTOREKEYPASS` | Password for the selected signing key. |
| `DISCORD_WEBHOOK_URL` | Release announcement webhook. Remove the notification step if the project does not use Discord. |

## Optional store deployment recipes

GitHub release, Google Play, Steam, and similar deployment paths are optional examples, not default template behaviour. Each project needs its own application IDs, release channels, and signing credentials.

These recipes follow the release-download pattern used by `game-godmaker`, but use current action versions and keep every product-specific value in a GitHub repository variable or secret. They deliberately download a published release rather than rebuild it.

### Google Play

Use this optional workflow after the AAB is attached to a published GitHub release. `robinraju/release-downloader@v1.13` downloads a named asset from the latest release, then `r0adkll/upload-google-play@v1.1.5` sends it to the selected Google Play track. The upload action expects `releaseFiles` and `tracks`, not its older singular inputs. See the [release downloader](https://github.com/robinraju/release-downloader) and [Google Play upload action](https://github.com/r0adkll/upload-google-play) for their current input details.

```yaml
name: Deploy latest release to Google Play

on:
  workflow_dispatch: {}
  release:
    types: [published]

permissions:
  contents: read

jobs:
  deploy-to-google-play:
    environment: production-google-play
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ github.token }}
      ANDROID_PACKAGE_NAME: ${{ vars.ANDROID_PACKAGE_NAME }}
      GOOGLE_PLAY_AAB_ASSET: ${{ vars.GOOGLE_PLAY_AAB_ASSET }}
      GOOGLE_PLAY_TRACK: ${{ vars.GOOGLE_PLAY_TRACK }}
    steps:
      - uses: actions/checkout@v7.0.0

      - name: Download the release AAB
        id: release-download
        uses: robinraju/release-downloader@v1.13
        with:
          latest: true
          fileName: ${{ env.GOOGLE_PLAY_AAB_ASSET }}
          out-file-path: release-downloads/android

      - name: Upload to Google Play
        uses: r0adkll/upload-google-play@v1.1.5
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: ${{ env.ANDROID_PACKAGE_NAME }}
          releaseFiles: release-downloads/android/${{ env.GOOGLE_PLAY_AAB_ASSET }}
          tracks: ${{ env.GOOGLE_PLAY_TRACK }}
          releaseName: ${{ steps.release-download.outputs.tag_name }}
```

| Repository variable | Value |
| --- | --- |
| `ANDROID_PACKAGE_NAME` | The published Android application ID, such as `com.example.product`. |
| `GOOGLE_PLAY_AAB_ASSET` | Exact AAB file name on the GitHub release. |
| `GOOGLE_PLAY_TRACK` | Google Play track, usually `internal` while validating the automation. |

| Secret | Value |
| --- | --- |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | The complete JSON service-account key authorised in Google Play Console. Do not base64-encode it for `serviceAccountJsonPlainText`. |

The Google Play package must already exist in Play Console, and the service account needs access to that application. Start with an internal track before automating production releases.

### Steam

This recipe uses the same published-release pattern. It downloads a Windows asset and an extracted Linux archive, then passes those two directories to `game-ci/steam-deploy@v3.2.0`. The template does not produce a Steam-ready Linux ZIP by default, so add a product-specific packaging step before using this recipe. The [Steam Deploy documentation](https://github.com/game-ci/steam-deploy) describes the supported depot layout and builder-account setup.

```yaml
name: Deploy latest release to Steam

on:
  workflow_dispatch: {}
  release:
    types: [published]

permissions:
  contents: read

jobs:
  deploy-to-steam:
    environment: production-steam
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ github.token }}
      STEAM_APP_ID: ${{ vars.STEAM_APP_ID }}
      STEAM_LINUX_ARCHIVE_ASSET: ${{ vars.STEAM_LINUX_ARCHIVE_ASSET }}
      STEAM_RELEASE_BRANCH: ${{ vars.STEAM_RELEASE_BRANCH }}
      STEAM_WINDOWS_ASSET: ${{ vars.STEAM_WINDOWS_ASSET }}
    steps:
      - uses: actions/checkout@v7.0.0

      - name: Download the Windows release asset
        id: windows-release
        uses: robinraju/release-downloader@v1.13
        with:
          latest: true
          fileName: ${{ env.STEAM_WINDOWS_ASSET }}
          out-file-path: release-downloads/windows

      - name: Download and extract the Linux release archive
        uses: robinraju/release-downloader@v1.13
        with:
          latest: true
          fileName: ${{ env.STEAM_LINUX_ARCHIVE_ASSET }}
          out-file-path: release-downloads/linux
          extract: true

      - name: Upload depots to Steam
        uses: game-ci/steam-deploy@v3.2.0
        with:
          username: ${{ secrets.STEAM_BUILDER_USERNAME }}
          configVdf: ${{ secrets.STEAM_BUILDER_CONFIG_VDF }}
          appId: ${{ env.STEAM_APP_ID }}
          buildDescription: ${{ steps.windows-release.outputs.tag_name }}
          rootPath: release-downloads
          depot1Path: windows
          depot2Path: linux
          releaseBranch: ${{ env.STEAM_RELEASE_BRANCH }}
```

| Repository variable | Value |
| --- | --- |
| `STEAM_APP_ID` | Steamworks application ID. |
| `STEAM_WINDOWS_ASSET` | Exact Windows release asset to put in the first depot. |
| `STEAM_LINUX_ARCHIVE_ASSET` | Exact Linux ZIP asset to extract into the second depot. |
| `STEAM_RELEASE_BRANCH` | Steam branch to make live, such as a prerelease branch. |

| Secret | Value |
| --- | --- |
| `STEAM_BUILDER_USERNAME` | Username for a restricted Steam build account. |
| `STEAM_BUILDER_CONFIG_VDF` | Base64-encoded `config.vdf` generated by SteamCMD for that builder account. Treat it like a credential and rotate it when Steam Guard requires re-authentication. |

Use a restricted Steam build account, not a personal administrator account. The Steam action supports a TOTP alternative, but the `configVdf` route keeps this recipe aligned with the existing BigfootDS deployment workflow.

## Version synchronisation

A project that ships through Capacitor can choose to synchronise the package version into the native project before generating assets or building an Android release. This is useful only after the project has chosen a versioning policy and verified how each store interprets the native version fields.
