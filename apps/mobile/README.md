# Stellar mobile

The Expo app (ADR-059). It has its own install: run everything from this folder.

```sh
cd "apps/mobile"
npm ci
npm run typecheck && npm test
EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL=http://<this-mac's-LAN-address>:4000 \
EXPO_PUBLIC_DARKVIEW_REALTIME_URL=http://<this-mac's-LAN-address>:4001 \
EXPO_PUBLIC_APP_URL=http://<this-mac's-LAN-address>:3000 \
npx expo start            # scan the QR code with Expo Go (SDK 58)
```

- `EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL`: the platform API (default `http://127.0.0.1:4000`,
  which a phone cannot reach; give it the Mac's LAN address).
- `EXPO_PUBLIC_DARKVIEW_REALTIME_URL`: where `/ws/mission` and `/stream/mission` are served
  (default: `EXPO_PUBLIC_APP_URL`, which is right for production, where one host serves both).
- `EXPO_PUBLIC_APP_URL`: the website the Book tab hands over to.

The Account page (the header's person button) signs in with a native bearer session (platform ADR-061) and keeps the
token in the keychain (`expo-secure-store`). A confirmed night opens its live room: the
mission channel and the MJPEG live view both carry the bearer, and the view is read
frame by frame with `expo/fetch`, since React Native's `<Image>` cannot play MJPEG. The
Collection tab lists captures and opens each one. The Club tab (clients ADR-084) shows the
member card, tiers, referral code and history, read-only. Booking and payment stay on the
website. No iOS store build exists until Apple enrolment clears.

## Android APK (local build)

`android/` is generated (continuous native generation) and never committed; app.json and
`plugins/android-release.js` hold its configuration. A release build reads
`.env.production`, so it talks to `https://stellar.astroman.ge`.

```sh
export JAVA_HOME=<a JDK 17>  ANDROID_HOME=~/Library/Android/sdk
# SDK: platform-tools, platforms;android-37.0, build-tools;37.0.0, ndk;27.1.12297006
npx expo prebuild --platform android --clean --no-install
cd android && ./gradlew assembleRelease --no-daemon --max-workers=3
# -> android/app/build/outputs/apk/release/app-release.apk
```

Release is signed with the upload key named by `keystore.properties` (`storeFile`,
`storePassword`, `keyAlias`, `keyPassword`), read from
`~/Desktop/Stellar Observatory/Private/android/` or `$STELLAR_KEYSTORE_PROPERTIES`. Without
it a release build **fails** (`plugins/android-release.js`); it never falls back to the debug
key. `node scripts/brand-icons.mjs` redraws the icon, adaptive icon and splash from the comet
mark, and the Play listing's graphics into `store/`.

## Google Play release (Android App Bundle)

Play takes an `.aab`, not an APK. Same prebuild, then `bundleRelease`:

```sh
export JAVA_HOME=<a JDK 17>  ANDROID_HOME=~/Library/Android/sdk
npx expo prebuild --platform android --clean --no-install
cd android && ./gradlew bundleRelease --no-daemon --max-workers=3
# -> android/app/build/outputs/bundle/release/app-release.aab
```

- **SDK levels.** Expo SDK 58 builds with compileSdk 37 and **targetSdk 36** (Android 16),
  from React Native's version catalog; Google Play requires 36 or higher for new apps since
  31 August 2026, so no override is needed. Check after any Expo upgrade:
  `aapt2 dump badging <apk> | grep targetSdk`.
- **Versions.** `version` (0.1.0) and `android.versionCode` (1) in `app.json` are right for
  the first upload. **Every later upload needs a higher `versionCode`**; Play refuses a
  repeat. Raise `version` when the change is visible to customers.
- **Signing.** Enrol the app in Play App Signing; Google holds the app signing key and this
  upload key signs what you upload. Keep a backup of `stellar-upload.jks` and
  `keystore.properties` outside this computer: losing them means asking Google for an
  upload-key reset.
- **Store graphics.** `store/play-icon-512.png` (512 x 512, 32-bit PNG) and
  `store/feature-graphic-1024x500.png`, from `node scripts/brand-icons.mjs`. Phone
  screenshots: `sh scripts/play-screenshots.sh <missionId>` against a running emulator (a
  Google APIs image, signed in), into `store/screenshots/{en,ka}/`.
- **Data safety.** The answers are in `docs/release/play-data-safety.md`.
- **Nothing is sold in the app** (clients ADR-084 §7). Tonight, Book and a target's page
  hand over to the website's `/app/book`, where booking and payment happen. A session is a
  digital service (maintainer, 2026-11-07), so those three hand-overs are removed or replaced
  by Google Play Billing before the first Play upload.
