import { brand } from "@/brand";

/** Clients ADR-067: Gift a night -- the gift page, a paid gift, and the board's code field. */
export const giftCopy = {
  en: {
    metadataTitle: `Gift a night · ${brand.en.name}`,
    metadataDescription:
      "Give someone a live session at a real telescope in Georgia. They choose the night and the object.",
    title: "Gift a night",
    lede: "A live session at the telescope, for someone else. They choose the night and what to point at; you choose nothing but them.",
    facts: {
      length: (minutes: number) => `${minutes} minutes at the telescope, live`,
      valid: "Valid for twelve months from payment",
      noCash:
        "Not exchangeable for cash. If their booking is cancelled, the gift comes back.",
    },
    price: "Price",
    priceUnknown: "The price could not be read just now. Try again in a moment.",
    signIn: "Sign in to buy a gift",
    signInNote:
      "You need an account to pay. The person you give it to will need one to book.",
    form: {
      legend: "Who it is for",
      name: "Their name (optional)",
      email: "Their email (optional)",
      emailHint:
        "If you give one, the code is emailed there once our emails are on. Either way, you can print it.",
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
        "This gift has not been paid for, so it has no code. Buy it again from the gift page.",
      cancelled:
        "The payment was declined, so this gift has no code. Nothing was charged.",
      redeemed: "This gift has been booked. Clear skies to whoever has it.",
      expired: "This gift expired unused.",
      print: "Print the card",
      how: "Give them the card, or send them the code. They enter it on the booking page under “Have a gift code?”, and the booking costs nothing.",
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
      note: "The gift pays for this session if the code is valid.",
      refused:
        "That gift code cannot be used: it is not valid, has been used, or has expired.",
    },
  },
  ka: {
    metadataTitle: `აჩუქე ღამე · ${brand.ka.nominative}`,
    metadataDescription:
      "აჩუქე ვინმეს პირდაპირი სეანსი ნამდვილ ტელესკოპთან საქართველოში. ღამესა და ობიექტს თვითონ აირჩევს.",
    title: "აჩუქე ღამე",
    lede: "პირდაპირი სეანსი ტელესკოპთან, სხვისთვის. ღამესა და ობიექტს ის აირჩევს; შენ მხოლოდ მას ირჩევ.",
    facts: {
      length: (minutes: number) => `${minutes} წუთი ტელესკოპთან, პირდაპირ`,
      valid: "მოქმედებს გადახდიდან თორმეტი თვე",
      noCash: "ფულად არ იცვლება. თუ ჯავშანი გაუქმდება, საჩუქარი ბრუნდება.",
    },
    price: "ფასი",
    priceUnknown: "ფასი ახლა ვერ წავიკითხეთ. სცადე ცოტა ხანში.",
    signIn: "შედი, რომ საჩუქარი იყიდო",
    signInNote:
      "გადასახდელად ანგარიში გჭირდება. ვისაც აჩუქებ, დასაჯავშნად მასაც დასჭირდება.",
    form: {
      legend: "ვისთვის",
      name: "სახელი (არასავალდებულო)",
      email: "ელფოსტა (არასავალდებულო)",
      emailHint:
        "თუ მიუთითებ, კოდს იქ გავაგზავნით, როცა ჩვენი წერილები ჩაირთვება. ნებისმიერ შემთხვევაში შეგიძლია დაბეჭდო.",
      message: "მინაწერი (არასავალდებულო)",
      messageHint: "500 სიმბოლომდე, ბარათზე დაიბეჭდება.",
      buy: "გადახდაზე გადასვლა",
      buying: "გადახდა იხსნება…",
      redirecting: "გადახდის გვერდი იხსნება…",
    },
    refused: {
      notConfigured: "საჩუქრის ყიდვა ახლა შეუძლებელია.",
      invalid: "შეამოწმე ელფოსტა და მინაწერი, მერე სცადე თავიდან.",
      failed: "ვერ შესრულდა. თანხა არ ჩამოგეჭრა. სცადე თავიდან.",
    },
    mine: "შენი საჩუქრები",
    none: "საჩუქარი ჯერ არ გიყიდია.",
    unreachable: "შენი საჩუქრები ახლა ვერ წავიკითხეთ.",
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
        "ეს საჩუქარი გადახდილი არ არის, ამიტომ კოდი არ აქვს. იყიდე თავიდან საჩუქრის გვერდიდან.",
      cancelled:
        "გადახდა უარყოფილია, ამიტომ ამ საჩუქარს კოდი არ აქვს. თანხა არ ჩამოგეჭრა.",
      redeemed: "ეს საჩუქარი უკვე დაჯავშნილია.",
      expired: "ამ საჩუქარს ვადა გაუვიდა გამოუყენებლად.",
      print: "ბარათის დაბეჭდვა",
      how: "მიეცი ბარათი ან გაუგზავნე კოდი. ჯავშნის გვერდზე „გაქვს სასაჩუქრე კოდი?“ ველში შეიყვანს და ჯავშანი უფასო იქნება.",
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
      note: "საჩუქარი ამ სეანსს გადაიხდის, თუ კოდი სწორია.",
      refused:
        "ამ სასაჩუქრე კოდის გამოყენება შეუძლებელია: არასწორია, უკვე გამოყენებულია ან ვადა გაუვიდა.",
    },
  },
} as const;
