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

export type ObservatorySite = {
  id: string;
  name: LocalizedText;
  location: LocalizedText;
  status: ObservatoryStatusValue;
  statusMode: "DEMONSTRATION" | "TELEMETRY";
  telescope: TelescopeConfiguration;
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
    capabilities: ["PLANETARY", "LUNAR", "BRIGHT_DEEP_SKY"],
  },
];

export function getObservatory(observatoryId: string) {
  return observatories.find((observatory) => observatory.id === observatoryId);
}
