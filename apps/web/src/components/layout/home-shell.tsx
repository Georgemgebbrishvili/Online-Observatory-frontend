import { FlightPlan } from "@/components/home/flight-plan";
import { SkyHero } from "@/components/home/sky-hero";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type HomeShellProps = {
  content: Dictionary["home"];
  locale: Locale;
};

/**
 * The public homepage: the sky with its observatory, then how a night works in four
 * small doors. Nothing else for now; what joins them is the maintainer's call.
 */
export function HomeShell({ content, locale }: HomeShellProps) {
  // Each step opens the page where it happens.
  const stepPages = ["app/book", "observatory", "tonight", "app/collection"];
  const steps = content.howItWorks.steps.map((step, index) => ({
    ...step,
    href: `/${locale}/${stepPages[index]}`,
  }));

  return (
    <main id="main-content" className="public-home">
      <SkyHero content={content.hero} locale={locale} />

      <section className="home-band home-steps" id="about" aria-labelledby="steps-title">
        <Container>
          <header className="home-steps-heading">
            <p className="kicker">{content.howItWorks.eyebrow}</p>
            <h2 id="steps-title">{content.howItWorks.title}</h2>
          </header>
          <FlightPlan steps={steps} />
        </Container>
      </section>
    </main>
  );
}
