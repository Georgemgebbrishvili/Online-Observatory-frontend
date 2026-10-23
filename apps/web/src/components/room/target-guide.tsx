import type { TargetType } from "@darkview/contracts";
import { useId } from "react";

import type { Locale } from "@/i18n/config";
import { targetGuideCopy } from "@/i18n/resources/target-guide";

import { PanelHead } from "./panel-head";

/** Clients ADR-069: what the customer is looking at, and what the live view can show. */
export function TargetGuide({
  description,
  locale,
  name,
  type,
}: {
  description: string | null;
  locale: Locale;
  name: string;
  type: TargetType;
}) {
  const copy = targetGuideCopy[locale];
  const titleId = useId();
  return (
    <section className="room-panel room-guide" aria-labelledby={titleId}>
      <PanelHead id={titleId} icon="pointing" title={copy.title(name)} />
      {description && <p>{description}</p>}
      <p className="room-guide-view">
        <span className="board-label">{copy.view}</span> {copy.classes[type]}
      </p>
    </section>
  );
}
