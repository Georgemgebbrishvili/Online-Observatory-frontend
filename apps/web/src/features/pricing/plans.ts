import type { Locale } from "@/i18n/config";

type LocalizedText = Record<Locale, string>;

/**
 * What the public pricing page may say exists today. Watching is free. A slot is sold
 * by the platform, which prices each one (the slot's `priceMinor`); this page carries
 * no amount of its own, so it cannot drift from the platform or state a price nobody
 * has approved.
 */
export type PricingOffering = {
  id: "watch" | "slot";
  name: LocalizedText;
  description: LocalizedText;
  price: { kind: "FREE" } | { kind: "PER_SLOT" };
  features: LocalizedText[];
  action: { href: string; label: LocalizedText };
};

export const pricingOfferings: PricingOffering[] = [
  {
    id: "watch",
    name: { en: "Watch", ka: "ყურება" },
    description: {
      en: "Follow public live observations and plan your own.",
      ka: "უყურეთ საჯარო პირდაპირ დაკვირვებებს და დაგეგმეთ საკუთარი.",
    },
    price: { kind: "FREE" },
    features: [
      { en: "Public live observations", ka: "საჯარო პირდაპირი დაკვირვებები" },
      { en: "Tonight's sky", ka: "დღევანდელი ცა" },
      { en: "The target catalogue", ka: "ობიექტების კატალოგი" },
    ],
    action: {
      href: "app/missions",
      label: { en: "Explore tonight's sky", ka: "დღევანდელი ცის ნახვა" },
    },
  },
  {
    id: "slot",
    name: { en: "An observation slot", ka: "სადამკვირვებლო სლოტი" },
    description: {
      en: "Reserve the telescope, choose an approved target and watch it live.",
      ka: "დაჯავშნეთ ტელესკოპი, აირჩიეთ დამტკიცებული ობიექტი და უყურეთ მას პირდაპირ.",
    },
    price: { kind: "PER_SLOT" },
    features: [
      {
        en: "The telescope, yours for the slot",
        ka: "ტელესკოპი თქვენია სლოტის განმავლობაში",
      },
      {
        en: "Your captures, kept in your collection",
        ka: "თქვენი კადრები, თქვენს კოლექციაში",
      },
      {
        en: "Live view, never long exposure",
        ka: "ცოცხალი ხედი, არა ხანგრძლივი ექსპოზიცია",
      },
    ],
    action: {
      href: "app/book",
      label: { en: "Book an observation", ka: "დაკვირვების დაჯავშნა" },
    },
  },
];
