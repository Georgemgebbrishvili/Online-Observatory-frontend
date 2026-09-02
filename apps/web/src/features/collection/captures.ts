import type { Locale } from "@/i18n/config";

export type CaptureVisibility = "PUBLIC" | "PRIVATE";
export type CapturePreset = "NATURAL" | "BRIGHT" | "DETAIL";

export type Capture = {
  id: string;
  targetId: string;
  target: Record<Locale, string>;
  catalogId: string;
  capturedAt: string;
  observatory: Record<Locale, string>;
  telescope: string;
  missionId: string;
  processingPreset: CapturePreset;
  thumbnailUrl: string;
  originalAssetUrl: string;
  fitsUrl?: string;
  visibility: CaptureVisibility;
  description: Record<Locale, string>;
};

export type ProgressCollection = {
  id: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  targetCatalogIds: string[];
};

const observatory = {
  en: "Darkview Tbilisi Observatory",
  ka: "Darkview თბილისის ობსერვატორია",
} as const;

export const captures: Capture[] = [
  {
    id: "CAP-DV-0001",
    targetId: "target-saturn",
    target: { en: "Saturn", ka: "სატურნი" },
    catalogId: "SATURN",
    capturedAt: "2026-08-25T19:58:00.000Z",
    observatory,
    telescope: "Celestron NexStar 6SE",
    missionId: "DV-SIM-001",
    processingPreset: "NATURAL",
    thumbnailUrl: "/captures/saturn-dv-0001.svg",
    originalAssetUrl: "/captures/saturn-dv-0001.svg",
    visibility: "PUBLIC",
    description: {
      en: "Saturn held steady at the center of the field, with its rings clearly separated from the planet.",
      ka: "სატურნი კადრის ცენტრში სტაბილურად იდგა, მისი რგოლები კი პლანეტისგან მკაფიოდ გამოყოფილი ჩანდა.",
    },
  },
  {
    id: "CAP-DV-0002",
    targetId: "target-moon",
    target: { en: "Lunar Terminator", ka: "მთვარის ტერმინატორი" },
    catalogId: "MOON",
    capturedAt: "2026-08-22T18:34:00.000Z",
    observatory,
    telescope: "Celestron NexStar 6SE",
    missionId: "DV-SIM-002",
    processingPreset: "DETAIL",
    thumbnailUrl: "/captures/moon-dv-0002.svg",
    originalAssetUrl: "/captures/moon-dv-0002.svg",
    visibility: "PRIVATE",
    description: {
      en: "Long evening shadows reveal the depth of craters along the lunar day-night boundary.",
      ka: "გრძელი საღამოს ჩრდილები მთვარის დღისა და ღამის საზღვარზე კრატერების სიღრმეს აჩენს.",
    },
  },
  {
    id: "CAP-DV-0004",
    targetId: "target-m31",
    target: { en: "Andromeda Galaxy", ka: "ანდრომედას გალაქტიკა" },
    catalogId: "M31",
    capturedAt: "2026-08-18T21:17:00.000Z",
    observatory,
    telescope: "Celestron NexStar 6SE",
    missionId: "DV-SIM-004",
    processingPreset: "BRIGHT",
    thumbnailUrl: "/captures/andromeda-dv-0004.svg",
    originalAssetUrl: "/captures/andromeda-dv-0004.svg",
    visibility: "PUBLIC",
    description: {
      en: "A quiet galactic core emerges through a wide field of stars, with the outer halo fading into darkness.",
      ka: "ვარსკვლავების ფართო ველში მშვიდი გალაქტიკური ბირთვი ჩნდება, გარე ჰალო კი სიბნელეში იკარგება.",
    },
  },
  {
    id: "CAP-DV-0003",
    targetId: "target-m13",
    target: { en: "Hercules Cluster", ka: "ჰერკულესის გროვა" },
    catalogId: "M13",
    capturedAt: "2026-08-12T20:46:00.000Z",
    observatory,
    telescope: "Celestron NexStar 6SE",
    missionId: "DV-SIM-003",
    processingPreset: "DETAIL",
    thumbnailUrl: "/captures/m13-dv-0003.svg",
    originalAssetUrl: "/captures/m13-dv-0003.svg",
    visibility: "PRIVATE",
    description: {
      en: "The dense heart of M13 resolves outward into hundreds of ancient stellar points.",
      ka: "M13-ის მკვრივი გული გარეთ ასობით უძველეს ვარსკვლავურ წერტილად იშლება.",
    },
  },
];

export const progressCollections: ProgressCollection[] = [
  {
    id: "solar-system",
    title: { en: "Solar System", ka: "მზის სისტემა" },
    description: {
      en: "Our nearest worlds, observed one by one.",
      ka: "ჩვენთან უახლოესი სამყაროები, თითოეული დაკვირვებით.",
    },
    targetCatalogIds: ["MOON", "SATURN", "JUPITER", "MARS"],
  },
  {
    id: "messier-starter",
    title: { en: "Messier Starter", ka: "მესიეს დასაწყისი" },
    description: {
      en: "A first path through the classic Messier catalog.",
      ka: "პირველი გზა მესიეს კლასიკურ კატალოგში.",
    },
    targetCatalogIds: ["M13", "M31", "M42", "M57", "M27"],
  },
  {
    id: "deep-sky",
    title: { en: "Deep Sky", ka: "ღრმა ცა" },
    description: {
      en: "Clusters, galaxies, and nebulae beyond the Solar System.",
      ka: "გროვები, გალაქტიკები და ნისლეულები მზის სისტემის მიღმა.",
    },
    targetCatalogIds: ["M13", "M31", "M42", "M57", "M27", "NGC 7000"],
  },
];

export function getCapture(captureId: string) {
  return captures.find((capture) => capture.id === captureId);
}

export function getCollectionProgress(collection: ProgressCollection) {
  const capturedCatalogIds = new Set(captures.map((capture) => capture.catalogId));
  const completed = collection.targetCatalogIds.filter((id) =>
    capturedCatalogIds.has(id),
  ).length;

  return {
    completed,
    total: collection.targetCatalogIds.length,
    percentage: Math.round((completed / collection.targetCatalogIds.length) * 100),
  };
}
