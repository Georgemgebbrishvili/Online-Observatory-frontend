import type { Metadata } from "next";
import "@/styles/booking.css";
import "@/styles/room.css";
import "@/styles/collection.css";
import "@/styles/design-system.css";
import "@/styles/planet-hero.css";
import "@/styles/homepage.css";
import { notFound } from "next/navigation";

import { OpticalRing } from "@/components/astronomy/optical-ring";
import { TargetAvailability } from "@/components/astronomy/target-availability";
import { TargetCard } from "@/components/astronomy/target-card";
import { BookingActionsView } from "@/components/booking/booking-actions";
import { BookingRow } from "@/components/booking/booking-list";
import { formatPrice, SlotRow } from "@/components/booking/booking-night";
import { formatSlot } from "@/features/booking/present";
import { bookingActionsCopy, bookingsCopy } from "@/i18n/resources/bookings";
import { LiveFeed } from "@/components/room/live-feed";
import { MissionSteps } from "@/components/room/mission-steps";
import { PointingDial } from "@/components/room/pointing-dial";
import { TargetPreview } from "@/components/room/target-preview";
import { CountUp } from "@/components/home/count-up";
import { homeFonts } from "@/components/home/fonts";
import { MagneticLink } from "@/components/home/magnetic-link";
import { PlanetHero } from "@/components/home/planet-hero";
import { TargetRail } from "@/components/home/target-rail";
import type { LiveStatus } from "@/features/missions/live";
import { missionProgress, plateFor } from "@/features/missions/room";
import { fill } from "@/features/operator/format";
import { CaptureCard } from "@/components/collection/capture-card";
import { CaptureDownloads } from "@/components/collection/capture-downloads";
import { MissionStatus, missionStatuses } from "@/components/missions/mission-status";
import { LiveIndicator } from "@/components/observatory/live-indicator";
import { ModeNotice } from "@/components/observatory/mode-notice";
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
import { formatCapturedAt } from "@/features/collection/present";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { captureDetailCopy, collectionGalleryCopy } from "@/i18n/resources/collection";
import { roomCopy } from "@/i18n/resources/room";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import { palette } from "@/styles/tokens";

import {
  captureSpecimens,
  designSystemCopy,
  dialSpecimens,
  slotSpecimens,
  stepSpecimenHistory,
  targetSpecimens,
} from "./copy";

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

const bookingStatusSpecimens = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
] as const;

const liveSpecimens: readonly LiveStatus[] = [
  "not-started",
  "starting",
  "connecting",
  "live",
  "reconnecting",
  "offline",
  "hold",
  "expired",
  "ended",
  "refused",
  "error",
];

