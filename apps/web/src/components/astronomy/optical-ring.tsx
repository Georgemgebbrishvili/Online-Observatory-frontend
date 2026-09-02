type OpticalRingProps = {
  size?: "small" | "medium" | "large";
  active?: boolean;
  label?: string;
};

export function OpticalRing({
  active = false,
  label,
  size = "medium",
}: OpticalRingProps) {
  return (
    <span
      className={`optical-ring optical-ring-${size} ${active ? "optical-ring-active" : ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="47.5" />
        <circle cx="50" cy="50" r="34" />
        <circle cx="50" cy="50" r="12" />
        <path d="M50 2.5v9M50 88.5v9M2.5 50h9M88.5 50h9" />
        <path className="optical-ring-accent" d="M19 25A39.5 39.5 0 0 1 50 10.5" />
      </svg>
      <span className="optical-ring-center" aria-hidden="true" />
    </span>
  );
}
