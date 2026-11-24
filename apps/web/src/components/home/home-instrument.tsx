import { Container } from "@/components/ui/container";
import type { HomepageDictionary } from "@/types/homepage";

type HomeInstrumentProps = {
  content: HomepageDictionary["instrument"];
};

/**
 * The light path of a Schmidt-Cassegrain, drawn: in through the corrector, back to the
 * primary mirror, forward to the secondary, back through the primary's hole to the camera.
 */
function LightPath() {
  const rays = [-44, -28, 28, 44];
  return (
    <svg className="home-optics" viewBox="-10 -70 380 140" aria-hidden="true">
      <rect className="home-optics-tube" x="40" y="-56" width="250" height="112" rx="6" />
      <line className="home-optics-glass" x1="40" y1="-56" x2="40" y2="56" />
      <path className="home-optics-mirror" d="M286 -54 Q296 -30 296 -8 M296 8 Q296 30 286 54" />
      <path className="home-optics-mirror" d="M64 -12 Q60 0 64 12" />
      <rect className="home-optics-camera" x="318" y="-14" width="34" height="28" rx="4" />
      {rays.map((y, index) => {
        const hit = y < 0 ? -10 : 10;
        return (
          <g key={y}>
            <path className="home-optics-ray" d={`M-10 ${y} L289 ${y} L63 ${hit} L334 0`} />
            <path
              className="home-optics-pulse"
              style={{ animationDelay: `${index * 420}ms` }}
              pathLength={100}
              d={`M-10 ${y} L289 ${y} L63 ${hit} L334 0`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * ADR-100: the instrument, in figures. One wide tile with the drawn light path and the
 * lede, four figures, and the safety rule. No model names (ADR-076), no picture that
 * could pass for the telescope's own.
 */
export function HomeInstrument({ content }: HomeInstrumentProps) {
  return (
    <section className="home-band home-instrument" aria-labelledby="home-instrument-title">
      <Container>
        <header className="home-head">
          <span className="home-kicker">{content.kicker}</span>
          <h2 id="home-instrument-title">{content.title}</h2>
        </header>
        <div className="home-instrument-grid">
          <figure className="home-tile home-instrument-tile home-instrument-lead">
            <LightPath />
            <p>{content.lede}</p>
            <figcaption>{content.diagram}</figcaption>
          </figure>
          {content.figures.map((figure) => (
            <div className="home-tile home-instrument-tile home-instrument-figure" key={figure.label}>
              <b>
                {figure.value}
                {figure.unit && <small>{figure.unit}</small>}
              </b>
              <span>{figure.label}</span>
            </div>
          ))}
          <div className="home-tile home-instrument-tile home-instrument-safety">
            <span className="home-instrument-check" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6Z" />
                <path d="m8.5 12 2.4 2.4 4.6-4.8" />
              </svg>
            </span>
            <b>{content.safety.title}</b>
            <span>{content.safety.text}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
