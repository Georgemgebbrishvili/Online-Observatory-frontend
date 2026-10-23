# Error reports reach Sentry scrubbed (ADR-064) — 2026-10-23

No Sentry account exists yet. Each runtime's DSN pointed at a local listener on
`127.0.0.1:8999` that writes every event it receives, as received, to `events.jsonl`.
The project number in each DSN tells the runtimes apart:

| Path | Runtime | Forced failure |
| --- | --- | --- |
| `/api/1/` | Agent (Python) | `logger.error` naming an email address and `token=…` |
| `/api/2/` | Realtime | started against a database that does not exist; its sweeps fail |
| `/api/3/` | Platform API | `GET /observatories?email=…` with an invalid local environment |
| `/api/4/` | Website, browser | an error thrown on `/en/status?email=…`, relayed through `/monitoring` |

In every event: no `user`, no `server_name`, no cookie or header other than
`user-agent`, no query string, and the email and token replaced with `[scrubbed]`.

The website's server path uses the same `onRequestError` wiring as the API and was not
forced separately.
