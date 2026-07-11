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

## Android signing

The checked-in `capacitor.config.json` names the Android release type only. It deliberately contains no keystore path, alias, or password. The template has two separate signing paths:

- `npm run capacitor:android:build` is useful for a normal local packaging check. Without signing values, it produces an unsigned release AAB.
- `npm run capacitor:android:build:signed` is the local developer path. It loads local signing values, prepares the Capacitor project, and builds a signed AAB.
- `.github/workflows/ci_build.yaml` builds an unsigned AAB on the GitHub runner, then signs that result from GitHub Actions secrets. It does not use a checked-in Android signing configuration.

### Local signed builds

Use an Android upload key that lives outside the repository. If the product uses Play App Signing, follow the [Android signing guide](https://developer.android.com/studio/publish/app-signing) for the product's upload-key and app-signing-key decisions. Losing a key or its password is a product recovery problem, not something a template can safely fix, so keep an encrypted backup and store passwords in the team's password manager.

For a new local upload key, create a directory outside the repository and let `keytool` prompt for the sensitive values:

```powershell
New-Item -ItemType Directory -Force "$HOME\.bigfootds\android" | Out-Null
keytool -genkeypair -v `
  -keystore "$HOME\.bigfootds\android\product-upload.jks" `
  -alias product-upload `
  -keyalg RSA `
  -keysize 4096 `
  -validity 10000
```

Create the ignored local environment file once:

```powershell
npm run setup:env
```

Then fill in `.env.local`. The template includes the variable names only in `.env.example`; do not put real values there.

| Local variable | Purpose |
| --- | --- |
| `ANDROID_SIGNING_STORE_FILE` | Absolute keystore path, or a path relative to the repository root. Keep the file outside the repository. |
| `ANDROID_SIGNING_STORE_PASSWORD` | Password for the keystore. |
| `ANDROID_SIGNING_KEY_ALIAS` | Alias of the signing key inside the keystore. |
| `ANDROID_SIGNING_KEY_PASSWORD` | Password for that signing key. |
| `ANDROID_SIGNING_STORE_TYPE` | Optional keystore format. It defaults to `JKS`; use `PKCS12` only when that is the selected key's format. |

For example, the local file should contain values with the same alias and paths you chose, not this template's values:

```dotenv
ANDROID_SIGNING_STORE_FILE="C:\Users\your-name\.bigfootds\android\product-upload.jks"
ANDROID_SIGNING_STORE_PASSWORD="replace-with-your-keystore-password"
ANDROID_SIGNING_KEY_ALIAS=product-upload
ANDROID_SIGNING_KEY_PASSWORD="replace-with-your-key-password"
ANDROID_SIGNING_STORE_TYPE=JKS
```

Build the signed bundle with:

```powershell
npm run capacitor:android:build:signed
```

The wrapper gives those values to Gradle through the build process environment. They never go into `capacitor.config.json`, `android/app/build.gradle`, or its command-line arguments. Values supplied through the developer's environment take precedence over `.env.local`, so a local secret manager can replace the file completely. Do not prefix signing variables with `VITE_`, because Vite exposes that prefix to browser code.

`.env.local`, `.jks`, and `.keystore` files are ignored by Git in this template. They are still sensitive plaintext or key material on the developer's machine, so do not copy them into issue trackers, chat, build logs, or cloud-sync folders that are outside the team's approved secret-storage process.

### CI signing secrets

The current Android release job expects these repository or organisation secrets. Their names intentionally differ from the local variables because the workflow passes them directly to its signing action.

| GitHub Actions secret | Value |
| --- | --- |
| `GOOGLEPLAY_SIGNINGKEYBASE64` | Base64 encoding of the upload-keystore bytes, with no surrounding JSON or quotes. |
| `GOOGLEPLAY_KEYALIAS` | Upload-key alias. |
| `GOOGLEPLAY_KEYSTOREPASS` | Keystore password. |
| `GOOGLEPLAY_KEYSTOREKEYPASS` | Upload-key password. |

In PowerShell, this reads a local keystore and prints the base64 value that can be pasted into the GitHub secret form:

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("$HOME\.bigfootds\android\product-upload.jks"))
```

Set `APP_NAME` as a repository variable as described above. Never place any of these secret values in a workflow file, `package.json`, Capacitor configuration, or a committed environment file.

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

`package.json` `version` is the one canonical release version for this template. Release workflows already read it for tags and display names, and Capver now writes that same number into the Android project before every `capacitor:android:compile` run.

Run these commands directly when checking a native version change:

```powershell
npm run capacitor:version:sync
npm run capacitor:version:check
```

The sync wrapper passes the current `package.json` version to `@capawesome/capver set`. It does not use Capver's `sync` command because that command chooses the highest version found across platforms, which would let a stale Android value override the package version.

### Android mapping

The template uses Capver's `MMmmmmppp` pattern. Android `versionName` is exactly the package version. Android `versionCode` is the positive integer formed by the major version followed by the minor version padded to four digits and patch version padded to three digits.

| Package version | Android `versionName` | Android `versionCode` |
| --- | --- | --- |
| `0.0.10` | `0.0.10` | `10` |
| `1.2.3` | `1.2.3` | `10002003` |
| `12.34.5` | `12.34.5` | `120034005` |

This produces a monotonically increasing version code for normal SemVer releases and supports up to `9999` minor versions and `999` patch versions. The scripts reject `0.0.0` and codes above Android's positive-integer limit, including every `215.x.y` version and the upper end of `214.x.y`.

Capver's native mapping accepts only the release form `MAJOR.MINOR.PATCH`. The wrapper deliberately rejects prerelease and build metadata rather than silently removing it from `package.json`. A project that needs mobile prereleases must define a store channel and Android version-code policy first, then extend this wrapper as a product-specific decision.

See the [Capver documentation](https://github.com/capawesome-team/capver) for its platform support and pattern options.
