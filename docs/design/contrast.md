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

**Measured greys.** Since ADR-052 ink 2–4 are opaque greys (`#b8b8b4`, `#969692`,
`#73736f`); the rules stay translucent and are measured composited over the ground they sit
on, which is what reaches the eye.

**No restricted pair.** Every text token passes AA on every surface, including
`text-tertiary` on `surface-hover`. `text-disabled` is for disabled controls only, which
SC 1.4.3 exempts, and is deliberately absent.

**The red.** White on the accent red `#e3482c` measures 4.0:1, below AA for a 14px label, so
filled buttons sit on `action` (`#c8392a`, 5.1:1 under white) and red text uses `accent-ink`.
`accent` itself is measured only as a control edge and indicator (3:1).

`border-strong` and `border-subtle` are decorative hairlines and are deliberately absent. Every
form control uses `border-control`.

<!-- table -->

| Foreground       | Background                       | Use                                    | Measured | AA minimum | Result |
| ---------------- | -------------------------------- | -------------------------------------- | -------- | ---------- | ------ |
| `text-primary`   | `night`                          | text                                   | 17.65:1  | 4.5:1      | pass   |
| `text-primary`   | `surface-base`                   | text                                   | 16.87:1  | 4.5:1      | pass   |
| `text-primary`   | `surface-raised`                 | text                                   | 15.78:1  | 4.5:1      | pass   |
| `text-primary`   | `surface-hover`                  | text                                   | 13.89:1  | 4.5:1      | pass   |
| `text-secondary` | `night`                          | text                                   | 9.77:1   | 4.5:1      | pass   |
| `text-secondary` | `surface-base`                   | text                                   | 9.34:1   | 4.5:1      | pass   |
| `text-secondary` | `surface-raised`                 | text                                   | 8.73:1   | 4.5:1      | pass   |
| `text-secondary` | `surface-hover`                  | text                                   | 7.69:1   | 4.5:1      | pass   |
| `text-tertiary`  | `night`                          | text                                   | 6.55:1   | 4.5:1      | pass   |
| `text-tertiary`  | `surface-base`                   | text                                   | 6.26:1   | 4.5:1      | pass   |
| `text-tertiary`  | `surface-raised`                 | text                                   | 5.85:1   | 4.5:1      | pass   |
| `text-tertiary`  | `surface-hover`                  | text                                   | 5.15:1   | 4.5:1      | pass   |
| `accent-ink`     | `night`                          | text                                   | 6.98:1   | 4.5:1      | pass   |
| `accent-ink`     | `surface-base`                   | text                                   | 6.67:1   | 4.5:1      | pass   |
| `accent-ink`     | `surface-raised`                 | text                                   | 6.24:1   | 4.5:1      | pass   |
| `accent-ink`     | `surface-hover`                  | text                                   | 5.49:1   | 4.5:1      | pass   |
| `live`           | `night`                          | text                                   | 9.25:1   | 4.5:1      | pass   |
| `live`           | `surface-base`                   | text                                   | 8.84:1   | 4.5:1      | pass   |
| `live`           | `surface-raised`                 | text                                   | 8.27:1   | 4.5:1      | pass   |
| `live`           | `surface-hover`                  | text                                   | 7.28:1   | 4.5:1      | pass   |
| `photon`         | `night`                          | text                                   | 17.65:1  | 4.5:1      | pass   |
| `photon`         | `surface-base`                   | text                                   | 16.87:1  | 4.5:1      | pass   |
| `photon`         | `surface-raised`                 | text                                   | 15.78:1  | 4.5:1      | pass   |
| `photon`         | `surface-hover`                  | text                                   | 13.89:1  | 4.5:1      | pass   |
| `success`        | `night`                          | text                                   | 9.25:1   | 4.5:1      | pass   |
| `success`        | `surface-base`                   | text                                   | 8.84:1   | 4.5:1      | pass   |
| `success`        | `surface-raised`                 | text                                   | 8.27:1   | 4.5:1      | pass   |
| `success`        | `surface-hover`                  | text                                   | 7.28:1   | 4.5:1      | pass   |
| `warning`        | `night`                          | text                                   | 10.40:1  | 4.5:1      | pass   |
| `warning`        | `surface-base`                   | text                                   | 9.94:1   | 4.5:1      | pass   |
| `warning`        | `surface-raised`                 | text                                   | 9.30:1   | 4.5:1      | pass   |
| `warning`        | `surface-hover`                  | text                                   | 8.19:1   | 4.5:1      | pass   |
| `error`          | `night`                          | text                                   | 7.63:1   | 4.5:1      | pass   |
| `error`          | `surface-base`                   | text                                   | 7.30:1   | 4.5:1      | pass   |
| `error`          | `surface-raised`                 | text                                   | 6.82:1   | 4.5:1      | pass   |
| `error`          | `surface-hover`                  | text                                   | 6.01:1   | 4.5:1      | pass   |
| `on-action`      | `action`                         | primary button label                   | 5.15:1   | 4.5:1      | pass   |
| `on-photon`      | `photon`                         | checked control, data fill             | 19.07:1  | 4.5:1      | pass   |
| `border-control` | `night`                          | control boundary / focus ring (1.4.11) | 3.29:1   | 3:1        | pass   |
| `border-control` | `surface-base`                   | control boundary / focus ring (1.4.11) | 3.32:1   | 3:1        | pass   |
| `border-control` | `surface-raised`                 | control boundary / focus ring (1.4.11) | 3.31:1   | 3:1        | pass   |
| `border-control` | `surface-hover`                  | control boundary / focus ring (1.4.11) | 3.21:1   | 3:1        | pass   |
| `accent`         | `night`                          | control boundary / focus ring (1.4.11) | 4.84:1   | 3:1        | pass   |
| `accent`         | `surface-base`                   | control boundary / focus ring (1.4.11) | 4.63:1   | 3:1        | pass   |
| `accent`         | `surface-raised`                 | control boundary / focus ring (1.4.11) | 4.33:1   | 3:1        | pass   |
| `accent`         | `surface-hover`                  | control boundary / focus ring (1.4.11) | 3.81:1   | 3:1        | pass   |
| `photon`         | `night`                          | control boundary / focus ring (1.4.11) | 17.65:1  | 3:1        | pass   |
| `photon`         | `surface-base`                   | control boundary / focus ring (1.4.11) | 16.87:1  | 3:1        | pass   |
| `photon`         | `surface-raised`                 | control boundary / focus ring (1.4.11) | 15.78:1  | 3:1        | pass   |
| `photon`         | `surface-hover`                  | control boundary / focus ring (1.4.11) | 13.89:1  | 3:1        | pass   |
| `error`          | `night`                          | control boundary / focus ring (1.4.11) | 7.63:1   | 3:1        | pass   |
| `error`          | `surface-base`                   | control boundary / focus ring (1.4.11) | 7.30:1   | 3:1        | pass   |
| `error`          | `surface-raised`                 | control boundary / focus ring (1.4.11) | 6.82:1   | 3:1        | pass   |
| `error`          | `surface-hover`                  | control boundary / focus ring (1.4.11) | 6.01:1   | 3:1        | pass   |
| `live`           | `scrim-strong over surface-base` | simulated / mode chip over a picture   | 9.92:1   | 4.5:1      | pass   |
| `error`          | `scrim-strong over surface-base` | simulated / mode chip over a picture   | 8.19:1   | 4.5:1      | pass   |

<!-- /table -->
