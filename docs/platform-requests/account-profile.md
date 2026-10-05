# Platform request: edit the profile, and change the email address

Raised 2026-10-05 for roadmap slice C1. C4 (account and profile, DV-079) waits on it.
ADR-016 leaves email change undecided. The name and the language are covered here too,
because the profile page needs all three and nothing in the contract writes any of them.

## What blocks

`User` carries `displayName`, `email` and `locale`, and only `register` writes them.
`/app/profile` is a "not yet available" page today.

## Screens that need it

`/{locale}/app/profile` (C4): the name, the language the platform writes to the
customer in, and the email address. Also `/{locale}/verify-email/{token}`, which a
change of address would reuse.

## Proposed shape

- `PATCH /me` with `{ displayName?, locale? }`. Same bounds as `RegisterRequest`. It
  answers **200** with `User`. `locale` is the language of the platform's emails, so
  changing it changes which language the next email arrives in.
- `POST /me/email` with `{ email, currentPassword }`. It answers **202**, and sends a
  link to the **new** address. The account keeps its current address until that link is
  followed. The old address is told that a change was asked for, without the new
  address in the message. A wrong current password is the same 401 as a wrong sign-in.
  An address that already holds an account is not revealed: the answer is still 202,
  and the new address is told it already has an account.
- The link reuses the verification route, so `verifyEmail` takes a change token as
  well as a registration token. On success the address changes, every other session
  ends, and the answer is **200** with `User`.

Rate limits, the Origin check and audit rows are ADR-016's, as for every other
`/auth` and `/me` mutation.

## Until then

The profile page stays a "not yet available" page.
