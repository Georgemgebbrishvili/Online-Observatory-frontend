# Ownership — who owns which files

Two agents never own the same file. A merge conflict between tracks means a boundary was
crossed: fix the boundary, not just the conflict.

## Boundaries inside this repository

| Agent | Owns | Never touches |
| --- | --- | --- |
| **darkview-web** | `apps/web/src/app/**`, `components/**`, `features/**`, `styles/**`, `i18n/**` | the platform seam, contract spec |
| **darkview-mobile** | `apps/mobile/**` | web internals, contract spec |
| **darkview-lead** | `packages/contracts/**`, `docs/**`, root config, `.github/**`, `scripts/**`, `apps/web/src/lib/platform/**` | feature implementation in any track |

`apps/web/src/lib/platform/` is the seam to `darkview-platform`. It is lead-owned because
a change to it is a change to how this repository consumes the contract.

## The other repository

`darkview-platform` holds the Observatory Agent, the API, the realtime service and the
database. Nobody here edits it, and nobody there edits this one. The only thing that
crosses is the contract, and it crosses one way: released there, copied here.

A change that needs both repositories is two branches, two reviews, and the platform side
merges first.

## Rules

1. **The contract spec is not ours.** `packages/contracts/openapi.yaml` is a pinned copy.
   A task needing a new field stops and opens a contract issue against
   `darkview-platform`.
2. **Generated files are nobody's.** `packages/contracts/generated/` is produced by
   `npm run contracts:generate`. Never hand-edited, by anyone.
3. **One agent, one branch, one issue.** Branch naming: `web/dv-077-operator-console`,
   `mobile/dv-082-app-shell`, `lead/…`.
4. **Shared files need a lead decision.** `apps/web/package.json` and the root config are
   lead-owned; a worker needing a dependency asks rather than edits.
5. **Two agents at once is the ceiling** for one reviewer.

## Review and merge

darkview-lead reviews every branch and decides merge order. Nothing merges to `main`
directly, and nothing is pushed without explicit approval on that push.

## Definition of done

1. Scope matches the issue — nothing more.
2. Relevant tests pass; lint and typecheck pass.
3. No unrelated refactor.
4. `npm run contracts:check` is green.
5. The issue's stated evidence exists — screenshots per locale, test output.
6. Risks and assumptions listed explicitly.
