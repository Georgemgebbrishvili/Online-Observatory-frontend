# Google Play Data safety — Stellar (`ge.astroman.stellar`)

The source for the Play Console **Data safety** form. Written 2026-11-07 from the app's code
(`apps/mobile/src`) and the platform's account deletion (platform ADR-044). Re-check it
whenever the app gains a feature, a library that sends data (analytics, crash reporting,
ads) or a permission.

## What the build asks the phone for

The release APK (`aapt2 dump badging`, 2026-11-07) requests only:

- `INTERNET` — to reach the platform API at `https://stellar.astroman.ge`.
- `VIBRATE` — added by React Native; the app does not collect anything with it.

`app.json` blocks `SYSTEM_ALERT_WINDOW`, external storage and biometric permissions. The app
has no location, camera, microphone, contacts, photos/media or advertising-ID access, and no
analytics, crash-reporting or ads SDK. There is no Sentry in the app (the website has its
own; it is not part of this form).

## Data the app collects or sends

"Collected" in Play's sense means it leaves the phone. Everything below goes only to
Stellar's own platform (`stellar.astroman.ge`), over HTTPS.

| Play category | Data | Why | Required? | Shared with third parties? |
| --- | --- | --- | --- | --- |
| Personal info → Email address | The email typed to sign in | Account management (sign-in) | Required to sign in; the app works signed out | No |
| Personal info → Name | The display name, read back from the account (set on the website) | Account management | Not entered in the app | No |
| App activity → Other user-generated content | Live-session commands (exposure, gain, capture) sent during the customer's own booked session | App functionality | Only during a session | No |
| Photos and videos → Photos | Captures the customer made at the telescope, shown from their Collection | App functionality | Only when signed in | No |
| App info and performance | None collected | — | — | — |
| Financial info → Purchase history | Bookings are **read** (dates, status, target) for the Account tab; no card or payment data passes through the app | App functionality | Only when signed in | No |

**Credentials.** The password is sent once to `POST /auth/native-sign-in` and is never stored.
The platform returns a session token, kept on the phone in the system keychain
(`expo-secure-store`) and sent as `Authorization: Bearer` on the customer's own requests. It is
deleted on sign-out. Play does not list tokens as a data type; answer "Account management"
under the email and name rows.

**Loyalty points** (the Club tab) are read from the customer's account and are not a Play
data type. The app spends and sells nothing (clients ADR-084 §7).

**Payments.** None in the app. Booking and payment happen on the website, outside the app,
through the payment provider; the app never sees card data.

## Form answers

- **Does your app collect or share any of the required user data types?** Yes.
- **Is all of the user data collected by your app encrypted in transit?** Yes. The release
  build talks to `https://stellar.astroman.ge` only (`.env.production`).
- **Do you provide a way for users to request that their data is deleted?** Yes.
  - In the app: Account → **Delete account** opens the website's profile page.
  - On the web: `https://stellar.astroman.ge/en/app/profile` (and `/ka/app/profile`).
- **Shared:** No data is shared with third parties. The platform's own processors (hosting,
  database, file storage, email delivery) act on Stellar's behalf, which Play does not
  count as sharing.
- **Processed ephemerally:** no row is ephemeral; captures and bookings are stored.
- **Optional vs required:** the app works signed out (Tonight, Book hand-over, the public
  Club scheme). Every row above is only collected once the customer signs in.

## What deletion removes (platform ADR-044)

Deleting the account, behind the current password, happens at once and cannot be undone:

- **Deleted:** the password, every session (the app's token stops working), every
  verification and reset link, the captures with their files and share links, the
  Collections, the loyalty account and its history, mission presence and seats, and the
  email outbox.
- **Kept, with the name and email removed:** bookings, payments, missions and the credit
  ledger, carrying only the account id, because payment records must be kept for
  accounting. The audit log keeps the id and nothing that names the person.
- **Blocked while something is unsettled:** a live or upcoming session, a held booking, an
  owed refund, an active subscription or voucher. The profile page says which.

## Open points for the maintainer

- The retention period for the anonymised payment records is the lawyer's answer (platform
  roadmap F3). Play's form does not ask for it, but the privacy policy should state it.
- A customer who signed up with Google has no password, and deletion asks for the current
  password. Confirm on the live site that such a customer can delete their account (set a
  password first via "Forgot password", or a Google path) before declaring deletion
  available to everyone.
