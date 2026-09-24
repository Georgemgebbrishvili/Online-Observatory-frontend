import type { Metadata } from "next";
import "@/styles/design-system.css";
import { notFound } from "next/navigation";

import { OpticalRing } from "@/components/astronomy/optical-ring";
import { TargetQuality, targetQualities } from "@/components/astronomy/target-quality";
import { MissionStatus, missionStatuses } from "@/components/missions/mission-status";
import { LiveIndicator } from "@/components/observatory/live-indicator";
import {
  ObservatoryStatus,
  observatoryStatuses,
} from "@/components/observatory/observatory-status";
import { Button } from "@/components/ui/button";
import { Card, SurfacePanel } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Modal, Sheet } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Checkbox, Field, TextArea, TextInput } from "@/components/ui/form";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { Tabs } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { missionSessionCopy } from "@/i18n/resources/missions";
import { palette } from "@/styles/tokens";

import { designSystemCopy } from "./copy";

type DesignSystemPageProps = {
  params: Promise<{ locale: string }>;
};

const swatches = [
  ["night", palette.neutral950],
  ["surface-base", palette.neutral900],
  ["surface-raised", palette.neutral800],
  ["surface-hover", palette.neutral700],
  ["border-subtle", palette.neutral600],
  ["text-primary", palette.neutral100],
  ["text-secondary", palette.neutral300],
  ["text-tertiary", palette.neutral400],
  ["photon", palette.photon],
  ["photon-deep", palette.deepSignal],
  ["success", palette.success],
  ["warning", palette.warning],
  ["error", palette.error],
  ["info", palette.info],
] as const;

const typeScale = [
  "hero",
  "h1",
  "h2",
  "h3",
  "body-lg",
  "body",
  "label",
  "caption",
  "mono",
] as const;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

function SectionHeader({
  id,
  section,
}: {
  id: string;
  section: readonly [string, string, string, string];
}) {
  return (
    <header className="ds-section-header">
      <span>{section[0]}</span>
      <div>
        <h2 id={id}>{section[1]}</h2>
        <p>{section[2]}</p>
        <p className="ds-brand-ref">Brand Identity System v2.0 · {section[3]}</p>
      </div>
    </header>
  );
}

export async function generateMetadata({
  params,
}: DesignSystemPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) return {};

  const copy = designSystemCopy[locale];
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    robots: { index: false, follow: false },
  };
}

