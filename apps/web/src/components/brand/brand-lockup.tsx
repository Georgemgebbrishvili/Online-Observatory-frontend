import { brand } from "@/brand";

import { BrandMark } from "./brand-mark";

type BrandLockupProps = {
  ariaLabel: string;
  /** "by Astroman", shown where the lockup signs off a page: the footer (ADR-052 §3). */
  endorsement?: string;
};

/** The comet mark beside the name, as the Skychaser site sets its own (ADR-052 §3). */
export function BrandLockup({ ariaLabel, endorsement }: BrandLockupProps) {
  return (
    <span className="brand-lockup" aria-label={ariaLabel}>
      <BrandMark className="brand-mark" />
      {/* Latin in Anton on a Georgian page too, as the mark always is. */}
      <span className="brand-wordmark" lang="en">
        {brand.en.name}
      </span>
      {endorsement && <span className="brand-endorsement">{endorsement}</span>}
    </span>
  );
}
