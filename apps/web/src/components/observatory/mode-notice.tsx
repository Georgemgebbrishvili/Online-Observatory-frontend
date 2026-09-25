import type { ObservatoryMode } from "@darkview/contracts";

type ModeNoticeProps = {
  mode: ObservatoryMode;
  label: string;
  detail: string;
};

/** ObservatoryMode, stated plainly wherever a page shows what the telescope is doing. */
export function ModeNotice({ detail, label, mode }: ModeNoticeProps) {
  return (
    <aside className={`mode-notice mode-notice-${mode.toLowerCase()}`} role="note">
      <strong>{label}</strong>
      <span>{detail}</span>
    </aside>
  );
}
