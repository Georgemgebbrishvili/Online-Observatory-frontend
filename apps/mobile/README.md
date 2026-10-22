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

The Account tab signs in with a native bearer session (platform ADR-061) and keeps the
token in the keychain (`expo-secure-store`). A confirmed night opens its live room: the
mission channel and the MJPEG live view both carry the bearer, and the view is read
frame by frame with `expo/fetch`, since React Native's `<Image>` cannot play MJPEG. The
Collection tab lists captures and opens each one. Booking and payment stay on the website. No
store build exists until Apple enrolment clears.
