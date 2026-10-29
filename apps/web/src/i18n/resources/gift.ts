import { brand } from "@/brand";

/** Clients ADR-067: Gift a night -- the gift page, a paid gift, and the board's code field. */
export const giftCopy = {
  en: {
    metadataTitle: `Gift a night · ${brand.en.name}`,
    metadataDescription:
      "Gift a live session at a real telescope in Georgia. They pick the night and the target.",
    title: "Gift a night",
    lede: "A live telescope session, as a gift. They pick the night and the target.",
    facts: {
      length: (minutes: number) => `${minutes} minutes at the telescope, live`,
      valid: "Valid for twelve months from payment",
      noCash:
        "No cash value. If their booking is cancelled, the gift comes back.",
    },
    price: "Price",
    priceUnknown: "Price unavailable. Try again shortly.",
    signIn: "Sign in to buy a gift",
    signInNote:
      "You need an account to pay. They need one to book.",
    form: {
      legend: "Who it is for",
      name: "Their name (optional)",
      email: "Their email (optional)",
      emailHint:
        "We'll email the code once emails are on. You can always print it.",
      message: "A note (optional)",
      messageHint: "Up to 500 characters, printed on the card.",
      buy: "Continue to payment",
      buying: "Opening the payment…",
      redirecting: "Opening the payment page…",
    },
    refused: {
      notConfigured: "Gifts cannot be sold here just now.",
      invalid: "Check the email address and the note, then try again.",
      failed: "That did not go through. Nothing was charged. Try again.",
    },
    mine: "Your gifts",
    none: "You have not bought a gift yet.",
    unreachable: "Your gifts could not be read just now.",
    open: "Open",
    status: {
      PENDING_PAYMENT: "Not paid",
      ACTIVE: "Ready to give",
      REDEEMED: "Booked",
      EXPIRED: "Expired",
      CANCELLED: "Payment declined",
    } as Record<string, string>,
    detail: {
      metadataTitle: `Your gift · ${brand.en.name}`,
      back: "All your gifts",
      notFound: "This gift is not one of yours.",
      pending:
        "Not paid, so no code. Buy it again from the gift page.",
      cancelled:
        "Payment declined, so no code. Nothing was charged.",
      redeemed: "This gift has been booked.",
      expired: "This gift expired unused.",
      print: "Print the card",
      how: "Give them the card or the code. They enter it under “Have a gift code?” when booking. The session is free.",
    },
    card: {
      kicker: "A gift",
      heading: "A night at the telescope",
      for: (name: string) => `For ${name}`,
      length: (minutes: number) =>
        `${minutes}-minute live session at ${brand.en.name}, Tbilisi`,
      code: "Gift code",
      until: (date: string) => `Use it by ${date}`,
      redeem: "Book at stellar.astroman.ge and enter the code under “Have a gift code?”.",
    },
    board: {
      label: "Have a gift code?",
      field: "Gift code",
      paid: "Paid by the gift",
      note: "If the code is valid, the gift pays for this session.",
      refused:
        "That code is invalid, used or expired.",
    },
  },
  ka: {
    metadataTitle: `აჩუქე ღამე · ${brand.ka.nominative}`,
    metadataDescription:
      "აჩუქე პირდაპირი სეანსი ნამდვილ ტელესკოპთან საქართველოში. ღამესა და ობიექტს თვითონ აირჩევს.",
    title: "აჩუქე ღამე",
    lede: "პირდაპირი სეანსი ტელესკოპთან, საჩუქრად. ღამესა და ობიექტს თვითონ აირჩევს.",
    facts: {
      length: (minutes: number) => `${minutes} წუთი ტელესკოპთან, პირდაპირ`,
      valid: "მოქმედებს 12 თვე გადახდიდან",
      noCash: "ფულად არ იცვლება. თუ ჯავშანი გაუქმდება, საჩუქარი ბრუნდება.",
    },
    price: "ფასი",
    priceUnknown: "ფასი ახლა ვერ ჩაიტვირთა. სცადე ცოტა ხანში.",
    signIn: "შედი საჩუქრის საყიდლად",
    signInNote:
      "გადასახდელად ანგარიში გჭირდება. დასაჯავშნად მასაც დასჭირდება.",
    form: {
      legend: "ვისთვის",
      name: "სახელი (არასავალდებულო)",
      email: "ელფოსტა (არასავალდებულო)",
      emailHint:
        "კოდს ელფოსტით გავაგზავნით, როცა წერილები ჩაირთვება. დაბეჭდვა ყოველთვის შეგიძლია.",
      message: "მინაწერი (არასავალდებულო)",
      messageHint: "500 სიმბოლომდე, ბარათზე დაიბეჭდება.",
      buy: "გადახდაზე გადასვლა",
      buying: "გადახდა იხსნება…",
      redirecting: "გადახდის გვერდი იხსნება…",
    },
    refused: {
      notConfigured: "საჩუქრის ყიდვა ახლა შეუძლებელია.",
      invalid: "შეამოწმე ელფოსტა და მინაწერი, მერე სცადე თავიდან.",
      failed: "ვერ მოხერხდა. თანხა არ ჩამოგეჭრა. სცადე თავიდან.",
    },
    mine: "შენი საჩუქრები",
    none: "საჩუქარი ჯერ არ გიყიდია.",
    unreachable: "საჩუქრები ახლა ვერ ჩაიტვირთა.",
    open: "გახსნა",
    status: {
      PENDING_PAYMENT: "გადაუხდელი",
      ACTIVE: "მზადაა საჩუქრად",
      REDEEMED: "დაჯავშნილია",
      EXPIRED: "ვადაგასული",
      CANCELLED: "გადახდა უარყოფილია",
    } as Record<string, string>,
    detail: {
      metadataTitle: `შენი საჩუქარი · ${brand.ka.nominative}`,
      back: "ყველა საჩუქარი",
      notFound: "ეს საჩუქარი შენი არ არის.",
      pending:
        "გადახდილი არ არის, ამიტომ კოდი არ აქვს. იყიდე თავიდან საჩუქრის გვერდზე.",
      cancelled:
        "გადახდა უარყოფილია, ამიტომ კოდი არ აქვს. თანხა არ ჩამოგეჭრა.",
      redeemed: "ეს საჩუქარი უკვე დაჯავშნილია.",
      expired: "ვადა გაუვიდა გამოუყენებლად.",
      print: "ბარათის დაბეჭდვა",
      how: "მიეცი ბარათი ან გაუგზავნე კოდი. დაჯავშნისას შეიყვანს ველში „გაქვს სასაჩუქრე კოდი?“ — სეანსი უფასო იქნება.",
    },
    card: {
      kicker: "საჩუქარი",
      heading: "ღამე ტელესკოპთან",
      for: (name: string) => `ვისთვის: ${name}`,
      length: (minutes: number) =>
        `${minutes}-წუთიანი პირდაპირი სეანსი, ${brand.ka.nominative}, თბილისი`,
      code: "სასაჩუქრე კოდი",
      until: (date: string) => `გამოიყენე ${date}-მდე`,
      redeem:
        "დაჯავშნე stellar.astroman.ge-ზე და შეიყვანე კოდი ველში „გაქვს სასაჩუქრე კოდი?“.",
    },
    board: {
      label: "გაქვს სასაჩუქრე კოდი?",
      field: "სასაჩუქრე კოდი",
      paid: "იხდის საჩუქარი",
      note: "თუ კოდი სწორია, სეანსს საჩუქარი გადაიხდის.",
      refused:
        "კოდი არასწორია, გამოყენებულია ან ვადაგასულია.",
    },
  },
} as const;
