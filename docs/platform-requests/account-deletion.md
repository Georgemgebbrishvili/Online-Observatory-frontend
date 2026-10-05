# Platform request: a customer can delete their account

Raised 2026-10-05 for roadmap slice C1. C4 (account and profile, DV-079) waits on it.
ADR-016 leaves account deletion undecided. The privacy page's "Your rights over your
data" section is marked pending until it exists.
Filed as [#173](https://github.com/Bekatsertsvadzee/Online-Observatory/issues/173).

## What blocks

Nothing in the contract deletes, or asks to delete, a `User`.

## Screens that need it

`/{locale}/app/profile` (C4): "Delete my account", behind a confirmation that names what
is lost and asks for the password.

## Proposed shape

- `DELETE /me` with `{ currentPassword }`. It answers **204**, ends every session, and
  clears the cookies, as `signOut` does. A wrong password is the same 401 as a wrong
  sign-in.
- It answers **409** with a code the client can name, and deletes nothing, while the
  account has:
  - a mission in a live state, or a hold it may resume from;
  - a paid booking whose slot is still ahead (the customer cancels or is refunded
    first);
  - a refund or a free slot that is owed and not yet taken.

## What needs the maintainer, and a lawyer

These are decisions, not implementation, and roadmap item F3 (the legal text) depends on
them:

1. **Captures.** Deleted with the account, or kept for a stated time so a customer can
   change their mind. Shared observations and capture links stop working either way.
2. **Payment and booking records.** Accounting rules are likely to require keeping some
   of them; how many, and for how long, is the lawyer's answer. The proposal is to keep those rows with the name and email replaced, and to
   delete everything else.
3. **The audit log.** It is append-only. The proposal is that its rows keep the user id
   and nothing that names the person.
4. **When it happens.** At once, or after a grace period with a link to undo it.

## Until then

The profile page offers no deletion. The privacy page keeps the section marked pending.
