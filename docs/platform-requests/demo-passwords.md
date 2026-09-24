# Platform request: the demo accounts' password

Raised 2026-09-24 from `chore/dev-stack-and-boundary`. Against `darkview-platform` at
`acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## What blocks

The development seed writes `demo.observer`, `demo.operator` and `demo.viewer`
`@darkview.invalid` with a fixed scrypt hash (`packages/db/prisma/seed.ts:17-18`). The
plaintext is recorded nowhere: not in the README, RUNBOOK, seed output or history (it
arrived in `131c3e1` as a hash).

A customer account can be created locally: `dev/mail-sink.mjs` receives the
verification webhook. An **operator** cannot: no route grants the role. So
`/[locale]/admin` — operator console, observatory state, mission control — cannot be
signed into on a local stack.

## Proposed shape

No contract change. Either document the plaintext in `docs/RUNBOOK.md` §"Seeding" and
print it when the seed runs (as the device token already is), or have the seed take the
password from an env var, e.g. `DEMO_ACCOUNT_PASSWORD`, refusing to run without it.

## Screens that need it

`/[locale]/admin` and all its children. `dev/README.md` step 7.
