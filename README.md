## Running on a USB-connected Android device

If `bun android` shows the Expo Go "Something went wrong" screen instead of loading the app, the device's loopback port forwarding to Metro is missing or stale:

```bash
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081" host.exp.exponent
```

The first command forwards the device's `localhost:8081` to your machine's Metro server over USB. The second relaunches Expo Go pointed at that address.

## Building APK Files

To generate an APK file for Android distribution or testing:

### Using Expo EAS Build (Recommended)

```bash
bunx eas build --platform android --local
```

This uses Expo's cloud build system. Requires an Expo account.

### Local Build (Requires Android SDK)

```bash
bunx expo prebuild --clean --platform android
cd android
./gradlew assembleRelease -Pabis=arm64-v8a
```

The APK will be in `android/app/build/outputs/apk/release/`

### Generate Android App Bundle (for Play Store)

```bash
cd android
./gradlew bundleRelease
```

The AAB file will be in `android/app/build/outputs/bundle/release/`
