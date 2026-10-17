# Production browser harness adaptations

The regular client suite starts `next dev`. For this audit, a temporary copy ran against the successful production build using `next start`, with the same test assertions except infrastructure URL/cookie expectations:

- Fake API runs on port 4000 to match the built API rewrite.
- A local TCP relay forwards port 4001 to the fake for the built realtime rewrites.
- Fake cookies use the production `__Host-` names and Secure attribute.
- Fake capture URLs use localhost:3100/api/storage, with localhost:3100 as the allowed storage origin, because the initial production build's CSP only allows same-origin images.
- The expected fixture download URL is adjusted accordingly.
- Dev route warming is removed; setup, chromium, signed-out and separate operator projects are retained.
- Operator-record screenshots write only into this QA evidence directory.

The main run uses four Chrome workers. A serial retest, if performed, is recorded separately. This is adapted test evidence, not a claim that the repository's unmodified development harness passed or that production deployment configuration was verified.
