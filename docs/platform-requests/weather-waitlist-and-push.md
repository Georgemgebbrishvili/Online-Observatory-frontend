# Platform request: slot forecasts, a waitlist, and push

Raised 2026-10-23 from Phase 6 slice 6.6 (`docs/plan/phase-6/README.md`, ADR-068).
Against `darkview-platform` at `ba88985cb1f4842fb925b525a8d5cdd8fe45c230`.

## What blocks

- The booking board shows a week of nights, but the only forecast is tonight's
  (`GET /observatories/{id}/conditions`), and the realtime service stores two days.
- A taken slot cannot be waited for: nothing records a queue or offers a freed slot.
- There is no push: no device registration on the native session (ADR-061), no sender.

## Screens that need it

The booking board (forecast per slot, Join the waitlist, an offer held for me), a lost
booking's page (the next clear slot), the phone's Account tab (permission, the
notification log).

## Proposed shape

**Forecast (part A).**
`Slot.forecast: SlotForecast` (required): `{ status: ViewingConditionsStatus,
cloudCoverPercent: number | null }` -- the cloudiest hour the slot touches; UNKNOWN when
any touched hour has no stored or no fresh forecast. Seven forecast days instead of two.

**Waitlist (part A).**
- `POST /waitlist` `{ observatoryId, slotStartAt, durationMinutes }` -> 201
  `WaitlistEntry`. 409 when the slot is not taken (book it) or the caller already waits
  for it; 422 at three active places.
- `GET /waitlist` -> `{ items: WaitlistEntry[] }`, the caller's, newest first.
- `DELETE /waitlist/{entryId}` -> 204; another person's entry is 404.
- `WaitlistEntry { id, observatoryId, slotStartAt, durationMinutes, status: WAITING |
  OFFERED | CLAIMED | LAPSED | ENDED | LEFT, position: integer | null, offerExpiresAt:
  date-time | null, createdAt }`.
- `SlotUnavailableReason` gains `HELD_FOR_WAITLIST`: a freed slot offered to the first in
  line for fifteen minutes. Only the offeree may reserve it; reserving it claims the entry.
- A realtime sweep offers freed slots in order, lapses unclaimed offers, ends entries
  whose slot has started, and queues the email `WAITLIST_OFFER`.

**Push (part B) -- deferred by ADR-068 §4, not filed.**
- `POST /me/push-devices` `{ token, platform: IOS | ANDROID }` on a NATIVE session -> 204;
  the device belongs to that session and goes with it.
- `GET /me/notifications` -> `{ items: [{ id, kind: PushKind, status, createdAt, sentAt }] }`,
  the last twenty.
- `PushKind`: `SLOT_STARTING` (15 minutes before, push only), `WEATHER_HOLD`,
  `CAPTURE_READY`, `WAITLIST_OFFER`, `CARD_PRIZE_WON` -- the last four queued wherever their
  email is.
- Realtime sends the push outbox through Expo's push API (endpoint and optional
  `EXPO_ACCESS_TOKEN` from the environment), once per row, and forgets a token Expo
  reports unregistered.
