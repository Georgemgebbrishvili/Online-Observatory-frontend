"use client";

import type { CardPrizeKind, CardRarity } from "@darkview/contracts";

import { SkychaserCard, type CardFaceProps } from "@/components/cards/skychaser-card";
import type { Locale } from "@/i18n/config";
import { cardsCopy } from "@/i18n/resources/cards";

type Labels = {
  down: string;
  turning: string;
  disabled: string;
  picked: string;
  plain: string;
  refused: string;
};

const noop = () => {};
const prizeOf: Record<CardRarity, CardPrizeKind | null> = {
  LEGENDARY: "FREE_SLOT",
  EPIC: "OBSERVER_SEAT",
  RARE: "DISCOUNT",
  COMMON: null,
};

/**
 * The weekly cards (ADR-058) in their states. The face-down specimen is a live button,
 * so hover and focus-visible can be tried; turning it does nothing here.
 */
export function CardSpecimens({ labels, locale }: { labels: Labels; locale: Locale }) {
  const copy = cardsCopy[locale];
  const face = (rarity: CardRarity, slug: string | null, name: string, kind: string, position = 0): CardFaceProps => ({
    rarity,
    rarityLabel: copy.rarity[rarity],
    slug,
    name,
    kind,
    position,
    prize: copy.prize(prizeOf[rarity], { durationMinutes: 40, percentOff: 20 }),
  });
  const ka = locale === "ka";
  const specimens: { label: string; node: React.ReactNode }[] = [
    { label: labels.down, node: <SkychaserCard face={null} onTurn={noop} turnLabel={copy.turn(0)} /> },
    { label: labels.turning, node: <SkychaserCard face={null} onTurn={noop} turnLabel={copy.turn(1)} busy caption={copy.turning} /> },
    { label: labels.disabled, node: <SkychaserCard face={null} onTurn={noop} turnLabel={copy.turn(2)} disabled /> },
    { label: labels.picked, node: <SkychaserCard face={face("LEGENDARY", "m42-orion-nebula", ka ? "ორიონის ნისლეული" : "Orion Nebula", ka ? "ნისლეული" : "Nebula")} picked caption={copy.illustration} /> },
    { label: copy.rarity.EPIC, node: <SkychaserCard face={face("EPIC", "saturn", ka ? "სატურნი" : "Saturn", ka ? "პლანეტა" : "Planet", 1)} caption={copy.illustration} /> },
    { label: copy.rarity.RARE, node: <SkychaserCard face={face("RARE", "moon-terminator", ka ? "მთვარის ტერმინატორი" : "Moon terminator", ka ? "მთვარე" : "Moon", 2)} caption={copy.illustration} /> },
    { label: copy.rarity.COMMON, node: <SkychaserCard face={face("COMMON", "jupiter", ka ? "იუპიტერი" : "Jupiter", ka ? "პლანეტა" : "Planet")} caption={copy.illustration} /> },
    { label: labels.plain, node: <SkychaserCard face={face("COMMON", "albireo", ka ? "ალბირეო" : "Albireo", ka ? "ორმაგი ვარსკვლავი" : "Double star", 2)} caption={copy.illustration} /> },
  ];
  return (
    <div className="ds-cards">
      <div className="ds-cards-grid">
        {specimens.map((specimen) => (
          <div key={specimen.label} className="ds-cards-specimen">
            <p className="ds-cards-label">{specimen.label}</p>
            {specimen.node}
          </div>
        ))}
      </div>
      <p className="ds-cards-label">{labels.refused}</p>
      <p className="cards-note" role="status">
        {copy.refused.failed}
      </p>
    </div>
  );
}
