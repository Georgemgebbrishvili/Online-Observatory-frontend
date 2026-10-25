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

**Measured inks.** Since ADR-074 ink 2–4 are opaque rose-greys (`#dcc4c7`, `#b89ea2`,
`#7d6468`); the rules stay translucent and are measured composited over the ground they sit
on, which is what reaches the eye.

**No restricted pair.** Every text token passes AA on every surface, including
`text-tertiary` on `surface-hover`. `text-disabled` is for disabled controls only, which
SC 1.4.3 exempts, and is deliberately absent.

**The crimson.** Filled buttons sit on `action` (`#c81d36`, 5.7:1 under white) and crimson
text uses `accent-ink` (`#ff8090`). `accent` (`#e1263f`) itself is measured only as a
control edge and indicator (3:1).

`border-strong` and `border-subtle` are decorative hairlines and are deliberately absent. Every
form control uses `border-control`.

<!-- table -->
| Foreground | Background | Use | Measured | AA minimum | Result |
| --- | --- | --- | --- | --- | --- |
| `text-primary` | `night` | text | 18.03:1 | 4.5:1 | pass |
| `text-primary` | `surface-base` | text | 18.44:1 | 4.5:1 | pass |
| `text-primary` | `surface-raised` | text | 16.94:1 | 4.5:1 | pass |
| `text-primary` | `surface-hover` | text | 16.01:1 | 4.5:1 | pass |
| `text-secondary` | `night` | text | 11.99:1 | 4.5:1 | pass |
| `text-secondary` | `surface-base` | text | 12.26:1 | 4.5:1 | pass |
| `text-secondary` | `surface-raised` | text | 11.26:1 | 4.5:1 | pass |
| `text-secondary` | `surface-hover` | text | 10.64:1 | 4.5:1 | pass |
| `text-tertiary` | `night` | text | 7.94:1 | 4.5:1 | pass |
| `text-tertiary` | `surface-base` | text | 8.12:1 | 4.5:1 | pass |
| `text-tertiary` | `surface-raised` | text | 7.45:1 | 4.5:1 | pass |
| `text-tertiary` | `surface-hover` | text | 7.04:1 | 4.5:1 | pass |
| `accent-ink` | `night` | text | 8.21:1 | 4.5:1 | pass |
| `accent-ink` | `surface-base` | text | 8.40:1 | 4.5:1 | pass |
| `accent-ink` | `surface-raised` | text | 7.71:1 | 4.5:1 | pass |
| `accent-ink` | `surface-hover` | text | 7.29:1 | 4.5:1 | pass |
| `live` | `night` | text | 9.38:1 | 4.5:1 | pass |
| `live` | `surface-base` | text | 9.60:1 | 4.5:1 | pass |
| `live` | `surface-raised` | text | 8.81:1 | 4.5:1 | pass |
| `live` | `surface-hover` | text | 8.33:1 | 4.5:1 | pass |
| `photon` | `night` | text | 18.03:1 | 4.5:1 | pass |
| `photon` | `surface-base` | text | 18.44:1 | 4.5:1 | pass |
| `photon` | `surface-raised` | text | 16.94:1 | 4.5:1 | pass |
| `photon` | `surface-hover` | text | 16.01:1 | 4.5:1 | pass |
| `success` | `night` | text | 9.38:1 | 4.5:1 | pass |
| `success` | `surface-base` | text | 9.60:1 | 4.5:1 | pass |
| `success` | `surface-raised` | text | 8.81:1 | 4.5:1 | pass |
| `success` | `surface-hover` | text | 8.33:1 | 4.5:1 | pass |
| `warning` | `night` | text | 10.55:1 | 4.5:1 | pass |
| `warning` | `surface-base` | text | 10.79:1 | 4.5:1 | pass |
| `warning` | `surface-raised` | text | 9.91:1 | 4.5:1 | pass |
| `warning` | `surface-hover` | text | 9.37:1 | 4.5:1 | pass |
| `error` | `night` | text | 9.92:1 | 4.5:1 | pass |
| `error` | `surface-base` | text | 10.14:1 | 4.5:1 | pass |
| `error` | `surface-raised` | text | 9.31:1 | 4.5:1 | pass |
| `error` | `surface-hover` | text | 8.80:1 | 4.5:1 | pass |
| `on-action` | `action` | primary button label | 5.70:1 | 4.5:1 | pass |
| `on-photon` | `photon` | checked control, data fill | 19.20:1 | 4.5:1 | pass |
| `border-control` | `night` | control boundary / focus ring (1.4.11) | 3.12:1 | 3:1 | pass |
| `border-control` | `surface-base` | control boundary / focus ring (1.4.11) | 3.09:1 | 3:1 | pass |
| `border-control` | `surface-raised` | control boundary / focus ring (1.4.11) | 3.13:1 | 3:1 | pass |
| `border-control` | `surface-hover` | control boundary / focus ring (1.4.11) | 3.09:1 | 3:1 | pass |
| `accent` | `night` | control boundary / focus ring (1.4.11) | 4.27:1 | 3:1 | pass |
| `accent` | `surface-base` | control boundary / focus ring (1.4.11) | 4.37:1 | 3:1 | pass |
| `accent` | `surface-raised` | control boundary / focus ring (1.4.11) | 4.01:1 | 3:1 | pass |
| `accent` | `surface-hover` | control boundary / focus ring (1.4.11) | 3.79:1 | 3:1 | pass |
| `photon` | `night` | control boundary / focus ring (1.4.11) | 18.03:1 | 3:1 | pass |
| `photon` | `surface-base` | control boundary / focus ring (1.4.11) | 18.44:1 | 3:1 | pass |
| `photon` | `surface-raised` | control boundary / focus ring (1.4.11) | 16.94:1 | 3:1 | pass |
| `photon` | `surface-hover` | control boundary / focus ring (1.4.11) | 16.01:1 | 3:1 | pass |
| `error` | `night` | control boundary / focus ring (1.4.11) | 9.92:1 | 3:1 | pass |
| `error` | `surface-base` | control boundary / focus ring (1.4.11) | 10.14:1 | 3:1 | pass |
| `error` | `surface-raised` | control boundary / focus ring (1.4.11) | 9.31:1 | 3:1 | pass |
| `error` | `surface-hover` | control boundary / focus ring (1.4.11) | 8.80:1 | 3:1 | pass |
| `live` | `scrim-strong over surface-base` | simulated / mode chip over a picture | 9.97:1 | 4.5:1 | pass |
| `error` | `scrim-strong over surface-base` | simulated / mode chip over a picture | 10.54:1 | 4.5:1 | pass |
<!-- /table -->
