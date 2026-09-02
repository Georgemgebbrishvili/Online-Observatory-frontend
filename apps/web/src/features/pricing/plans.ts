import type { Locale } from "@/i18n/config";

type LocalizedText = Record<Locale, string>;

export type PriceConfiguration =
  | { kind: "FREE"; amountMinor: 0 }
  | {
      kind: "CONFIGURABLE";
      amountMinor?: number;
      currency?: string;
      billingInterval?: "MONTHLY" | "SESSION";
    };

export type OfferingAvailability = "AVAILABLE" | "CONCEPT" | "FUTURE";

export type PricingOffering = {
  id: "observer" | "explorer" | "advanced" | "private-observatory";
  name: LocalizedText;
  description: LocalizedText;
  availability: OfferingAvailability;
  featureFlag?: keyof typeof pricingFeatureFlags;
  price: PriceConfiguration;
  features: LocalizedText[];
  sessionDurations?: number[];
};

export type PricingConfiguration = {
  version: string;
  currency: string | null;
  paymentsEnabled: boolean;
  offerings: PricingOffering[];
};

export const pricingFeatureFlags = {
  advancedOffering: false,
} as const;

export const pricingConfiguration: PricingConfiguration = {
  version: "2026-08-draft",
  currency: null,
  paymentsEnabled: false,
  offerings: [
    {
      id: "observer",
      name: { en: "Observer", ka: "დამკვირვებელი" },
      description: {
        en: "Begin with the shared sky and follow real public observations.",
        ka: "დაიწყეთ საერთო ცით და თვალყური ადევნეთ საჯარო დაკვირვებებს.",
      },
      availability: "AVAILABLE",
      price: { kind: "FREE", amountMinor: 0 },
      features: [
        { en: "Watch public live missions", ka: "საჯარო პირდაპირი მისიების ყურება" },
        { en: "Browse Tonight's Sky", ka: "დღევანდელი ცის დათვალიერება" },
        { en: "Explore the object catalog", ka: "ობიექტების კატალოგის აღმოჩენა" },
      ],
    },
    {
      id: "explorer",
      name: { en: "Explorer", ka: "მკვლევარი" },
      description: {
        en: "A future subscription concept for building a personal observing practice.",
        ka: "სამომავლო გამოწერის კონცეფცია პირადი დაკვირვების გამოცდილებისთვის.",
      },
      availability: "CONCEPT",
      price: { kind: "CONFIGURABLE", billingInterval: "MONTHLY" },
      features: [
        { en: "Mission credits", ka: "მისიის კრედიტები" },
        { en: "Personal captures", ka: "პირადი კადრები" },
        { en: "Personal collection", ka: "პირადი კოლექცია" },
        { en: "Scheduled observations", ka: "დაგეგმილი დაკვირვებები" },
      ],
    },
    {
      id: "advanced",
      name: { en: "Advanced", ka: "გაფართოებული" },
      description: {
        en: "A feature-gated future path for longer and more technical observations.",
        ka: "ფუნქციით შეზღუდული სამომავლო გზა უფრო ხანგრძლივი და ტექნიკური დაკვირვებებისთვის.",
      },
      availability: "FUTURE",
      featureFlag: "advancedOffering",
      price: { kind: "CONFIGURABLE", billingInterval: "MONTHLY" },
      features: [
        { en: "Priority reservations", ka: "პრიორიტეტული დაჯავშნა" },
        { en: "Advanced processing", ka: "გაფართოებული დამუშავება" },
        { en: "Raw and FITS data", ka: "დაუმუშავებელი და FITS მონაცემები" },
        { en: "Longer observations", ka: "უფრო ხანგრძლივი დაკვირვებები" },
      ],
    },
    {
      id: "private-observatory",
      name: { en: "Private Observatory", ka: "პირადი ობსერვატორია" },
      description: {
        en: "A premium dedicated telescope window for an exclusive observing session.",
        ka: "ტელესკოპის პრემიუმ გამოყოფილი დრო ექსკლუზიური დაკვირვების სესიისთვის.",
      },
      availability: "CONCEPT",
      price: { kind: "CONFIGURABLE", billingInterval: "SESSION" },
      sessionDurations: [30, 60, 120],
      features: [
        { en: "Exclusive telescope session", ka: "ტელესკოპის ექსკლუზიური სესია" },
      ],
    },
  ],
};

export function getPricingOffering(offeringId: PricingOffering["id"]) {
  return pricingConfiguration.offerings.find((offering) => offering.id === offeringId);
}

export function isOfferingEnabled(offering: PricingOffering) {
  return offering.featureFlag ? pricingFeatureFlags[offering.featureFlag] : true;
}
