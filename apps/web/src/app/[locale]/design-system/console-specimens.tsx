"use client";

import { useId, useState } from "react";

import { consoleCopy } from "@/components/observatory-console/copy";
import { CopyProvider } from "@/components/observatory-console/copy-context";
import { Camera } from "@/components/observatory-console/panels";
import { ConditionAlerts } from "@/components/observatory-console/ViewStage";
import type { Locale } from "@/i18n/config";
import { EXPOSURES_S, GAIN, STACK_SIZES } from "@/lib/observatory-sim/camera";

/** A frame of a star field: the sky's peak low, a tail of stars, a few pixels clipped. */
const sampleHistogram = Array.from({ length: 32 }, (_, i) =>
  i === 31
    ? 40
    : Math.round(9000 * Math.exp(-((i - 5) ** 2) / 6) + 600 * Math.exp(-i / 6)),
);

type Labels = { live: string; noFrame: string; stacking: string; conditions: string };

const noop = () => {};

/**
 * The observatory console's camera panel and condition notices (ADR-056), on the
 * console's own ground. The live specimen's controls work, so hover and focus can be
 * tried; the others hold their state.
 */
export function ConsoleSpecimens({ locale, labels }: { locale: Locale; labels: Labels }) {
  const t = consoleCopy[locale];
  const id = useId();
  const [exp, setExp] = useState(EXPOSURES_S.indexOf(8));
  const [subs, setSubs] = useState(STACK_SIZES.indexOf(8));
  const [gain, setGain] = useState(300);
  const total = `${STACK_SIZES[subs]} × ${EXPOSURES_S[exp]} s`;
  const alerts = [
    { text: t.alerts.belowHorizon, warn: true },
    { text: t.alerts.low(25), warn: true },
    { text: t.alerts.cloud, warn: false },
    { text: t.alerts.dew(91), warn: false },
  ];

  return (
    <CopyProvider value={t}>
      <div className="sdo ds-console">
        <div className="ds-console-grid">
          <figure>
            <Camera
              exp={exp}
              subs={subs}
              gain={gain}
              total={total}
              locked={false}
              enabled
              onExp={(i) => setExp(Math.max(0, Math.min(EXPOSURES_S.length - 1, i)))}
              onSubs={(i) => setSubs(Math.max(0, Math.min(STACK_SIZES.length - 1, i)))}
              onGain={(v) => setGain(Math.max(GAIN.min, Math.min(GAIN.max, v)))}
              onAuto={noop}
              refreshNote={null}
              nameId={`${id}-live`}
              histogram={sampleHistogram}
            />
            <figcaption id={`${id}-live`}>
              {labels.live} · {t.provenanceSimulated}
            </figcaption>
          </figure>
          <figure>
            <Camera
              exp={exp}
              subs={subs}
              gain={gain}
              total={total}
              locked={false}
              enabled
              onExp={noop}
              onSubs={noop}
              onGain={noop}
              onAuto={null}
              refreshNote={null}
              nameId={`${id}-none`}
              histogram={null}
            />
            <figcaption id={`${id}-none`}>{labels.noFrame}</figcaption>
          </figure>
          <figure>
            <Camera
              exp={exp}
              subs={subs}
              gain={gain}
              total={total}
              locked
              enabled
              onExp={noop}
              onSubs={noop}
              onGain={noop}
              onAuto={noop}
              refreshNote={null}
              nameId={`${id}-stacking`}
              histogram={sampleHistogram}
            />
            <figcaption id={`${id}-stacking`}>{labels.stacking}</figcaption>
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
