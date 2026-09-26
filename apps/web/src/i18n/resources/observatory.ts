import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type ObservatoryPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  statement: string;
  liveStatus: string;
  fullStatus: string;
  observingNow: (target: string) => string;
  missionInProgress: string;
  statusUnavailable: StateCopy;
  noObservatory: StateCopy;
  tonight: string;
  tonightDescription: string;
  seeTonight: string;
  openLive: string;
  liveNote: string;
  instrument: string;
  telescope: string;
  aperture: string;
  focalLength: string;
  camera: string;
  cameraModel: string;
  cameraType: string;
  drawing: string;
  missionTitle: string;
  missionDescription: string;
  safety: string;
  safetyDescription: string;
  futureNetwork: string;
  futureDescription: string;
  activeSite: string;
  noPartners: string;
  networkFoundation: string;
};

export const observatoryPageCopy: Record<"en" | "ka", ObservatoryPageCopy> = {
  en: {
    metadataTitle: `${brand.en.name} Tbilisi Observatory`,
    metadataDescription: `${brand.en.name}'s live remote telescope in Tbilisi: its status right now, tonight's targets, and the instrument.`,
    eyebrow: "LIVE REMOTE OBSERVATORY · TBILISI",
    statement: `${brand.en.name} operates a physical telescope system remotely through secure observatory software.`,
    liveStatus: "Live status",
    fullStatus: "Full status",
    observingNow: (target) => `Observing now: ${target}`,
    missionInProgress: "An observation is in progress",
    statusUnavailable: {
      title: "The observatory's status is unavailable right now.",
      description: "Nothing below is affected. Try the full status page shortly.",
    },
    noObservatory: {
      title: "No observatory is listed.",
      description: "There is nothing to report yet.",
    },
    tonight: "Tonight",
    tonightDescription: "Targets the telescope can reach tonight.",
    seeTonight: "See tonight's targets",
    openLive: "Open the live view",
    liveNote: "Signed-in observers only.",
    instrument: "The instrument",
    telescope: "Telescope",
    aperture: "aperture",
    focalLength: "focal length",
    camera: "Camera",
    cameraModel: "ZWO ASI585MC",
    cameraType: "One-shot colour camera",
    drawing: "Drawing",
    missionTitle: "What happens during a mission",
    missionDescription:
      "A request becomes a capture through a protected sequence managed beside the telescope—not by unrestricted browser controls.",
    safety: "Safety comes before movement",
    safetyDescription: `Before anything moves, ${brand.en.name} checks that the mission is allowed, the equipment is ready, and the requested direction is safe.`,
    futureNetwork: "Future network",
    futureDescription:
      "The architecture supports additional observatories, but only physically integrated and verified sites will appear here.",
    activeSite: "Single active site",
    noPartners: "No future observatory partners are being represented.",
    networkFoundation: "Explore the network foundation",
  },
  ka: {
    metadataTitle: `${brand.ka.genitive} თბილისის ობსერვატორია`,
    metadataDescription: `${brand.ka.genitive} დისტანციური ტელესკოპი თბილისში: მისი სტატუსი ახლა, დღევანდელი ობიექტები და ინსტრუმენტი.`,
    eyebrow: "დისტანციური ობსერვატორია · თბილისი",
    statement: `${brand.ka.nominative} ფიზიკურ ტელესკოპურ სისტემას უსაფრთხო ობსერვატორიული პროგრამით დისტანციურად მართავს.`,
    liveStatus: "სტატუსი ახლა",
    fullStatus: "სრული სტატუსი",
    observingNow: (target) => `ახლა დაკვირვება მიმდინარეობს: ${target}`,
    missionInProgress: "დაკვირვება მიმდინარეობს",
    statusUnavailable: {
      title: "ობსერვატორიის სტატუსი ახლა მიუწვდომელია.",
      description:
        "ქვემოთ მოცემულ ინფორმაციაზე ეს გავლენას არ ახდენს. სცადეთ სრული სტატუსის გვერდი ცოტა ხანში.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერჯერობით საანგარიშო არაფერია.",
    },
    tonight: "დღეს ღამით",
    tonightDescription: "ობიექტები, რომლებსაც ტელესკოპი დღეს ღამით მისწვდება.",
    seeTonight: "ამაღამ ხილული ობიექტები",
    openLive: "პირდაპირი ხედის გახსნა",
    liveNote: "მხოლოდ ავტორიზებული დამკვირვებლებისთვის.",
    instrument: "ინსტრუმენტი",
    telescope: "ტელესკოპი",
    aperture: "აპერტურა",
    focalLength: "ფოკუსური მანძილი",
    camera: "კამერა",
    cameraModel: "ZWO ASI585MC",
    cameraType: "ფერადი (OSC) კამერა",
    drawing: "ნახაზი",
    missionTitle: "რა ხდება მისიის დროს",
    missionDescription:
      "მოთხოვნა კადრად ტელესკოპთან დაცული თანმიმდევრობის გავლით იქცევა — არა ბრაუზერის შეუზღუდავი მართვით.",
    safety: "უსაფრთხოება მოძრაობაზე წინ დგას",
    safetyDescription: `ნებისმიერი მოძრაობის წინ ${brand.ka.nominative} ამოწმებს, რომ მისია ნებადართულია, მოწყობილობა მზადაა და მიმართულება უსაფრთხოა.`,
    futureNetwork: "სამომავლო ქსელი",
    futureDescription:
      "არქიტექტურა დამატებით ობსერვატორიებს უჭერს მხარს, თუმცა აქ მხოლოდ ფიზიკურად ინტეგრირებული და დადასტურებული ადგილები გამოჩნდება.",
    activeSite: "ერთი აქტიური ადგილი",
    noPartners: "სამომავლო ობსერვატორიის პარტნიორები წარმოდგენილი არ არის.",
    networkFoundation: "ქსელის საფუძვლის ნახვა",
  },
};
