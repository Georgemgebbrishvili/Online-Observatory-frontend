import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatePanel } from "@/components/ui/state-panel";
import { fill } from "@/features/operator/format";
import { primaryReason } from "@/features/targets/present";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import { targetCopy } from "@/i18n/resources/targets";

type TonightNoticesProps = {
  result: TonightResult;
  locale: Locale;
  headingLevel?: 2 | 3;
};

/**
 * What a reader must know before tonight's list: that it is the simulator's, that
 * nothing on it can be observed and why, or that there is no list at all.
 */
export function TonightNotices({
  headingLevel = 3,
  locale,
  result,
}: TonightNoticesProps) {
  const copy = targetCopy[locale];

  if (result.kind === "unreachable") {
    return (
      <StatePanel variant="error" headingLevel={headingLevel} {...copy.unreachable} />
    );
  }
  if (result.kind === "no-observatory") {
    return <StatePanel headingLevel={headingLevel} {...copy.noObservatory} />;
  }

  const blocked = !result.items.some((item) => item.visibility.observable);
  // Sorted observable-first, so when nothing is observable the first item's first
  // reason is the one that decides for the whole sky — the safety envelope, the
  // weather, the observatory being offline, daylight.
  const reason = result.items[0] ? primaryReason(result.items[0].visibility) : null;

  return (
    <>
      {result.observatory.mode === "SIMULATED" && (
        <ModeNotice
          mode="SIMULATED"
          label={copy.simulated.label}
          detail={copy.simulated.detail}
        />
      )}
      {blocked && (
        <StatePanel
          headingLevel={headingLevel}
          title={copy.noneObservable.title}
          description={
            reason
              ? fill(copy.noneObservable.reason, { reason: copy.reasons[reason] })
              : ""
          }
        />
      )}
    </>
  );
}
