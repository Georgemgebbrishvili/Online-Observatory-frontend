import { brand } from "@/brand";
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

export type GuideId = "home" | "pricing" | "observatory";

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
          answer: `Yes. One telescope with a colour camera, in Georgia.`,
          link: { label: "See the observatory", path: "observatory" },
        },
        {
          question: "Do I need any equipment or software?",
          answer: "No. A browser on a phone or computer is enough.",
        },
        {
          question: "When can I observe?",
          answer: "Through the dark hours, Georgia time (GMT+4). Booking shows the next seven nights.",
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
      pointsTitle: "Included with every slot",
      points: [
        {
          title: "The telescope to yourself",
          body: "One customer at a time. Nobody else can move it.",
        },
        {
          title: "Your target, centred",
          body: "The telescope finds and centres your target.",
        },
        {
          title: "The live camera picture",
          body: "Short exposures stack live as you watch.",
        },
        {
          title: "Captures you keep",
          body: "Every capture is saved in your Collection.",
        },
        {
          title: "Seats for friends",
          body: "Share a watch link with up to ten people.",
        },
        {
          title: "Weather watched for you",
          body: "If clouds roll in, the session holds. The refund policy covers it.",
        },
      ],
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
    observatory: {
      eyebrow: "About the observatory",
      title: "One telescope in Georgia, run for you remotely.",
      lede: "The console works like a real session: connect, point, capture.",
      stepsTitle: "What happens in a real session",
      steps: [
        {
          title: "Slew",
          body: "The mount turns to your target. Too low, near the Sun or behind the horizon mask is refused.",
        },
        {
          title: "Verify and centre",
          body: "The camera takes a frame, finds where it points, and the mount centres the target.",
        },
        {
          title: "Observe",
          body: "Short exposures stack live on your screen.",
        },
        {
          title: "Capture",
          body: "Save the frame you like to your Collection, with time and target.",
        },
      ],
      faqTitle: "About the instrument",
      faq: [
        {
          question: "Can my browser move the telescope directly?",
          answer: `No. The observatory dials out to the ${brand.en.name} cloud and rechecks every command before it moves.`,
        },
        {
          question: "What is the instrument?",
          answer: "A telescope with a ZWO ASI585MC colour camera on a computerised mount. Its live state is on the status page.",
          link: { label: "Status", path: "status" },
        },
      ],
      cta: {
        title: "Book the real one.",
        body: "Time on the telescope, live.",
        action: { label: "Reserve a slot", path: "app/book" },
        secondary: { label: "See prices", path: "pricing" },
      },
    },
  },
  ka: {
    home: {
      eyebrow: "რას დაინახავ",
      title: "ცა ისე, როგორც კამერა ხედავს — ამაღამ.",
      lede: "ბევრი მოკლე კადრი შენს თვალწინ ჯამდება და მკრთალი ობიექტები რამდენიმე წუთში ჩნდება. ეს ხანგრძლივი ექსპოზიციის ფოტო არ არის.",
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
          title: "ვარსკვლავთგროვები",
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
          answer: `დიახ. ერთი ტელესკოპი ფერადი კამერით, საქართველოში.`,
          link: { label: "ობსერვატორიის ნახვა", path: "observatory" },
        },
        {
          question: "რამე აღჭურვილობა მჭირდება?",
          answer: "არა. საკმარისია ბრაუზერი ტელეფონზე ან კომპიუტერზე.",
        },
        {
          question: "როდის შემიძლია დაკვირვება?",
          answer: "ღამის ბნელ საათებში, საქართველოს დროით (GMT+4). დაჯავშნისას ჩანს მომდევნო შვიდი ღამე.",
          link: { label: "დაჯავშნა", path: "app/book" },
        },
        {
          question: "რა ხდება, თუ მოღრუბლულია?",
          answer: "სეანსი ამინდის გამო ჩერდება და გვერდი გაცნობებს. ჯავშანს თანხის დაბრუნების პოლიტიკა ფარავს.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
        {
          question: "სურათების შენახვა შემიძლია?",
          answer: "დიახ. ყოველი კადრი შენს კოლექციაში ინახება და შეგიძლია ჩამოტვირთო.",
        },
      ],
    },
    pricing: {
      eyebrow: "რას გაძლევს სეანსი",
      title: "დრო ერთ ნამდვილ ტელესკოპთან.",
      lede: "სეანსის დროს მთელი ტელესკოპი შენია. რიგი არ არის.",
      pointsTitle: "ყოველ სეანსში შედის",
      points: [
        {
          title: "ტელესკოპი მხოლოდ შენთვის",
          body: "ერთდროულად ერთი მომხმარებელი. მას სხვა ვერ ამოძრავებს.",
        },
        {
          title: "შენი ობიექტი, დაცენტრებული",
          body: "ტელესკოპი პოულობს შენს ობიექტს და ცენტრში აქცევს.",
        },
        {
          title: "პირდაპირი გამოსახულება",
          body: "მოკლე კადრები შენს თვალწინ ჯამდება.",
        },
        {
          title: "კადრები შენ გრჩება",
          body: "ყოველი კადრი შენს კოლექციაში ინახება.",
        },
        {
          title: "ადგილები მეგობრებისთვის",
          body: "გაუზიარე ბმული ათამდე ადამიანს.",
        },
        {
          title: "ამინდს ჩვენ ვადევნებთ თვალს",
          body: "თუ მოიღრუბლა, სეანსი ჩერდება. ჯავშანს თანხის დაბრუნების პოლიტიკა ფარავს.",
        },
      ],
      faqTitle: "გადახდა და ფასები",
      faq: [
        {
          question: "როგორ გადავიხადო?",
          answer: "დაჯავშნის ბოლოს, დაცულ გვერდზე. გადახდისას სეანსი შენთვისაა დაკავებული.",
        },
        {
          question: "საიდან არის ეს ფასები?",
          answer: "ფასს ობსერვატორია ადგენს. აქ იგივე ფასი ჩანს, რაც გადახდისას.",
          link: { label: "ამაღამინდელი სეანსები", path: "app/book" },
        },
        {
          question: "სხვისი სეანსის ყურება უფასოა?",
          answer: "არა. ადგილი ფასიანია და ფასს გადახდამდე ნახავ.",
        },
        {
          question: "რა მოხდება, თუ სეანსი ვერ ჩატარდა?",
          answer: "ამინდს, ხილვადობასა და ხარვეზებს თანხის დაბრუნების პოლიტიკა ფარავს. ის გაშვებამდე სრულდება.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
      ],
      cta: {
        title: "გინდა, თავად ნახო?",
        body: "აირჩიე ღამე და ობიექტი. უყურე ნამდვილ ცას, სადაც არ უნდა იყო.",
        action: { label: "დაჯავშნე სეანსი", path: "app/book" },
        secondary: { label: "სცადე ობსერვატორია", path: "observatory" },
      },
    },
    observatory: {
      eyebrow: "ობსერვატორიის შესახებ",
      title: "ერთი ტელესკოპი საქართველოში, დისტანციურად.",
      lede: "პულტი ნამდვილი სეანსივით მუშაობს: დაუკავშირდი, მიმართე, გადაიღე.",
      stepsTitle: "რა ხდება ნამდვილ სეანსში",
      steps: [
        {
          title: "მობრუნება",
          body: "მონტირება შენი ობიექტისკენ ბრუნდება. ძალიან დაბალი, მზესთან ახლო ან ნიღბის მიღმა პოზიცია იბლოკება.",
        },
        {
          title: "შემოწმება და დაცენტრება",
          body: "კამერა იღებს კადრს, პროგრამა ადგენს მიმართულებას და მონტირება ობიექტს ცენტრში აქცევს.",
        },
        {
          title: "დაკვირვება",
          body: "მოკლე კადრები ჯამდება და პირდაპირ შენს ეკრანზე ჩანს.",
        },
        {
          title: "გადაღება",
          body: "შეინახე მოწონებული კადრი. ის კოლექციაში ხვდება დროით და ობიექტით.",
        },
      ],
      faqTitle: "ინსტრუმენტის შესახებ",
      faq: [
        {
          question: "ჩემს ბრაუზერს შეუძლია ტელესკოპის ამოძრავება?",
          answer: `არა. ობსერვატორია გარედან კავშირს არ იღებს. ის თავად უკავშირდება ${brand.ka.genitive} სერვერს და ყოველ ბრძანებას მოძრაობამდე ხელახლა ამოწმებს.`,
        },
        {
          question: "რა ინსტრუმენტია?",
          answer: "ტელესკოპი ZWO ASI585MC ფერადი კამერით, კომპიუტერიზებულ მონტირებაზე. მიმდინარე მდგომარეობა სტატუსის გვერდზეა.",
          link: { label: "სტატუსი", path: "status" },
        },
      ],
      cta: {
        title: "დაჯავშნე ნამდვილი.",
        body: "დრო ტელესკოპთან, პირდაპირ.",
        action: { label: "დაჯავშნე სეანსი", path: "app/book" },
        secondary: { label: "ფასების ნახვა", path: "pricing" },
      },
    },
  },
};
