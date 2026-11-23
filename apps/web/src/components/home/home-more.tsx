import { Container } from "@/components/ui/container";
import type { HomepageDictionary } from "@/types/homepage";

type HomeMoreProps = {
  content: HomepageDictionary["more"];
};

/**
 * ADR-076, ADR-086, ADR-099: the homepage's questions. What a session costs is on the
 * hero's panels and /pricing; the other ways in are in the footer.
 */
export function HomeMore({ content }: HomeMoreProps) {
  return (
    <section className="home-band" aria-labelledby="home-faq-title">
      <Container>
        <div className="home-split home-split-faq">
          <header className="home-head">
            <h2 id="home-faq-title">{content.faq.title}</h2>
          </header>
          <div className="home-faq">
            {content.faq.items.map((item) => (
              <details key={item.q} name="home-faq">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
