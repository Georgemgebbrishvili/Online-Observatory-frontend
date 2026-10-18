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

export type GuideId = "home" | "book" | "pricing" | "observatory";

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
      lede: "Live view stacks many short exposures while you watch, so faint objects build up on screen over a few minutes. It is the eyepiece, made bigger and shared, not a long-exposure photograph.",
      pointsTitle: "What the telescope points at",
      points: [
        {
          title: "Planets",
          body: "Jupiter's cloud belts and its four large moons, Saturn's rings, Venus in phase, Mars near opposition.",
        },
        {
          title: "Double stars",
          body: "Pairs like Albireo, gold and blue, or Mizar and Alcor, split cleanly at the telescope's focal length.",
        },
        {
          title: "Star clusters",
          body: "Globular clusters such as M13 and M15 resolve into thousands of points as the stack deepens.",
        },
        {
          title: "Nebulae",
          body: "The Ring, the Dumbbell and the Orion Nebula show their shape and some colour in live view.",
        },
      ],
      faqTitle: "Questions people ask first",
      faq: [
        {
          question: "Is this a real telescope?",
          answer: `Yes. ${brand.en.name} is one telescope with a colour astronomy camera on a mount in Tbilisi, Georgia. Until the observatory opens it runs on a simulator, and every simulated picture is badged "Simulated".`,
          link: { label: "See the observatory", path: "observatory" },
        },
        {
          question: "Do I need any equipment or software?",
          answer: "No. A browser on a phone or a computer is enough. The telescope is controlled by the observatory's own software; you choose the target and watch.",
        },
        {
          question: "When can I observe?",
          answer: "Slots run through the dark hours of the night, in observatory time (Tbilisi, GMT+4). The booking page shows the next seven nights and what is above the horizon for each slot.",
          link: { label: "Open the booking page", path: "app/book" },
        },
        {
          question: "What happens if it is cloudy?",
          answer: "The observatory watches the weather. If clouds stop the telescope, the session goes on a weather hold and the page tells you. What happens to the booking is set out in the refund policy.",
          link: { label: "Read the refund policy", path: "refunds" },
        },
        {
          question: "Can I keep the pictures?",
          answer: "Yes. Every capture you take during your slot goes into your Collection, where you can open and download it.",
        },
      ],
    },
    book: {
      eyebrow: "How booking works",
      title: "Four choices, then the sky is yours.",
      lede: "A slot is half an hour of the telescope, held for you alone. You pick when, the board shows only what is up for the whole slot, and you pay to confirm.",
      stepsTitle: "Booking, step by step",
      steps: [
        {
          title: "Pick a night",
          body: "The next seven nights, each with its Moon phase and how many slots are still open.",
        },
        {
          title: "Pick a start",
          body: "Start times are in observatory time, Tbilisi (GMT+4). A slot that has already begun cannot be booked.",
        },
        {
          title: "Choose a target",
          body: "Only operator-approved targets that stay above the horizon for the whole slot are offered.",
        },
        {
          title: "Reserve and pay",
          body: "The slot is held while you pay. If the payment does not complete, the hold lapses and the slot goes back on the board.",
        },
      ],
      faqTitle: "Before you book",
      faq: [
        {
          question: "What do I do when my slot starts?",
          answer: "Open Live from the Account menu, or the link on your booking. The telescope slews to your target, centres it, and the camera picture appears. You can capture frames while you watch.",
        },
        {
          question: "Can I invite someone to watch with me?",
          answer: "Yes. From your live session you can share a watch link. Up to ten people can take a seat and see the same picture; the telescope stays under your control.",
        },
        {
          question: "Can I move or cancel a booking?",
          answer: "Your bookings are listed on this page under the board. Where a booking can still be moved, it offers a new time. Cancellation and refunds follow the refund policy.",
          link: { label: "Read the refund policy", path: "refunds" },
        },
        {
          question: "Why is a target missing?",
          answer: "Targets are offered only while they stay high enough for the whole slot. Pick a different start time and the list changes with the sky.",
        },
      ],
    },
    pricing: {
      eyebrow: "What a slot gives you",
      title: "Time with one real telescope.",
      lede: "A slot is the whole instrument for its length: the mount, the camera and the picture they make, with nobody else in the queue.",
      pointsTitle: "Included with every slot",
      points: [
        {
          title: "The telescope to yourself",
          body: "One customer at a time. Nobody else can move it during your slot.",
        },
        {
          title: "Your target, centred",
          body: "The observatory slews, checks where it is pointing and centres your target before the picture starts.",
        },
        {
          title: "The live camera picture",
          body: "Short exposures stacked live, so the image deepens while you watch.",
        },
        {
          title: "Captures you keep",
          body: "Every frame you capture is saved in your Collection to open and download later.",
        },
        {
          title: "Seats for friends",
          body: "Share a watch link and up to ten people can see what you see.",
        },
        {
          title: "Weather watched for you",
          body: "If the sky closes, the session goes on hold and the refund policy covers the booking.",
        },
      ],
      faqTitle: "Paying and prices",
      faq: [
        {
          question: "How do I pay?",
          answer: "On a secure payment page at the end of booking. The slot is held for you while the payment completes.",
        },
        {
          question: "Where do the amounts on this page come from?",
          answer: "The observatory sets the price per slot. This page reads it live from the booking board, the same figure you see at checkout, so it is never an old number.",
          link: { label: "See tonight's slots", path: "app/book" },
        },
        {
          question: "Is watching somebody else's session free?",
          answer: "A seat in a live session is priced per seat, and the watch link shows that price before you pay.",
        },
        {
          question: "What if the session cannot run?",
          answer: "Weather, visibility and technical faults are covered by the refund policy, which is being finalised before launch.",
          link: { label: "Read the refund policy", path: "refunds" },
        },
      ],
      cta: {
        title: "Ready to see it for yourself?",
        body: "Pick a night and a target, and watch the real sky from wherever you are.",
        action: { label: "Reserve a slot", path: "app/book" },
        secondary: { label: "Try the observatory", path: "observatory" },
      },
    },
    observatory: {
      eyebrow: "About the observatory",
      title: "One telescope in Tbilisi, run for you remotely.",
      lede: "The console above is a practice run on a sky model: connect, point and capture exactly as a session works. When you book, the same steps drive the real instrument.",
      stepsTitle: "What happens in a real session",
      steps: [
        {
          title: "Slew",
          body: "The mount turns to your target. It refuses any position too low, too close to the Sun, or outside the horizon mask.",
        },
        {
          title: "Verify and centre",
          body: "The camera takes a frame, the software works out where it is pointing, and the mount corrects until the target is centred.",
        },
        {
          title: "Observe",
          body: "Short exposures are stacked live and streamed to your screen as the picture builds up.",
        },
        {
          title: "Capture",
          body: "Save the frame you like. It goes into your Collection with its time and target.",
        },
      ],
      faqTitle: "About the instrument",
      faq: [
        {
          question: "Can my browser move the telescope directly?",
          answer: `No. The observatory accepts no connection from outside. It dials out to the ${brand.en.name} cloud, and checks every command again on its own before the mount moves.`,
        },
        {
          question: "Is this console the real telescope?",
          answer: `Not yet. Until the observatory opens, the console runs on a sky model and is badged "Simulated". Everything it draws is an illustration, not telescope output.`,
        },
        {
          question: "What is the instrument?",
          answer: "A telescope with a ZWO ASI585MC colour camera on a computerised mount. Its aperture and focal length are on the home page, and its live state on the status page.",
          link: { label: "Live status", path: "status" },
        },
      ],
      cta: {
        title: "Book the real one.",
        body: "Time on the telescope, a target of your choice, and the live picture.",
        action: { label: "Reserve a slot", path: "app/book" },
        secondary: { label: "See prices", path: "pricing" },
      },
    },
  },
  ka: {
    home: {
      eyebrow: "რას დაინახავ",
      title: "ცა ისე, როგორც კამერა ხედავს — ამაღამ.",
      lede: "პირდაპირი გამოსახულება შენს თვალწინ ბევრ მოკლე ექსპოზიციას აჯამებს, ამიტომ მკრთალი ობიექტები რამდენიმე წუთში იკვეთება ეკრანზე. ეს ოკულარია — გადიდებული და გაზიარებული — და არა ხანგრძლივი ექსპოზიციის ფოტო.",
      pointsTitle: "რას აკვირდება ტელესკოპი",
      points: [
        {
          title: "პლანეტები",
          body: "იუპიტერის ღრუბლოვანი სარტყლები და მისი ოთხი დიდი თანამგზავრი, სატურნის რგოლები, ვენერას ფაზა, მარსი დაპირისპირების დროს.",
        },
        {
          title: "ორმაგი ვარსკვლავები",
          body: "წყვილები, როგორიცაა ოქროსფერი და ცისფერი ალბირეო ან მიცარი და ალკორი, ტელესკოპის ფოკუსურ მანძილზე მკაფიოდ იყოფა.",
        },
        {
          title: "ვარსკვლავთგროვები",
          body: "სფერული გროვები, როგორიცაა M13 და M15, დაჯამებასთან ერთად ათასობით წერტილად იშლება.",
        },
        {
          title: "ნისლეულები",
          body: "რგოლისებრი, ჰანტელის და ორიონის ნისლეულები პირდაპირ გამოსახულებაშიც აჩვენებენ ფორმას და ცოტა ფერსაც.",
        },
      ],
      faqTitle: "პირველი კითხვები",
      faq: [
        {
          question: "ეს ნამდვილი ტელესკოპია?",
          answer: `დიახ. ${brand.ka.nominative} ერთი ტელესკოპია ფერადი ასტრონომიული კამერით, მონტირებაზე, თბილისში. ობსერვატორიის გახსნამდე ის სიმულატორზე მუშაობს და ყოველი სიმულირებული სურათი მონიშნულია, როგორც „სიმულირებული“.`,
          link: { label: "ობსერვატორიის ნახვა", path: "observatory" },
        },
        {
          question: "მჭირდება რაიმე აღჭურვილობა ან პროგრამა?",
          answer: "არა. საკმარისია ბრაუზერი ტელეფონზე ან კომპიუტერზე. ტელესკოპს ობსერვატორიის საკუთარი პროგრამა მართავს — შენ ირჩევ ობიექტს და უყურებ.",
        },
        {
          question: "როდის შემიძლია დაკვირვება?",
          answer: "სეანსები ღამის ბნელ საათებშია, ობსერვატორიის დროით (თბილისი, GMT+4). დაჯავშნის გვერდზე ჩანს მომდევნო შვიდი ღამე და ის, რაც თითოეულ სეანსზე ჰორიზონტს ზემოთაა.",
          link: { label: "დაჯავშნის გვერდის გახსნა", path: "app/book" },
        },
        {
          question: "რა ხდება, თუ მოღრუბლულია?",
          answer: "ობსერვატორია ამინდს ადევნებს თვალს. თუ ღრუბლები ტელესკოპს აჩერებს, სეანსი ამინდის გამო ჩერდება და გვერდი ამას გაცნობებს. რა ემართება ჯავშანს, თანხის დაბრუნების პოლიტიკაშია აღწერილი.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
        {
          question: "შემიძლია სურათების შენახვა?",
          answer: "დიახ. ყოველი კადრი, რომელსაც სეანსის დროს გადაიღებ, შენს კოლექციაში ინახება — იქ შეგიძლია გახსნა და ჩამოტვირთვა.",
        },
      ],
    },
    book: {
      eyebrow: "როგორ ხდება დაჯავშნა",
      title: "ოთხი არჩევანი — და ცა შენია.",
      lede: "სეანსი ტელესკოპთან ნახევარი საათია — მხოლოდ შენთვის. შენ ირჩევ დროს, დაფა მხოლოდ იმას გაჩვენებს, რაც მთელი სეანსის განმავლობაში ჩანს, და დასადასტურებლად იხდი.",
      stepsTitle: "დაჯავშნა ნაბიჯ-ნაბიჯ",
      steps: [
        {
          title: "აირჩიე ღამე",
          body: "მომდევნო შვიდი ღამე, თითოეული მთვარის ფაზით და თავისუფალი სეანსების რაოდენობით.",
        },
        {
          title: "აირჩიე დასაწყისი",
          body: "დაწყების დრო ობსერვატორიის დროითაა — თბილისი (GMT+4). უკვე დაწყებული სეანსის დაჯავშნა შეუძლებელია.",
        },
        {
          title: "აირჩიე ობიექტი",
          body: "შემოთავაზებულია მხოლოდ ოპერატორის მიერ დამტკიცებული ობიექტები, რომლებიც მთელი სეანსის განმავლობაში ჰორიზონტს ზემოთ რჩება.",
        },
        {
          title: "დაჯავშნე და გადაიხადე",
          body: "სანამ იხდი, სეანსი შენთვისაა დაკავებული. თუ გადახდა არ დასრულდა, დაკავება იხსნება და სეანსი დაფაზე ბრუნდება.",
        },
      ],
      faqTitle: "დაჯავშნამდე",
      faq: [
        {
          question: "რა ვქნა, როცა სეანსი დაიწყება?",
          answer: "გახსენი „პირდაპირი დაკვირვება“ ანგარიშის მენიუდან ან ჯავშნის ბმულიდან. ტელესკოპი შენი ობიექტისკენ მობრუნდება, ცენტრში მოაქცევს და კამერის გამოსახულება გამოჩნდება. ყურების დროს შეგიძლია კადრების გადაღება.",
        },
        {
          question: "შემიძლია ვინმე მოვიწვიო საყურებლად?",
          answer: "დიახ. პირდაპირი ეთერიდან შეგიძლია გააზიარო სანახავი ბმული. ათამდე ადამიანს შეუძლია ადგილის დაკავება და იმავე სურათის ნახვა — ტელესკოპს კი ისევ შენ მართავ.",
        },
        {
          question: "შემიძლია ჯავშნის გადატანა ან გაუქმება?",
          answer: "შენი ჯავშნები ამ გვერდზე, დაფის ქვემოთაა. სადაც ჯავშნის გადატანა ჯერ კიდევ შესაძლებელია, ის ახალ დროს შემოგთავაზებს. გაუქმება და თანხის დაბრუნება პოლიტიკით რეგულირდება.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
        {
          question: "რატომ არ ჩანს ობიექტი?",
          answer: "ობიექტი მხოლოდ მაშინ ჩანს, როცა მთელი სეანსის განმავლობაში საკმარისად მაღლაა. აირჩიე სხვა დასაწყისი და სია ცასთან ერთად შეიცვლება.",
        },
      ],
    },
    pricing: {
      eyebrow: "რას გაძლევს სეანსი",
      title: "დრო ერთ ნამდვილ ტელესკოპთან.",
      lede: "სეანსის განმავლობაში მთელი ინსტრუმენტი შენია: მონტირება, კამერა და გამოსახულება, რომელსაც ისინი ქმნიან — რიგში არავინაა.",
      pointsTitle: "ყოველ სეანსში შედის",
      points: [
        {
          title: "ტელესკოპი მხოლოდ შენთვის",
          body: "ერთდროულად ერთი მომხმარებელი. შენი სეანსის დროს მას ვერავინ ამოძრავებს.",
        },
        {
          title: "შენი ობიექტი, დაცენტრებული",
          body: "ტელესკოპი მობრუნდება, ამოწმებს, საით უყურებს, და გამოსახულების დაწყებამდე ობიექტს ცენტრში მოაქცევს.",
        },
        {
          title: "კამერის პირდაპირი სურათი",
          body: "მოკლე ექსპოზიციები რეალურ დროში ჯამდება და გამოსახულება შენს თვალწინ იკვეთება.",
        },
        {
          title: "კადრები, რომლებიც შენ გრჩება",
          body: "ყოველი გადაღებული კადრი შენს კოლექციაში ინახება — მოგვიანებით გასახსნელად და ჩამოსატვირთად.",
        },
        {
          title: "ადგილები მეგობრებისთვის",
          body: "გააზიარე სანახავი ბმული და ათამდე ადამიანი დაინახავს იმას, რასაც შენ ხედავ.",
        },
        {
          title: "ამინდს ჩვენ ვადევნებთ თვალს",
          body: "თუ ცა მოიღრუბლა, სეანსი ჩერდება და ჯავშანს თანხის დაბრუნების პოლიტიკა ფარავს.",
        },
      ],
      faqTitle: "გადახდა და ფასები",
      faq: [
        {
          question: "როგორ გადავიხადო?",
          answer: "დაჯავშნის ბოლოს, დაცულ გადახდის გვერდზე. სანამ გადახდა სრულდება, სეანსი შენთვისაა დაკავებული.",
        },
        {
          question: "საიდან მოდის ამ გვერდზე მოცემული თანხები?",
          answer: "ფასს ყოველ სეანსზე ობსერვატორია ადგენს. ეს გვერდი მას პირდაპირ ჯავშნის გვერდიდან კითხულობს — იგივე თანხაა, რასაც გადახდისას ნახავ, ამიტომ ძველი ციფრი აქ არასდროს ჩანს.",
          link: { label: "ამაღამინდელი სეანსები", path: "app/book" },
        },
        {
          question: "სხვისი ეთერის ყურება უფასოა?",
          answer: "პირდაპირ ეთერში ადგილი ფასიანია — ფასი თითო ადგილზეა — და სანახავი ბმული მას გადახდამდე გაჩვენებს.",
        },
        {
          question: "რა მოხდება, თუ სეანსი ვერ ჩატარდა?",
          answer: "ამინდს, ხილვადობას და ტექნიკურ ხარვეზებს თანხის დაბრუნების პოლიტიკა ფარავს, რომელიც გაშვებამდე სრულდება.",
          link: { label: "თანხის დაბრუნების პოლიტიკა", path: "refunds" },
        },
      ],
      cta: {
        title: "გინდა, თავად ნახო?",
        body: "აირჩიე ღამე და ობიექტი და უყურე ნამდვილ ცას, სადაც არ უნდა იყო.",
        action: { label: "დაჯავშნე სეანსი", path: "app/book" },
        secondary: { label: "სცადე ობსერვატორია", path: "observatory" },
      },
    },
    observatory: {
      eyebrow: "ობსერვატორიის შესახებ",
      title: "ერთი ტელესკოპი თბილისში, შენთვის დისტანციურად.",
      lede: "ზემოთ მოცემული პულტი ცის მოდელზე სავარჯიშოა: დაუკავშირდი, მიმართე და გადაიღე ზუსტად ისე, როგორც ნამდვილ სეანსში. დაჯავშნისას იგივე ნაბიჯები ნამდვილ ინსტრუმენტს მართავს.",
      stepsTitle: "რა ხდება ნამდვილ სეანსში",
      steps: [
        {
          title: "მობრუნება",
          body: "მონტირება შენი ობიექტისკენ ბრუნდება. ის უარს ამბობს ყველა პოზიციაზე, რომელიც ძალიან დაბალია, მზესთან ახლოსაა ან ჰორიზონტის ნიღბის მიღმაა.",
        },
        {
          title: "შემოწმება და დაცენტრება",
          body: "კამერა იღებს კადრს, პროგრამა ადგენს, საით უმიზნებს, და მონტირება ასწორებს მიმართულებას, სანამ ობიექტი ცენტრში არ მოექცევა.",
        },
        {
          title: "დაკვირვება",
          body: "მოკლე ექსპოზიციები რეალურ დროში ჯამდება და შენს ეკრანზე გადმოდის, გამოსახულება კი თანდათან იკვეთება.",
        },
        {
          title: "გადაღება",
          body: "შეინახე მოწონებული კადრი. ის შენს კოლექციაში ხვდება, დროითა და ობიექტით.",
        },
      ],
      faqTitle: "ინსტრუმენტის შესახებ",
      faq: [
        {
          question: "შეუძლია ჩემს ბრაუზერს ტელესკოპის პირდაპირ ამოძრავება?",
          answer: `არა. ობსერვატორია გარედან არცერთ კავშირს არ იღებს. ის თავად უკავშირდება ${brand.ka.genitive} სერვერებს და ყოველ ბრძანებას დგარის ამოძრავებამდე დამოუკიდებლად ამოწმებს.`,
        },
        {
          question: "ეს პულტი ნამდვილ ტელესკოპს მართავს?",
          answer: "ჯერ არა. ობსერვატორიის გახსნამდე პულტი ცის მოდელზე მუშაობს და მონიშნულია, როგორც „სიმულირებული“. ყველაფერი, რასაც ხატავს, ილუსტრაციაა და არა ტელესკოპის გამოსახულება.",
        },
        {
          question: "რა ინსტრუმენტია?",
          answer: "ტელესკოპი ZWO ASI585MC ფერადი კამერით, კომპიუტერიზებულ მონტირებაზე. მისი აპერტურა და ფოკუსური მანძილი მთავარ გვერდზეა, მიმდინარე მდგომარეობა კი სტატუსის გვერდზე.",
          link: { label: "მიმდინარე სტატუსი", path: "status" },
        },
      ],
      cta: {
        title: "დაჯავშნე ნამდვილი.",
        body: "დრო ტელესკოპთან, შენი არჩეული ობიექტი და პირდაპირი სურათი.",
        action: { label: "დაჯავშნე სეანსი", path: "app/book" },
        secondary: { label: "ფასების ნახვა", path: "pricing" },
      },
    },
  },
};
