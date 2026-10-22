# Stellar mobile

The Expo app (ADR-059). It has its own install: run everything from this folder.

```sh
cd "apps/mobile"
npm ci
npm run typecheck && npm test
EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL=http://<this-mac's-LAN-address>:4000 \
EXPO_PUBLIC_APP_URL=http://<this-mac's-LAN-address>:3000 \
npx expo start            # scan the QR code with Expo Go (SDK 58)
```

- `EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL`: the platform API (default `http://127.0.0.1:4000`,
  which a phone cannot reach; give it the Mac's LAN address).
- `EXPO_PUBLIC_APP_URL`: the website the Book tab hands over to.

Only public reads are used. Signing in waits on
`docs/platform-requests/mobile-sign-in.md`. No store build exists until Apple enrolment
clears.
