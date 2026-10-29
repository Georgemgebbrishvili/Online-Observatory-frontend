import type { CardPrizeKind, CardPrizeStatus, CardRarity } from "@darkview/contracts";

import type { Locale } from "@/i18n/config";

type PrizeFacts = { durationMinutes: number | null; percentOff: number | null };

export type CardsCopy = {
  metadataTitle: string;
  title: string;
  lede: string;
  week: (range: string) => string;
  rarity: Record<CardRarity, string>;
  prize: (kind: CardPrizeKind | null, facts: PrizeFacts) => string;
  illustration: string;
  turn: (position: number) => string;
  turning: string;
  faceDown: string;
  choose: string;
  result: {
    won: (rarity: string, prize: string) => string;
    nothing: string;
    others: string;
    next: (when: string) => string;
  };
  refused: { closed: string; picked: string; failed: string };
  odds: {
    title: string;
    rarity: string;
    prize: string;
    chance: string;
    cap: (count: number) => string;
    valid: (days: number) => string;
    free: string;
    terms: string;
  };
  prizes: {
    title: string;
    empty: string;
    unreadable: string;
    status: Record<CardPrizeStatus, string>;
    code: string;
    copy: string;
    copied: string;
    expires: (date: string) => string;
    book: string;
    seat: string;
  };
  states: {
    notConfigured: { title: string; description: string };
    noObservatory: { title: string; description: string };
    unreachable: { title: string; description: string };
  };
  homeLink: { title: string; description: string; action: string };
  board: {
    label: string;
    none: string;
    option: (prize: string, until: string) => string;
    free: string;
    discount: (percent: number) => string;
    refused: string;
    useSeat: string;
  };
};

