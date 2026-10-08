import type { Metadata } from "next";
import "@/styles/booking.css";
import "@/styles/room.css";
import "@/styles/collection.css";
import "@/styles/design-system.css";
import "@/styles/pages.css";
import "@/styles/homepage.css";
import "@/styles/observatory.css";
import "@/styles/profile.css";
import { notFound } from "next/navigation";

import { TargetAvailability } from "@/components/astronomy/target-availability";
import { BookingActionsView } from "@/components/booking/booking-actions";
import { BookingRow } from "@/components/booking/booking-list";
import { ReserveFormView } from "@/components/booking/reserve-form";
import { formatPrice, SlotRow } from "@/components/booking/booking-night";
import { formatSlot } from "@/features/booking/present";
import { bookingActionsCopy, bookingsCopy } from "@/i18n/resources/bookings";
import { rescheduleCopy } from "@/i18n/resources/reschedule";
import { reserveCopy } from "@/i18n/resources/reserve";
import { LiveFeed } from "@/components/room/live-feed";
import { MissionSteps } from "@/components/room/mission-steps";
import { PointingDial } from "@/components/room/pointing-dial";
import {
  RoomCaptureAction,
  RoomControlsView,
  RoomSessionView,
} from "@/components/room/room-controls";
import { RoomSharingView } from "@/components/room/room-sharing";
import { WatchView, type WatchPhase } from "@/components/room/mission-watch";
import { roomSharingCopy } from "@/i18n/resources/room-sharing";
import { roomControlsCopy } from "@/i18n/resources/room-controls";
import { TargetPreview } from "@/components/room/target-preview";
import { FlightPlan } from "@/components/home/flight-plan";
import { PlateFan } from "@/components/home/plate-fan";
import { TonightList } from "@/components/home/tonight-list";
import type { LiveStatus } from "@/features/missions/live";
import { missionProgress, plateFor, type FeedPlates } from "@/features/missions/room";
import { fill } from "@/features/operator/format";
import { CaptureCard } from "@/components/collection/capture-card";
import { CaptureDownloads } from "@/components/collection/capture-downloads";
import { MissionStatus, missionStatuses } from "@/components/missions/mission-status";
import { LiveIndicator } from "@/components/observatory/live-indicator";
import { FieldPlate } from "@/components/observatory/field-plate";
import { ModeNotice } from "@/components/observatory/mode-notice";
import {
  ObservatoryStatus,
  observatoryStatuses,
} from "@/components/observatory/observatory-status";
import { SiteClock } from "@/components/observatory/site-clock";
import { StarField } from "@/components/observatory/star-field";
import { Button, ButtonLink } from "@/components/ui/button";
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
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { profileCopy } from "@/i18n/resources/profile";
import { roomCopy } from "@/i18n/resources/room";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import { watchCopy } from "@/i18n/resources/watch";
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

// ADR-039 roles. The value column is the palette entry, or the opacity of cream.
const swatches = [
  ["night", palette.black],
  ["surface-base", palette.deep],
  ["surface-raised", "cream 4.5%"],
  ["surface-hover", "cream 8.5%"],
  ["border-subtle", "cream 11%"],
  ["border-strong", "cream 20%"],
  ["text-primary", palette.ink],
  ["text-secondary", "cream 76%"],
  ["text-tertiary", "cream 56%"],
  ["text-disabled", "cream 34%"],
  ["accent", palette.orange],
  ["accent-hover", palette.orangeHi],
  ["accent-ink", palette.orangeInk],
  ["live", palette.yellow],
  ["photon", palette.photon],
  ["success", palette.success],
  ["warning", palette.warning],
  ["error", palette.error],
] as const;

const typeScale = [
  "display",
  "hero",
  "h1",
  "h2",
  "h3",
  "stat",
  "kicker",
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
  "stopped",
  "refused",
  "error",
];

