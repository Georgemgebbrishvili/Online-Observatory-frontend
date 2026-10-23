import type { Locale } from "@/i18n/config";

/**
 * Clients ADR-070: the instrument behind the view, and where to find one. A plain line,
 * never a banner; the telescope named is the observatory's own.
 */
export function AstromanLine({
  locale,
  telescope,
}: {
  locale: Locale;
  telescope: { manufacturer: string; model: string };
}) {
  const instrument = `${telescope.manufacturer} ${telescope.model}`;
  return (
    <p className="astroman-line">
      {locale === "ka" ? `დანახულია ${instrument}-ით.` : `Seen through a ${instrument}.`}{" "}
      <a href="https://astroman.ge" rel="noopener" target="_blank">
        {locale === "ka" ? "ასტრომანი" : "Telescopes at Astroman"}
        <span className="visually-hidden">
          {locale === "ka" ? " (ახალ ფანჯარაში)" : " (opens in a new tab)"}
        </span>
      </a>
    </p>
  );
}
