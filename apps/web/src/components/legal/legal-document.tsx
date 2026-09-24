import Link from "next/link";

import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { LegalCopy, LegalDocument } from "@/i18n/resources/legal";

export function LegalDocumentPage({
  copy,
  document,
  locale,
}: {
  copy: LegalCopy;
  document: LegalDocument;
  locale: Locale;
}) {
  return (
    <main className="legal-page" id="main-content">
      <Container>
        <header className="legal-header">
          <span className="legal-eyebrow">{document.eyebrow}</span>
          <h1>{document.title}</h1>
          <p className="legal-introduction">{document.introduction}</p>
        </header>

        <aside className="legal-notice" role="note">
          <span className="legal-notice-marker">{copy.noticeMarker}</span>
          <div>
            <h2>{copy.noticeTitle}</h2>
            <p>{copy.notice}</p>
          </div>
        </aside>

        <div className="legal-sections">
          {document.sections.map((section, index) => (
            <section className="legal-section" key={section.heading}>
              <h2>
                <span className="legal-section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>

              {section.status === "decided" ? (
                <>
                  <span className="legal-status legal-status-decided">
                    {copy.decidedLabel}
                  </span>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </>
              ) : (
                <>
                  <span className="legal-status legal-status-pending">
                    {copy.pendingLabel}
                  </span>
                  <p className="legal-pending-detail">{copy.pendingDetail}</p>
                </>
              )}
            </section>
          ))}
        </div>

        <Link className="legal-back" href={`/${locale}`}>
          {copy.back}
        </Link>
      </Container>
    </main>
  );
}
