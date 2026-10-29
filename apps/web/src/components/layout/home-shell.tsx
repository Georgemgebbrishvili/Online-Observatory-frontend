import { FlightPlan } from "@/components/home/flight-plan";
import { HomeMore } from "@/components/home/home-more";
import { HomeNow } from "@/components/home/home-now";
import { HomeQuick } from "@/components/home/home-quick";
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
 * The public homepage: the sky with its observatory (on a phone, the observatory now and
 * tonight's next open times right under it), how a night works in four small
 * doors, two small cards — tonight and the observatory now — then booking and its
 * lengths, the other ways in, questions, and a last call.
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
      <HomeQuick live={content.live} locale={locale} panel={panel} pricing={pricing} />

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
          <HomeNow content={content} locale={locale} tonight={tonight} panel={panel} />
        </Container>
      </section>

      <HomeMore content={content.more} locale={locale} pricing={pricing} />
    </main>
  );
}
