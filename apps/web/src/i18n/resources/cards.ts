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
  simulated: { label: string; detail: string };
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
    lede: "Three cards, one turn a week. A card can hold a free session, a free observer seat or a discount.",
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
    choose: "Choose one card. The cards were dealt before you choose, and the other two turn over after.",
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
    simulated: {
      label: "Simulated",
      detail: "This is the demo observatory. Prizes work on its simulated sessions.",
    },
    odds: {
      title: "Odds",
      rarity: "Card",
      prize: "Holds",
      chance: "Chance per card",
      cap: (count) =>
        `At most ${count} free sessions are won each week. After that, a card that would hold one holds a discount.`,
      valid: (days) => `A prize can be used for ${days} days after it is won, by your account only.`,
      free: "Free to play. Cards are never sold, and prizes cannot be exchanged for money.",
      terms: "Rules in the Terms",
    },
    prizes: {
      title: "Your prizes",
      empty: "No prizes yet.",
      unreadable: "Your prizes could not be loaded. Reload to try again.",
      status: { ACTIVE: "Ready to use", REDEEMED: "Used", EXPIRED: "Expired" },
      code: "Code",
      copy: "Copy code",
      copied: "Copied",
      expires: (date) => `Use by ${date}`,
      book: "Book with it",
      seat: "Choose it when you join a live session as an observer.",
    },
    states: {
      notConfigured: {
        title: "The cards are not open yet",
        description: "The weekly cards are not running on this site yet.",
      },
      noObservatory: {
        title: "No observatory to play at",
        description: "The cards are dealt per observatory, and none is open for booking.",
      },
      unreachable: {
        title: "The cards could not be loaded",
        description: "The observatory service did not answer. Reload in a moment.",
      },
    },
    homeLink: {
      title: "Weekly cards",
      description: "Turn one of three cards for a free session, a seat or a discount.",
      action: "Turn a card",
    },
    board: {
      label: "Use a prize",
      none: "No prize",
      option: (prize, until) => `${prize} · use by ${until}`,
      free: "Free",
      discount: (percent) => `${percent}% off at checkout`,
      refused: "That prize cannot be used for this session. Choose another, or none.",
      useSeat: "Use my free seat",
    },
  },
  ka: {
    metadataTitle: "კვირის ბარათები",
    title: "კვირის ბარათები",
    lede: "სამი ბარათი, კვირაში ერთხელ ერთის გადაბრუნება. ბარათში შეიძლება იყოს უფასო სეანსი, დამკვირვებლის უფასო ადგილი ან ფასდაკლება.",
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
    turn: (position) => `${position + 1}-ლი ბარათის გადაბრუნება სამიდან`,
    turning: "ბრუნდება…",
    faceDown: "დაფარულია",
    choose: "აირჩიე ერთი ბარათი. ბარათები შენს არჩევამდე დარიგდა, დანარჩენი ორი კი არჩევის შემდეგ გადაბრუნდება.",
    result: {
      won: (rarity, prize) => `${rarity}: ${prize}.`,
      nothing: "ჩვეულებრივი: ამ კვირას პრიზის გარეშე.",
      others: "დანარჩენ ორ ბარათში იყო:",
      next: (when) => `ახალი ბარათები: ${when}.`,
    },
    refused: {
      closed: "ამ კვირის ბარათები დაიხურა. განაახლე გვერდი ახალი კვირისთვის.",
      picked: "ამ კვირას ბარათი უკვე გადაბრუნდა.",
      failed: "ბარათი ვერ გადაბრუნდა. სცადე თავიდან.",
    },
    simulated: {
      label: "სიმულაცია",
      detail: "ეს სადემონსტრაციო ობსერვატორიაა. პრიზები მის სიმულირებულ სეანსებზე მუშაობს.",
    },
    odds: {
      title: "შანსები",
      rarity: "ბარათი",
      prize: "შიგნით",
      chance: "შანსი თითო ბარათზე",
      cap: (count) =>
        `კვირაში არაუმეტეს ${count} უფასო სეანსი გაიცემა. ამის შემდეგ ასეთ ბარათში ფასდაკლება იქნება.`,
      valid: (days) => `პრიზის გამოყენება შეიძლება მოგებიდან ${days} დღის განმავლობაში, მხოლოდ შენი ანგარიშით.`,
      free: "თამაში უფასოა. ბარათები არასდროს იყიდება, პრიზი კი ფულზე არ იცვლება.",
      terms: "წესები პირობებში",
    },
    prizes: {
      title: "შენი პრიზები",
      empty: "პრიზები ჯერ არ გაქვს.",
      unreadable: "პრიზები ვერ ჩაიტვირთა. განაახლე გვერდი.",
      status: { ACTIVE: "მზადაა გამოსაყენებლად", REDEEMED: "გამოყენებულია", EXPIRED: "ვადა გაუვიდა" },
      code: "კოდი",
      copy: "კოდის კოპირება",
      copied: "დაკოპირდა",
      expires: (date) => `გამოიყენე ${date}-მდე`,
      book: "დაჯავშნე მისით",
      seat: "აირჩიე, როცა პირდაპირ ეთერს დამკვირვებლად შეუერთდები.",
    },
    states: {
      notConfigured: {
        title: "ბარათები ჯერ არ გახსნილა",
        description: "კვირის ბარათები ამ საიტზე ჯერ არ მუშაობს.",
      },
      noObservatory: {
        title: "სათამაშო ობსერვატორია არ არის",
        description: "ბარათები ობსერვატორიის მიხედვით რიგდება, და ჯავშნისთვის არცერთი არ არის ღია.",
      },
      unreachable: {
        title: "ბარათები ვერ ჩაიტვირთა",
        description: "ობსერვატორიის სერვისმა არ უპასუხა. განაახლე ცოტა ხანში.",
      },
    },
    homeLink: {
      title: "კვირის ბარათები",
      description: "გადააბრუნე ერთი სამიდან — უფასო სეანსისთვის, ადგილისთვის ან ფასდაკლებისთვის.",
      action: "ბარათის გადაბრუნება",
    },
    board: {
      label: "პრიზის გამოყენება",
      none: "პრიზის გარეშე",
      option: (prize, until) => `${prize} · ${until}-მდე`,
      free: "უფასო",
      discount: (percent) => `${percent}%-იანი ფასდაკლება გადახდისას`,
      refused: "ეს პრიზი ამ სეანსისთვის ვერ გამოიყენება. აირჩიე სხვა ან არცერთი.",
      useSeat: "ჩემი უფასო ადგილის გამოყენება",
    },
  },
};
