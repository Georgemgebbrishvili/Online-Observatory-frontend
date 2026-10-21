import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "Reserve time on a real telescope in Tbilisi, watch it live, and keep what you capture.",
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
      subscription: "Subscription",
      loyalty: "Loyalty",
      passes: "Observation Pass",
      plannedGroup: "Not yet available",
      previewEyebrow: "Application shell",
      previewDescription:
        "This destination is a layout preview. Feature content will be added separately.",
      plannedEyebrow: "Not yet available",
      plannedDescription: `This part of ${brand.en.name} has not been built. It is listed here so you can see what is coming, and it will work from this page when it is ready.`,
    },
  },
  home: {
    hero: {
      headline: "The real sky,",
      sunset: "live.",
      lede: "A real telescope in Tbilisi, Georgia, shows you the sky live. Reserve an observation slot and watch the real camera feed.",
      cta: "Reserve a slot",
      plates: { saturn: "Saturn", jupiter: "Jupiter", mars: "Mars", venus: "Venus" },
      sky: {
        label:
          "A night sky. Move the pointer, or tap, to find the planets drawn in it. Every one is an illustration, not telescope output.",
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
      description: `${brand.en.name} turns time on a real telescope into one clear mission, from reserving a slot to keeping what you captured.`,
      steps: [
        {
          title: "Reserve",
          description: "Pick a target and a time.",
          action: "Book a slot",
        },
        {
          title: "Slew",
          description: "The telescope in Tbilisi turns to your target.",
          action: "Open the observatory",
        },
        {
          title: "Watch",
          description: "See its camera live as the picture sharpens.",
        },
        {
          title: "Keep",
          description: "Save the picture to your collection.",
          action: "Your collection",
        },
      ],
    },
    tonight: {
      eyebrow: "Tonight's sky",
      title: "Choose what the telescope sees next.",
      description:
        "What the observatory can see tonight, and why it cannot see the rest.",
      all: "All of tonight's targets",
    },
    instrument: {
      eyebrow: "The instrument",
      title: "One real telescope, in Tbilisi.",
      description:
        "Commanded only by the observatory's own software, never directly from a browser. What you see is what its camera sees.",
      aperture: "Aperture",
      focalLength: "Focal length",
      focalRatio: "Focal ratio",
      camera: "Camera",
      cameraValue: "ZWO ASI585MC",
      mode: "Mode",
      modeValue: "Live view",
      location: "Location",
      locationValue: "Tbilisi, Georgia",
      millimetres: "mm",
    },
    finalCta: {
      eyebrow: "Begin with tonight",
      title: "Your next observation starts here.",
      description: `Choose an observable target and shape your first ${brand.en.name} mission.`,
      action: "Reserve a slot",
      secondary: "Explore tonight's sky",
      privateTitle: "Private sessions",
    },
  },
  footer: {
    brandAriaLabel: brand.en.siteName,
    brandEndorsement: brand.en.endorsement,
    georgianLanguage: "ქართული",
    englishLanguage: "English",
    statement: "One real telescope in Tbilisi. The real sky, live.",
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
