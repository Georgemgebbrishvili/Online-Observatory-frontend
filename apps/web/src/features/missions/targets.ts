import type { Locale } from "@/i18n/config";

export const targetTypes = [
  "Planet",
  "Moon",
  "Galaxy",
  "Nebula",
  "Cluster",
  "Star",
] as const;

export type TargetType = (typeof targetTypes)[number];
export type VisibilityRating = "excellent" | "good" | "fair" | "unavailable";
export type ImagePreset = "moon" | "saturn" | "galaxy" | "cluster" | "nebula" | "star";

type LocalizedText = Record<Locale, string>;

export type MissionTarget = {
  id: string;
  slug: string;
  catalogId: string;
  commonName: string;
  georgianName: string;
  type: TargetType;
  ra: string;
  dec: string;
  magnitude: number;
  angularSize: string;
  description: LocalizedText;
  minimumAltitude: number;
  preferredObservationDuration: number;
  imagePreset: ImagePreset;
  bestMonths: number[];
  observatoryCompatibility: string[];
  currentVisibility: {
    rating: VisibilityRating;
    altitude: number;
    window: string;
  };
  qualityScore: number;
  difficulty: LocalizedText;
  expectation: LocalizedText;
};

export const configuredSafetyAltitude = 25;
export const activeObservatoryId = "tbilisi-01";

