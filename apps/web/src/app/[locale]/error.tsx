"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { feedbackCopy } from "@/i18n/resources/feedback";
import "@/styles/pages.css";

/**
 * The error boundary every route falls back to. Phase 1 wants a designed screen for a
 * failure rather than a stack trace or a bare string, and every later phase inherits
 * this one instead of inventing its own.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const requested = typeof params?.locale === "string" ? params.locale : "en";
  const locale = isLocale(requested) ? requested : "en";
  const copy = feedbackCopy[locale];

  useEffect(() => {
    // The digest is what ties this screen to a server log line. Nothing else about
    // the error is shown, because the message can carry internals.
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="public-page route-error">
      <section className="page-hero" role="alert">
        <Container>
          <p className="kicker">{copy.errorKicker}</p>
          <h1>{copy.errorTitle}</h1>
          <p className="page-lede">{copy.errorDescription}</p>
          <div className="route-error-actions">
            <button type="button" className="button button-primary" onClick={reset}>
              {copy.errorRetry}
            </button>
            <a className="button button-secondary" href={`/${locale}`}>
              {copy.errorHome}
            </a>
          </div>
          {error.digest && (
            <p className="route-error-digest">
              {copy.errorReference} <code>{error.digest}</code>
            </p>
          )}
        </Container>
      </section>
    </main>
  );
}
