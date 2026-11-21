/** Browser/OS combos and keys typed into a focused control (Space on a button, Backspace in a field) are not game shortcuts. */
export function isShortcutIgnored(e: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'altKey' | 'target'>): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const el = e.target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));
}
