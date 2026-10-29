import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type AuthenticatedHomeCopy = {
  metadataTitle: string;
  metadataDescription: string;
  greeting: (name: string | null) => string;
  tonight: string;
  recommendation: (target: string) => string;
  observe: (target: string) => string;
  exploreTonight: string;
  window: string;
  altitude: string;
  illustration: string;
  observatory: string;
  telescope: string;
  fullStatus: string;
  statusUnavailable: StateCopy;
  noObservatory: StateCopy;
  upcoming: string;
  simulated: string;
  openMission: string;
  retiredTarget: string;
  noUpcoming: StateCopy & { action: string };
  upcomingUnavailable: StateCopy;
  alsoTonight: string;
  alsoTonightDescription: string;
  collection: string;
  collectionDescription: string;
  openCollection: string;
};

export const authenticatedHomeCopy: Record<"en" | "ka", AuthenticatedHomeCopy> = {
  en: {
    metadataTitle: `Home · ${brand.en.name}`,
    metadataDescription: "Tonight's sky, sessions and Collection.",
    greeting: (name) => (name ? `Welcome back, ${name}.` : "Welcome back."),
    tonight: "Tonight",
    recommendation: (target) => `${target} is up tonight`,
    observe: (target) => `Observe ${target}`,
    exploreTonight: "See all tonight",
    window: "Window tonight",
    altitude: "Altitude now",
    illustration: "Illustration — not telescope output",
    observatory: "Observatory",
    telescope: "Telescope",
    fullStatus: "Full status",
    statusUnavailable: {
      title: "Status unavailable right now.",
      description: "Everything else works.",
    },
    noObservatory: {
      title: "No observatory is listed.",
      description: "Nothing to show yet.",
    },
    upcoming: "Upcoming sessions",
    simulated: "Simulated",
    openMission: "Open session",
    retiredTarget: "Object no longer offered",
    noUpcoming: {
      title: "No upcoming sessions.",
      description: "Book one for tonight.",
      action: "See tonight's sky",
    },
    upcomingUnavailable: {
      title: "Couldn't load your sessions.",
      description: "Try again shortly.",
    },
    alsoTonight: "Also up tonight",
    alsoTonightDescription: "More objects in reach tonight.",
    collection: "Your Collection",
    collectionDescription: "Your most recent captures.",
    openCollection: "Open Collection",
  },
  ka: {
    metadataTitle: `მთავარი · ${brand.ka.nominative}`,
    metadataDescription: "ამაღამინდელი ცა, სეანსები და კოლექცია.",
    greeting: (name) =>
      name ? `გამარჯობა, ${name}!` : "გამარჯობა!",
    tonight: "ამაღამ",
    recommendation: (target) => `${target} ამაღამ ჩანს`,
    observe: (target) => `დააკვირდი: ${target}`,
    exploreTonight: "ამაღამ რა ჩანს",
    window: "ამაღამ ჩანს",
    altitude: "სიმაღლე ახლა",
    illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    observatory: "ობსერვატორია",
    telescope: "ტელესკოპი",
    fullStatus: "სრული სტატუსი",
    statusUnavailable: {
      title: "სტატუსი ახლა მიუწვდომელია.",
      description: "დანარჩენი ჩვეულებრივ მუშაობს.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერ საჩვენებელი არაფერია.",
    },
    upcoming: "მომავალი სეანსები",
    simulated: "სიმულირებული",
    openMission: "სეანსის გახსნა",
    retiredTarget: "ობიექტი აღარ არის ხელმისაწვდომი",
    noUpcoming: {
      title: "მომავალი სეანსი არ გაქვს.",
      description: "დაჯავშნე ამაღამ.",
      action: "ამაღამ რა ჩანს",
    },
    upcomingUnavailable: {
      title: "სეანსები ვერ ჩაიტვირთა.",
      description: "ცოტა ხანში სცადე.",
    },
    alsoTonight: "ასევე ჩანს ამაღამ",
    alsoTonightDescription: "სხვა ობიექტები ამაღამ.",
    collection: "შენი კოლექცია",
    collectionDescription: "შენი ბოლო კადრები.",
    openCollection: "კოლექციის გახსნა",
  },
};
