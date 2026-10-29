import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "Book a real telescope in Georgia and watch the sky live.",
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
      loyalty: "Loyalty",
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
      lede: "A real telescope in Georgia. Book a time and watch live.",
      cta: "Reserve a slot",
      plates: {
        saturn: "Saturn",
        jupiter: "Jupiter",
        mars: "Mars",
        venus: "Venus",
        "moon-terminator": "The Moon",
        "m42-orion-nebula": "Orion Nebula",
        "m57-ring-nebula": "Ring Nebula",
        "m27-dumbbell-nebula": "Dumbbell Nebula",
        "m13-hercules-cluster": "Hercules Cluster",
        albireo: "Albireo",
        "mizar-alcor": "Mizar and Alcor",
      },
      kinds: {
        planet: "Planet",
        moon: "Our Moon",
        nebula: "Nebula",
        planetaryNebula: "Planetary nebula",
        cluster: "Star cluster",
        double: "Double star",
      },
      sky: {
        label:
          "A night sky. Move the pointer, or tap, to find the planets, nebulae and stars drawn in it. Every one is an illustration, not telescope output.",
        explore: "Explore the sky",
        tap: "Tap the sky",
        foundBefore: "",
        foundAfter: "found",
        illustration: "Illustration — not telescope output",
      },
    },
    common: {
      minutes: "min",
      window: "Window",
      altitude: "Altitude now",
    },
    howItWorks: {
      eyebrow: `How ${brand.en.name} works`,
      title: "Four steps to the sky.",
      steps: [
        {
          title: "Reserve",
          description: "Pick a night.",
        },
        {
          title: "Slew",
          description: "The telescope turns to it.",
        },
        {
          title: "Watch",
          description: "See it live.",
        },
        {
          title: "Keep",
          description: "Keep the picture.",
        },
      ],
    },
    tonight: {
      kicker: "Tonight",
      title: "What the telescope can see",
      all: "All targets",
      empty: "Nothing is up tonight.",
      unavailable: "Tonight's sky can't be read right now.",
    },
    live: {
      kicker: "Live now",
      title: "The observatory",
      observing: "Observing {name}",
      inProgress: "An observation is in progress",
      watch: "Watch",
      fullStatus: "Full status",
      unavailable: "The status can't be read right now.",
    },
    more: {
      book: {
        kicker: "Booking",
        title: "Three taps to the telescope",
        steps: [
          {
            title: "Pick a night",
            text: "Up to seven nights ahead.",
          },
          {
            title: "Pick a time",
            text: "15 minutes to 4 hours.",
          },
          {
            title: "Reserve",
            text: "Clouded out? You get a free session.",
          },
        ],
        lengths: "Any length, one rate",
        perMinute: "{price} a minute",
        cta: "Book a session",
      },
      ways: {
        kicker: "More",
        title: "More ways in",
        items: [
          { title: "Weekly vote", text: "Vote for the week's target.", href: "vote" },
          {
            title: "Gift a night",
            text: "Give someone a night at the telescope.",
            href: "gift",
          },
          {
            title: brand.en.game,
            text: "Fly through the solar system.",
            href: "explorer",
          },
          {
            title: "Weekly cards",
            text: "A free card each week. Win a session or a discount.",
            href: "app/cards",
          },
        ],
      },
      faq: {
        kicker: "Questions",
        title: "Before you book",
        items: [
          {
            q: "Do I need a telescope or an app?",
            a: "No. It all runs in your browser.",
          },
          {
            q: "What if it is cloudy?",
            a: "If the weather stops your session, pick another night for free.",
          },
          {
            q: "How long can a session be?",
            a: "From 15 minutes to 4 hours.",
          },
          {
            q: "Can I choose what to look at?",
            a: "Yes. Or let us pick the best one in the sky.",
          },
        ],
      },
      closer: {
        title: "The sky is open",
        sunset: "tonight.",
        lede: "A real telescope, a few taps away.",
        cta: "Reserve a slot",
        secondary: "Try the observatory",
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
    description:
      "This link is wrong or the page moved.",
    action: `Return to ${brand.en.name}`,
  },
} satisfies Dictionary;

export default dictionary;