export const cardsCopy: Record<Locale, CardsCopy> = {
  en: {
    metadataTitle: "Weekly cards",
    title: "Weekly cards",
    lede: "Turn one of three cards each week. Win a free session, seat or discount.",
    week: (range) => `This week · ${range}`,
    rarity: { LEGENDARY: "Legendary", EPIC: "Epic", RARE: "Rare", COMMON: "Common" },
    prize: (kind, { durationMinutes, percentOff }) => {
      switch (kind) {
        case "FREE_SLOT":
          return `A free ${durationMinutes ?? ""}-minute session`;
        case "OBSERVER_SEAT":
          return "A free observer seat";
        case "DISCOUNT":
          return `${percentOff ?? ""}% off one booking`;
        default:
          return "No prize";
      }
    },
    illustration: "Illustration — not telescope output",
    turn: (position) => `Turn card ${position + 1} of 3`,
    turning: "Turning…",
    faceDown: "Face down",
    choose: "Pick one. Cards are dealt before you pick.",
    result: {
      won: (rarity, prize) => `${rarity}: ${prize}.`,
      nothing: "Common: no prize this week.",
      others: "The other two cards held:",
      next: (when) => `New cards on ${when}.`,
    },
    refused: {
      closed: "This week's cards have closed. Reload for the new week.",
      picked: "A card was already turned this week.",
      failed: "The card could not be turned. Try again.",
    },
    odds: {
      title: "Odds",
      rarity: "Card",
      prize: "Holds",
      chance: "Chance per card",
      cap: (count) =>
        `Up to ${count} free sessions a week. After that, a discount instead.`,
      valid: (days) => `Use a prize within ${days} days. Your account only.`,
      free: "Free to play. No cash value.",
      terms: "Rules in the Terms",
    },
    prizes: {
      title: "Your prizes",
      empty: "No prizes yet.",
      unreadable: "Couldn't load prizes. Reload.",
      status: { ACTIVE: "Ready to use", REDEEMED: "Used", EXPIRED: "Expired" },
      code: "Code",
      copy: "Copy code",
      copied: "Copied",
      expires: (date) => `Use by ${date}`,
      book: "Book with it",
      seat: "Pick it when you join a live session.",
    },
    states: {
      notConfigured: {
        title: "The cards are not open yet",
        description: "Coming soon.",
      },
      noObservatory: {
        title: "No observatory to play at",
        description: "No observatory is open for booking.",
      },
      unreachable: {
        title: "The cards could not be loaded",
        description: "Reload in a moment.",
      },
    },
    homeLink: {
      title: "Weekly cards",
      description: "Win a free session, seat or discount.",
      action: "Turn a card",
    },
    board: {
      label: "Use a prize",
      none: "No prize",
      option: (prize, until) => `${prize} · use by ${until}`,
      free: "Free",
      discount: (percent) => `${percent}% off at checkout`,
      refused: "Can't use that prize here. Choose another, or none.",
      useSeat: "Use my free seat",
    },
  },
  ka: {
    metadataTitle: "კვირის ბარათები",
    title: "კვირის ბარათები",
    lede: "ყოველ კვირა გადააბრუნე ერთი ბარათი სამიდან. მოიგე უფასო სეანსი, ადგილი ან ფასდაკლება.",
    week: (range) => `ეს კვირა · ${range}`,
    rarity: { LEGENDARY: "ლეგენდარული", EPIC: "ეპიკური", RARE: "იშვიათი", COMMON: "ჩვეულებრივი" },
    prize: (kind, { durationMinutes, percentOff }) => {
      switch (kind) {
        case "FREE_SLOT":
          return `უფასო ${durationMinutes ?? ""}-წუთიანი სეანსი`;
        case "OBSERVER_SEAT":
          return "დამკვირვებლის უფასო ადგილი";
        case "DISCOUNT":
          return `${percentOff ?? ""}%-იანი ფასდაკლება ერთ ჯავშანზე`;
        default:
          return "პრიზის გარეშე";
      }
    },
    illustration: "ილუსტრაცია — არა ტელესკოპის გამოსახულება",
    turn: (position) => `გადააბრუნე ბარათი ${position + 1} (სამიდან)`,
    turning: "ბრუნდება…",
    faceDown: "დაფარულია",
    choose: "აირჩიე ერთი. ბარათები წინასწარაა დარიგებული.",
    result: {
      won: (rarity, prize) => `${rarity}: ${prize}.`,
      nothing: "ჩვეულებრივი: ამ კვირას პრიზი არ არის.",
      others: "დანარჩენ ორ ბარათში იყო:",
      next: (when) => `ახალი ბარათები: ${when}.`,
    },
    refused: {
      closed: "ეს კვირა დასრულდა. განაახლე გვერდი.",
      picked: "ამ კვირას ბარათი უკვე გადაბრუნდა.",
      failed: "ბარათი ვერ გადაბრუნდა. სცადე თავიდან.",
    },
    odds: {
      title: "შანსები",
      rarity: "ბარათი",
      prize: "შიგნით",
      chance: "შანსი თითო ბარათზე",
      cap: (count) =>
        `კვირაში მაქსიმუმ ${count} უფასო სეანსი. შემდეგ — ფასდაკლება.`,
      valid: (days) => `პრიზი გამოიყენე ${days} დღეში. მხოლოდ შენი ანგარიშით.`,
      free: "თამაში უფასოა. პრიზი ფულზე არ იცვლება.",
      terms: "წესები პირობებში",
    },
    prizes: {
      title: "შენი პრიზები",
      empty: "პრიზები ჯერ არ გაქვს.",
      unreadable: "პრიზები ვერ ჩაიტვირთა. განაახლე გვერდი.",
      status: { ACTIVE: "მზადაა", REDEEMED: "გამოყენებულია", EXPIRED: "ვადა გაუვიდა" },
      code: "კოდი",
      copy: "კოდის დაკოპირება",
      copied: "დაკოპირდა",
      expires: (date) => `გამოიყენე ${date}-მდე`,
      book: "გამოიყენე ჯავშნისას",
      seat: "აირჩიე, როცა პირდაპირ სეანსს შეუერთდები.",
    },
    states: {
      notConfigured: {
        title: "ბარათები ჯერ არ გახსნილა",
        description: "მალე.",
      },
      noObservatory: {
        title: "ობსერვატორია არ არის",
        description: "დასაჯავშნად არცერთი ობსერვატორია არ არის ღია.",
      },
      unreachable: {
        title: "ბარათები ვერ ჩაიტვირთა",
        description: "ცოტა ხანში განაახლე გვერდი.",
      },
    },
    homeLink: {
      title: "კვირის ბარათები",
      description: "მოიგე უფასო სეანსი, ადგილი ან ფასდაკლება.",
      action: "გადააბრუნე ბარათი",
    },
    board: {
      label: "პრიზის გამოყენება",
      none: "პრიზის გარეშე",
      option: (prize, until) => `${prize} · ${until}-მდე`,
      free: "უფასო",
      discount: (percent) => `${percent}%-იანი ფასდაკლება გადახდისას`,
      refused: "ეს პრიზი აქ ვერ გამოიყენება. აირჩიე სხვა ან არცერთი.",
      useSeat: "უფასო ადგილის გამოყენება",
    },
  },
};
