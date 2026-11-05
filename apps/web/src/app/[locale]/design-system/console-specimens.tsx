"use client";

import { useId, useState } from "react";

import { consoleCopy } from "@/components/observatory-console/copy";
import { CopyProvider } from "@/components/observatory-console/copy-context";
import ExposurePanel from "@/components/observatory-console/exposure-panel";
import FocusDial from "@/components/observatory-console/focus-dial";
import SlewPad from "@/components/observatory-console/slew-pad";
import SkyDome from "@/components/observatory-console/sky-dome";
import { ConditionAlerts } from "@/components/observatory-console/ViewStage";
import type { Locale } from "@/i18n/config";
import { GAIN, STACK_SIZES } from "@/lib/observatory-sim/camera";
import { STATION_BY_ID } from "@/lib/observatory-sim/sim-stations";
import { TELESCOPE_TARGET_BY_ID, targetPosition } from "@/lib/observatory-sim/telescope-targets";

/** A frame of a star field: the sky's peak low, a tail of stars, a few pixels clipped. */
const sampleHistogram = Array.from({ length: 32 }, (_, i) =>
  i === 31
    ? 40
    : Math.round(9000 * Math.exp(-((i - 5) ** 2) / 6) + 600 * Math.exp(-i / 6)),
);

type Labels = { live: string; noFrame: string; stacking: string; conditions: string; domeStandby: string; domeOnTarget: string };

/** A fixed autumn evening over the station, so the dome specimens are the same on every render. */
const DOME_NIGHT_MS = Date.parse("2026-09-25T20:00:00+04:00");
const domeStation = STATION_BY_ID.get("tbilisi-01")!;
const domeTarget = TELESCOPE_TARGET_BY_ID.get("m57")!;
const domePointing = targetPosition(domeTarget, domeStation, new Date(DOME_NIGHT_MS));

const noop = () => {};

/**
 * The observatory console's exposure panel, slew pad and focuser dial (ADR-083) and its
 * condition notices (ADR-056), on the console's own ground. The live specimen's controls work, so hover and focus can be
 * tried; the others hold their state.
 */
export function ConsoleSpecimens({ locale, labels }: { locale: Locale; labels: Labels }) {
  const t = consoleCopy[locale];
  const id = useId();
  const [exp, setExp] = useState(8);
  const [rate, setRate] = useState(6);
  const [focusRate, setFocusRate] = useState(3);
  const [focusPos, setFocusPos] = useState(23163);
  const [subs, setSubs] = useState(STACK_SIZES.indexOf(8));
  const [gain, setGain] = useState(300);
  const total = `${STACK_SIZES[subs]} × ${exp} s`;
  const alerts = [
    { text: t.alerts.belowHorizon, warn: true },
    { text: t.alerts.low(25), warn: true },
    { text: t.alerts.cloud, warn: false },
    { text: t.alerts.dew(91), warn: false },
  ];

  return (
    <CopyProvider value={t}>
      <div className="sdo oh ds-console">
        <div className="ds-console-grid">
          <figure>
            <ExposurePanel
              exposureS={exp}
              onExposure={setExp}
              gain={gain}
              onGain={(v) => setGain(Math.max(GAIN.min, Math.min(GAIN.max, v)))}
              subs={subs}
              onSubs={(i) => setSubs(Math.max(0, Math.min(STACK_SIZES.length - 1, i)))}
              total={total}
              locked={false}
              histogram={sampleHistogram}
              ae={{ state: { running: false, status: "locked", mode: "auto", scene: "deepsky", pass: 3, level: 0.12, clipped: 0 }, run: noop, stop: noop, keep: false, setKeep: noop }}
            />
            <figcaption id={`${id}-live`}>
              {labels.live} · {t.provenanceSimulated}
            </figcaption>
          </figure>
          <figure>
            <ExposurePanel exposureS={exp} onExposure={null} gain={gain} onGain={null} subs={subs} onSubs={null} total={total} locked={false} histogram={null} ae={null} />
            <figcaption id={`${id}-none`}>{labels.noFrame}</figcaption>
          </figure>
          <figure>
            <ExposurePanel
              exposureS={exp}
              onExposure={noop}
              gain={gain}
              onGain={noop}
              subs={subs}
              onSubs={noop}
              total={total}
              locked
              histogram={sampleHistogram}
              ae={{ state: { running: true, status: "metering", mode: "auto", scene: "planet", pass: 2, level: 0.64, clipped: 0 }, run: noop, stop: noop, keep: true, setKeep: noop }}
            />
            <figcaption id={`${id}-stacking`}>{labels.stacking}</figcaption>
          </figure>
          <figure>
            <SlewPad enabled rate={rate} rateLabel="16×" onRate={setRate} onPress={noop} onRelease={noop} onCentre={noop} canCentre />
            <figcaption>{t.hub.slew}</figcaption>
          </figure>
          <figure>
            <FocusDial position={focusPos} enabled moving={false} rate={focusRate} onRate={setFocusRate} onNudge={(n) => setFocusPos((p) => p + n)} onHold={noop} />
            <figcaption>{t.hub.focuser.title}</figcaption>
          </figure>
          <figure>
            <SkyDome locale={locale} station={domeStation} minuteMs={DOME_NIGHT_MS} pointing={null} targetId={null} onPick={noop} />
            <figcaption>{labels.domeStandby}</figcaption>
          </figure>
          <figure>
            <SkyDome locale={locale} station={domeStation} minuteMs={DOME_NIGHT_MS} pointing={domePointing} targetId={domeTarget.id} onPick={noop} />
            <figcaption>{labels.domeOnTarget}</figcaption>
          </figure>
          <figure>
            <div className="ds-console-stage">
              <ConditionAlerts alerts={alerts} />
            </div>
            <figcaption>{labels.conditions}</figcaption>
          </figure>
        </div>
      </div>
    </CopyProvider>
  );
}
