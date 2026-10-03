import Link from "next/link";

import { Container } from "@/components/ui/container";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import type { LegalCopy, LegalDocument } from "@/i18n/resources/legal";

/**
 * A legal document in the poster language (ADR-039, slice B4): the draft notice once at
 * the top, a table of contents beside a readable column, settled sections in full and
 * pending ones as a single muted line. Nothing here is drafted law (DV-072).
 */
export function LegalDocumentPage({
  copy,
  document,
  locale,
}: {
  copy: LegalCopy;
  document: LegalDocument;
  locale: Locale;
}) {
  const sections = document.sections.map((section, index) => ({
    ...section,
    id: `section-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
  }));
  const pending = sections.filter((section) => section.status === "pending").length;

  return (
    <main className="public-page legal-page" id="main-content">
      <section className="page-hero" aria-labelledby="legal-title">
        <Container>
          <p className="kicker">{document.eyebrow}</p>
          <h1 id="legal-title">{document.title}</h1>
          <p className="page-lede">{document.introduction}</p>
        </Container>
      </section>

      <Container className="legal-layout">
        <nav className="legal-toc" aria-labelledby="legal-toc-title">
          <h2 id="legal-toc-title" className="plate-title">
            {copy.contents}
          </h2>
          <ol>
            {sections.map((section) => (
              <li
                key={section.id}
                className={section.status === "pending" ? "legal-toc-pending" : undefined}
              >
                <a href={`#${section.id}`}>
                  <span className="legal-toc-number">{section.number}</span>
                  <span>
                    {section.heading}
                    {section.status === "pending" && (
                      <span className="visually-hidden"> · {copy.pendingLabel}</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-body">
          <aside className="legal-notice" role="note">
            <span className="legal-notice-marker">{copy.noticeMarker}</span>
            <h2>{copy.noticeTitle}</h2>
            <p>{copy.notice}</p>
            {pending > 0 && (
              <p className="legal-notice-summary">
                {fill(copy.pendingSummary, {
                  pending: String(pending),
                  total: String(sections.length),
                })}{" "}
                {copy.pendingDetail}
              </p>
            )}
          </aside>

          {sections.map((section) =>
            section.status === "decided" ? (
              <section
                className="legal-section"
                id={section.id}
                key={section.id}
                aria-labelledby={`${section.id}-title`}
              >
                <h2 id={`${section.id}-title`}>
                  <span className="legal-section-number">{section.number}</span>
                  {section.heading}
                </h2>
                <span className="legal-status legal-status-decided">
                  {copy.decidedLabel}
                </span>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ) : (
              <section
                className="legal-section legal-section-pending"
                id={section.id}
                key={section.id}
                aria-labelledby={`${section.id}-title`}
              >
                <h2 id={`${section.id}-title`}>
                  <span className="legal-section-number">{section.number}</span>
                  {section.heading}
                </h2>
                <span className="legal-status legal-status-pending">
                  {copy.pendingLabel}
                </span>
              </section>
            ),
          )}

          <Link className="page-link legal-back" href={`/${locale}`}>
            {copy.back}
          </Link>
        </article>
      </Container>
    </main>
  );
}
