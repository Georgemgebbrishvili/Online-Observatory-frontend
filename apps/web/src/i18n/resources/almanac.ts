import type {
  AlmanacEvent,
  EclipseKindName,
  MoonPhaseName,
  Planet,
  SeasonName,
  Shower,
} from "@/features/booking/almanac";

/** The booking calendar's words: its frame, and a title and a note for every sky event. */
export type AlmanacCopy = {
  previousMonth: string;
  nextMonth: string;
  special: string;
  nothingThisMonth: string;
  nothingTonight: string;
  notYet: string;
  past: string;
  moonLit: (lit: number) => string;
  legendOpen: string;
  computed: string;
  title: (event: AlmanacEvent) => string;
  note: (event: AlmanacEvent) => string;
};

type Words = {
  planet: Record<Planet, string>;
  phase: Record<MoonPhaseName, [string, string]>;
  season: Record<SeasonName, [string, string]>;
  shower: Record<Shower, string>;
  lunar: Record<EclipseKindName, string>;
  solar: Record<EclipseKindName, string>;
};

const en: Words = {
  planet: {
    mercury: "Mercury",
    venus: "Venus",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uranus",
    neptune: "Neptune",
  },
  phase: {
    new: [
      "New Moon",
      "The darkest sky of the month: best for clusters and double stars.",
    ],
    first: [
      "First quarter",
      "A half Moon in the evening, its craters sharp along the shadow line.",
    ],
    full: ["Full Moon", "The Moon is up all night: bright, and hard on faint targets."],
    last: ["Last quarter", "The Moon rises after midnight, so the evening stays dark."],
  },
  season: {
    marchEquinox: ["March equinox", "Day and night of equal length."],
    juneSolstice: ["June solstice", "The shortest night of the year."],
    septemberEquinox: ["September equinox", "Day and night of equal length."],
    decemberSolstice: ["December solstice", "The longest night of the year."],
  },
  shower: {
    quadrantids: "Quadrantids",
    lyrids: "Lyrids",
    etaAquariids: "Eta Aquariids",
    perseids: "Perseids",
    orionids: "Orionids",
    leonids: "Leonids",
    geminids: "Geminids",
  },
  lunar: {
    penumbral: "Penumbral lunar eclipse",
    partial: "Partial lunar eclipse",
    annular: "Lunar eclipse",
    total: "Total lunar eclipse",
  },
  solar: {
    penumbral: "Solar eclipse",
    partial: "Partial solar eclipse",
    annular: "Annular solar eclipse",
    total: "Total solar eclipse",
  },
};

const ka: Words = {
  planet: {
    mercury: "მერკური",
    venus: "ვენერა",
    mars: "მარსი",
    jupiter: "იუპიტერი",
    saturn: "სატურნი",
    uranus: "ურანი",
    neptune: "ნეპტუნი",
  },
  phase: {
    new: [
      "ახალი მთვარე",
      "თვის ყველაზე ბნელი ცა — საუკეთესოა გროვებისა და ორმაგი ვარსკვლავებისთვის.",
    ],
    first: [
      "პირველი მეოთხედი",
      "საღამოს ნახევარმთვარეა, ჩრდილის ხაზთან კრატერები მკვეთრად ჩანს.",
    ],
    full: [
      "სავსე მთვარე",
      "მთვარე მთელი ღამე ცაზეა — კაშკაშაა და მკრთალ ობიექტებს ფარავს.",
    ],
    last: ["ბოლო მეოთხედი", "მთვარე შუაღამის შემდეგ ამოდის, ამიტომ საღამო ბნელია."],
  },
  season: {
    marchEquinox: ["გაზაფხულის ბუნიობა", "დღე და ღამე თანაბარია."],
    juneSolstice: ["ზაფხულის მზებუდობა", "წლის უმოკლესი ღამე."],
    septemberEquinox: ["შემოდგომის ბუნიობა", "დღე და ღამე თანაბარია."],
    decemberSolstice: ["ზამთრის მზებუდობა", "წლის უგრძესი ღამე."],
  },
  shower: {
    quadrantids: "კვადრანტიდები",
    lyrids: "ლირიდები",
    etaAquariids: "ეტა აქვარიდები",
    perseids: "პერსეიდები",
    orionids: "ორიონიდები",
    leonids: "ლეონიდები",
    geminids: "გემინიდები",
  },
  lunar: {
    penumbral: "მთვარის ნახევარჩრდილოვანი დაბნელება",
    partial: "მთვარის ნაწილობრივი დაბნელება",
    annular: "მთვარის დაბნელება",
    total: "მთვარის სრული დაბნელება",
  },
  solar: {
    penumbral: "მზის დაბნელება",
    partial: "მზის ნაწილობრივი დაბნელება",
    annular: "მზის რგოლისებრი დაბნელება",
    total: "მზის სრული დაბნელება",
  },
};

