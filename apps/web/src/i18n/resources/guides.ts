import type { Locale } from "@/i18n/config";

type GuideLink = { label: string; path: string };

export type GuideCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  stepsTitle?: string;
  steps?: { title: string; body: string }[];
  pointsTitle?: string;
  points?: { title: string; body: string }[];
  faqTitle: string;
  faq: { question: string; answer: string; link?: GuideLink }[];
  cta?: { title: string; body: string; action: GuideLink; secondary?: GuideLink };
};

export type GuideId = "home" | "pricing";

/**
 * The explaining each landing page carries under its working part. Nothing here
 * states a price, a refund rule or an opening date: those come from the platform or
 * from the legal pages, which these answers point to.
 */
export const guideCopy: Record<Locale, Record<GuideId, GuideCopy>> = {
  en: {
    home: {
      eyebrow: "What you will see",
      title: "The sky as the camera sees it, tonight.",
      lede: "Many short exposures stack as you watch, so faint objects build up in minutes. Not a long-exposure photo.",
      pointsTitle: "What the telescope points at",
      points: [
        {
          title: "Planets",
          body: "Jupiter's belts and moons, Saturn's rings, the phases of Venus.",
        },
        {
          title: "Double stars",
          body: "Albireo, gold and blue. Mizar and Alcor.",
        },
        {
          title: "Star clusters",
          body: "M13 and M15 resolve into thousands of stars.",
        },
        {
          title: "Nebulae",
          body: "The Ring, the Dumbbell and Orion, with shape and some colour.",
        },
      ],
      faqTitle: "Common questions",
      faq: [
        {
          question: "Is this a real telescope?",
          answer: `Yes. One telescope with a colour camera.`,
          link: { label: "See the observatory", path: "observatory" },
        },
        {
          question: "Do I need any equipment or software?",
          answer: "No. A browser on a phone or computer is enough.",
        },
        {
          question: "When can I observe?",
          answer: "Through the dark hours, observatory time (GMT+4). Booking shows the next seven nights.",
          link: { label: "Open the booking page", path: "app/book" },
        },
        {
          question: "What happens if it is cloudy?",
          answer: "The session goes on weather hold and the page tells you. The refund policy covers the booking.",
          link: { label: "Read the refund policy", path: "refunds" },
        },
        {
          question: "Can I keep the pictures?",
          answer: "Yes. Every capture goes to your Collection to download.",
        },
      ],
    },
    pricing: {
      eyebrow: "What a slot gives you",
      title: "Time with one real telescope.",
      lede: "The whole telescope is yours for the slot. No queue.",
      faqTitle: "Paying and prices",
      faq: [
        {
          question: "How do I pay?",
          answer: "On a secure payment page at the end of booking. Your slot is held while you pay.",
        },
        {
          question: "Where do these prices come from?",
          answer: "The observatory sets them. This page shows the same live price as checkout.",
          link: { label: "See tonight's slots", path: "app/book" },
        },
        {
          question: "Is watching somebody else's session free?",
          answer: "No. Seats are priced per seat, shown before you pay.",
        },
        {
          question: "What if the session cannot run?",
          answer: "The refund policy covers weather, visibility and faults. It is being finalised before launch.",
          link: { label: "Read the refund policy", path: "refunds" },
        },
      ],
      cta: {
        title: "Ready to see it for yourself?",
        body: "Pick a night and a target. Watch the real sky from anywhere.",
        action: { label: "Reserve a slot", path: "app/book" },
        secondary: { label: "Try the observatory", path: "observatory" },
      },
    },
  },
  ka: {
    home: {
      eyebrow: "რას დაინახავ",
      title: "ცა, როგორც კამერა ხედავს.",
      lede: "მოკლე კადრები გროვდება და მკრთალი ობიექტები წუთებში ჩნდება. ეს გრძელი ექსპოზიციის ფოტო არ არის.",
      pointsTitle: "რას აკვირდება ტელესკოპი",
      points: [
        {
          title: "პლანეტები",
          body: "იუპიტერის სარტყლები და თანამგზავრები, სატურნის რგოლები, ვენერას ფაზები.",
        },
        {
          title: "ორმაგი ვარსკვლავები",
          body: "ალბირეო — ოქროსფერი და ცისფერი. მიცარი და ალკორი.",
        },
        {
          title: "ვარსკვლავური გროვები",
          body: "M13 და M15 ათასობით ვარსკვლავად იშლება.",
        },
        {
          title: "ნისლეულები",
          body: "რგოლის, ჰანტელისა და ორიონის ნისლეულები — ფორმით და ცოტა ფერით.",
        },
      ],
      faqTitle: "ხშირი კითხვები",
      faq: [
        {
          question: "ეს ნამდვილი ტელესკოპია?",
          answer: `დიახ. ერთი ტელესკოპი ფერადი კამერით.`,
          link: { label: "ობსერვატორიის ნახვა", path: "observatory" },
        },
        {
          question: "აღჭურვილობა მჭირდება?",
          answer: "არა. მხოლოდ ბრაუზერი.",
        },
        {
          question: "როდის შემიძლია დაკვირვება?",
          answer: "ბნელ საათებში, GMT+4. დასაჯავშნად ჩანს მომდევნო 7 ღამე.",
          link: { label: "დაჯავშნა", path: "app/book" },
        },
        {
          question: "რა ხდება, თუ მოღრუბლულია?",
          answer: "სეანსი ჩერდება. ჯავშანს თანხის დაბრუნების პოლიტიკა ფარავს.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
        {
          question: "სურათების შენახვა შემიძლია?",
          answer: "დიახ. კადრები კოლექციაში ინახება და მათი ჩამოტვირთვა შეიძლება.",
        },
      ],
    },
    pricing: {
      eyebrow: "რას გაძლევს სეანსი",
      title: "დრო ერთ ნამდვილ ტელესკოპთან.",
      lede: "სეანსის დროს მთელი ტელესკოპი შენია. რიგი არ არის.",
      faqTitle: "გადახდა და ფასები",
      faq: [
        {
          question: "როგორ გადავიხადო?",
          answer: "დაჯავშნის ბოლოს, დაცულ გვერდზე. გადახდისას სეანსი შენთვისაა დაკავებული.",
        },
        {
          question: "საიდან არის ეს ფასები?",
          answer: "აქ იგივე ფასია, რასაც გადახდისას ნახავ.",
          link: { label: "ამაღამის სეანსები", path: "app/book" },
        },
        {
          question: "სხვისი სეანსის ყურება უფასოა?",
          answer: "არა. ადგილი ფასიანია და ფასს გადახდამდე ნახავ.",
        },
        {
          question: "რა მოხდება, თუ სეანსი ვერ ჩატარდა?",
          answer: "ამინდს, ხილვადობასა და ხარვეზებს თანხის დაბრუნების პოლიტიკა ფარავს. ის გაშვებამდე დაზუსტდება.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
      ],
      cta: {
        title: "გინდა, თავად ნახო?",
        body: "აირჩიე ღამე და ობიექტი.",
        action: { label: "დაჯავშნე სეანსი", path: "app/book" },
        secondary: { label: "სცადე ობსერვატორია", path: "observatory" },
      },
    },
  },
};
