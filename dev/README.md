# Local dev stack

From a clean machine to the web client running against the real platform, with the
observatory on the simulator. Every command is below, in order.

**What does not work yet, and why.** Three things stop the full "booked mission reaches a
capture" run on a freshly seeded stack. Each is raised against the platform and is not
worked around here:

| Blocked                                                                 | Request                                                                    |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Every slew, at any hour: `MAX_ALT_SAFE` is null in the seed             | [dev-safety-envelope.md](../docs/platform-requests/dev-safety-envelope.md) |
| Operator sign-in: the demo password is recorded nowhere                 | [demo-passwords.md](../docs/platform-requests/demo-passwords.md)           |
| Anything in daylight: no slots, and both halves apply the daylight lock | [dev-daylight.md](../docs/platform-requests/dev-daylight.md)               |

What does work: the platform, simulator and web client come up together, and you can
register, verify and sign in as a customer. The agent links to realtime. You can browse
targets, and at night you can see and reserve slots.

## The platform checkout is read-only

`../part-1-platform` is used, never changed. See CLAUDE.md, "The platform repository".
The only commands run there are `npm ci`, `npm run db:generate`, `npm run db:deploy`,
`npm run db:seed`, the dev servers, creating `agent/.venv` and running the agent. **Never
`npm run db:migrate`**: it is `prisma migrate dev` and can write migration files there.

## 1. Tools

|                   | Version                      | Check                    |
| ----------------- | ---------------------------- | ------------------------ |
| Node              | 24 LTS                       | `node --version`         |
| Python            | 3.12                         | `python3.12 --version`   |
| Container runtime | OrbStack (or Docker Desktop) | `docker compose version` |
| git               | any                          |                          |

```bash
brew install --cask orbstack
open -a OrbStack          # once, to finish its setup; afterwards `docker` is on PATH
```

## 2. The two checkouts, side by side

```
Darkview/
  part-1-platform/   darkview-platform, read-only
  part-2-clients/    this repository
```

A platform checkout somewhere else? Set `PLATFORM_DIR` in step 3. `darkview.code-workspace`
opens `../part-1-platform` and does not read `PLATFORM_DIR`.

```bash
cd /Users/nika/Desktop/Darkview/part-2-clients
npm ci
```

## 3. `dev/.env.local`

```bash
cp /Users/nika/Desktop/Darkview/part-2-clients/dev/.env.local.example \
   /Users/nika/Desktop/Darkview/part-2-clients/dev/.env.local
```

It holds `PLATFORM_DIR` and the simulated agent's site coordinates. It is gitignored.
Leave the coordinates on Tbilisi; see "Daylight" below.

## 4. `../part-1-platform/.env`, created by you

The platform's services read it. Nothing in this repository writes it, because it holds
the platform's secrets.

**If the file already exists, do not overwrite it.** Move it aside first and carry over
any lines you still need. The copy on this machine carries unrelated keys (Telegram,
Codex), and it has no `S3_*` keys, without which the API and realtime service refuse to start:

```bash
mv /Users/nika/Desktop/Darkview/part-1-platform/.env \
   /Users/nika/Desktop/Darkview/part-1-platform/.env.before-dev-stack
```

Then write the file. It is one command; every secret is generated fresh, and `set -C`
refuses to clobber an existing file:

```bash
( set -C; s() { openssl rand -hex 32; }; cat > /Users/nika/Desktop/Darkview/part-1-platform/.env <<EOF
NODE_ENV=development
DATABASE_URL=postgresql://darkview:darkview@localhost:5432/darkview?schema=public
DATABASE_TEST_URL=postgresql://darkview:darkview@localhost:5432/darkview_test
APP_URL=http://localhost:3000
AUTH_SECRET=$(s)
STREAM_SIGNING_SECRET=$(s)
REALTIME_INTERNAL_URL=http://localhost:4001
REALTIME_INTERNAL_SECRET=$(s)
VOUCHER_CODE_SECRET=$(s)
TRUSTED_PROXY_HOPS=0
S3_ENDPOINT=http://localhost:9000
S3_REGION=eu-central-1
S3_BUCKET=darkview-captures
S3_ACCESS_KEY_ID=darkview-dev
S3_SECRET_ACCESS_KEY=darkview-dev-only
S3_FORCE_PATH_STYLE=true
EMAIL_VERIFICATION_WEBHOOK_URL=http://127.0.0.1:4010/verification
EMAIL_VERIFICATION_WEBHOOK_SECRET=$(s)
PAYMENT_SANDBOX_WEBHOOK_SECRET=$(s)
EOF
)
```

Notes on the values:

- `APP_URL=http://localhost:3000`. **Open the site at `http://localhost:3000`, never
  `127.0.0.1:3000`.** The platform checks `Origin` on every mutation against this exact
  origin, and realtime admits mission-channel handshakes only from it. On `127.0.0.1`,
  sign-in, registration and booking all fail with a cross-origin refusal.
- Postgres and MinIO credentials match `dev/docker-compose.yml`. They are local-only
  placeholders and are published on `127.0.0.1` only.
- `EMAIL_VERIFICATION_WEBHOOK_URL` points at `dev/mail-sink.mjs`, which the stack
  starts. It prints each verification link instead of sending an email.
