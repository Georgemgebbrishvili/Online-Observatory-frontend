import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description: "Book a real telescope in Georgia and watch the sky live.",
  },
  navigation: {
    ariaLabel: "Primary navigation",
    skip: "Skip to content",
    language: "Language",
    languageName: "ქართული",
    brandAriaLabel: brand.en.siteName,
    public: {
      ariaLabel: "Public navigation",
      menu: "Open navigation",
      closeMenu: "Close navigation",
      book: "Book",
      observatory: "Observatory",
      pricing: "Pricing",
      explorer: brand.en.game,
      sky: "Night Sky",
      signIn: "Sign in",
      register: "Create an account",
      reserve: "Reserve a slot",
      account: "Account",
      overview: "Overview",
    },
    app: {
      ariaLabel: "Application navigation",
      home: "Home",
      book: "Book",
      live: "Live",
      collection: "Collection",
      profile: "Profile",
      cards: "Weekly cards",
      bookings: "Your nights",
      subscription: "Subscription",
      loyalty: "Club",
      passes: "Observation Pass",
      plannedGroup: "Not yet available",
      previewDescription:
        "This destination is a layout preview. Feature content will be added separately.",
      plannedDescription: `This part of ${brand.en.name} has not been built. It is listed here so you can see what is coming, and it will work from this page when it is ready.`,
    },
  },
  home: {
    hero: {
      headline: "The real sky,",
      sunset: "live.",
      lede: "Book a real telescope in Georgia and watch the night sky live.",
      cta: "Book a session",
      watch: "Watch live",
      illustration: "Illustration — not telescope output",
      panels: { tonight: "Tonight", noTimes: "No open times tonight", upTonight: "{count} up tonight" },
      rail: { aperture: "Aperture", perMinute: "A minute", openWeek: "Open this week" },
    },
    common: {
      minutes: "min",
      window: "Window",
      altitude: "Altitude now",
    },
    howItWorks: {
      title: "How it works",
      steps: [
        { title: "Book", description: "Pick a night and a time." },
        { title: "Aim", description: "The telescope turns to your target." },
        { title: "Watch", description: "See it live in your browser." },
        { title: "Keep", description: "Save the pictures you take." },
      ],
    },
    tonight: { title: "Tonight" },
    more: {
      price: {
        title: "Pay by the minute",
        cloud: "Clouded out? Your next session is free.",
      },
      ways: {
        title: "More to explore",
        items: [
          {
            title: "Weekly vote",
            text: "Choose what the telescope sees next.",
            href: "vote",
          },
          {
            title: "Gift a night",
            text: "A night at the telescope, as a gift.",
            href: "gift",
          },
          {
            title: brand.en.game,
            text: "Fly through the solar system.",
            href: "explorer",
          },
          { title: "Weekly cards", text: "A free card every week.", href: "app/cards" },
        ],
      },
      faq: {
        title: "Questions",
        items: [
          {
            q: "Do I need a telescope or an app?",
            a: "No. Everything runs in your browser.",
          },
          {
            q: "What if it is cloudy?",
            a: "If the weather stops your session, book another night for free.",
          },
          { q: "How long can a session be?", a: "From 15 minutes to 4 hours." },
          {
            q: "Can I choose what to look at?",
            a: "Yes. Or we pick the best object in the sky.",
          },
        ],
      },
    },
  },
  footer: {
    brandAriaLabel: brand.en.siteName,
    brandEndorsement: brand.en.endorsement,
    georgianLanguage: "ქართული",
    englishLanguage: "English",
    statement: "One real telescope in Georgia.",
    product: "Product",
    legal: "Legal",
    language: "Language",
    book: "Book",
    pricing: "Pricing",
    collection: "Collection",
    observatory: "Observatory",
    status: "Status",
    privacy: "Privacy",
    terms: "Terms",
    refunds: "Refunds",
  },
  notFound: {
    title: "Observation not found",
    description: "This link is wrong or the page moved.",
    action: `Return to ${brand.en.name}`,
  },
} satisfies Dictionary;

export default dictionary;
