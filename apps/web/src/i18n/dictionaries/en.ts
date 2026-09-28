import type { Dictionary } from "../types";
import { brand } from "@/brand";

const dictionary = {
  metadata: {
    title: brand.en.siteName,
    description:
      "Connect to real observatories, launch astronomical missions, and capture your own images of the night sky.",
  },
  navigation: {
    ariaLabel: "Primary navigation",
    skip: "Skip to content",
    language: "Language",
    languageName: "ქართული",
    brandAriaLabel: brand.en.siteName,
    brandEndorsement: brand.en.endorsement,
    public: {
      ariaLabel: "Public navigation",
      menu: "Open navigation",
      closeMenu: "Close navigation",
      explore: "Explore",
      live: "Live",
      observatory: "Observatory",
      pricing: "Pricing",
      about: "About",
      signIn: "Sign in",
      startExploring: "Start Exploring",
    },
    app: {
      ariaLabel: "Application navigation",
      sidebarAriaLabel: "Account and observatory",
      brandAriaLabel: brand.en.siteName,
      brandEndorsement: brand.en.endorsement,
      home: "Home",
      missions: "Missions",
      live: "Live",
      collection: "Collection",
      profile: "Profile",
      book: "Book an observation",
      subscription: "Subscription",
      loyalty: "Loyalty",
      passes: "Observation Pass",
      plannedGroup: "Not yet available",
      mobile: {
        home: "Home",
        missions: "Missions",
        live: "Live",
        collection: "Collection",
        profile: "Profile",
      },
      observatory: "Observatory status",
      observatoryName: "Tbilisi Observatory",
      statusOnline: "Online",
      simulated: "Simulated status",
      previewEyebrow: "Application shell",
      previewDescription:
        "This destination is a layout preview. Feature content will be added separately.",
      plannedEyebrow: "Not yet available",
      plannedDescription: `This part of ${brand.en.name} has not been built. It is listed here so you can see what is coming, and it will work from this page when it is ready.`,
    },
  },
  home: {
    hero: {
      eyebrow: "PLANET",
      cta: "RESERVE A SLOT",
      showPlanet: "Show {planet}",
      nextSection: "Scroll to next section",
      illustration: "Illustration — not telescope output",
      planets: {
        earth: {
          name: "EARTH",
          lede: [
            "The planet we observe from. A real telescope in Tbilisi, Georgia, shows you the sky",
            "live. Reserve an observation slot and watch the real camera feed.",
          ],
        },
        venus: {
          name: "VENUS",
          lede: [
            "The brightest planet in our sky, showing phases like a small Moon. Reserve an",
            "observation slot and watch it live through a real telescope.",
          ],
        },
        mars: {
          name: "MARS",
          lede: [
            "The rust-red world, its markings clearest near opposition. Reserve an observation",
            "slot and watch it live through a real telescope in Tbilisi.",
          ],
        },
      },
    },
    common: {
      viewTarget: "View target",
      illustration: "Catalogue illustration",
      minutes: "min",
      window: "Window",
      altitude: "Altitude now",
      duration: "Mission",
    },
    howItWorks: {
      eyebrow: `How ${brand.en.name} works`,
      title: "Three steps. One real observation.",
      description: `${brand.en.name} turns time on a real telescope into one clear mission, from choosing a target to keeping what you captured.`,
      steps: [
        {
          title: "Choose",
          description: "Pick a target from tonight's observable sky and reserve a slot.",
        },
        {
          title: "Observe",
          description:
            "At your slot the telescope in Tbilisi slews to it, and you watch the live view build up.",
        },
        {
          title: "Keep",
          description: "Capture the stacked frame and keep it in your collection.",
        },
      ],
    },
    tonight: {
      eyebrow: "Tonight's sky",
      title: "Choose what the telescope sees next.",
      description:
        "Every target the observatory knows, with what it can see tonight and why it cannot see the rest.",
      scheduleNote:
        "Visibility computed live by the observatory · pictures are illustrations, not telescope output",
      railLabel: "Tonight's targets",
      all: "All",
      previous: "Previous targets",
      next: "Next targets",
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
      cameraNote: "One-shot colour, live-stacked",
      millimetres: "mm",
    },
    finalCta: {
      eyebrow: "Begin with tonight",
      title: "Your next observation starts here.",
      description: `Choose an observable target and shape your first ${brand.en.name} mission.`,
      action: "Reserve a slot",
      secondary: "Explore tonight's sky",
      privateTitle: "Private sessions",
      privateNote: "Longer, dedicated telescope windows are coming later.",
    },
  },
  footer: {
    brandAriaLabel: brand.en.siteName,
    brandEndorsement: brand.en.endorsement,
    georgianLanguage: "ქართული",
    englishLanguage: "English",
    statement: "A premium optical instrument looking into deep space.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    language: "Language",
    missions: "Missions",
    live: "Live",
    collection: "Collection",
    observatory: "Observatory",
    status: "Status",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    refunds: "Refunds",
    comingSoon: "Coming soon",
  },
  notFound: {
    title: "Observation not found",
    action: `Return to ${brand.en.name}`,
  },
} satisfies Dictionary;

export default dictionary;
