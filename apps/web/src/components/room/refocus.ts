/**
 * After a panel swaps its controls, puts focus on the one that replaced the control the
 * keyboard was on: a removed or disabled button drops focus to the page. Only when focus
 * was in the panel or fell to the page, never from somewhere else.
 */
export function refocus(panel: HTMLElement | null, target: HTMLElement | null) {
  const active = document.activeElement;
  if (!panel || !target) return;
  if (!active || active === document.body || panel.contains(active)) target.focus();
}
