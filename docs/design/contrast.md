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

**Restricted pair.** `text-tertiary` on `surface-hover` measures 4.14:1, below AA. Both
values come directly from Brand Identity System v2.0, so the fix is in usage, not in the
tokens: tertiary text is never placed on `surface-hover`. The one place the library would
otherwise produce it — the eyebrow of an interactive card on hover — switches to
`text-secondary`.

`border-strong` (2.84:1) and `border-subtle` (1.64:1) are decorative dividers and are
deliberately absent. Every form control uses `border-control`.

<!-- table -->

| Foreground       | Background                          | Use                                    | Measured | AA minimum | Result         |
| ---------------- | ----------------------------------- | -------------------------------------- | -------- | ---------- | -------------- |
| `text-primary`   | `night`                             | text                                   | 18.32:1  | 4.5:1      | pass           |
| `text-primary`   | `surface-base`                      | text                                   | 17.54:1  | 4.5:1      | pass           |
| `text-primary`   | `surface-raised`                    | text                                   | 16.40:1  | 4.5:1      | pass           |
| `text-primary`   | `surface-hover`                     | text                                   | 14.45:1  | 4.5:1      | pass           |
| `text-secondary` | `night`                             | text                                   | 9.53:1   | 4.5:1      | pass           |
| `text-secondary` | `surface-base`                      | text                                   | 9.13:1   | 4.5:1      | pass           |
| `text-secondary` | `surface-raised`                    | text                                   | 8.53:1   | 4.5:1      | pass           |
| `text-secondary` | `surface-hover`                     | text                                   | 7.52:1   | 4.5:1      | pass           |
| `text-tertiary`  | `night`                             | text                                   | 5.25:1   | 4.5:1      | pass           |
| `text-tertiary`  | `surface-base`                      | text                                   | 5.03:1   | 4.5:1      | pass           |
| `text-tertiary`  | `surface-raised`                    | text                                   | 4.70:1   | 4.5:1      | pass           |
| `text-tertiary`  | `surface-hover`                     | text                                   | 4.14:1   | 4.5:1      | **restricted** |
| `text-technical` | `night`                             | text                                   | 9.32:1   | 4.5:1      | pass           |
| `text-technical` | `surface-base`                      | text                                   | 8.93:1   | 4.5:1      | pass           |
| `text-technical` | `surface-raised`                    | text                                   | 8.34:1   | 4.5:1      | pass           |
| `text-technical` | `surface-hover`                     | text                                   | 7.35:1   | 4.5:1      | pass           |
| `photon`         | `night`                             | text                                   | 10.66:1  | 4.5:1      | pass           |
| `photon`         | `surface-base`                      | text                                   | 10.21:1  | 4.5:1      | pass           |
| `photon`         | `surface-raised`                    | text                                   | 9.54:1   | 4.5:1      | pass           |
| `photon`         | `surface-hover`                     | text                                   | 8.41:1   | 4.5:1      | pass           |
| `success`        | `night`                             | text                                   | 10.50:1  | 4.5:1      | pass           |
| `success`        | `surface-base`                      | text                                   | 10.06:1  | 4.5:1      | pass           |
| `success`        | `surface-raised`                    | text                                   | 9.40:1   | 4.5:1      | pass           |
| `success`        | `surface-hover`                     | text                                   | 8.29:1   | 4.5:1      | pass           |
| `warning`        | `night`                             | text                                   | 10.49:1  | 4.5:1      | pass           |
| `warning`        | `surface-base`                      | text                                   | 10.05:1  | 4.5:1      | pass           |
| `warning`        | `surface-raised`                    | text                                   | 9.40:1   | 4.5:1      | pass           |
| `warning`        | `surface-hover`                     | text                                   | 8.28:1   | 4.5:1      | pass           |
| `error`          | `night`                             | text                                   | 7.23:1   | 4.5:1      | pass           |
| `error`          | `surface-base`                      | text                                   | 6.92:1   | 4.5:1      | pass           |
| `error`          | `surface-raised`                    | text                                   | 6.47:1   | 4.5:1      | pass           |
| `error`          | `surface-hover`                     | text                                   | 5.70:1   | 4.5:1      | pass           |
| `info`           | `night`                             | text                                   | 8.95:1   | 4.5:1      | pass           |
| `info`           | `surface-base`                      | text                                   | 8.57:1   | 4.5:1      | pass           |
| `info`           | `surface-raised`                    | text                                   | 8.02:1   | 4.5:1      | pass           |
| `info`           | `surface-hover`                     | text                                   | 7.06:1   | 4.5:1      | pass           |
| `on-photon`      | `photon`                            | primary button label                   | 10.66:1  | 4.5:1      | pass           |
| `on-photon`      | `photon-hover`                      | primary button label, hover            | 11.69:1  | 4.5:1      | pass           |
| `border-control` | `night`                             | control boundary / focus ring (1.4.11) | 5.25:1   | 3:1        | pass           |
| `border-control` | `surface-base`                      | control boundary / focus ring (1.4.11) | 5.03:1   | 3:1        | pass           |
| `border-control` | `surface-raised`                    | control boundary / focus ring (1.4.11) | 4.70:1   | 3:1        | pass           |
| `border-control` | `surface-hover`                     | control boundary / focus ring (1.4.11) | 4.14:1   | 3:1        | pass           |
| `photon`         | `night`                             | control boundary / focus ring (1.4.11) | 10.66:1  | 3:1        | pass           |
| `photon`         | `surface-base`                      | control boundary / focus ring (1.4.11) | 10.21:1  | 3:1        | pass           |
| `photon`         | `surface-raised`                    | control boundary / focus ring (1.4.11) | 9.54:1   | 3:1        | pass           |
| `photon`         | `surface-hover`                     | control boundary / focus ring (1.4.11) | 8.41:1   | 3:1        | pass           |
| `error`          | `night`                             | control boundary / focus ring (1.4.11) | 7.23:1   | 3:1        | pass           |
| `error`          | `surface-base`                      | control boundary / focus ring (1.4.11) | 6.92:1   | 3:1        | pass           |
| `error`          | `surface-raised`                    | control boundary / focus ring (1.4.11) | 6.47:1   | 3:1        | pass           |
| `error`          | `surface-hover`                     | control boundary / focus ring (1.4.11) | 5.70:1   | 3:1        | pass           |
| `photon`         | `photon-muted over surface-base`    | status indicator text                  | 7.95:1   | 4.5:1      | pass           |
| `photon`         | `photon-muted over surface-raised`  | status indicator text                  | 7.23:1   | 4.5:1      | pass           |
| `success`        | `success-muted over surface-base`   | status indicator text                  | 8.05:1   | 4.5:1      | pass           |
| `success`        | `success-muted over surface-raised` | status indicator text                  | 7.34:1   | 4.5:1      | pass           |
| `warning`        | `warning-muted over surface-base`   | status indicator text                  | 8.06:1   | 4.5:1      | pass           |
| `warning`        | `warning-muted over surface-raised` | status indicator text                  | 7.36:1   | 4.5:1      | pass           |
| `error`          | `error-muted over surface-base`     | status indicator text                  | 5.92:1   | 4.5:1      | pass           |
| `error`          | `error-muted over surface-raised`   | status indicator text                  | 5.45:1   | 4.5:1      | pass           |

<!-- /table -->
