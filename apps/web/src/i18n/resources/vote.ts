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
      "One target a week, picked by vote.",
    title: "The week's vote",
    chapter: (week) => `The week's vote · ${week}`,
    cast: (count) => `${count} ${count === 1 ? "vote" : "votes"}`,
    none: "Nothing is above the horizon for the telescope this week.",
    unreachable: "Sky data unavailable right now.",
    poster: {
      leading: "Leading the vote",
      highest: "Highest that night",
      quiet: "A quiet sky.",
      lockOn: (day) => `Votes lock the week's target on ${day} at 13:00 UTC.`,
      nothing: "Nothing is above the horizon for the telescope.",
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
        "Ballot unavailable right now.",
      lockedButton: "Locked",
      lockedNote: "Voting is closed. The operator announces the winner.",
      signIn: "Sign in to vote",
      signInFor: (name) => `Sign in to vote for ${name}`,
      yourVote: "Your vote",
      cast: (name) => `Your vote is on ${name}.`,
      locked: "The week's vote has locked.",
      notCandidate: "That target is not on this week's ballot.",
      failed: "Vote not saved. Try again.",
      targetPage: (name) => `${name}, target page`,
    },
    chart: {
      horizon: "Horizon",
      now: "Now",
      summary: (count, dusk, dawn) =>
        `${count} ${count === 1 ? "target" : "targets"} visible ${dusk}–${dawn}.`,
      summaryLead: (name, altitude, at, count, dusk, dawn) =>
        `${name} peaks at ${altitude}° at ${at}. ${count} ${count === 1 ? "target" : "targets"} visible ${dusk}–${dawn}.`,
      pathTitle: (name, altitude, at) => `${name} — highest ${altitude}° at ${at}`,
    },
  },
  ka: {
    metadataTitle: `კენჭისყრა — კვირის დაკვირვება · ${brand.ka.nominative}`,
    metadataDescription:
      "კვირაში ერთი ობიექტი, არჩეული კენჭისყრით.",
    title: "კვირის კენჭისყრა",
    chapter: (week) => `კვირის კენჭისყრა · ${week}`,
    cast: (count) => `${count} ხმა`,
    none: "ამ კვირას ტელესკოპისთვის ჰორიზონტს ზემოთ არაფერია.",
    unreachable: "ცის მონაცემები ახლა მიუწვდომელია.",
    poster: {
      leading: "ლიდერობს",
      highest: "ყველაზე მაღლა იმ ღამეს",
      quiet: "წყნარი ცა.",
      lockOn: (day) => `კვირის ობიექტი ${day}, 13:00 UTC-ზე ფიქსირდება.`,
      nothing: "ტელესკოპისთვის ჰორიზონტს ზემოთ არაფერია.",
      illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    },
    facts: {
      highest: "მაქს. სიმაღლე",
      at: "დრო",
      votes: "ხმები",
      of: (votes, cast) => `${votes} / ${cast}`,
    },
    sky: (night) => `ცა ${night}`,
    ballot: {
      leading: "ლიდერი",
      when: (altitude, time) => `მაქს. ${altitude}° ${time}-ზე`,
      votes: () => "ხმა",
      vote: "ხმის მიცემა",
      voteFor: (name) => `ხმის მიცემა: ${name}`,
      opensSoon: "იხსნება პირველი სინათლით",
      opensNote:
        "ბიულეტენი ახლა მიუწვდომელია.",
      lockedButton: "დახურულია",
      lockedNote: "კენჭისყრა დასრულდა. გამარჯვებულს ოპერატორი გამოაცხადებს.",
      signIn: "შედი და მიეცი ხმა",
      signInFor: (name) => `შედი, რომ ხმა მისცე: ${name}`,
      yourVote: "შენი ხმა",
      cast: (name) => `შენი ხმა: ${name}.`,
      locked: "კვირის კენჭისყრა დაიხურა.",
      notCandidate: "ეს ობიექტი ამ კვირის ბიულეტენში არ არის.",
      failed: "ხმა ვერ შეინახა. სცადე თავიდან.",
      targetPage: (name) => `${name}, ობიექტის გვერდი`,
    },
    chart: {
      horizon: "ჰორიზონტი",
      now: "ახლა",
      summary: (count, dusk, dawn) => `${count} ობიექტი ჩანს ${dusk}-დან ${dawn}-მდე.`,
      summaryLead: (name, altitude, at, count, dusk, dawn) =>
        `${name} ყველაზე მაღლაა ${at}-ზე (${altitude}°). ${count} ობიექტი ჩანს ${dusk}-დან ${dawn}-მდე.`,
      pathTitle: (name, altitude, at) => `${name} — მაქს. ${altitude}° ${at}-ზე`,
    },
  },
};
