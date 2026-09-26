import type {
  CaptureVisibility,
  ImagingProfile,
  OpticalConfig,
} from "@darkview/contracts";

import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

/**
 * Words for the Collection. The platform's enums are keyed by the contract, so a new
 * value upstream is a type error here rather than a blank label.
 */
type CollectionCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  featured: string;
  allCaptures: string;
  allDescription: string;
  olderCaptures: string;
  newestCaptures: string;
  view: string;
  imageAlt: (target: string) => string;
  simulated: string;
  noPreview: string;
  retiredTarget: string;
  visibility: Record<CaptureVisibility, string>;
  profiles: Record<ImagingProfile, string>;
  loading: string;
  empty: StateCopy & { action: string };
  noOlder: StateCopy & { action: string };
  unreachable: StateCopy;
};

type CaptureDetailCopy = {
  back: string;
  capturedBy: string;
  date: string;
  observatory: string;
  aboutTarget: string;
  imageFailed: string;
  download: string;
  downloadFits: string;
  noFits: string;
  downloadFailed: string;
  downloadNote: string;
  provenance: string;
  profile: string;
  optics: string;
  solvedFocalLength: string;
  exposure: string;
  gain: string;
  stack: string;
  frames: (count: number) => string;
  integration: string;
  frameSize: string;
  mission: string;
  captureId: string;
  visibilityLabel: string;
  source: string;
  sources: { SIMULATED: string; REAL: string };
  opticalConfigs: Record<OpticalConfig, string>;
};

export const collectionGalleryCopy: Record<"en" | "ka", CollectionCopy> = {
  en: {
    metadataTitle: `Collection · ${brand.en.name}`,
    metadataDescription: "Your personal archive of completed observations.",
    eyebrow: "Your observations",
    title: "A sky only you have seen.",
    description:
      "Every capture you take during an observation is kept here, with the settings the telescope used.",
    featured: "Latest capture",
    allCaptures: "Observation archive",
    allDescription: "Newest first, by the time the shutter closed.",
    olderCaptures: "Older captures",
    newestCaptures: "Back to the newest",
    view: "Open capture",
    imageAlt: (target) => `${target}, as captured`,
    simulated: "Simulated capture",
    noPreview: "No preview for this capture",
    retiredTarget: "A target no longer in the catalogue",
    visibility: { PRIVATE: "Private", GALLERY: "In the gallery" },
    profiles: {
      LUNAR: "Lunar",
      PLANETARY: "Planetary",
      DOUBLE_STAR: "Double star",
      GLOBULAR_CLUSTER: "Globular cluster",
      PLANETARY_NEBULA: "Planetary nebula",
      BRIGHT_NEBULA: "Bright nebula",
    },
    loading: "Loading your Collection…",
    empty: {
      title: "Your Collection is empty.",
      description: "Captures from your observations appear here.",
      action: "See tonight's targets",
    },
    noOlder: {
      title: "No older captures.",
      description: "This is the end of your Collection.",
      action: "Back to the newest",
    },
    unreachable: {
      title: "We couldn't load your Collection.",
      description: "Your captures are safe. Try again shortly.",
    },
  },
  ka: {
    metadataTitle: `კოლექცია · ${brand.ka.nominative}`,
    metadataDescription: "თქვენი დასრულებული დაკვირვებების პირადი არქივი.",
    eyebrow: "თქვენი დაკვირვებები",
    title: "ცა, რომელიც მხოლოდ თქვენ ნახეთ.",
    description:
      "დაკვირვებისას გადაღებული ყველა კადრი აქ ინახება, ტელესკოპის მიერ გამოყენებულ პარამეტრებთან ერთად.",
    featured: "ბოლო კადრი",
    allCaptures: "დაკვირვებების არქივი",
    allDescription: "ჯერ უახლესი, ჩამკეტის დახურვის დროის მიხედვით.",
    olderCaptures: "ძველი კადრები",
    newestCaptures: "უახლესებზე დაბრუნება",
    view: "კადრის გახსნა",
    imageAlt: (target) => `${target} — გადაღებული კადრი`,
    simulated: "სიმულირებული კადრი",
    noPreview: "ამ კადრს მინიატურა არ აქვს",
    retiredTarget: "ობიექტი, რომელიც კატალოგში აღარ არის",
    visibility: { PRIVATE: "პირადი", GALLERY: "გალერეაში" },
    profiles: {
      LUNAR: "მთვარის",
      PLANETARY: "პლანეტარული",
      DOUBLE_STAR: "ორმაგი ვარსკვლავი",
      GLOBULAR_CLUSTER: "სფერული გროვა",
      PLANETARY_NEBULA: "პლანეტარული ნისლეული",
      BRIGHT_NEBULA: "კაშკაშა ნისლეული",
    },
    loading: "კოლექცია იტვირთება…",
    empty: {
      title: "თქვენი კოლექცია ცარიელია.",
      description: "დაკვირვებისას გადაღებული კადრები აქ გამოჩნდება.",
      action: "ამაღამ ხილული ობიექტები",
    },
    noOlder: {
      title: "ძველი კადრები აღარ არის.",
      description: "ეს თქვენი კოლექციის დასასრულია.",
      action: "უახლესებზე დაბრუნება",
    },
    unreachable: {
      title: "კოლექციის ჩატვირთვა ვერ მოხერხდა.",
      description: "თქვენი კადრები დაცულია. სცადეთ ცოტა ხანში.",
    },
  },
};

