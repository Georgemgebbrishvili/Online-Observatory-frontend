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
  title: string;
  featured: string;
  allCaptures: string;
  allDescription: string;
  olderCaptures: string;
  newestCaptures: string;
  /** ADR-051: the past nights, each a mission with what it kept. */
  nights: string;
  nightsDescription: string;
  noNights: string;
  openNight: string;
  nightCaptures: (count: number) => string;
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
    title: "A sky only you have seen.",
    featured: "Latest capture",
    allCaptures: "Observation archive",
    allDescription: "Newest first, by the time the shutter closed.",
    olderCaptures: "Older captures",
    newestCaptures: "Back to the newest",
    nights: "Past nights",
    nightsDescription:
      "Every observation you have made, latest first, with what it kept.",
    noNights: "No nights yet. Your first observation will appear here once it ends.",
    openNight: "Open the night",
    nightCaptures: (count: number) => (count === 1 ? "1 capture" : `${count} captures`),
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
    metadataDescription: "შენი დასრულებული დაკვირვებების პირადი არქივი.",
    title: "ცა, რომელიც მხოლოდ შენ ნახე.",
    featured: "ბოლო კადრი",
    allCaptures: "დაკვირვებების არქივი",
    allDescription: "უახლესი პირველად, გადაღების დროის მიხედვით.",
    olderCaptures: "ძველი კადრები",
    newestCaptures: "უახლესებზე დაბრუნება",
    nights: "წარსული ღამეები",
    nightsDescription:
      "ყველა შენი დაკვირვება, უახლესი პირველად, თითოეული თავისი კადრებით.",
    noNights: "ღამეები ჯერ არ არის. პირველი დაკვირვება აქ გამოჩნდება, როცა დასრულდება.",
    openNight: "ღამის გახსნა",
    nightCaptures: (count: number) => `${count} კადრი`,
    view: "კადრის გახსნა",
    imageAlt: (target) => `${target} — გადაღებული კადრი`,
    simulated: "სიმულირებული კადრი",
    noPreview: "ამ კადრს მინიატურა არ აქვს",
    retiredTarget: "ობიექტი, რომელიც კატალოგში აღარ არის",
    visibility: { PRIVATE: "პირადი", GALLERY: "გალერეაში" },
    profiles: {
      LUNAR: "მთვარე",
      PLANETARY: "პლანეტა",
      DOUBLE_STAR: "ორმაგი ვარსკვლავი",
      GLOBULAR_CLUSTER: "სფერული გროვა",
      PLANETARY_NEBULA: "პლანეტარული ნისლეული",
      BRIGHT_NEBULA: "კაშკაშა ნისლეული",
    },
    loading: "კოლექცია იტვირთება…",
    empty: {
      title: "შენი კოლექცია ცარიელია.",
      description: "დაკვირვებისას გადაღებული კადრები აქ გამოჩნდება.",
      action: "ამაღამ ხილული ობიექტები",
    },
    noOlder: {
      title: "ძველი კადრები აღარ არის.",
      description: "ეს შენი კოლექციის დასასრულია.",
      action: "უახლესებზე დაბრუნება",
    },
    unreachable: {
      title: "კოლექციის ჩატვირთვა ვერ მოხერხდა.",
      description: "შენი კადრები დაცულია. სცადე ცოტა ხანში.",
    },
  },
};

