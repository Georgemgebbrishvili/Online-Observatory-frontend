type BrandLockupProps = {
  ariaLabel: string;
  compact?: boolean;
  endorsement: string;
};

export function BrandLockup({
  ariaLabel,
  compact = false,
  endorsement,
}: BrandLockupProps) {
  return (
    <span className="brand-lockup" aria-label={ariaLabel}>
      <span className="brand-wordmark">Stellar</span>
      {!compact && <span className="brand-endorsement">{endorsement}</span>}
    </span>
  );
}