/** A planet with the Georgian postposition -თან ("near"): a consonant stem drops its -ი. */
const kaNear = (planet: Planet) => {
  const name = ka.planet[planet];
  return name.endsWith("ი") ? `${name.slice(0, -1)}თან` : `${name}სთან`;
};

// Written by hand, not toLocaleString: Node's and the browser's Georgian data disagree
// on the decimal mark, and the page would not hydrate. Georgian takes a comma.
const degrees = (value: number, locale: "en" | "ka") => {
  const text = String(Math.round(value * 10) / 10);
  return `${locale === "ka" ? text.replace(".", ",") : text}°`;
};

export const almanacCopy: Record<"en" | "ka", AlmanacCopy> = {
  en: {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    special: "Special nights",
    nothingThisMonth: "A quiet month: no eclipse, close pass or shower.",
    nothingTonight: "Nothing out of the ordinary in the sky.",
    notYet: "Not open for booking yet",
    past: "Past",
    moonLit: (lit) => `Moon ${lit}% lit`,
    legendOpen: "Open night",
    computed: "Computed for Tbilisi",
    title: (e) => {
      switch (e.kind) {
        case "moon":
          return en.phase[e.phase][0];
        case "moonNear":
          return `Moon near ${en.planet[e.body]}`;
        case "pair":
          return `${en.planet[e.bodies[0]]} meets ${en.planet[e.bodies[1]]}`;
        case "opposition":
          return `${en.planet[e.body]} at opposition`;
        case "season":
          return en.season[e.season][0];
        case "lunarEclipse":
          return en.lunar[e.eclipse];
        case "solarEclipse":
          return en.solar[e.eclipse];
        case "meteors":
          return `${en.shower[e.shower]} peak`;
      }
    },
    note: (e) => {
      switch (e.kind) {
        case "moon":
          return en.phase[e.phase][1];
        case "moonNear":
          return `${degrees(e.degrees, "en")} apart in the evening sky.`;
        case "pair":
          return `A close pass, ${degrees(e.degrees, "en")} apart in the evening sky.`;
        case "opposition":
          return "Closest and brightest of the year, and up all night.";
        case "season":
          return en.season[e.season][1];
        case "lunarEclipse":
          return e.visible ? "Visible from Tbilisi." : "Not visible from Tbilisi.";
        case "solarEclipse":
          return e.visible
            ? "Seen from Tbilisi by day. The telescope never points at the Sun."
            : "Not visible from Tbilisi.";
        case "meteors":
          return "A meteor shower at its peak: watch by eye after midnight.";
      }
    },
  },
  ka: {
    previousMonth: "წინა თვე",
    nextMonth: "შემდეგი თვე",
    special: "განსაკუთრებული ღამეები",
    nothingThisMonth: "მშვიდი თვეა: არც დაბნელება, არც შეხვედრა, არც მეტეორული ნაკადი.",
    nothingTonight: "ცაზე განსაკუთრებული არაფერია.",
    notYet: "ჯავშნისთვის ჯერ არ არის ღია",
    past: "გასულია",
    moonLit: (lit) => `მთვარე ${lit}%-ით განათებულია`,
    legendOpen: "თავისუფალი ღამე",
    computed: "გამოთვლილია თბილისისთვის",
    title: (e) => {
      switch (e.kind) {
        case "moon":
          return ka.phase[e.phase][0];
        case "moonNear":
          return `მთვარე ${kaNear(e.body)}`;
        case "pair":
          return `${ka.planet[e.bodies[0]]} და ${ka.planet[e.bodies[1]]}`;
        case "opposition":
          return `${ka.planet[e.body]} ოპოზიციაში`;
        case "season":
          return ka.season[e.season][0];
        case "lunarEclipse":
          return ka.lunar[e.eclipse];
        case "solarEclipse":
          return ka.solar[e.eclipse];
        case "meteors":
          return `${ka.shower[e.shower]} — პიკი`;
      }
    },
    note: (e) => {
      switch (e.kind) {
        case "moon":
          return ka.phase[e.phase][1];
        case "moonNear":
          return `საღამოს ცაზე მათ შორის ${degrees(e.degrees, "ka")}-ია.`;
        case "pair":
          return `მჭიდრო შეხვედრა: საღამოს ცაზე ${degrees(e.degrees, "ka")} დაშორებით.`;
        case "opposition":
          return "წლის ყველაზე ახლო და კაშკაშა, ცაზე მთელი ღამე ჩანს.";
        case "season":
          return ka.season[e.season][1];
        case "lunarEclipse":
          return e.visible ? "ჩანს თბილისიდან." : "თბილისიდან არ ჩანს.";
        case "solarEclipse":
          return e.visible
            ? "თბილისიდან დღისით ჩანს. ტელესკოპი მზისკენ არასდროს მიიმართება."
            : "თბილისიდან არ ჩანს.";
        case "meteors":
          return "მეტეორული ნაკადი პიკზეა: შუაღამის შემდეგ შეუიარაღებელი თვალით უყურე.";
      }
    },
  },
};
