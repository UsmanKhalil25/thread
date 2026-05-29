## Building APK Files

To generate an APK file for Android distribution or testing:

### Using Expo EAS Build (Recommended)
```bash
bunx eas build --platform android --local
```
This uses Expo's cloud build system. Requires an Expo account.

### Local Build (Requires Android SDK)
```bash
bunx expo prebuild --clean
cd android
./gradlew assembleRelease
```
The APK will be in `android/app/build/outputs/apk/release/`

### Generate Android App Bundle (for Play Store)
```bash
cd android
./gradlew bundleRelease
```
The AAB file will be in `android/app/build/outputs/bundle/release/`

