import type { Locale } from "@/i18n/config";

/**
 * Clients ADR-070: where to find a telescope of your own. A plain line, never a banner;
 * since ADR-109 the observatory's own instrument is not named.
 */
export function AstromanLine({ locale }: { locale: Locale }) {
  return (
    <p className="astroman-line">
      {locale === "ka" ? "გინდა საკუთარი ტელესკოპი?" : "Want a telescope of your own?"}{" "}
      <a href="https://astroman.ge" rel="noopener" target="_blank">
        {locale === "ka" ? "ასტრომანი" : "Telescopes at Astroman"}
        <span className="visually-hidden">
          {locale === "ka" ? " (ახალ ფანჯარაში)" : " (opens in a new tab)"}
        </span>
      </a>
    </p>
  );
}
