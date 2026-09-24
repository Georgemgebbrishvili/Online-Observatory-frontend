# Legal source — what is already decided, and what a lawyer must still write

DV-072 built the legal pages at `/terms`, `/privacy` and `/refunds` in both locales. The
pages render from `apps/web/src/i18n/resources/legal.ts`. Nothing on them is in force.

This file exists so that whoever drafts the real documents starts from what Darkview has
already committed to, rather than from nothing. It is not itself a legal document.

## How the pages are built

Each section is either `decided` or `pending`.

- **`decided`** — a controlling document already settled it. The page states it and marks
  it _Settled_. Sources are listed below, section by section.
- **`pending`** — the page says the section is awaiting legal review and shows no text.
  No agent may fill one of these in from general knowledge. Replacing a `pending` section
  means changing its `status` to `decided` and supplying reviewed text.

Changing a `decided` section's substance means changing the ADR that decided it first.

## Already decided — with sources

### Terms of service

| Section                                                                                                      | Source                                    |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| What Darkview is — a live remote observatory in Tbilisi; NexStar 6SE; operator-approved targets              | `CLAUDE.md`, Product                      |
| Live view, not long-exposure astrophotography; short exposures and live stacking; no Hubble/JWST-class claim | `CLAUDE.md`, Product and Design and brand |
| An observation slot; one observation at a time; one session owner at a time                                  | `CLAUDE.md`, Mission states; ADR-015      |
| Visibility is decided by the sky, not the booking; altitude envelope and horizon mask                        | `CLAUDE.md`, Hardware safety              |

### Privacy policy

| Section                                                                                    | Source       |
| ------------------------------------------------------------------------------------------ | ------------ |
| Session cookies keep you signed in and protect forms against CSRF; not advertising cookies | ADR-016 §3–4 |

### Refund policy

| Section                                                                                         | Source                        |
| ----------------------------------------------------------------------------------------------- | ----------------------------- |
| A released booking returns what paid for it, in the form it was paid                            | ADR-022 §7                    |
| A credit booking returns credits; a voucher booking restores the voucher; neither returns money | ADR-022 §7                    |
| Cancelling a subscription mid-period refunds nothing                                            | ADR-022, amendment 2026-09-19 |
| Unspent minutes expire at period end and do not roll over                                       | ADR-022, amendment 2026-09-19 |
| A failed renewal is retried three times over seven days, then the subscription expires          | ADR-022, amendment 2026-09-19 |

## Still needed, and what each one blocks

Nothing below can be written from inside this repository. Each needs a decision from the
maintainer, a lawyer, or both.

### Blocks payment onboarding

A payment provider will ask to see published terms and a refund policy before it approves
a merchant account. These are the ones on the critical path:

1. **Cancelling a single observation.** How long before a slot may it be cancelled, and
   what comes back? No ADR covers the one-off booking case; ADR-022 covers only credits.
2. **Clouds, and a slot that cannot be flown.** The commercially hardest question here,
   and the one customers will ask first. ADR-015 §Flow B notes that a refund policy for a
   clouded-out week does not exist and defers it. Phase 1 still needs an answer for the
   attended case.
3. **Equipment failure during a slot.** Partial slot, full refund, credit, or re-book.
4. **How to ask for a refund**, and how long Darkview takes to answer.
5. **Merchant identity** — the legal entity, its registration number, and its address.

### Blocks launch, not payment onboarding

6. **A data inventory** for the privacy policy: every field the platform stores about a
   customer, why, on what legal basis, and for how long. This must be compiled from
   `darkview-platform`'s schema, not guessed at here.
7. **Sub-processors** — payment provider, email delivery, hosting and their regions.
8. **Data subject rights** and the process for exercising them.
9. **Captures and the collection**: who owns a capture, what licence Darkview takes, and
   what happens to captures when an account closes.
10. **Acceptable use**, account suspension and termination.
11. **Liability, service availability and any warranty disclaimer.**
12. **Governing law and dispute resolution.**
13. **Whether Georgian or English governs** where the two texts differ. The site publishes
    both; the documents must say which one wins.

## Open question for the maintainer

The pages are currently indexable. A draft policy that search engines index and cache may
be worse than no page at all, since a cached draft can be quoted back at you. Consider
`privatePageMetadata` from `apps/web/src/lib/seo.ts` on these three routes until the real
text lands. This was not applied, because it is a business decision rather than an
implementation one.
