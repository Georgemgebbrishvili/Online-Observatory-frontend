import { MoonGlyph } from "@/components/booking/moon-glyph";
import { Container } from "@/components/ui/container";
import { fill } from "@/features/operator/format";
import type { TonightSky } from "@/features/sky/tonight-sky";
import type { Locale } from "@/i18n/config";
import { skyTonightCopy } from "@/i18n/resources/sky-tonight";

/** Faintest magnitude an eye picks out under city light. */
const eyeLimit = 5;

/** A small strip under the hero: the Moon and planets up tonight, worked out for today's date. */
export function SkyTonight({
  locale,
  sky,
  timezone,
}: {
  locale: Locale;
  sky: TonightSky | null;
  timezone: string;
}) {
  if (!sky) return null;
  const copy = skyTonightCopy[locale];
  const clock = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
  const day = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${sky.date}T12:00:00Z`));

  return (
    <section className="home-band sky-tonight-band" aria-labelledby="sky-tonight-title">
      <Container>
        <div className="sky-tonight">
          <header className="sky-tonight-head">
            <p className="kicker">{copy.kicker}</p>
            <h2 id="sky-tonight-title">{copy.title}</h2>
            <time dateTime={sky.date}>{day}</time>
          </header>
          {sky.objects.length === 0 ? (
            <p className="home-card-note">{copy.empty}</p>
          ) : (
            <ul className="sky-tonight-list">
              {sky.objects.map((o) => (
                <li key={o.body} className="sky-obj" data-body={o.body}>
                  <span className="sky-orb" aria-hidden="true">
                    {o.body === "Moon" ? (
                      <MoonGlyph lit={o.lit ?? 0} waxing={o.waxing ?? true} />
                    ) : null}
                  </span>
                  <span className="sky-obj-text">
                    <strong>{copy.names[o.body]}</strong>
                    <span>
                      {fill(copy.best, { time: clock.format(o.best) })} ·{" "}
                      {copy.directions[o.direction]} {o.altitude}°
                    </span>
                    <small>
                      {o.body === "Moon"
                        ? fill(copy.lit, { lit: String(o.lit) })
                        : o.magnitude <= eyeLimit
                          ? copy.eye
                          : copy.scope}
                      {" · "}
                      {fill(copy.up, {
                        from: clock.format(o.from),
                        to: clock.format(o.to),
                      })}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
