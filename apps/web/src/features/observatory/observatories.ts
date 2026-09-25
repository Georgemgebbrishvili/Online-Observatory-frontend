import type { ObservatoryStatusValue } from "@/components/observatory/observatory-status";
import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

type LocalizedText = Record<Locale, string>;

export type EquipmentConfigurationStatus = "EXPECTED_MVP" | "FINALIZED";

export type TelescopeConfiguration = {
  manufacturer: string;
  model: string;
  type: LocalizedText;
  aperture: string;
  focalLength: string;
  mount: LocalizedText;
  configurationStatus: EquipmentConfigurationStatus;
};

export type CameraConfiguration = {
  manufacturer?: string;
  model?: string;
  type: LocalizedText;
  cooling: LocalizedText;
  connection: LocalizedText;
  configurationStatus: EquipmentConfigurationStatus;
};

export type ObservatorySite = {
  id: string;
  name: LocalizedText;
  location: LocalizedText;
  coordinates: { latitude: number; longitude: number };
  status: ObservatoryStatusValue;
  statusMode: "DEMONSTRATION" | "TELEMETRY";
  telescope: TelescopeConfiguration;
  camera: CameraConfiguration;
  capabilities: string[];
};

export const observatories: ObservatorySite[] = [
  {
    id: "tbilisi-01",
    name: {
      en: `${brand.en.name} Tbilisi Observatory`,
      ka: `${brand.ka.genitive} თბილისის ობსერვატორია`,
    },
    location: { en: "Tbilisi, Georgia", ka: "თბილისი, საქართველო" },
    coordinates: { latitude: 41.72, longitude: 44.79 },
    status: "ONLINE",
    statusMode: "DEMONSTRATION",
    telescope: {
      manufacturer: "Celestron",
      model: "NexStar 6SE",
      type: { en: "Schmidt-Cassegrain", ka: "შმიდტ-კასეგრენი" },
      aperture: "150 mm",
      focalLength: "1500 mm",
      mount: { en: "Computerized alt-azimuth", ka: "კომპიუტერული ალტ-აზიმუტური" },
      configurationStatus: "EXPECTED_MVP",
    },
    camera: {
      type: { en: "Cooled astronomy camera", ka: "გაგრილებადი ასტრონომიული კამერა" },
      cooling: { en: "Regulated sensor cooling", ka: "სენსორის რეგულირებადი გაგრილება" },
      connection: {
        en: "Observatory computer only",
        ka: "მხოლოდ ობსერვატორიის კომპიუტერთან",
      },
      configurationStatus: "EXPECTED_MVP",
    },
    capabilities: ["PLANETARY", "LUNAR", "BRIGHT_DEEP_SKY"],
  },
];

export const missionOperations = [
  { id: "request", label: { en: "Request", ka: "მოთხოვნა" } },
  {
    id: "safety-validation",
    label: { en: "Safety validation", ka: "უსაფრთხოების შემოწმება" },
  },
  {
    id: "telescope-movement",
    label: { en: "Telescope movement", ka: "ტელესკოპის მოძრაობა" },
  },
  {
    id: "position-verification",
    label: { en: "Position verification", ka: "პოზიციის გადამოწმება" },
  },
  { id: "imaging", label: { en: "Imaging", ka: "გადაღება" } },
  { id: "capture", label: { en: "Capture", ka: "კადრი" } },
] as const;

export const observatorySafetyChecks = [
  {
    id: "visibility",
    title: { en: "Target visibility", ka: "სამიზნის ხილვადობა" },
    description: {
      en: "The object must be high enough above the local horizon for a useful observation.",
      ka: "ობიექტი ადგილობრივ ჰორიზონტზე საკმარისად მაღლა უნდა იყოს სასარგებლო დაკვირვებისთვის.",
    },
  },
  {
    id: "movement",
    title: { en: "Movement limits", ka: "მოძრაობის საზღვრები" },
    description: {
      en: "Every planned movement stays inside configured mechanical and horizon limits.",
      ka: "ყოველი დაგეგმილი მოძრაობა მექანიკურ და ჰორიზონტის დადგენილ საზღვრებში რჩება.",
    },
  },
  {
    id: "ownership",
    title: { en: "Session ownership", ka: "სესიის მფლობელობა" },
    description: {
      en: "Only the active mission can request its approved observation sequence.",
      ka: "დამტკიცებული დაკვირვების თანმიმდევრობის მოთხოვნა მხოლოდ აქტიურ მისიას შეუძლია.",
    },
  },
  {
    id: "sun",
    title: { en: "Sun avoidance", ka: "მზისგან დაცვა" },
    description: {
      en: "Unsafe directions near the Sun are rejected before telescope movement begins.",
      ka: "მზესთან ახლოს სახიფათო მიმართულებები ტელესკოპის მოძრაობამდე იბლოკება.",
    },
  },
  {
    id: "readiness",
    title: { en: "Observatory readiness", ka: "ობსერვატორიის მზადყოფნა" },
    description: {
      en: "The telescope, camera, enclosure, and local conditions must all be ready.",
      ka: "ტელესკოპი, კამერა, ნაგებობა და ადგილობრივი პირობები სრულად მზად უნდა იყოს.",
    },
  },
] as const;

export function getObservatory(observatoryId: string) {
  return observatories.find((observatory) => observatory.id === observatoryId);
}