export const missionTargets: MissionTarget[] = [
  {
    id: "target-saturn",
    slug: "saturn",
    catalogId: "SATURN",
    commonName: "Saturn",
    georgianName: "სატურნი",
    type: "Planet",
    ra: "23h 12m 41s",
    dec: "−06° 42′ 18″",
    magnitude: 0.8,
    angularSize: "18.4″",
    description: {
      en: "A ringed world whose shape is visible in a single, carefully timed observation.",
      ka: "რგოლებიანი სამყარო, რომლის გამორჩეული ფორმაც ერთ ზუსტად შერჩეულ დაკვირვებაში ჩანს.",
    },
    minimumAltitude: 25,
    preferredObservationDuration: 12,
    imagePreset: "saturn",
    bestMonths: [8, 9, 10, 11],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "excellent", altitude: 48, window: "21:40–23:15" },
    qualityScore: 96,
    difficulty: { en: "Easy", ka: "მარტივი" },
    expectation: {
      en: "A bright planetary disc, its rings, and a chance of seeing Titan beside it.",
      ka: "კაშკაშა პლანეტარული დისკო, რგოლები და შესაძლოა მის გვერდით ტიტანიც.",
    },
  },
  {
    id: "target-moon",
    slug: "moon",
    catalogId: "MOON",
    commonName: "Moon",
    georgianName: "მთვარე",
    type: "Moon",
    ra: "20h 18m 07s",
    dec: "−24° 11′ 42″",
    magnitude: -11.2,
    angularSize: "31.2′",
    description: {
      en: "A high-contrast landscape of craters, ridges, and long shadows along the terminator.",
      ka: "კრატერების, ქედებისა და ტერმინატორთან გაწოლილი გრძელი ჩრდილების კონტრასტული ლანდშაფტი.",
    },
    minimumAltitude: 20,
    preferredObservationDuration: 8,
    imagePreset: "moon",
    bestMonths: [1, 2, 3, 9, 10, 11, 12],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "excellent", altitude: 61, window: "20:10–22:30" },
    qualityScore: 92,
    difficulty: { en: "Very easy", ka: "ძალიან მარტივი" },
    expectation: {
      en: "Sharp crater detail and dramatic relief where lunar day meets night.",
      ka: "მკვეთრი კრატერები და დრამატული რელიეფი მთვარის დღისა და ღამის საზღვარზე.",
    },
  },
  {
    id: "target-m13",
    slug: "hercules-cluster",
    catalogId: "M13",
    commonName: "Hercules Cluster",
    georgianName: "ჰერკულესის გროვა",
    type: "Cluster",
    ra: "16h 41m 41s",
    dec: "+36° 27′ 36″",
    magnitude: 5.8,
    angularSize: "20′",
    description: {
      en: "A dense globe of ancient stars suspended in the constellation Hercules.",
      ka: "უძველესი ვარსკვლავების მჭიდრო სფერო ჰერკულესის თანავარსკვლავედში.",
    },
    minimumAltitude: 28,
    preferredObservationDuration: 14,
    imagePreset: "cluster",
    bestMonths: [5, 6, 7, 8, 9],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "good", altitude: 44, window: "20:50–22:40" },
    qualityScore: 86,
    difficulty: { en: "Moderate", ka: "საშუალო" },
    expectation: {
      en: "A luminous core resolving into hundreds of fine stellar points.",
      ka: "მანათობელი ბირთვი, რომელიც ასობით წვრილ ვარსკვლავურ წერტილად იშლება.",
    },
  },
  {
    id: "target-m31",
    slug: "andromeda-galaxy",
    catalogId: "M31",
    commonName: "Andromeda Galaxy",
    georgianName: "ანდრომედას გალაქტიკა",
    type: "Galaxy",
    ra: "00h 42m 44s",
    dec: "+41° 16′ 09″",
    magnitude: 3.4,
    angularSize: "3.2° × 1°",
    description: {
      en: "Our nearest large galactic neighbor, seen as a soft elongated island of light.",
      ka: "ჩვენთან უახლოესი დიდი გალაქტიკა — რბილი, წაგრძელებული სინათლის კუნძული.",
    },
    minimumAltitude: 30,
    preferredObservationDuration: 18,
    imagePreset: "galaxy",
    bestMonths: [8, 9, 10, 11, 12],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "good", altitude: 39, window: "22:20–01:10" },
    qualityScore: 90,
    difficulty: { en: "Moderate", ka: "საშუალო" },
    expectation: {
      en: "A bright galactic core with a wide, faint halo extending into the dark.",
      ka: "კაშკაშა გალაქტიკური ბირთვი და სუსტი ფართო ჰალო, რომელიც სიბნელეში იშლება.",
    },
  },
  {
    id: "target-m57",
    slug: "ring-nebula",
    catalogId: "M57",
    commonName: "Ring Nebula",
    georgianName: "რგოლის ნისლეული",
    type: "Nebula",
    ra: "18h 53m 35s",
    dec: "+33° 01′ 45″",
    magnitude: 8.8,
    angularSize: "1.4′ × 1.0′",
    description: {
      en: "A compact shell of glowing gas left by a star at the end of its life.",
      ka: "სიცოცხლის ბოლოს მყოფი ვარსკვლავის მიერ დატოვებული მანათობელი აირის კომპაქტური გარსი.",
    },
    minimumAltitude: 30,
    preferredObservationDuration: 16,
    imagePreset: "nebula",
    bestMonths: [6, 7, 8, 9, 10],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "good", altitude: 36, window: "20:45–22:55" },
    qualityScore: 84,
    difficulty: { en: "Challenging", ka: "რთული" },
    expectation: {
      en: "A small smoke-ring shape with a darker center and subtle cyan edge.",
      ka: "პატარა კვამლის რგოლის ფორმა, მუქი ცენტრითა და მსუბუქი ცისფერი კიდით.",
    },
  },
  {
    id: "target-m27",
    slug: "dumbbell-nebula",
    catalogId: "M27",
    commonName: "Dumbbell Nebula",
    georgianName: "ჰანტელის ნისლეული",
    type: "Nebula",
    ra: "19h 59m 36s",
    dec: "+22° 43′ 16″",
    magnitude: 7.4,
    angularSize: "8′ × 5.6′",
    description: {
      en: "An expanding veil of stellar gas with a broad, hourglass-like profile.",
      ka: "ვარსკვლავური აირის გაფართოებადი ფარდა, ფართო ქვიშის საათის მსგავსი ფორმით.",
    },
    minimumAltitude: 28,
    preferredObservationDuration: 16,
    imagePreset: "nebula",
    bestMonths: [6, 7, 8, 9, 10],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "fair", altitude: 31, window: "21:15–23:35" },
    qualityScore: 78,
    difficulty: { en: "Challenging", ka: "რთული" },
    expectation: {
      en: "A pale, structured cloud whose shape becomes clearer through longer exposure.",
      ka: "ფერმკრთალი სტრუქტურული ღრუბელი, რომლის ფორმაც ხანგრძლივი ექსპოზიციით მკაფიო ხდება.",
    },
  },
  {
    id: "target-albireo",
    slug: "albireo",
    catalogId: "β CYG",
    commonName: "Albireo",
    georgianName: "ალბირეო",
    type: "Star",
    ra: "19h 30m 43s",
    dec: "+27° 57′ 35″",
    magnitude: 3.1,
    angularSize: "34.7″ separation",
    description: {
      en: "A celebrated double star whose two points contrast in amber and blue.",
      ka: "ცნობილი ორმაგი ვარსკვლავი, რომლის ორი წერტილი ქარვისფრად და ლურჯად კონტრასტობს.",
    },
    minimumAltitude: 25,
    preferredObservationDuration: 10,
    imagePreset: "star",
    bestMonths: [6, 7, 8, 9, 10],
    observatoryCompatibility: ["tbilisi-01"],
    currentVisibility: { rating: "good", altitude: 33, window: "20:35–22:15" },
    qualityScore: 81,
    difficulty: { en: "Easy", ka: "მარტივი" },
    expectation: {
      en: "Two clean stellar points with a striking warm-and-cool color contrast.",
      ka: "ორი მკვეთრი ვარსკვლავური წერტილი თბილი და ცივი ფერების გამორჩეული კონტრასტით.",
    },
  },
];

const visibilityWeight: Record<VisibilityRating, number> = {
  excellent: 100,
  good: 76,
  fair: 48,
  unavailable: 0,
};

export function targetRank(target: MissionTarget) {
  const requiredAltitude = Math.max(configuredSafetyAltitude, target.minimumAltitude);
  const altitudeMargin = Math.max(
    0,
    target.currentVisibility.altitude - requiredAltitude,
  );
  const altitudeScore = Math.min(100, altitudeMargin * 5);
  const compatible = target.observatoryCompatibility.includes(activeObservatoryId);

  return (
    visibilityWeight[target.currentVisibility.rating] * 0.35 +
    altitudeScore * 0.25 +
    (compatible ? 100 : 0) * 0.2 +
    target.qualityScore * 0.2
  );
}

export const rankedMissionTargets = [...missionTargets]
  .filter(
    (target) =>
      target.currentVisibility.rating !== "unavailable" &&
      target.currentVisibility.altitude >=
        Math.max(configuredSafetyAltitude, target.minimumAltitude) &&
      target.observatoryCompatibility.includes(activeObservatoryId),
  )
  .sort((a, b) => targetRank(b) - targetRank(a));

export function getMissionTarget(slug: string) {
  return missionTargets.find((target) => target.slug === slug);
}
