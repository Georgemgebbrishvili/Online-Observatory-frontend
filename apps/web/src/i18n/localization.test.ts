import { describe, expect, it } from "vitest";

import en from "@/i18n/dictionaries/en";
import ka from "@/i18n/dictionaries/ka";
import { authenticatedHomeCopy } from "@/i18n/resources/authenticated-home";
import { bookingCopy } from "@/i18n/resources/booking";
import { roomCopy } from "@/i18n/resources/room";
import { captureDetailCopy, collectionGalleryCopy } from "@/i18n/resources/collection";
import { missionBrowserCopy, missionDetailCopy } from "@/i18n/resources/missions";
import { legalCopy } from "@/i18n/resources/legal";
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { pricingPageCopy } from "@/i18n/resources/pricing";
import { authCopy } from "@/i18n/resources/auth";
import { targetCopy } from "@/i18n/resources/targets";
import { watchCopy } from "@/i18n/resources/watch";

function resourceShape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(resourceShape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, resourceShape(child)]),
    );
  }
  return typeof value;
}

describe("Georgian localization", () => {
  it("uses the approved core product language", () => {
    expect(ka.navigation.app.home).toBe("მთავარი");
    expect(ka.navigation.app.missions).toBe("მისიები");
    expect(ka.navigation.app.live).toBe("პირდაპირი დაკვირვება");
    expect(ka.navigation.app.collection).toBe("კოლექცია");
    expect(ka.navigation.public.observatory).toBe("ობსერვატორია");
    expect(ka.home.tonight.eyebrow).toBe("დღევანდელი ცა");
    expect(roomCopy.ka.states.CENTERING.title).toBe("ობიექტი ცენტრდება");
  });

  it("keeps English and Georgian feature resources structurally aligned", () => {
    const resources = [
      [en, ka],
      [authenticatedHomeCopy.en, authenticatedHomeCopy.ka],
      [bookingCopy.en, bookingCopy.ka],
      [collectionGalleryCopy.en, collectionGalleryCopy.ka],
      [captureDetailCopy.en, captureDetailCopy.ka],
      [missionBrowserCopy.en, missionBrowserCopy.ka],
      [missionDetailCopy.en, missionDetailCopy.ka],
      [roomCopy.en, roomCopy.ka],
      [observatoryPageCopy.en, observatoryPageCopy.ka],
      [pricingPageCopy.en, pricingPageCopy.ka],
      [authCopy.en, authCopy.ka],
      [legalCopy.en, legalCopy.ka],
      [targetCopy.en, targetCopy.ka],
      [watchCopy.en, watchCopy.ka],
    ] as const;

    for (const [english, georgian] of resources) {
      expect(resourceShape(georgian)).toEqual(resourceShape(english));
    }
  });
});
