# Platform request: an observer can read the refund a close gave them

Raised 2026-10-02, following [#167](https://github.com/Bekatsertsvadzee/Online-Observatory/issues/167)
and its pull request #168, under
[ADR-036](../decisions/ADR-036-ten-observers-and-a-refund-for-the-time-a-close-takes.md).
The maintainer decided the same day that the observer is shown the amount refunded.
Filed as [#169](https://github.com/Bekatsertsvadzee/Online-Observatory/issues/169).

## What blocks

#168 records the refund on `ObserverPack.refundedMinor`, but nothing returns it after
the close:

- `purchaseObserverPack` is the only operation that returns an `ObserverPack`, and it
  answers 403 once the session is closed.
- `getMissionWatchView` answers 404 to the observer once the owner closes. Their seat is
  `LEFT` and `Mission.observable` is false, which removes both of the grounds the
  operation reads on.
- An owed refund (`refundOwedMinor`, any provider other than SANDBOX) is not in the
  contract at all, so the client cannot say "your refund is on its way" either.

## Screens that need it

The watch page (roadmap slice A1), at the moment the owner closes and on any later visit
to the same link. Also the room's close confirmation (A5), which is to say that watchers
are refunded for the time they lose.

## Proposed shape

- `getMissionWatchView` is also readable by a caller who holds a `PAID` `ObserverPack` on
  the mission, in any mission state. It still grants nothing.
- `MissionWatchView.myObserverPack`: the caller's own pack, `ObserverPack | null`.
- `ObserverPack.refundOwedMinor` (integer, minor units, null unless a refund is decided
  but not yet issued). The client says "refunded {amount}" for `refundedMinor`, and
  "{amount} will be refunded" for `refundOwedMinor`.

The platform may prefer a dedicated read, such as `GET /missions/{id}/observer-pack`.
The client needs the same three values either way: price, refunded, owed.

## Until then

The watch page says the session was closed and promises no amount.

## Built

Platform ADR-045, PR #180, merged as `8cd3ae4`, in the request's first shape: a paid pack
is a ground to read the watch view in any mission state, `MissionWatchView.myObserverPack`
carries the caller's own pack, and `ObserverPack.refundOwedMinor` sits beside
`refundedMinor`. The watch page says "was refunded to you" for the first and "will be
refunded to you" for the second, and a paid buyer returning after a close reads it with no
seat offered for sale.