export default async function DesignSystemPage({ params }: DesignSystemPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const copy = designSystemCopy[locale];
  const room = roomCopy[locale];
  // The feed's plates as the first-party observatory fills them, for Saturn.
  const specimenPlates: FeedPlates = {
    instrument: [
      locale === "ka" ? "თბილისის ობსერვატორია" : "Tbilisi Observatory",
      `${room.feed.camera} · ${room.feed.optics.F10_NATIVE}`,
    ],
    subject: { name: locale === "ka" ? "სატურნი" : "Saturn", coordinates: null },
  };
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
                  <span>{copy.fonts.headline}</span>
                  <p className="headline">{copy.displaySample}</p>
                  <p className="headline" lang="ka">
                    {copy.georgianSample}
                  </p>
                </div>
                <div>
                  <span>{copy.fonts.title}</span>
                  <p>
                    <span className="title-sunset">{copy.titleSample}</span>
                  </p>
                </div>
                <div>
                  <span>{copy.fonts.label}</span>
                  <p className="label ds-label-type">{copy.labelSample}</p>
                  <p className="label ds-label-type" lang="ka">
                    {copy.georgianLabelSample}
                  </p>
                </div>
                <div>
                  <span>{copy.fonts.body}</span>
                  <p>{copy.bodySample}</p>
                  <p lang="ka">{copy.georgianBodySample}</p>
                </div>
                <div>
                  <span>{copy.fonts.data}</span>
                  <p className="data ds-data-type">{copy.typeScale.mono}</p>
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

        <section className="ds-section" aria-labelledby="poster-title">
          <SectionHeader id="poster-title" section={copy.sections.poster} />
          <div className="ds-kicker-sample">
            <p className="kicker">{copy.poster.kicker}</p>
            <p className="display">{copy.poster.headline}</p>
            <div className="stats-row">
              {copy.poster.stats.map(([value, label]) => (
                <div key={label}>
                  <p className="stat-value">{value}</p>
                  <p className="stat-label">{label}</p>
                </div>
              ))}
            </div>
          </div>
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
              <Button size="small">{copy.buttons.small}</Button>
              <Button size="medium">{copy.buttons.medium}</Button>
              <Button size="large">{copy.buttons.large}</Button>
              <Button variant="secondary" disabled>
                {copy.buttons.disabled}
              </Button>
              <Button variant="secondary" loading>
                {copy.buttons.loading}
              </Button>
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
              <span className="capture-simulated">{copy.simulatedBadge}</span>
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
                href="#"
                timezone="Asia/Tbilisi"
                locale={locale}
              />
            ))}
            {/* Replacing a lost slot: the same row, free. */}
            <SlotRow
              {...slotSpecimens[0]}
              href="#"
              priceLabel={rescheduleCopy[locale].free}
              timezone="Asia/Tbilisi"
              locale={locale}
            />
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
          <h3 className="ds-subheading">{copy.cards.reserveForm}</h3>
          <div className="ds-room-specimens">
            {(
              [
                [null, "idle", null],
                ["saturn", "idle", null],
                ["saturn", "reserving", null],
                ["saturn", "redirecting", null],
                ["saturn", "idle", reserveCopy[locale].form.taken],
              ] as const
            ).map(([targetId, phase, feedback], index) => (
              <SurfacePanel key={index}>
                <ReserveFormView
                  choices={[
                    { id: "albireo", name: "Albireo", detail: "β Cyg" },
                    { id: "saturn", name: "Saturn", detail: "" },
                  ]}
                  copy={reserveCopy[locale].form}
                  targetId={targetId}
                  phase={phase}
                  feedback={feedback}
                />
              </SurfacePanel>
            ))}
          </div>
          <h3 className="ds-subheading">{copy.cards.roomSharing}</h3>
          <div className="ds-room-specimens">
            {(
              [
                [false, 0, false, false, null],
                [false, 0, true, false, null],
                [true, 2, false, false, null],
                [true, 2, false, true, null],
                [true, 2, false, false, "copied"],
                [true, 2, false, false, "ended"],
              ] as const
            ).map(([observable, count, saving, confirming, notice], index) => (
              <RoomSharingView
                key={index}
                observable={observable}
                count={count}
                capacity={5}
                saving={saving}
                confirming={confirming}
                notice={notice}
                copy={roomSharingCopy[locale]}
                label={`${roomSharingCopy[locale].title} ${index + 1}`}
              />
            ))}
          </div>
          <h3 className="ds-subheading">{copy.cards.watch}</h3>
          <div className="ds-room-specimens">
            {(
              [
                ["sale", null, false, null],
                ["sale", "buy", false, null],
                ["loading", null, false, null],
                ["error", null, false, null],
                ["sale", null, true, null],
                ["full", null, true, null],
                ["paying", "join", true, null],
                ["watching", null, true, null],
                ["left", null, true, null],
                ["closed", null, false, null],
                ["closed", null, false, "refunded"],
                ["over", null, false, "owed"],
                ["over", null, false, null],
                ["owner", null, false, null],
                ["not-open", null, false, null],
              ] as const satisfies readonly (readonly [
                WatchPhase,
                "buy" | "join" | null,
                boolean,
                "refunded" | "owed" | null,
              ])[]
            ).map(([phase, pending, simulated, refund], index) => {
              const watch = watchCopy[locale];
              const seen =
                phase !== "loading" && phase !== "error" && phase !== "not-open";
              return (
                <WatchView
                  key={index}
                  phase={phase}
                  copy={watch}
                  headingLevel={2}
                  label={`WatchView ${index + 1}`}
                  target={seen ? "Saturn" : null}
                  observatory={seen ? specimenPlates.instrument?.[0] : null}
                  headline={fill(watch.headline, { owner: "Nino", target: "Saturn" })}
                  seats={fill(watch.seats, {
                    count: phase === "full" ? "5" : "2",
                    capacity: "5",
                  })}
                  simulated={
                    simulated
                      ? {
                          label: watch.simulated,
                          detail: statusCopy[locale].mode.SIMULATED.detail,
                        }
                      : null
                  }
                  pending={pending}
                  refund={
                    refund
                      ? fill(refund === "refunded" ? watch.refunded : watch.refundOwed, {
                          amount: formatPrice(750, "GEL", locale),
                        })
                      : null
                  }
                  roomPath={`/${locale}/design-system`}
                  feed={
                    <LiveFeed
                      status="live"
                      stream={{
                        // An empty frame: nothing here stands for telescope output.
                        url: `data:image/svg+xml,${encodeURIComponent(
                          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><rect width="16" height="10" fill="${palette.black}"/></svg>`,
                        )}`,
                        simulated: true,
                        alt: fill(room.live.streamAltSimulated, { target: "Saturn" }),
                      }}
                      preview={null}
                      title={room.live.status.live.title}
                      description={room.live.status.live.description}
                      labels={{
                        simulated: room.live.simulated,
                        live: room.live.live,
                        timeLeft: room.live.timeLeft,
                      }}
                      timeLeft={null}
                      plates={specimenPlates}
                      steps={
                        <MissionSteps
                          id={`ds-watch-steps-${index}`}
                          title={room.steps.title}
                          names={room.steps.names}
                          statuses={missionProgress("OBSERVING", null)}
                          position={fill(room.steps.stepOf, { step: "4" })}
                          now={room.steps.now}
                          stopped={room.steps.stopped}
                        />
                      }
                    />
                  }
                />
              );
            })}
          </div>
          <h3 className="ds-subheading">{copy.cards.roomControls}</h3>
          <div className="ds-room-specimens">
            {(
              [
                [
                  { move: true, capture: true, stop: true, waiting: null },
                  null,
                  null,
                  false,
                ],
                [
                  { move: true, capture: true, stop: true, waiting: null },
                  { control: "up", relayed: true },
                  null,
                  false,
                ],
                [
                  { move: true, capture: true, stop: true, waiting: null },
                  null,
                  { control: "capture", outcome: { kind: "done" } },
                  false,
                ],
                [
                  { move: true, capture: true, stop: true, waiting: null },
                  null,
                  {
                    control: "right",
                    outcome: { kind: "refused", reason: "SAFETY_NUDGE_LIMIT_EXCEEDED" },
                  },
                  false,
                ],
                [
                  { move: true, capture: true, stop: true, waiting: null },
                  null,
                  { control: "recenter", outcome: { kind: "no-answer" } },
                  false,
                ],
                [
                  { move: true, capture: true, stop: true, waiting: null },
                  null,
                  null,
                  true,
                ],
                [
                  { move: false, capture: false, stop: true, waiting: "centring" },
                  null,
                  null,
                  false,
                ],
                [
                  { move: false, capture: false, stop: true, waiting: "capturing" },
                  null,
                  null,
                  false,
                ],
                [
                  { move: true, capture: false, stop: true, waiting: null },
                  null,
                  null,
                  false,
                ],
              ] as const
            ).map(([offered, pending, outcome, confirmingStop], index) => (
              <RoomControlsView
                key={index}
                offered={offered}
                pending={pending}
                outcome={outcome}
                confirmingStop={confirmingStop}
                copy={roomControlsCopy[locale]}
                label={`${roomControlsCopy[locale].title} ${index + 1}`}
              />
            ))}
          </div>
          <div className="ds-room-specimens ds-session-specimens">
            <div className="ds-capture-specimens">
              <RoomCaptureAction
                offered={{ move: true, capture: true, stop: true, waiting: null }}
                pending={null}
                copy={roomControlsCopy[locale]}
              />
              <RoomCaptureAction
                offered={{ move: true, capture: true, stop: true, waiting: null }}
                pending={{ control: "capture", relayed: false }}
                copy={roomControlsCopy[locale]}
              />
            </div>
            {(
              [
                [false, null],
                [true, null],
                [true, { control: "stop", relayed: true }],
              ] as const
            ).map(([confirmingStop, pending], index) => (
              <RoomSessionView
                key={index}
                offered={{ move: true, capture: true, stop: true, waiting: null }}
                pending={pending}
                outcome={null}
                confirmingStop={confirmingStop}
                copy={roomControlsCopy[locale]}
                label={`${roomControlsCopy[locale].sessionTitle} ${index + 1}`}
              />
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
                  now={room.steps.now}
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
                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><rect width="16" height="10" fill="${palette.black}"/></svg>`,
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
                  plates={specimenPlates}
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
                    ) : status === "stopped" ? (
                      <>
                        <ButtonLink variant="secondary" href={`/${locale}/app/bookings`}>
                          {room.live.actions.booking}
                        </ButtonLink>
                        <ButtonLink href={`/${locale}/app/book`}>
                          {room.live.actions.book}
                        </ButtonLink>
                      </>
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
            <SurfacePanel role="status" aria-label={copy.feedback.loading}>
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
          {/* Account slice 2: a profile form's answer, accepted and refused. */}
          <SurfacePanel className="profile-panel">
            <h3>{profileCopy[locale].password.title}</h3>
            <p className="profile-outcome" role="status">
              {profileCopy[locale].password.changed}
            </p>
            <p className="profile-outcome profile-outcome-error" role="alert">
              {profileCopy[locale].errors.unavailable}
            </p>
            <Button loading>{profileCopy[locale].password.submit}</Button>
          </SurfacePanel>
        </section>

        <section className="ds-section" aria-labelledby="showcase-title">
          <SectionHeader id="showcase-title" section={copy.sections.showcase} />
          <div className="ds-home-specimen">
            <PlateFan content={dictionary.home.hero} />
          </div>
        </section>

        <section className="ds-section" aria-labelledby="homepage-title">
          <SectionHeader id="homepage-title" section={copy.sections.homepage} />
          <div className="ds-home-specimen">
            <FlightPlan
              steps={dictionary.home.howItWorks.steps.map((step) => ({
                ...step,
                status: dictionary.home.howItWorks.status.simulated,
              }))}
            />
            <TonightList
              items={targetSpecimens}
              timezone="Asia/Tbilisi"
              locale={locale}
              common={dictionary.home.common}
            />
          </div>
        </section>

        <section className="ds-section" aria-labelledby="observatory-scene-title">
          <SectionHeader
            id="observatory-scene-title"
            section={copy.sections.observatory}
          />
          <div className="observatory-page ds-observatory-specimen">
            <StarField />
            <div className="ds-observatory-pills">
              {(["online", "observing", "hold", "degraded", "offline"] as const).map(
                (state) => (
                  <span
                    key={state}
                    className={`observatory-pill observatory-pill-${state}`}
                  >
                    <span className="observatory-pill-led" aria-hidden="true" />
                    {observatoryPageCopy[locale].scene.states[state]}
                  </span>
                ),
              )}
            </div>
            <SiteClock
              locale={locale}
              timezone="Asia/Tbilisi"
              zoneLabel={observatoryPageCopy[locale].scene.siteTime}
            />
            <div className="ds-observatory-plate">
              <FieldPlate
                focalLengthMm={1500}
                locale={locale}
                labels={{
                  ...observatoryPageCopy[locale].scene.plate,
                  caption: observatoryPageCopy[locale].illustration,
                }}
              />
            </div>
            <nav
              className="observatory-dock"
              aria-label={observatoryPageCopy[locale].scene.ways.label}
            >
              {observatoryPageCopy[locale].scene.ways.items.map((way, index) => (
                <a
                  key={way.title}
                  href="#observatory-scene-title"
                  className="observatory-dock-way"
                >
                  <span className="observatory-dock-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="observatory-dock-title">{way.title}</span>
                  <span className="observatory-dock-line">
                    {way.cta} <span aria-hidden="true">→</span>
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </section>
      </Container>
    </main>
  );
}