export default async function DesignSystemPage({ params }: DesignSystemPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const copy = designSystemCopy[locale];

  return (
    <main id="main-content" className="design-system-page">
      <Container>
        <header className="ds-hero">
          <div>
            <p className="eyebrow">
              <span aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <h1>{copy.title}</h1>
            <p>{copy.introduction}</p>
            <span className="ds-internal-label">{copy.internal}</span>
          </div>
          <OpticalRing size="large" active label={copy.opticalLabel} />
        </header>

        <section className="ds-section" aria-labelledby="foundations-title">
          <SectionHeader id="foundations-title" section={copy.sections.foundations} />
          <div className="ds-foundations">
            <SurfacePanel>
              <h3>{copy.palette}</h3>
              <div className="ds-palette">
                {swatches.map(([token, value], index) => (
                  <div key={token} className="ds-swatch-row">
                    <span
                      className="ds-swatch"
                      style={{ background: `var(--color-${token})` }}
                      aria-hidden="true"
                    />
                    <span>{copy.paletteNames[index]}</span>
                    <code>--color-{token}</code>
                    <code>{value}</code>
                  </div>
                ))}
              </div>
            </SurfacePanel>
            <SurfacePanel>
              <h3>{copy.typography}</h3>
              <div className="ds-type-specimens">
                <div>
                  <span>{copy.displayFont}</span>
                  <p className="ds-display-type">{copy.displaySample}</p>
                </div>
                <div>
                  <span>{copy.bodyFont}</span>
                  <p>{copy.bodySample}</p>
                </div>
                <div>
                  <span>{copy.monoFont}</span>
                  <p className="data">{copy.typeScale.mono}</p>
                </div>
                <div className="ds-token-row">
                  <code>04</code>
                  <code>08</code>
                  <code>12</code>
                  <code>16</code>
                  <code>24</code>
                  <code>32</code>
                </div>
              </div>
            </SurfacePanel>
          </div>
        </section>

        <section className="ds-section" aria-labelledby="type-scale-title">
          <SectionHeader id="type-scale-title" section={copy.sections.typeScale} />
          <SurfacePanel>
            <dl className="ds-type-scale">
              {typeScale.map((step) => (
                <div key={step}>
                  <dt>
                    <code>--font-size-{step}</code>
                  </dt>
                  <dd className={`ds-type-${step}`}>{copy.typeScale[step]}</dd>
                </div>
              ))}
            </dl>
          </SurfacePanel>
        </section>

        <section className="ds-section" aria-labelledby="actions-title">
          <SectionHeader id="actions-title" section={copy.sections.actions} />
          <SurfacePanel>
            <div className="ds-component-row">
              <Button>{copy.buttons.primary}</Button>
              <Button variant="secondary">{copy.buttons.secondary}</Button>
              <Button variant="ghost">{copy.buttons.ghost}</Button>
              <Button variant="danger">{copy.buttons.danger}</Button>
              <Button loading>{copy.buttons.loading}</Button>
              <Button disabled>{copy.buttons.disabled}</Button>
            </div>
            <div className="ds-component-row">
              <IconButton label={copy.buttons.search}>
                <SearchIcon />
              </IconButton>
              <IconButton label={copy.buttons.locate} variant="active">
                <LocateIcon />
              </IconButton>
              <Chip>{copy.chips[0]}</Chip>
              <Chip>{copy.chips[1]}</Chip>
              <Chip selected>{copy.chips[2]}</Chip>
            </div>
          </SurfacePanel>
        </section>

        <section className="ds-section" aria-labelledby="statuses-title">
          <SectionHeader id="statuses-title" section={copy.sections.statuses} />
          <div className="ds-status-grid">
            <SurfacePanel>
              <h3>{copy.statusGroups.observatory}</h3>
              <div className="ds-status-list">
                {observatoryStatuses.map((status) => (
                  <ObservatoryStatus
                    key={status}
                    status={status}
                    label={copy.observatoryStatuses[status]}
                  />
                ))}
              </div>
            </SurfacePanel>
            <SurfacePanel>
              <h3>{copy.statusGroups.live}</h3>
              <div className="ds-status-list">
                <LiveIndicator active label={copy.liveLabel} />
                <LiveIndicator active={false} label={copy.idle} />
              </div>
              <h3 className="ds-subheading">{copy.statusGroups.quality}</h3>
              <div className="ds-status-list">
                {targetQualities.map((quality) => (
                  <TargetQuality
                    key={quality}
                    quality={quality}
                    label={copy.targetQualities[quality]}
                  />
                ))}
              </div>
            </SurfacePanel>
            <SurfacePanel className="ds-status-panel-wide">
              <h3>{copy.statusGroups.mission}</h3>
              <div className="ds-status-list">
                {missionStatuses.map((status) => (
                  <MissionStatus
                    key={status}
                    status={status}
                    label={missionSessionCopy[locale].states[status].title.replace(
                      "{target}",
                      "M42",
                    )}
                  />
                ))}
              </div>
            </SurfacePanel>
          </div>
        </section>

        <section className="ds-section" aria-labelledby="surfaces-title">
          <SectionHeader id="surfaces-title" section={copy.sections.surfaces} />
          <div className="ds-card-grid">
            <Card
              eyebrow={copy.cards.eyebrow}
              title={copy.cards.title}
              footer={
                <div className="ds-card-footer">
                  <span className="ds-card-meta">{copy.cards.footer}</span>
                  <Button size="small" variant="ghost">
                    {copy.buttons.secondary}
                  </Button>
                </div>
              }
              interactive
            >
              <p>{copy.cards.description}</p>
            </Card>
            <SurfacePanel>
              <h3>{copy.cards.panelTitle}</h3>
              <p>{copy.cards.panelDescription}</p>
            </SurfacePanel>
            <SurfacePanel elevated>
              <h3>{copy.cards.elevatedTitle}</h3>
              <p>{copy.cards.elevatedDescription}</p>
            </SurfacePanel>
          </div>
        </section>

        <section className="ds-section" aria-labelledby="overlays-title">
          <SectionHeader id="overlays-title" section={copy.sections.overlays} />
          <SurfacePanel>
            <div className="ds-overlay-grid">
              <Modal
                triggerLabel={copy.overlay.openModal}
                title={copy.overlay.modalTitle}
                description={copy.overlay.modalDescription}
                closeLabel={copy.overlay.close}
              >
                <p>{copy.overlay.modalBody}</p>
              </Modal>
              <Sheet
                triggerLabel={copy.overlay.openSheet}
                title={copy.overlay.sheetTitle}
                description={copy.overlay.sheetDescription}
                closeLabel={copy.overlay.close}
              >
                <p>{copy.overlay.sheetBody}</p>
              </Sheet>
              <Dropdown
                label={copy.overlay.dropdown}
                options={copy.overlay.options.map((label, index) => ({
                  label,
                  value: String(index),
                }))}
              />
              <Tooltip content={copy.overlay.tooltip}>
                <span className="ds-coordinate" aria-label={copy.overlay.tooltipLabel}>
                  J2000
                </span>
              </Tooltip>
            </div>
          </SurfacePanel>
        </section>

        <section className="ds-section" aria-labelledby="tabs-title">
          <SectionHeader id="tabs-title" section={copy.sections.navigation} />
          <Tabs
            ariaLabel={copy.tabs.label}
            items={[
              {
                id: "overview",
                label: copy.tabs.overview,
                content: copy.tabs.overviewBody,
              },
              {
                id: "visibility",
                label: copy.tabs.visibility,
                content: copy.tabs.visibilityBody,
              },
              {
                id: "equipment",
                label: copy.tabs.equipment,
                content: copy.tabs.equipmentBody,
              },
            ]}
          />
        </section>

        <section className="ds-section" aria-labelledby="feedback-title">
          <SectionHeader id="feedback-title" section={copy.sections.feedback} />
          <div className="ds-feedback-grid">
            <SurfacePanel aria-label={copy.feedback.loading}>
              <div className="ds-skeleton-preview">
                <Skeleton width="3rem" height="3rem" rounded />
                <div>
                  <Skeleton width="48%" />
                  <Skeleton width="82%" />
                  <Skeleton width="65%" />
                </div>
              </div>
            </SurfacePanel>
            <StatePanel
              title={copy.feedback.emptyTitle}
              description={copy.feedback.emptyDescription}
              action={<Button variant="secondary">{copy.feedback.emptyAction}</Button>}
            />
            <StatePanel
              variant="error"
              title={copy.feedback.errorTitle}
              description={copy.feedback.errorDescription}
              action={<Button variant="secondary">{copy.feedback.retry}</Button>}
            />
          </div>
        </section>

        <section className="ds-section" aria-labelledby="form-title">
          <SectionHeader id="form-title" section={copy.sections.forms} />
          <SurfacePanel className="ds-form-panel">
            <form className="ds-form" noValidate>
              <h3>{copy.form.title}</h3>
              <Field
                label={copy.form.target}
                htmlFor="target-name"
                hint={copy.form.targetHint}
              >
                <TextInput
                  id="target-name"
                  name="target"
                  placeholder={copy.form.targetPlaceholder}
                  aria-describedby="target-name-message"
                />
              </Field>
              <Field label={copy.form.notes} htmlFor="mission-notes">
                <TextArea
                  id="mission-notes"
                  name="notes"
                  placeholder={copy.form.notesPlaceholder}
                />
              </Field>
              <Field
                label={copy.form.email}
                htmlFor="notification-email"
                error={copy.form.emailError}
              >
                <TextInput
                  id="notification-email"
                  name="email"
                  type="email"
                  defaultValue="observer@"
                  aria-invalid="true"
                  aria-describedby="notification-email-message"
                />
              </Field>
              <Checkbox label={copy.form.consent} defaultChecked />
              <Button type="submit">{copy.form.submit}</Button>
            </form>
          </SurfacePanel>
        </section>
      </Container>
    </main>
  );
}
