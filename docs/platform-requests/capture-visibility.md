# Platform request: set a capture's visibility

Raised 2026-09-26 from Phase 2 slice 2 (`docs/plan/phase-2/02-collection.md`). Against
`darkview-platform` at `acca64803fe81c9a6c9ef9fe3b562b7537edcbd5`.

## What blocks

`Capture.visibility` is `PRIVATE | GALLERY`, and the contract says "Publishing to the
public gallery is opt-in". Nothing lets the customer opt in: no operation writes
`visibility`, and the platform only reads it (`packages/db/capture.ts:40,64,90`).

The fixture capture page has a Make public / Make private toggle and a Share button.
Neither can be wired, so both are removed in slice 2 and the visibility is shown read-only.

## Screens that need it

`/[locale]/app/collection/[captureId]` — the toggle, and Share once a gallery page exists.

## Proposed shape

```yaml
/captures/{captureId}:
  patch:
    operationId: setCaptureVisibility
    tags: [captures]
    summary: Publish a capture to the gallery, or take it back.
    parameters:
      - $ref: "#/components/parameters/CaptureId"
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            additionalProperties: false
            required: [visibility]
            properties:
              visibility:
                $ref: "#/components/schemas/CaptureVisibility"
    responses:
      "200":
        description: The capture.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Capture"
      "401":
        $ref: "#/components/responses/Unauthorized"
      "404":
        $ref: "#/components/responses/NotFound"
```

Owner only, 404 for anyone else, as `getCapture`. Whether a `SIMULATED` capture may reach
the gallery at all is the platform's call; the contract says it is "never presented as
telescope output", which suggests a 409 for it.

## Not asked for here

A public gallery read (`GET /gallery` or similar). Without it `GALLERY` has no visible
effect, so this request is only half the feature. Raise it when a gallery page is planned.
