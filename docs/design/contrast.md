# Contrast measurements — DV-070

WCAG 2.1 contrast ratios for every token pair the Stellar component library uses, computed
from `apps/web/src/styles/tokens.css` by `apps/web/src/styles/tokens.test.ts`. That test fails
if any pair drops below its minimum or if this table stops matching the tokens. Regenerate the
table after a token change:

```bash
UPDATE_CONTRAST=1 npx vitest run src/styles/tokens.test.ts   # from apps/web
```

Minimums: 4.5:1 for text (SC 1.4.3, normal-size text, the stricter case), 3:1 for control
boundaries and focus indicators (SC 1.4.11). Tints are measured composited over the surface
they sit on.

**Translucent ink.** Ink 2–4 and the rules are cream at an opacity (ADR-039). Each is
measured composited over the ground it sits on, which is what reaches the eye.

**No restricted pair.** Since ADR-039 every text token passes AA on every surface, including
`text-tertiary` on `surface-hover`. `text-disabled` (cream 34%) is for disabled controls only,
which SC 1.4.3 exempts, and is deliberately absent.

`border-strong` and `border-subtle` are decorative hairlines and are deliberately absent. Every
form control uses `border-control`.

<!-- table -->

| Foreground       | Background                       | Use                                    | Measured | AA minimum | Result |
| ---------------- | -------------------------------- | -------------------------------------- | -------- | ---------- | ------ |
| `text-primary`   | `night`                          | text                                   | 17.91:1  | 4.5:1      | pass   |
| `text-primary`   | `surface-base`                   | text                                   | 17.38:1  | 4.5:1      | pass   |
| `text-primary`   | `surface-raised`                 | text                                   | 16.85:1  | 4.5:1      | pass   |
| `text-primary`   | `surface-hover`                  | text                                   | 15.76:1  | 4.5:1      | pass   |
| `text-secondary` | `night`                          | text                                   | 9.64:1   | 4.5:1      | pass   |
| `text-secondary` | `surface-base`                   | text                                   | 9.49:1   | 4.5:1      | pass   |
| `text-secondary` | `surface-raised`                 | text                                   | 9.33:1   | 4.5:1      | pass   |
| `text-secondary` | `surface-hover`                  | text                                   | 8.95:1   | 4.5:1      | pass   |
| `text-tertiary`  | `night`                          | text                                   | 5.42:1   | 4.5:1      | pass   |
| `text-tertiary`  | `surface-base`                   | text                                   | 5.42:1   | 4.5:1      | pass   |
| `text-tertiary`  | `surface-raised`                 | text                                   | 5.43:1   | 4.5:1      | pass   |
| `text-tertiary`  | `surface-hover`                  | text                                   | 5.36:1   | 4.5:1      | pass   |
| `accent-ink`     | `night`                          | text                                   | 11.31:1  | 4.5:1      | pass   |
| `accent-ink`     | `surface-base`                   | text                                   | 10.97:1  | 4.5:1      | pass   |
| `accent-ink`     | `surface-raised`                 | text                                   | 10.63:1  | 4.5:1      | pass   |
| `accent-ink`     | `surface-hover`                  | text                                   | 9.95:1   | 4.5:1      | pass   |
| `live`           | `night`                          | text                                   | 14.78:1  | 4.5:1      | pass   |
| `live`           | `surface-base`                   | text                                   | 14.35:1  | 4.5:1      | pass   |
| `live`           | `surface-raised`                 | text                                   | 13.90:1  | 4.5:1      | pass   |
| `live`           | `surface-hover`                  | text                                   | 13.01:1  | 4.5:1      | pass   |
| `photon`         | `night`                          | text                                   | 11.16:1  | 4.5:1      | pass   |
| `photon`         | `surface-base`                   | text                                   | 10.83:1  | 4.5:1      | pass   |
| `photon`         | `surface-raised`                 | text                                   | 10.50:1  | 4.5:1      | pass   |
| `photon`         | `surface-hover`                  | text                                   | 9.82:1   | 4.5:1      | pass   |
| `success`        | `night`                          | text                                   | 11.00:1  | 4.5:1      | pass   |
| `success`        | `surface-base`                   | text                                   | 10.67:1  | 4.5:1      | pass   |
| `success`        | `surface-raised`                 | text                                   | 10.34:1  | 4.5:1      | pass   |
| `success`        | `surface-hover`                  | text                                   | 9.68:1   | 4.5:1      | pass   |
| `warning`        | `night`                          | text                                   | 10.99:1  | 4.5:1      | pass   |
| `warning`        | `surface-base`                   | text                                   | 10.66:1  | 4.5:1      | pass   |
| `warning`        | `surface-raised`                 | text                                   | 10.34:1  | 4.5:1      | pass   |
| `warning`        | `surface-hover`                  | text                                   | 9.67:1   | 4.5:1      | pass   |
| `error`          | `night`                          | text                                   | 7.57:1   | 4.5:1      | pass   |
| `error`          | `surface-base`                   | text                                   | 7.34:1   | 4.5:1      | pass   |
| `error`          | `surface-raised`                 | text                                   | 7.12:1   | 4.5:1      | pass   |
| `error`          | `surface-hover`                  | text                                   | 6.66:1   | 4.5:1      | pass   |
| `on-accent`      | `accent`                         | primary button label                   | 6.25:1   | 4.5:1      | pass   |
| `on-accent`      | `accent-hover`                   | primary button label, hover            | 9.36:1   | 4.5:1      | pass   |
| `on-photon`      | `photon`                         | checked control, data fill             | 11.16:1  | 4.5:1      | pass   |
| `border-control` | `night`                          | control boundary / focus ring (1.4.11) | 3.16:1   | 3:1        | pass   |
| `border-control` | `surface-base`                   | control boundary / focus ring (1.4.11) | 3.21:1   | 3:1        | pass   |
| `border-control` | `surface-raised`                 | control boundary / focus ring (1.4.11) | 3.27:1   | 3:1        | pass   |
| `border-control` | `surface-hover`                  | control boundary / focus ring (1.4.11) | 3.33:1   | 3:1        | pass   |
| `accent`         | `night`                          | control boundary / focus ring (1.4.11) | 6.97:1   | 3:1        | pass   |
| `accent`         | `surface-base`                   | control boundary / focus ring (1.4.11) | 6.77:1   | 3:1        | pass   |
| `accent`         | `surface-raised`                 | control boundary / focus ring (1.4.11) | 6.56:1   | 3:1        | pass   |
| `accent`         | `surface-hover`                  | control boundary / focus ring (1.4.11) | 6.13:1   | 3:1        | pass   |
| `photon`         | `night`                          | control boundary / focus ring (1.4.11) | 11.16:1  | 3:1        | pass   |
| `photon`         | `surface-base`                   | control boundary / focus ring (1.4.11) | 10.83:1  | 3:1        | pass   |
| `photon`         | `surface-raised`                 | control boundary / focus ring (1.4.11) | 10.50:1  | 3:1        | pass   |
| `photon`         | `surface-hover`                  | control boundary / focus ring (1.4.11) | 9.82:1   | 3:1        | pass   |
| `error`          | `night`                          | control boundary / focus ring (1.4.11) | 7.57:1   | 3:1        | pass   |
| `error`          | `surface-base`                   | control boundary / focus ring (1.4.11) | 7.34:1   | 3:1        | pass   |
| `error`          | `surface-raised`                 | control boundary / focus ring (1.4.11) | 7.12:1   | 3:1        | pass   |
| `error`          | `surface-hover`                  | control boundary / focus ring (1.4.11) | 6.66:1   | 3:1        | pass   |
| `live`           | `scrim-strong over surface-base` | simulated / mode chip over a picture   | 14.76:1  | 4.5:1      | pass   |
| `error`          | `scrim-strong over surface-base` | simulated / mode chip over a picture   | 7.55:1   | 4.5:1      | pass   |

<!-- /table -->