export default async function DesignSystemPage({ params }: DesignSystemPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const copy = designSystemCopy[locale];
  const room = roomCopy[locale];
  const dictionary = await getDictionary(locale);

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
              <h3 className="ds-subheading">{copy.statusGroups.availability}</h3>
              <div className="ds-status-list">
                <TargetAvailability observable label={targetCopy[locale].observable} />
                {Object.values(targetCopy[locale].reasons).map((reason) => (
                  <TargetAvailability key={reason} observable={false} label={reason} />
                ))}
              </div>
            </SurfacePanel>
            <SurfacePanel className="ds-status-panel-wide">
              <h3>{copy.statusGroups.mode}</h3>
              <div className="ds-status-list">
                {(["SIMULATED", "REAL"] as const).map((mode) => (
                  <ModeNotice
                    key={mode}
                    mode={mode}
                    label={statusCopy[locale].mode[mode].banner}
                    detail={statusCopy[locale].mode[mode].detail}
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
                    label={roomCopy[locale].states[status].title.replace(
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
          <h3 className="ds-subheading">{copy.cards.targetCard}</h3>
          <div className="target-grid">
            {targetSpecimens.map((item) => (
              <TargetCard
                key={item.target.id}
                item={item}
                timezone="Asia/Tbilisi"
                locale={locale}
                common={dictionary.home.common}
              />
            ))}
          </div>
          <h3 className="ds-subheading">{copy.cards.captureCard}</h3>
          <div className="capture-grid">
            {captureSpecimens.map((specimen) => (
              <CaptureCard
                key={specimen.captureId}
                captureId={specimen.captureId}
                href={`/${locale}/design-system#surfaces-title`}
                title={specimen.title[locale]}
                reference="M13 · 60000000"
                capturedAt={formatCapturedAt(specimen.capturedAt, "Asia/Tbilisi", locale)}
                thumbnail={specimen.thumbnail}
                simulated={specimen.simulated}
                visibility={specimen.visibility}
                copy={collectionGalleryCopy[locale]}
              />
            ))}
            <SurfacePanel>
              <CaptureDownloads
                captureId="specimen"
                fitsAvailable={false}
                signInPath={`/${locale}/sign-in`}
                copy={{
                  download: captureDetailCopy[locale].download,
                  downloadFits: captureDetailCopy[locale].downloadFits,
                  noFits: captureDetailCopy[locale].noFits,
                  downloadFailed: captureDetailCopy[locale].downloadFailed,
                  downloadNote: captureDetailCopy[locale].downloadNote,
                }}
              />
              <p className="capture-action-feedback" role="note">
                {captureDetailCopy[locale].downloadFailed}
              </p>
            </SurfacePanel>
          </div>
          <h3 className="ds-subheading">{copy.cards.slotRow}</h3>
          <ol className="slot-list">
            {slotSpecimens.map((slot) => (
              <SlotRow
                key={slot.startAt}
                {...slot}
                timezone="Asia/Tbilisi"
                locale={locale}
              />
            ))}
          </ol>
          <h3 className="ds-subheading">{copy.cards.bookingRow}</h3>
          <ol className="booking-list">
            {bookingStatusSpecimens.map((status, index) => (
              <BookingRow
                key={status}
                href="#"
                title={["Saturn", "Albireo", "M13", "Venus", "Moon"][index]}
                slot={formatSlot(
                  `2026-10-0${index + 1}T14:00:00Z`,
                  30,
                  "Asia/Tbilisi",
                  locale,
                )}
                price={formatPrice(4500, "GEL", locale)}
                status={status}
                statusLabel={bookingsCopy[locale].status[status]}
              />
            ))}
          </ol>
          <h3 className="ds-subheading">{copy.cards.bookingActions}</h3>
          <div className="ds-room-specimens">
            {(
              [
                [true, false, false, null, null],
                [true, false, true, null, null],
                [true, false, true, "cancel", null],
                [false, true, false, null, null],
                [false, true, false, "refund", null],
                [false, true, false, null, bookingActionsCopy(locale).refundUnavailable],
              ] as const
            ).map(([cancellable, refundable, confirming, pending, feedback], index) => (
              <SurfacePanel key={index}>
                <BookingActionsView
                  cancellable={cancellable}
                  refundable={refundable}
                  confirming={confirming}
                  pending={pending}
                  feedback={feedback}
                  copy={bookingActionsCopy(locale)}
                />
              </SurfacePanel>
            ))}
          </div>
          <h3 className="ds-subheading">{copy.cards.missionSteps}</h3>
          <div className="ds-room-specimens">
            {(
              [
                ["VERIFYING", null],
                ["COMPLETE", null],
                ["HARDWARE_ERROR", stepSpecimenHistory],
              ] as const
            ).map(([state, events]) => {
              const statuses = missionProgress(state, events);
              const at = statuses.findIndex((step) => step !== "done");
              return (
                <MissionSteps
                  key={state}
                  id={`ds-mission-steps-${state}`}
                  // Three on one page: each landmark needs its own name.
                  title={`${room.steps.title} — ${room.states[state].title}`}
                  names={room.steps.names}
                  statuses={statuses}
                  position={fill(room.steps.stepOf, {
                    step: String(at === -1 ? 5 : at + 1),
                  })}
                  stopped={room.steps.stopped}
                />
              );
            })}
          </div>
          <h3 className="ds-subheading">{copy.cards.pointingDial}</h3>
          <div className="ds-dial-specimens">
            {dialSpecimens.map((position) => (
              <PointingDial
                key={position.azimuthDegrees}
                position={position}
                label={room.pointing.dial}
                cardinals={room.pointing.cardinals}
              />
            ))}
            <PointingDial
              position={dialSpecimens[0]}
              telescope={{ altitudeDegrees: 30, azimuthDegrees: 120 }}
              label={room.pointing.dial}
              cardinals={room.pointing.cardinals}
            />
            <PointingDial
              position={dialSpecimens[0]}
              telescope={null}
              label={room.pointing.dial}
              cardinals={room.pointing.cardinals}
            />
          </div>
          <h3 className="ds-subheading">{copy.cards.targetPreview}</h3>
          <div className="ds-room-specimens ds-preview-specimens">
            <TargetPreview
              plate={plateFor("saturn")}
              name="Saturn"
              caption={room.feed.illustration}
              note={fill(room.feed.before, { target: "Saturn" })}
            />
            <TargetPreview
              plate={plateFor("m13-hercules-cluster")}
              name="M13"
              caption={room.feed.illustration}
              note={fill(room.feed.before, { target: "M13" })}
            />
          </div>
          <h3 className="ds-subheading">{copy.cards.liveFeed}</h3>
          <div className="ds-room-specimens ds-preview-specimens">
            {liveSpecimens.map((status) => {
              const text =
                status === "not-started"
                  ? {
                      title: room.live.notStarted.title,
                      description: fill(room.live.notStarted.before, {
                        time: formatCapturedAt(
                          "2030-01-15T18:00:00.000Z",
                          "Asia/Tbilisi",
                          locale,
                        ),
                      }),
                    }
                  : status === "refused"
                    ? {
                        title: room.live.refused.title,
                        description: room.live.refused.reasons.SAFETY_REFUSED ?? "",
                      }
                    : {
                        title: room.live.status[status].title,
                        description: fill(room.live.status[status].description, {
                          target: "Saturn",
                        }),
                      };
              return (
                <LiveFeed
                  key={status}
                  status={status}
                  stream={
                    status === "live"
                      ? {
                          // An empty frame: nothing here stands for telescope output.
                          url: `data:image/svg+xml,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><rect width="16" height="10" fill="${palette.neutral950}"/></svg>`,
                          )}`,
                          simulated: true,
                          alt: fill(room.live.streamAltSimulated, { target: "Saturn" }),
                        }
                      : null
                  }
                  preview={
                    <TargetPreview
                      plate={plateFor("saturn")}
                      name="Saturn"
                      caption={room.feed.illustration}
                    />
                  }
                  title={text.title}
                  description={text.description}
                  labels={{
                    simulated: room.live.simulated,
                    live: room.live.live,
                    timeLeft: room.live.timeLeft,
                  }}
                  timeLeft={
                    ["connecting", "live", "reconnecting"].includes(status)
                      ? { text: "24:00", iso: "PT1440S" }
                      : null
                  }
                  action={
                    status === "not-started" || status === "starting" ? (
                      <Button
                        disabled={status === "not-started"}
                        loading={status === "starting"}
                      >
                        {room.live.actions.start}
                      </Button>
                    ) : status === "refused" || status === "error" ? (
                      <Button variant="secondary">{room.live.actions.retry}</Button>
                    ) : undefined
                  }
                />
              );
            })}
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

        <section className="ds-section" aria-labelledby="showcase-title">
          <SectionHeader id="showcase-title" section={copy.sections.showcase} />
          <PlanetHero
            content={dictionary.home.hero}
            navigation={dictionary.navigation}
            locale={locale}
            nextId="showcase-title"
            contained
          />
        </section>

        <section className="ds-section" aria-labelledby="homepage-title">
          <SectionHeader id="homepage-title" section={copy.sections.homepage} />
          <div className={`home-page public-home ds-home-specimen ${homeFonts}`}>
            <TargetRail
              items={targetSpecimens}
              timezone="Asia/Tbilisi"
              locale={locale}
              common={dictionary.home.common}
              copy={dictionary.home.tonight}
            />
            <div className="home-final-actions">
              <MagneticLink className="home-pill" href="#homepage-title">
                {dictionary.home.finalCta.action}
              </MagneticLink>
              <MagneticLink className="home-pill home-pill-quiet" href="#homepage-title">
                {dictionary.home.finalCta.secondary}
              </MagneticLink>
            </div>
            <dl className="home-stats">
              <div>
                <dt>{dictionary.home.instrument.aperture}</dt>
                <dd>
                  <CountUp value={150} />
                  <small>{dictionary.home.instrument.millimetres}</small>
                </dd>
              </div>
              <div>
                <dt>{dictionary.home.instrument.focalRatio}</dt>
                <dd>
                  <CountUp prefix="f/" value={10} />
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </Container>
    </main>
  );
}
