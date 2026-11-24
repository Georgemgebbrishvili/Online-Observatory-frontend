import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/home-hero";
import { HomeInstrument } from "@/components/home/home-instrument";
import { HomeMore } from "@/components/home/home-more";
import { HomeQuick } from "@/components/home/home-quick";
import { HomeSteps } from "@/components/home/home-steps";
import { NightChart } from "@/components/home/night-chart";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { Container } from "@/components/ui/container";
import type { PricingFacts } from "@/features/pricing/read";
import type { TonightSky } from "@/features/sky/tonight-sky";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type HomeShellProps = {
  content: Dictionary["home"];
  navigation: { sky: string };
  locale: Locale;
  pricing: PricingFacts;
  sky: TonightSky | null;
};

/**
 * The public homepage (ADR-086, ADR-099, ADR-100): the hero with its panels, tonight (the
 * planets and the open times on one night chart), the instrument, how a session works,
 * questions, and the closing call.
 */
export function HomeShell({ content, navigation, locale, pricing, sky }: HomeShellProps) {
  // Each step opens the page where it happens.
  const stepPages = ["app/book", "observatory", "tonight", "app/collection"];
  const steps = content.howItWorks.steps.map((step, index) => ({
    ...step,
    href: `/${locale}/${stepPages[index]}`,
  }));

  return (
    <main id="main-content" className="public-home">
      <HomeHero
        content={content.hero}
        price={content.more.price}
        navigation={navigation}
        locale={locale}
        pricing={pricing}
        sky={sky}
        timezone="Asia/Tbilisi"
      />

      <section className="home-band" aria-labelledby="home-tonight-title">
        <Container>
          <header className="home-head home-head-row">
            <h2 id="home-tonight-title">{content.tonight.title}</h2>
            {sky && (
              <time dateTime={sky.date}>
                {new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                }).format(new Date(`${sky.date}T12:00:00Z`))}
              </time>
            )}
          </header>
          {sky && sky.objects.length > 0 ? (
            <NightChart locale={locale} pricing={pricing} sky={sky} timezone="Asia/Tbilisi" />
          ) : (
            <HomeQuick locale={locale} pricing={pricing} />
          )}
        </Container>
      </section>

      <HomeInstrument content={content.instrument} />

      <section className="home-band" id="about" aria-labelledby="steps-title">
        <Container>
          <header className="home-head">
            <h2 id="steps-title">{content.howItWorks.title}</h2>
          </header>
          <HomeSteps steps={steps} />
        </Container>
      </section>

      <HomeMore content={content.more} />
      <HomeClosing content={content.closing} cta={content.hero.cta} locale={locale} />
      <ScrollReveal />
    </main>
  );
}
