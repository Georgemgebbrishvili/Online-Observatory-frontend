import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "Reserve time on a real telescope in Georgia, watch what it sees, and keep what you capture.",
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
      lede: "A real telescope in Georgia. Reserve an observation slot and watch its camera feed.",
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
      title: "Four steps. One real observation.",
      steps: [
        {
          title: "Reserve",
          description: "Pick a night.",
        },
        {
          title: "Slew",
          description: "Turns to your target.",
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
    telescope: {
      kicker: "The telescope",
      title: "One real telescope in Georgia",
      aperture: "Aperture",
      focalLength: "Focal length",
      focalRatio: "Focal ratio",
      camera: "Camera",
      cameraValue: "ZWO ASI585MC",
      millimetres: "mm",
      more: "The observatory",
    },
    more: {
      sky: {
        kicker: "Tonight's sky",
        title: "Every night, a different sky",
        lede: "What the telescope can reach tonight. Choose one when you book, or let us point at the best one up.",
        up: "Up tonight",
        down: "Not tonight",
        all: "Every target",
      },
      book: {
        kicker: "Booking",
        title: "Three taps to the telescope",
        steps: [
          {
            title: "Pick a night",
            text: "Seven nights ahead, each with its Moon and how much time is free.",
          },
          {
            title: "Tap a start, tap an end",
            text: "Any quarter hour, from 15 minutes to 4 hours. The board opens with the next clear half hour already chosen.",
          },
          {
            title: "Reserve",
            text: "The time is held for you while you pay. A session lost to the weather gets a free replacement.",
          },
        ],
        lengths: "Any length, one rate",
        perMinute: "{price} a minute",
        cta: "Book a session",
      },
      see: {
        kicker: "What you see",
        title: "A live picture, not a photo album",
        lede: `${brand.en.name} is live-view astronomy: the camera takes short exposures and stacks them as they arrive, so the picture deepens while you watch. It is not long-exposure astrophotography.`,
        points: [
          {
            title: "The real camera",
            text: "The picture comes from the camera on the telescope in Tbilisi, as it happens.",
          },
          {
            title: "Captures you keep",
            text: "Save the frames you like. They go into your Collection with their time and target.",
          },
          {
            title: "Friends can watch",
            text: "Share a watch link, and up to ten people see what you see.",
          },
        ],
      },
      ways: {
        kicker: "More",
        title: "More ways in",
        items: [
          { title: "Weekly vote", text: "Vote for the week's target.", href: "vote" },
          { title: "Gift a night", text: "A session at the telescope, for someone else.", href: "gift" },
          { title: brand.en.game, text: "Fly the solar system in your browser.", href: "explorer" },
          {
            title: "Weekly cards",
            text: "Turn a card each week for a free session, a seat or a discount.",
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
            a: "No. Everything runs in your browser; the telescope, the mount and the camera are ours.",
          },
          {
            q: "What if it is cloudy?",
            a: "Every start shows a cloud forecast. If the weather stops a session, it is put on hold and you can choose a free replacement night.",
          },
          {
            q: "How long can a session be?",
            a: "Any quarter hour from 15 minutes to 4 hours, at the same rate per minute.",
          },
          {
            q: "Can I choose what to look at?",
            a: "Yes. Pick an object that is up for the whole session, or leave it to us and we point at the best one up.",
          },
        ],
      },
      closer: {
        title: "The sky is open",
        sunset: "tonight.",
        lede: "One real telescope, a few taps away.",
        cta: "Reserve a slot",
        secondary: "Try the observatory",
      },
    },
    pricing: {
      kicker: "Pricing",
      title: "A night on the telescope",
      from: "From {price}",
      session: "{minutes}-minute session",
      open: "{count} open this week",
      none: "New nights open every week.",
      reserve: "Reserve a slot",
      all: "Pricing",
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
      "Nothing is at this address. It may have moved, or the link was mistyped.",
    action: `Return to ${brand.en.name}`,
  },
} satisfies Dictionary;

export default dictionary;
