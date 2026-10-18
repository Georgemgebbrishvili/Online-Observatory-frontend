import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import { guideCopy, type GuideId } from "@/i18n/resources/guides";
import "@/styles/guide.css";

type PageGuideProps = { id: GuideId; locale: Locale };

/**
 * The explaining a landing page carries under its working part: what it is, the
 * steps, what to expect, the questions people ask, and where to go next.
 */
export function PageGuide({ id, locale }: PageGuideProps) {
  const guide = guideCopy[locale][id];
  const href = (path: string) => `/${locale}/${path}`;

  return (
    <section className="page-guide" aria-labelledby={`guide-${id}-title`}>
      <Container>
        <header className="guide-heading">
          <p className="kicker">{guide.eyebrow}</p>
          <h2 id={`guide-${id}-title`}>{guide.title}</h2>
          <p className="guide-lede">{guide.lede}</p>
        </header>

        {guide.steps && (
          <div className="guide-block">
            <h3 className="guide-block-title">{guide.stepsTitle}</h3>
            <ol className="guide-steps">
              {guide.steps.map((step, index) => (
                <li key={step.title}>
                  <span className="guide-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {guide.points && (
          <div className="guide-block">
            <h3 className="guide-block-title">{guide.pointsTitle}</h3>
            <ul className="guide-points">
              {guide.points.map((point) => (
                <li key={point.title}>
                  <h4>{point.title}</h4>
                  <p>{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="guide-block guide-faq">
          <h3 className="guide-block-title">{guide.faqTitle}</h3>
          <div className="guide-faq-list">
            {guide.faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <div>
                  <p>{item.answer}</p>
                  {item.link && (
                    <Link href={href(item.link.path)}>
                      {item.link.label} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        {guide.cta && (
          <div className="guide-cta">
            <div>
              <h3>{guide.cta.title}</h3>
              <p>{guide.cta.body}</p>
            </div>
            <div className="guide-cta-actions">
              <ButtonLink href={href(guide.cta.action.path)}>
                {guide.cta.action.label}
              </ButtonLink>
              {guide.cta.secondary && (
                <ButtonLink href={href(guide.cta.secondary.path)} variant="secondary">
                  {guide.cta.secondary.label}
                </ButtonLink>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
