# Real captures for the homepage hero (ADR-106)

A picture taken with this observatory's own telescope and camera, shown in the homepage
hero in place of another observer's photograph of that object (ADR-107).

1. Save the capture here as `<object>.webp`: square, the object centred on a black
   ground, 1,200 px or more a side. `<object>` is `jupiter`, `saturn`, `mars` or `venus`.
2. Add it to `apps/web/src/features/home/captures.ts` with the date it was taken:
   `jupiter: { src: "/sky/captures/jupiter.webp", capturedOn: "2026-12-01" }`.

The hero then badges it "Real capture" with its date, on the nights that object is the
hero's. Only a picture this telescope took goes here: never a drawing, a render or
another observatory's picture (`CLAUDE.md`, "Design and brand").
