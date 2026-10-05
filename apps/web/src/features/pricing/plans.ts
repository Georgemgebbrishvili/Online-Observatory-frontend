import type { Locale } from "@/i18n/config";

type LocalizedText = Record<Locale, string>;

/**
 * What the public pricing page may say exists today. Browsing is free. A seat in
 * somebody's live session and a slot of your own are both sold by the platform, which
 * prices each one (the pack's and the slot's `priceMinor`); this page carries no amount
 * of its own, so it cannot drift from the platform or state a price nobody has approved.
 */
export type PricingOffering = {
  id: "browse" | "seat" | "slot";
  name: LocalizedText;
  description: LocalizedText;
  price: { kind: "FREE" } | { kind: "PER_SEAT" } | { kind: "PER_SLOT" };
  features: LocalizedText[];
  /** None for a seat: one is bought from the watch link a session's owner shares. */
  action?: { href: string; label: LocalizedText };
};

export const pricingOfferings: PricingOffering[] = [
  {
    id: "browse",
    name: { en: "Browse", ka: "დათვალიერება" },
    description: {
      en: "See what the telescope can show tonight, and plan your own observation.",
      ka: "ნახე, რას აჩვენებს ტელესკოპი ამაღამ, და დაგეგმე შენი დაკვირვება.",
    },
    price: { kind: "FREE" },
    features: [
      { en: "Tonight's sky", ka: "ამაღამინდელი ცა" },
      { en: "The target catalogue", ka: "ობიექტების კატალოგი" },
    ],
    action: {
      href: "app/missions",
      label: { en: "Explore tonight's sky", ka: "ამაღამინდელი ცის ნახვა" },
    },
  },
  {
    id: "seat",
    name: { en: "A seat in a live session", ka: "ადგილი პირდაპირ სესიაში" },
    description: {
      en: "Watch somebody else's observation live, from the link they share with you.",
      ka: "უყურე სხვის დაკვირვებას პირდაპირ, იმ ბმულით, რომელსაც გაგიზიარებს.",
    },
    price: { kind: "PER_SEAT" },
    features: [
      { en: "The live picture", ka: "პირდაპირი გამოსახულება" },
      {
        en: "Up to ten seats in each session",
        ka: "თითო სესიაში მაქსიმუმ ათი ადგილი",
      },
      {
        en: "The telescope stays with its owner",
        ka: "ტელესკოპს მისი მფლობელი მართავს",
      },
    ],
  },
  {
    id: "slot",
    name: { en: "An observation slot", ka: "დაკვირვების სლოტი" },
    description: {
      en: "Reserve the telescope, choose an approved target and watch it live.",
      ka: "დაჯავშნე ტელესკოპი, აირჩიე დამტკიცებული ობიექტი და უყურე მას პირდაპირ.",
    },
    price: { kind: "PER_SLOT" },
    features: [
      {
        en: "The telescope, yours for the slot",
        ka: "ტელესკოპი შენია სლოტის განმავლობაში",
      },
      {
        en: "Your captures, kept in your Collection",
        ka: "შენი კადრები, შენს კოლექციაში",
      },
      {
        en: "Live view, never long exposure",
        ka: "პირდაპირი ხედი, არა ხანგრძლივი ექსპოზიცია",
      },
    ],
    action: {
      href: "app/book",
      label: { en: "Book an observation", ka: "დაკვირვების დაჯავშნა" },
    },
  },
];
