type LiveIndicatorProps = {
  label: string;
  active?: boolean;
};

export function LiveIndicator({ active = true, label }: LiveIndicatorProps) {
  return (
    <span className={`live-indicator ${active ? "live-indicator-active" : ""}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
}
