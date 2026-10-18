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
      { en: "Tonight's sky, hour by hour", ka: "ამაღამინდელი ცა, საათობრივად" },
      { en: "The full target catalogue", ka: "ობიექტების სრული კატალოგი" },
      { en: "The observatory's live status", ka: "ობსერვატორიის მიმდინარე მდგომარეობა" },
    ],
    action: {
      href: "app/missions",
      label: { en: "Explore tonight's sky", ka: "ამაღამინდელი ცის ნახვა" },
    },
  },
  {
    id: "seat",
    name: { en: "Watch a live session", ka: "უყურე პირდაპირ ეთერს" },
    description: {
      en: "Take a seat in somebody else's observation, from the link they share with you.",
      ka: "დაიკავე ადგილი სხვის დაკვირვებაზე, იმ ბმულით, რომელსაც გაგიზიარებენ.",
    },
    price: { kind: "PER_SEAT" },
    features: [
      { en: "The same live picture as the host", ka: "იგივე პირდაპირი გამოსახულება, რასაც მასპინძელი ხედავს" },
      { en: "Up to ten seats in each session", ka: "თითო ეთერში ათამდე ადგილი" },
      { en: "The telescope stays with the host", ka: "ტელესკოპს მასპინძელი მართავს" },
    ],
  },
  {
    id: "slot",
    name: { en: "Your own slot", ka: "შენი სეანსი" },
    description: {
      en: "Reserve the telescope, choose an approved target and watch it come in live.",
      ka: "დაჯავშნე ტელესკოპი, აირჩიე დამტკიცებული ობიექტი და უყურე პირდაპირ.",
    },
    price: { kind: "PER_SLOT" },
    features: [
      { en: "The telescope to yourself for the slot", ka: "მთელი სეანსის განმავლობაში ტელესკოპი მხოლოდ შენია" },
      { en: "Your target slewed to and centred", ka: "ტელესკოპი თავად მობრუნდება შენი ობიექტისკენ და ცენტრში მოაქცევს" },
      { en: "Captures kept in your Collection", ka: "გადაღებული კადრები შენს კოლექციაში ინახება" },
      { en: "A watch link for up to ten friends", ka: "სანახავი ბმული ათამდე მეგობრისთვის" },
    ],
    action: {
      href: "app/book",
      label: { en: "Book a slot", ka: "დაჯავშნე სეანსი" },
    },
  },
];
