import type { Locale } from "@/i18n/config";

/**
 * "Continue with Google" (platform ADR-048). A link, not a script: the platform's
 * `/auth/google/start` sends the browser to Google and back, and the session cookie
 * arrives exactly as a password sign-in's does. Nothing of Google's runs here.
 */
export function GoogleSignInButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a className="button button-secondary button-large auth-google" href={href}>
      <GoogleMark />
      <span>{label}</span>
    </a>
  );
}

export function googleSignInHref(locale: Locale) {
  return `/api/auth/google/start?locale=${locale}`;
}

/** Google's "G", as its sign-in branding guidelines draw it: Google's colours, not ours. */
function GoogleMark() {
  // eslint-disable-next-line @next/next/no-img-element -- a static 18px mark, nothing to optimise
  return <img alt="" aria-hidden="true" height={18} src="/brand/google-g.svg" width={18} />;
}
