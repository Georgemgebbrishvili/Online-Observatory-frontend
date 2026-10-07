/**
 * Only an https: address, or one on this origin, is followed: the sandbox checkout is
 * served here under /api, and a provider's is its own https page.
 */
export function checkoutTarget(redirectUrl: string, origin: string) {
  try {
    const url = new URL(redirectUrl, origin);
    return url.protocol === "https:" || url.origin === origin ? url.toString() : null;
  } catch {
    return null;
  }
}
