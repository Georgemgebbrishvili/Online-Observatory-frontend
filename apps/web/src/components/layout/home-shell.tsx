import { FlightPlan } from "@/components/home/flight-plan";
import { HomeMore } from "@/components/home/home-more";
import { HomeQuick } from "@/components/home/home-quick";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { SkyHero } from "@/components/home/sky-hero";
import { SkyTonight } from "@/components/home/sky-tonight";
import { Container } from "@/components/ui/container";
import type { PricingFacts } from "@/features/pricing/read";
import type { TonightSky } from "@/features/sky/tonight-sky";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type HomeShellProps = {
  content: Dictionary["home"];
  locale: Locale;
  pricing: PricingFacts;
  sky: TonightSky | null;
};

/**
 * The public homepage (ADR-076, ADR-077): the sky, tonight (open
 * times beside the planets up), how a session works, prices, other ways in, questions,
 * and a last call.
 */
export function HomeShell({ content, locale, pricing, sky }: HomeShellProps) {
  // Each step opens the page where it happens.
  const stepPages = ["app/book", "observatory", "tonight", "app/collection"];
  const steps = content.howItWorks.steps.map((step, index) => ({
    ...step,
    href: `/${locale}/${stepPages[index]}`,
  }));

  return (
    <main id="main-content" className="public-home">
      <SkyHero content={content.hero} locale={locale} />

      <section className="home-band" aria-labelledby="home-tonight-title">
        <Container>
          <header className="home-head">
            <h2 id="home-tonight-title">{content.tonight.title}</h2>
          </header>
          <div className="home-tonight">
            <HomeQuick locale={locale} pricing={pricing} />
            <SkyTonight locale={locale} sky={sky} timezone="Asia/Tbilisi" />
          </div>
        </Container>
      </section>

      <section className="home-band" id="about" aria-labelledby="steps-title">
        <Container>
          <header className="home-head">
            <h2 id="steps-title">{content.howItWorks.title}</h2>
          </header>
          <FlightPlan steps={steps} />
        </Container>
      </section>

      <HomeMore content={content.more} locale={locale} pricing={pricing} />
      <ScrollReveal />
    </main>
  );
}