export const captureDetailCopy: Record<"en" | "ka", CaptureDetailCopy> = {
  en: {
    back: "Your Collection",
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
      F20_BARLOW: "4064 mm · f/20, with Barlow",
      F10_NATIVE: "2032 mm · f/10, native",
      F6_3_REDUCER: "1280 mm · f/6.3, with reducer",
    },
  },
  ka: {
    back: "შენი კოლექცია",
    capturedBy: "შენ მიერ გადაღებული",
    date: "გადაღებულია",
    observatory: "ობსერვატორია",
    aboutTarget: "ობიექტის შესახებ",
    imageFailed: "სრული კადრის ჩატვირთვა ვერ მოხერხდა. სცადე ხელახლა.",
    download: "კადრის ჩამოტვირთვა",
    downloadFits: "FITS-ის ჩამოტვირთვა",
    noFits: "ამ კადრისთვის FITS არ ჩაწერილა",
    downloadFailed: "ჩამოტვირთვის ბმული ვერ შეიქმნა. სცადე ხელახლა.",
    downloadNote: "ჩამოტვირთვის ბმული მოთხოვნისას იქმნება და მალევე ვადა ეწურება.",
    provenance: "დაკვირვების მონაცემები",
    profile: "გადაღების პროფილი",
    optics: "ოპტიკა",
    solvedFocalLength: "ფოკუსური მანძილი, კადრის ამოცნობით გაზომილი",
    exposure: "ექსპოზიცია კადრზე",
    gain: "გაძლიერება",
    stack: "დაჯამება",
    frames: (count) => `${count} კადრი`,
    integration: "ჯამური ექსპოზიცია",
    frameSize: "კადრის ზომა",
    mission: "მისია",
    captureId: "კადრის ID",
    visibilityLabel: "ხილვადობა",
    source: "წყარო",
    sources: { SIMULATED: "სიმულატორი, არა ტელესკოპი", REAL: "ტელესკოპი" },
    opticalConfigs: {
      F20_BARLOW: "4064 მმ · f/20, ბარლოუთი",
      F10_NATIVE: "2032 მმ · f/10, ძირითადი",
      F6_3_REDUCER: "1280 მმ · f/6.3, რედუქტორით",
    },
  },
};

/** ADR-065: the owner's sharing controls on a capture. */
export const captureSharingCopy = {
  en: {
    title: "Share",
    private: "Only you can see this capture.",
    public: "Anyone with the link can see this capture. Your name is never shown.",
    makePublic: "Make public",
    makePrivate: "Make private",
    saving: "Saving…",
    copyLink: "Copy link",
    copied: "Link copied.",
    share: "Share",
    linkLabel: "Public link",
    simulated: "Simulated captures cannot be shared — they are not telescope output.",
    failed: "That did not save. Try again.",
  },
  ka: {
    title: "გაზიარება",
    private: "ამ კადრს მხოლოდ შენ ხედავ.",
    public: "ამ კადრს ხედავს ყველა, ვისაც ბმული აქვს. შენი სახელი არსად ჩანს.",
    makePublic: "საჯაროდ გახდომა",
    makePrivate: "პირადად დაბრუნება",
    saving: "ინახება…",
    copyLink: "ბმულის კოპირება",
    copied: "ბმული დაკოპირდა.",
    share: "გაზიარება",
    linkLabel: "საჯარო ბმული",
    simulated:
      "სიმულირებული კადრის გაზიარება შეუძლებელია — ის ტელესკოპის გამოსახულება არ არის.",
    failed: "ვერ შეინახა. სცადე თავიდან.",
  },
} as const;

/** ADR-065: the public page of a shared capture. */
export const galleryPageCopy = {
  en: {
    metadataTitle: "{target}, through the telescope",
    metadataDescription: "{target} on {date}, live from the observatory in Georgia.",
    kicker: "Seen through a real telescope",
    taken: "Taken",
    place: "Where",
    placeValue: "Georgia",
    instrument: "Telescope",
    instrumentValue: "{aperture} mm aperture · {focal} mm focal length",
    exposure: "Exposure",
    stack: "Stack",
    integration: "Total light",
    frames: "{count} frames",
    imageAlt: "{target}, captured live through the telescope",
    callTitle: "See it yourself",
    callBody:
      "Book a night and the telescope turns to the object you choose. You watch it live and keep what you capture.",
    call: "Book your own night",
  },
  ka: {
    metadataTitle: "{target} — ტელესკოპით",
    metadataDescription: "{target}, {date}, პირდაპირ ობსერვატორიიდან, საქართველო.",
    kicker: "დანახული ნამდვილი ტელესკოპით",
    taken: "გადაღებულია",
    place: "სად",
    placeValue: "საქართველო",
    instrument: "ტელესკოპი",
    instrumentValue: "აპერტურა {aperture} მმ · ფოკუსური მანძილი {focal} მმ",
    exposure: "ექსპოზიცია",
    stack: "დაჯამება",
    integration: "სულ სინათლე",
    frames: "{count} კადრი",
    imageAlt: "{target}, გადაღებული პირდაპირ ტელესკოპით",
    callTitle: "ნახე შენ თვითონ",
    callBody:
      "დაჯავშნე სეანსი და ტელესკოპი შენ მიერ არჩეულ ობიექტზე მოტრიალდება. უყურებ პირდაპირ ეთერში და გადაღებულს ინახავ.",
    call: "დაჯავშნე სეანსი",
  },
} as const;
