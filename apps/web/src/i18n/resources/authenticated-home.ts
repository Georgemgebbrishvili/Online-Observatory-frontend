import { brand } from "@/brand";

type StateCopy = { title: string; description: string };

type AuthenticatedHomeCopy = {
  metadataTitle: string;
  metadataDescription: string;
  greeting: (name: string | null) => string;
  introduction: string;
  tonight: string;
  recommendation: (target: string) => string;
  observe: (target: string) => string;
  exploreTonight: string;
  window: string;
  altitude: string;
  illustration: string;
  observatory: string;
  telescope: string;
  simulatedObservatory: string;
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
    metadataDescription: "Your observatory, missions, and collection for tonight.",
    greeting: (name) => (name ? `Good evening, ${name}` : "Good evening."),
    introduction:
      "Here is what the observatory can see tonight, and what is ahead for you.",
    tonight: "Tonight",
    recommendation: (target) => `${target} is up tonight`,
    observe: (target) => `Observe ${target}`,
    exploreTonight: "See all tonight",
    window: "Window tonight",
    altitude: "Altitude now",
    illustration: "Illustration — not telescope output",
    observatory: "Observatory",
    telescope: "Telescope",
    simulatedObservatory: "Simulated observatory",
    fullStatus: "Full status",
    statusUnavailable: {
      title: "Observatory status is unavailable right now.",
      description: "The rest of this page is unaffected.",
    },
    noObservatory: {
      title: "No observatory is listed.",
      description: "There is nothing to report yet.",
    },
    upcoming: "Upcoming observations",
    simulated: "Simulated",
    openMission: "Open mission",
    retiredTarget: "A target no longer in the catalogue",
    noUpcoming: {
      title: "No upcoming observations.",
      description: "Book one from tonight's targets.",
      action: "See tonight's targets",
    },
    upcomingUnavailable: {
      title: "Your upcoming observations could not be loaded.",
      description: "Try again shortly.",
    },
    alsoTonight: "Also up tonight",
    alsoTonightDescription: "Other targets the observatory can reach tonight.",
    collection: "Your Collection",
    collectionDescription: "Your most recent captures.",
    openCollection: "Open collection",
  },
  ka: {
    metadataTitle: `მთავარი · ${brand.ka.nominative}`,
    metadataDescription: "თქვენი ობსერვატორია, მისიები და დღევანდელი კოლექცია.",
    greeting: (name) => (name ? `საღამო მშვიდობისა, ${name}` : "საღამო მშვიდობისა."),
    introduction: "აი, რას ხედავს ობსერვატორია დღეს ღამით და რა გელით წინ.",
    tonight: "დღეს ღამით",
    recommendation: (target) => `${target} დღეს ღამით ჩანს`,
    observe: (target) => `${target}-ზე დაკვირვება`,
    exploreTonight: "დღევანდელი ცის ნახვა",
    window: "დღევანდელი დრო",
    altitude: "სიმაღლე ახლა",
    illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    observatory: "ობსერვატორია",
    telescope: "ტელესკოპი",
    simulatedObservatory: "სიმულირებული ობსერვატორია",
    fullStatus: "სრული სტატუსი",
    statusUnavailable: {
      title: "ობსერვატორიის სტატუსი ახლა მიუწვდომელია.",
      description: "გვერდის დანარჩენი ნაწილი ჩვეულებრივ მუშაობს.",
    },
    noObservatory: {
      title: "ობსერვატორია არ არის მითითებული.",
      description: "ჯერჯერობით საანგარიშო არაფერია.",
    },
    upcoming: "დაგეგმილი დაკვირვებები",
    simulated: "სიმულაცია",
    openMission: "მისიის გახსნა",
    retiredTarget: "ობიექტი, რომელიც კატალოგში აღარ არის",
    noUpcoming: {
      title: "დაგეგმილი დაკვირვება არ არის.",
      description: "დაჯავშნეთ ამაღამ ხილული ობიექტებიდან.",
      action: "ამაღამ ხილული ობიექტები",
    },
    upcomingUnavailable: {
      title: "დაგეგმილი დაკვირვებების ჩატვირთვა ვერ მოხერხდა.",
      description: "სცადეთ ცოტა ხანში.",
    },
    alsoTonight: "ასევე ჩანს დღეს ღამით",
    alsoTonightDescription:
      "სხვა ობიექტები, რომლებსაც ობსერვატორია დღეს ღამით მისწვდება.",
    collection: "თქვენი კოლექცია",
    collectionDescription: "თქვენი ბოლო კადრები.",
    openCollection: "კოლექციის გახსნა",
  },
};
