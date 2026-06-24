## Development build (custom dev client)

### 1. First-time build & install (USB)

Plug in your Android device (USB debugging on), confirm it's detected, then build:

```bash
adb devices                     # should list your device
npx expo run:android --device   # builds the native app, installs it, starts Metro
```

> **Do NOT use `bunx --bun expo ...`.** The `--bun` flag puts a Bun shim on `PATH`
> that intercepts the `node` calls Gradle makes in `settings.gradle`, which fails the
> build with `Process 'command 'node'' finished with non-zero exit value 1`.
> Use `npx` (or `bunx` **without** `--bun`).

The first build takes several minutes. After it finishes, the app
(`com.anonymous.minimal`) is installed on your device.

### 2. Daily development

You only rebuild natively when native code/config changes. For normal JS/TS work just
start Metro and reload the already-installed app.

Because the device often can't reach Metro over Wi-Fi (mobile data, different SSID, or
router AP isolation → `ConnectException: ... ETIMEDOUT`), tunnel Metro over USB:

```bash
adb reverse tcp:8081 tcp:8081            # route device localhost:8081 -> Metro (over USB)
npx expo start --dev-client --localhost  # serve the bundle at localhost
```

Then open the **thread** app. If it shows the dev-client error screen, tap **Go home**
→ **Enter URL manually** → `http://localhost:8081`.

> `adb reverse` is cleared on unplug / reboot / `adb kill-server`. Re-run it if the
> connection error returns.

Dev-menu shortcut: press **`m`** in the Metro terminal (the device blocks `adb shell input`).

### 3. Installing native packages

Always use `expo install` so versions match the SDK. Plain `bun add` grabs the latest,
which pulls in mismatched native modules and breaks the build (e.g. SDK 56
`expo-dev-menu` against SDK 55 → `Unresolved reference 'OptimizedRecord'`).

```bash
bunx expo install <package>
```

## Build performance & APK size (Gradle)

Configured in `android/gradle.properties`:

- `reactNativeArchitectures=arm64-v8a` — physical-device only; drops `x86_64`/emulator
  builds for smaller APKs and faster compiles. Add `x86_64` back if you need an emulator.
- `org.gradle.caching`, `org.gradle.parallel`, `org.gradle.daemon`, `kotlin.incremental` —
  faster warm/incremental builds.
- Release builds: R8 `minify`, `shrinkResources`, Proguard, PNG crunch, Hermes.

The build cache lives on disk (`android/build`, `~/.gradle/caches`) and **survives
reboots** — a reboot only kills the in-memory daemon (a few seconds to restart), not the
caches. A full slow rebuild only happens if you delete those caches.

## Building a release APK

> Do **not** run `expo prebuild --clean` — the `android/` folder has manual edits (the
> MMKV dependency required by the background-downloader, etc.) that regeneration wipes.

```bash
cd android
./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/`

### Android App Bundle (Play Store)

```bash
cd android
./gradlew bundleRelease
```

AAB output: `android/app/build/outputs/bundle/release/`
