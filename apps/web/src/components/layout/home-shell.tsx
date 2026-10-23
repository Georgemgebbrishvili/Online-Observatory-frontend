import { FlightPlan } from "@/components/home/flight-plan";
import { HomeNow } from "@/components/home/home-now";
import { SkyHero } from "@/components/home/sky-hero";
import { Container } from "@/components/ui/container";
import type { ObservatoryPanelResult } from "@/features/home/read";
import type { PricingFacts } from "@/features/pricing/read";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type HomeShellProps = {
  content: Dictionary["home"];
  locale: Locale;
  tonight: TonightResult;
  panel: ObservatoryPanelResult;
  pricing: PricingFacts;
};

/**
 * The public homepage: the sky with its observatory, how a night works in four small
 * doors, then four small cards — tonight, the observatory now, the telescope, the price.
 */
export function HomeShell({ content, locale, panel, pricing, tonight }: HomeShellProps) {
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

      <section
        className="home-band home-now-band"
        id="now"
        aria-label={content.live.title}
      >
        <Container>
          <HomeNow
            content={content}
            locale={locale}
            tonight={tonight}
            panel={panel}
            pricing={pricing}
          />
        </Container>
      </section>
    </main>
  );
}