- `OPEN_METEO_API_KEY` and `NOTIFICATION_WEBHOOK_*` are left unset. Forecasts use the
  keyless endpoint (non-commercial, which is fine locally), and customer emails queue in
  the database unsent.

## 5. First-time setup

```bash
cd /Users/nika/Desktop/Darkview/part-2-clients
npm run dev:stack:setup
```

This starts Postgres (with `darkview` and `darkview_test`) and MinIO (with the
`darkview-captures` bucket). Then, in the platform checkout, it runs:

- `npm ci`
- `npm run db:generate`
- `npm run db:deploy --workspace @darkview/db` (`prisma migrate deploy`: it applies
  the committed migrations and never writes one)
- `NODE_ENV=development npm run db:seed`
- `agent/.venv` on Python 3.12, with `agent/requirements-dev.txt`

It is safe to rerun.

## 6. Run it

```bash
cd /Users/nika/Desktop/Darkview/part-2-clients
npm run dev:stack
```

Or, in VS Code: _Tasks: Run Task → dev stack: run_.

| Prefix     | Process                        | Where                                         |
| ---------- | ------------------------------ | --------------------------------------------- |
| `mail`     | verification webhook sink      | 127.0.0.1:4010                                |
| `api`      | platform API                   | :4000                                         |
| `realtime` | observatory link, live view    | :4001                                         |
| `agent`    | Observatory Agent, `SIMULATED` | no port; dials `ws://localhost:4001/ws/agent` |
| `web`      | this web client                | http://localhost:3000                         |

The agent's observatory id and device token come from the platform's
`packages/db/prisma/development-seed.ts` (`DEMO_IDS.observatory`, `DEMO_AGENT_DEVICE_TOKEN`).
Its local state lives in `dev/.state/`, not `~/.darkview/`.

At start the script compares the platform's `HEAD` with the commit the contract was synced
from. On a mismatch it warns and carries on. Until `packages/contracts/SOURCE.json`
exists it only prints the platform `HEAD`.

Expected agent lines, per the platform RUNBOOK §3: `driver_mode=SIMULATED attended=False`,
then a **`safety envelope: UNMEASURED` warning. That warning is correct**; see
dev-safety-envelope.md.

**Stopping.** Ctrl-C stops every process with SIGTERM, which is how the agent parks. If
one process exits, the rest are stopped and the script names which one it was. Postgres
and MinIO keep running for the next start:

```bash
npm run dev:stack:down                                              # stop the containers
docker compose -f dev/docker-compose.yml down --volumes             # also wipe the data
```

After wiping the data, run step 5 again.

## 7. Sign in

1. Go to http://localhost:3000/en/register and create an account (password of 12+
   characters).
2. The `mail` line prints the link: `http://localhost:3000/en/verify-email/<token>`.
   Open it within 30 minutes.
3. You are signed in as a customer.

**Operator console, `/en/admin`:** blocked. The seeded `demo.operator@darkview.invalid`
has a password nobody has written down, and no route grants the operator role. See
[demo-passwords.md](../docs/platform-requests/demo-passwords.md). Once it is answered: sign
in as that account, open `/en/admin`, and the demo observatory shows ONLINE while `agent`
is running.

## 8. Book a mission and capture

**Blocked** by [dev-safety-envelope.md](../docs/platform-requests/dev-safety-envelope.md),
and in daylight also by [dev-daylight.md](../docs/platform-requests/dev-daylight.md). Once
those are resolved: at night, book a slot for the demo observatory, choose a target, start
the mission when the slot opens, and capture from the live room.

## Daylight

The agent computes the Sun itself and refuses slews while it is above the daylight lock.
The cloud does the same from the observatory's database coordinates, and offers slots
only in astronomical darkness inside the seeded 18:00–23:59 Tbilisi window. None of it
can be switched off here, and none of it should be:

- **Changing `SITE_LATITUDE`/`SITE_LONGITUDE` alone** gets you nothing: the cloud refuses first.
- **`DARKVIEW_AGENT_ATTENDED`** asserts that an operator is physically at the telescope. It
  would also not help, because the cloud never issues a daylight override.

[dev-daylight.md](../docs/platform-requests/dev-daylight.md) has the full investigation and
the proposed fix (a second, night-side simulated demo observatory in the seed).

## Troubleshooting

| Symptom                                              | Cause                                                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `docker compose is not available`                    | Step 1.                                                                                  |
| `…/.env is missing`                                  | Step 4.                                                                                  |
| API exits at start naming an `S3_*` variable         | The platform `.env` is missing the S3 block.                                             |
| Sign-in, register or booking refused as cross-origin | The site was opened on `127.0.0.1`, not `localhost`.                                     |
| `mail` exits at start                                | `EMAIL_VERIFICATION_WEBHOOK_SECRET` is missing or shorter than 32 characters.            |
| `agent` loops `link down … retrying`                 | Realtime is not up, or the database was not seeded (no `deviceTokenHash`). Rerun step 5. |
| Port 5432 in use                                     | Another Postgres is running, e.g. Homebrew's: `brew services stop postgresql@16`.        |
