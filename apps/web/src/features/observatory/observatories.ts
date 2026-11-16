import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

type LocalizedText = Record<Locale, string>;

export type EquipmentConfigurationStatus = "EXPECTED_MVP" | "FINALIZED";

export type TelescopeConfiguration = {
  type: LocalizedText;
  aperture: string;
  focalLength: string;
  mount: LocalizedText;
  configurationStatus: EquipmentConfigurationStatus;
};

export type ObservatorySite = {
  id: string;
  name: LocalizedText;
  telescope: TelescopeConfiguration;
  capabilities: string[];
};

export const observatories: ObservatorySite[] = [
  {
    id: "tbilisi-01",
    name: {
      en: `${brand.en.name} Observatory`,
      ka: `${brand.ka.genitive} ობსერვატორია`,
    },
    telescope: {
      type: { en: "Schmidt-Cassegrain", ka: "შმიდტ-კასეგრენი" },
      aperture: "203 mm",
      focalLength: "2032 mm",
      mount: { en: "Computerized alt-azimuth", ka: "კომპიუტერიზებული ალტაზიმუტური" },
      configurationStatus: "EXPECTED_MVP",
    },
    capabilities: ["PLANETARY", "LUNAR", "BRIGHT_DEEP_SKY"],
  },
];

export function getObservatory(observatoryId: string) {
  return observatories.find((observatory) => observatory.id === observatoryId);
}
