import { brand } from "@/brand";

export type VoteCopy = {
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  chapter: (week: string) => string;
  cast: (count: number) => string;
  none: string;
  unreachable: string;
  poster: {
    leading: string;
    highest: string;
    quiet: string;
    lockOn: (day: string) => string;
    nothing: string;
    illustration: string;
  };
  facts: { highest: string; at: string; votes: string; of: (votes: number, cast: number) => string };
  sky: (night: string) => string;
  ballot: {
    leading: string;
    when: (altitude: number, time: string) => string;
    votes: (count: number) => string;
    vote: string;
    voteFor: (name: string) => string;
    opensSoon: string;
    opensNote: string;
    lockedButton: string;
    lockedNote: string;
    signIn: string;
    signInFor: (name: string) => string;
    yourVote: string;
    cast: (name: string) => string;
    locked: string;
    notCandidate: string;
    failed: string;
    targetPage: (name: string) => string;
  };
  chart: {
    horizon: string;
    now: string;
    summary: (count: number, dusk: string, dawn: string) => string;
    summaryLead: (name: string, altitude: number, at: string, count: number, dusk: string, dawn: string) => string;
    pathTitle: (name: string, altitude: number, at: string) => string;
  };
};

export const voteCopy: Record<"en" | "ka", VoteCopy> = {
  en: {
    metadataTitle: `Vote — the week's observation · ${brand.en.name}`,
    metadataDescription:
      "One target a week, chosen by vote among what the telescope can observe.",
    title: "The week's vote",
    chapter: (week) => `The week's vote · ${week}`,
    cast: (count) => `${count} ${count === 1 ? "vote" : "votes"}`,
    none: "Nothing in the catalogue clears the horizon for the telescope this week.",
    unreachable: "The sky could not be read right now.",
    poster: {
      leading: "Leading the vote",
      highest: "Highest that night",
      quiet: "A quiet sky.",
      lockOn: (day) => `Votes lock the week's target on ${day} at 13:00 UTC.`,
      nothing: "Nothing in the catalogue clears the horizon for the telescope.",
      illustration: "Illustration — not telescope output",
    },
    facts: {
      highest: "Highest",
      at: "At",
      votes: "Votes",
      of: (votes, cast) => `${votes} of ${cast}`,
    },
    sky: (night) => `The sky on ${night}`,
    ballot: {
      leading: "Leading",
      when: (altitude, time) => `highest ${altitude}° at ${time}`,
      votes: (count) => (count === 1 ? "vote" : "votes"),
      vote: "Vote",
      voteFor: (name) => `Vote for ${name}`,
      opensSoon: "Opens with first light",
      opensNote:
        "The ballot could not be read right now. The week's candidates are what the observatory can see.",
      lockedButton: "Locked",
      lockedNote: "The week's vote has locked. The operator reads the winner.",
      signIn: "Sign in to vote",
      signInFor: (name) => `Sign in to vote for ${name}`,
      yourVote: "Your vote",
      cast: (name) => `Your vote is on ${name}.`,
      locked: "The week's vote has locked.",
      notCandidate: "That target is not on this week's ballot.",
      failed: "The vote was not recorded. Try again in a moment.",
      targetPage: (name) => `${name}, target page`,
    },
    chart: {
      horizon: "Horizon",
      now: "Now",
      summary: (count, dusk, dawn) =>
        `${count} ${count === 1 ? "target" : "targets"} can be observed between ${dusk} and ${dawn}.`,
      summaryLead: (name, altitude, at, count, dusk, dawn) =>
        `${name} climbs highest to ${altitude}° at ${at}. ${count} ${count === 1 ? "target" : "targets"} can be observed between ${dusk} and ${dawn}.`,
      pathTitle: (name, altitude, at) => `${name} — highest ${altitude}° at ${at}`,
    },
  },
  ka: {
    metadataTitle: `კენჭისყრა — კვირის დაკვირვება · ${brand.ka.nominative}`,
    metadataDescription:
      "კვირაში ერთი ობიექტი, რომელსაც კენჭისყრით ირჩევენ იმათგან, რასაც ტელესკოპი ხედავს.",
    title: "კვირის კენჭისყრა",
    chapter: (week) => `კვირის კენჭისყრა · ${week}`,
    cast: (count) => `${count} ხმა`,
    none: "ამ კვირას კატალოგიდან არცერთი ობიექტი არ ამოდის ჰორიზონტზე ტელესკოპისთვის.",
    unreachable: "ცის წაკითხვა ამჟამად ვერ მოხერხდა.",
    poster: {
      leading: "ლიდერობს კენჭისყრაში",
      highest: "ყველაზე მაღლა იმ ღამეს",
      quiet: "წყნარი ცა.",
      lockOn: (day) => `ხმები კვირის ობიექტს ${day}, 13:00 UTC-ზე აფიქსირებს.`,
      nothing: "კატალოგიდან არცერთი ობიექტი არ ამოდის ჰორიზონტზე ტელესკოპისთვის.",
      illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    },
    facts: {
      highest: "უმაღლესი",
      at: "დრო",
      votes: "ხმები",
      of: (votes, cast) => `${votes} / ${cast}`,
    },
    sky: (night) => `ცა ${night}`,
    ballot: {
      leading: "ლიდერი",
      when: (altitude, time) => `უმაღლესი ${altitude}° ${time}-ზე`,
      votes: () => "ხმა",
      vote: "ხმის მიცემა",
      voteFor: (name) => `ხმის მიცემა: ${name}`,
      opensSoon: "იხსნება პირველი სინათლით",
      opensNote:
        "ბიულეტენის წაკითხვა ამჟამად ვერ მოხერხდა. კვირის კანდიდატები ისაა, რასაც ობსერვატორია ხედავს.",
      lockedButton: "დახურულია",
      lockedNote: "კვირის კენჭისყრა დაიხურა. გამარჯვებულს ოპერატორი კითხულობს.",
      signIn: "ხმის მისაცემად შედი",
      signInFor: (name) => `შედი, რომ ხმა მისცე: ${name}`,
      yourVote: "შენი ხმა",
      cast: (name) => `შენი ხმა ${name}-ზეა.`,
      locked: "კვირის კენჭისყრა დაიხურა.",
      notCandidate: "ეს ობიექტი ამ კვირის ბიულეტენში არ არის.",
      failed: "ხმა არ ჩაიწერა. სცადე ცოტა ხანში.",
      targetPage: (name) => `${name}, ობიექტის გვერდი`,
    },
    chart: {
      horizon: "ჰორიზონტი",
      now: "ახლა",
      summary: (count, dusk, dawn) => `${count} ობიექტზე დაკვირვება შესაძლებელია ${dusk}-დან ${dawn}-მდე.`,
      summaryLead: (name, altitude, at, count, dusk, dawn) =>
        `${name} ყველაზე მაღლა ${altitude}°-ზე ადის ${at}-ზე. ${count} ობიექტზე დაკვირვება შესაძლებელია ${dusk}-დან ${dawn}-მდე.`,
      pathTitle: (name, altitude, at) => `${name} — უმაღლესი ${altitude}° ${at}-ზე`,
    },
  },
};
