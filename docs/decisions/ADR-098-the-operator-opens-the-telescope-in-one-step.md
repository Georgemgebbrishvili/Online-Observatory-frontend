# ADR-098 — The operator opens the telescope in one step

- **Date:** 2026-11-19
- **Status:** APPROVED (2026-11-19)
- **Decided by:** project maintainer (Nika), in session: "I need now the admin profile with
  free telescope access, so whenever the platform starts it should open a session green.
  and I should be able to enter the observatory room."
- **Builds on:** platform ADR-082 (an operator's free session on any first-party
  observatory, target optional), platform ADR-075, ADR-079 §1 (opening the room inside
  the slot starts the session).

## Decision

1. **`/[locale]/admin/telescope`** opens the operator's own free hour and replaces itself
   with the session room, where the room's own start makes it live. No target is sent:
   the platform picks the brightest one that is up. The observatory chosen in the console
   is tried first; when it has nothing up or a customer holds the time, the next one is.
   Any other refusal is shown with "Try again".
2. **Reopening lands in the same room.** The platform answers an operator's live free
   session as it stands, so the page is safe to bookmark and open again.
3. **Where it is reached:** first in the operator navigation ("Telescope"), and an "Enter
   the observatory" panel at the top of the overview. Not in the public header: it only
   knows that someone is signed in, and asking the platform for the role on every page
   would add a request to every page.
4. **The control page's own-session panel is shown on every operated observatory**, not
   only the hardware test one, with a choice of target and length.

## Consequences

- An operator's account is an OPERATOR role on the platform; nothing on the website
  grants it.
- The hour is free and audited on the platform; a customer's booking always comes first.
