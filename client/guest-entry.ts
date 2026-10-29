/**
 * Creates a local guest display name. The World server issues the actual
 * bearer token after joining and continues to validate all ownership.
 *
 * Guest access never requires an account, email or shared password.
 */
export function guestDisplayName(
  store: Pick<Storage, 'getItem' | 'setItem'>,
  suffix: () => string = () => crypto.randomUUID(),
): string {
  try {
    const existing = store.getItem('openrp-name')?.trim();
    if (existing && /^[\p{L}\p{N}_ .-]{2,24}$/u.test(existing)) return existing;
  } catch { /* Storage may be blocked in private browsing. */ }
  const short = suffix().replace(/[^a-z0-9]/gi, '').slice(0, 7).toUpperCase() || '0000000';
  const name = `Ospite${short}`;
  try { store.setItem('openrp-name', name); } catch { /* Account-free entry remains available. */ }
  return name;
}