export const captureDetailCopy: Record<"en" | "ka", CaptureDetailCopy> = {
  en: {
    back: "Your collection",
    capturedBy: "Captured by you",
    date: "Captured",
    observatory: "Observatory",
    aboutTarget: "About the target",
    imageFailed: "The full image could not be loaded. Try again.",
    download: "Download image",
    downloadFits: "Download FITS",
    noFits: "FITS was not recorded for this capture",
    downloadFailed: "The download link could not be created. Try again.",
    downloadNote:
      "Each download link is made when you ask for it, and expires soon after.",
    provenance: "Observation provenance",
    profile: "Imaging profile",
    optics: "Optics",
    solvedFocalLength: "Focal length, from the plate solve",
    exposure: "Exposure per frame",
    gain: "Gain",
    stack: "Stack",
    frames: (count) => `${count} ${count === 1 ? "frame" : "frames"}`,
    integration: "Total integration",
    frameSize: "Frame size",
    mission: "Mission",
    captureId: "Capture ID",
    visibilityLabel: "Visibility",
    source: "Source",
    sources: { SIMULATED: "Simulator, not the telescope", REAL: "The telescope" },
    opticalConfigs: {
      F20_BARLOW: "3000 mm · f/20, with Barlow",
      F10_NATIVE: "1500 mm · f/10, native",
      F6_3_REDUCER: "945 mm · f/6.3, with reducer",
    },
  },
  ka: {
    back: "თქვენი კოლექცია",
    capturedBy: "თქვენ მიერ გადაღებული",
    date: "გადაღებულია",
    observatory: "ობსერვატორია",
    aboutTarget: "ობიექტის შესახებ",
    imageFailed: "სრული კადრის ჩატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.",
    download: "კადრის ჩამოტვირთვა",
    downloadFits: "FITS-ის ჩამოტვირთვა",
    noFits: "ამ კადრისთვის FITS არ ჩაწერილა",
    downloadFailed: "ჩამოტვირთვის ბმული ვერ შეიქმნა. სცადეთ ხელახლა.",
    downloadNote: "ჩამოტვირთვის ბმული მოთხოვნისას იქმნება და მალე იწურება.",
    provenance: "დაკვირვების მონაცემები",
    profile: "გადაღების პროფილი",
    optics: "ოპტიკა",
    solvedFocalLength: "ფოკუსური მანძილი, ვარსკვლავური ამოხსნით",
    exposure: "ექსპოზიცია კადრზე",
    gain: "გაძლიერება",
    stack: "დასტა",
    frames: (count) => `${count} კადრი`,
    integration: "ჯამური ექსპოზიცია",
    frameSize: "კადრის ზომა",
    mission: "მისია",
    captureId: "კადრის ID",
    visibilityLabel: "ხილვადობა",
    source: "წყარო",
    sources: { SIMULATED: "სიმულატორი, არა ტელესკოპი", REAL: "ტელესკოპი" },
    opticalConfigs: {
      F20_BARLOW: "3000 mm · f/20, ბარლოუთი",
      F10_NATIVE: "1500 mm · f/10, საკუთარი",
      F6_3_REDUCER: "945 mm · f/6.3, რედუქტორით",
    },
  },
};
