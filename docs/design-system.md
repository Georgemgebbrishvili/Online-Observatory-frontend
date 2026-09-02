# Design system

## Direction

Darkview should feel like a premium optical instrument: dark, calm, exact, and trustworthy. The interface uses restrained cyan only for active or selected states. It avoids purple nebula imagery, game-like HUD decoration, excessive gradients, and generic space-store patterns.

## Foundations

- Display typography: Space Grotesk
- UI and body typography: Inter
- Base spacing: 4px multiples with fluid page gutters
- Primary background: `--color-background`
- Elevated surfaces: `--color-elevated` and `--color-elevated-secondary`
- Text hierarchy: `--color-text`, `--color-text-secondary`, `--color-text-muted`
- Active accent: `--color-cyan` and `--color-cyan-bright`
- Semantic states: `--color-success`, `--color-warning`, `--color-error`

All colors are defined as CSS design tokens in `src/styles/tokens.css`. Components must reference tokens or Tailwind theme aliases instead of hard-coded brand colors.

The token source is `src/styles/tokens.css`. It defines color, alpha surfaces, spacing, radii, shadows, typography sizing, and motion timing. `src/styles/components.css` contains reusable component styling; route-specific showcase layout lives in `src/styles/design-system.css`.

## Component inventory

- Actions: `Button`, `IconButton`
- Selection and status: `Chip`, `StatusIndicator`, `Tabs`, `Dropdown`
- Surfaces: `Card`, `SurfacePanel`, `Modal`, `Sheet`, `Tooltip`
- Feedback: `Skeleton`, `StatePanel`
- Forms: `Field`, `TextInput`, `TextArea`, `Checkbox`
- Darkview motifs: `OpticalRing`, `LiveIndicator`, `ObservatoryStatus`, `TargetQuality`, `MissionStatus`

The internal `/design-system` route redirects to the active locale and renders every supported component state. It is marked `noindex` and is not a product feature page.

## Operational semantics

Status components accept typed values and select a semantic tone internally. The visible label is always present, so color is never the only signal. Callers may supply a translated label without changing the stable state value.

`OpticalRing` is an interface motif, not a logo replacement. It uses a small inline SVG with tokenized strokes and must remain visually secondary to content.

## Interaction rules

- Use one primary button per focused section.
- Cyan illumination indicates active, live, selected, or target-lock state only.
- Use native dialog and select behavior for predictable keyboard and assistive-technology support.
- Modal and sheet content must have a title and an explicit close action.
- Tabs support Arrow Left, Arrow Right, Home, and End.
- Loading placeholders are decorative; their surrounding region provides the accessible label.
- Error states use `role="alert"`; empty states use a non-destructive status presentation.

## Accessibility

- Interactive controls require visible keyboard focus.
- Touch targets are at least 44px.
- Status must use text or an icon in addition to color.
- Body copy targets WCAG 2.1 AA contrast.
- Motion must respect `prefers-reduced-motion`.
- Semantic landmarks and headings must remain ordered and discoverable.

## Brand assets

The current lockup is a text placeholder. When approved files are supplied, place them in `public/brand` and replace the placeholder without redrawing or generating a logo. Asset provenance must also be added to the private provenance record.
