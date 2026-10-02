import type { CSSProperties } from "react";

import { plateFor } from "@/features/missions/room";
import { fanPlates } from "@/features/targets/homepage-data";
import type { HomepageDictionary } from "@/types/homepage";

type PlateFanProps = {
  content: Pick<
    HomepageDictionary["hero"],
    "fanLabel" | "illustration" | "plates" | "plateType"
  >;
};

/**
 * Three ADR-027 plates held in a fan beside the homepage headline (ADR-039), each in a
 * cream poster frame with its name. Drawn art, never telescope output, so the fan
 * carries the caption that says so.
 */
export function PlateFan({ content }: PlateFanProps) {
  return (
    <figure className="plate-fan" aria-label={content.fanLabel}>
      <div className="plate-fan-deck">
        {fanPlates.map((plate, index) => (
          <div
            key={plate}
            className="plate-fan-plate"
            data-plate={plate}
            style={{ "--side": index - 1, "--off": Math.abs(index - 1) } as CSSProperties}
          >
            <div className="plate-fan-art">
              {/* A small static WebP from /public, shown at one size: next/image adds nothing. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={plateFor(plate) ?? ""} alt="" width={388} height={555} />
            </div>
            <span className="plate-fan-type">{content.plateType}</span>
            <span className="plate-fan-name">{content.plates[plate]}</span>
          </div>
        ))}
      </div>
      <figcaption className="plate-fan-caption">{content.illustration}</figcaption>
    </figure>
  );
}
