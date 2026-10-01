# Hosting the demo

2026-10-01. Decisions by Nika, this date: a **demo** first (sandbox checkout, simulated
observatory, no real money, no hardware); Prisma Postgres; Fly.io for the long-lived
services; Cloudflare in front of one domain; the verification email through Resend from
the platform.

## Layout

```
                      stellar domain (Cloudflare DNS + proxy)
                         |                          |
          /ws/mission/*, /stream/mission/*          everything else
                         |                          |
                 Fly.io: realtime              Vercel: part-2-clients (web)
                 + simulated agent                  |  /api/* rewrite
                         |                          |
                         +------ Prisma Postgres ---+-- Vercel: platform api
                                 Cloudflare R2 (captures)
```

- **One host.** The session cookie is `__Host-` prefixed, so the browser sends it only to
  the host that set it (platform `docs/RUNBOOK.md` §1). The website, `/api` and the
  realtime paths therefore share the domain. Vercel's rewrites to an outside origin do
  not reliably carry a WebSocket upgrade, so Cloudflare routes the realtime paths to Fly
  before Vercel sees them; `/api` stays a Vercel rewrite, as in `next.config.ts`.
- **Database.** Prisma Postgres through the Vercel Marketplace. It supports `btree_gist`,
  which the slot-overlap constraint needs (RUNBOOK §2).
- **Captures.** Cloudflare R2: the platform stores through the S3 interface (ADR-012),
  and Vercel Blob is not S3-compatible.
- **Realtime + agent.** One Fly app, always on: the realtime service and the simulated
  agent, which dials out to it. CLAUDE.md forbids holding the observatory socket in a
  serverless function.
- **Email.** Only the verification email at first ([platform request](../platform-requests/hosted-demo.md)).

## Order

1. Platform branch: `DARKVIEW_DEPLOYMENT=demo` and the Resend sender, ADR-035, tests.
   Reviewed and merged under the platform's ADR-014.
2. Accounts (Nika): Fly.io, Cloudflare (move the domain's nameservers), Resend (verify
   the sending domain), Cloudflare R2 bucket.
3. Provision: the platform API as its own Vercel project with Prisma Postgres;
   `btree_gist`, then `db:deploy` and the demo seed — a production migration, run only on
   Nika's request in that session.
4. Fly: realtime + simulated agent, secrets set.
5. Cloudflare routes; the website's Vercel environment
   (`DARKVIEW_PLATFORM_API_URL`, `DARKVIEW_REALTIME_URL`, `DARKVIEW_STORAGE_ORIGIN`).
6. Smoke test on the live domain: register, verify, book, pay in the sandbox, open the
   room, capture, Collection.

## Not in this plan

A real payment provider, the nine notification emails, real hardware. Each needs its own
decision; the demo flag is undone for the real launch.
