# Platform request: the week's vote

Raised 2026-10-16 under
[ADR-053](../decisions/ADR-053-the-observatory-booking-and-vote-take-the-skychaser-modules.md) §8.
Built on the platform as ADR-050, pull request
[#191](https://github.com/Bekatsertsvadzee/Online-Observatory/pull/191) (2026-10-16).

## What blocks

`/vote` shows the week's candidates — every catalogue target the platform judges
observable at the first-party observatory — with their paths through the night. It cannot
count votes: nothing in the contract records a customer's choice for a week, and this
repository may not invent one. The ballot therefore stands with no counts and says the
vote opens with first light.

## Screens that need it

`/vote`: the ballot's counts and shares, the "Leading" mark, the caller's own vote, and
the poster's "Leading the vote" state. Later, the operator's schedule: the week's winner
is what the observatory photographs on its first clear night.

## Proposed shape

- `GET /votes?observatoryId=&week=` (public). `week` is the Monday, `YYYY-MM-DD`, in the
  observatory's zone; omitted means the current week. Answers
  `{ observatoryId, week, locksAt, candidates: [{ targetId, votes }], mine: targetId | null }`,
  where `candidates` are the targets observable at that observatory on at least one night
  of the week (the rule `GET /targets/tonight` applies, evaluated per night), `votes` is
  the count of customers whose current vote is that target, and `mine` is the caller's
  when the request carries a session.
- `POST /votes` (session). `{ observatoryId, week, targetId }`. One vote per customer per
  observatory per week; casting again moves it. 201 with the same body as `GET /votes`.
  422 for a target that is not a candidate that week; 409 `VOTE_LOCKED` after `locksAt`.
- `locksAt`: Sunday 13:00 UTC of the week, as the source product locks its ballot. The
  observatory's operator reads the winner; nothing is scheduled automatically.

Every customer's vote counts once: the source product's holder weights are its wallet's
and are not wanted here.
