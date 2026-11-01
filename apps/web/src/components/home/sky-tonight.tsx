import { MoonGlyph } from "@/components/booking/moon-glyph";
import { fill } from "@/features/operator/format";
import type { TonightSky } from "@/features/sky/tonight-sky";
import type { Locale } from "@/i18n/config";
import { skyTonightCopy } from "@/i18n/resources/sky-tonight";

/** Faintest magnitude an eye picks out under city light. */
const eyeLimit = 5;

/** The Moon and planets up tonight over Tbilisi, worked out for today's date. */
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

  return (
    <article className="home-tile sky-tonight" aria-labelledby="sky-tonight-title">
      <header className="home-tile-head">
        <h3 id="sky-tonight-title">{copy.title}</h3>
      </header>
      {sky.objects.length === 0 ? (
        <p className="home-tile-note">{copy.empty}</p>
      ) : (
        <ul className="sky-tonight-list" tabIndex={0} aria-label={copy.title}>
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
                  {copy.directions[o.direction]}
                </span>
              </span>
              <span className="sky-obj-tag">
                {o.body === "Moon"
                  ? fill(copy.lit, { lit: String(o.lit) })
                  : o.magnitude <= eyeLimit
                    ? copy.eye
                    : copy.scope}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
