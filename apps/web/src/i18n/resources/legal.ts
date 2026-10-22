import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

// DV-072. None of these documents is in force. A section is `decided` only where a
// controlling document already settled it -- the sources are listed per section in
// docs/legal-source.md -- and `pending` everywhere else. Nothing here is drafted law:
// a pending section states that it is pending rather than guessing at its content.
export type LegalSection = {
  heading: string;
  /** A fixed anchor, for a section another page links to. Otherwise `section-N`. */
  anchor?: string;
} & ({ status: "decided"; body: string[] } | { status: "pending" });

export type LegalDocument = {
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  sections: LegalSection[];
};

export type LegalDocumentId = "terms" | "privacy" | "refunds";

export type LegalCopy = {
  noticeMarker: string;
  noticeTitle: string;
  notice: string;
  decidedLabel: string;
  pendingLabel: string;
  pendingDetail: string;
  /** "{pending} of {total}": how many of the document's sections await review. */
  pendingSummary: string;
  contents: string;
  back: string;
  documents: Record<LegalDocumentId, LegalDocument>;
};

// The route segment for each document, shared by the pages, the footer and the tests.
export const legalPaths: Record<LegalDocumentId, string> = {
  terms: "terms",
  privacy: "privacy",
  refunds: "refunds",
};

export const legalCopy: Record<Locale, LegalCopy> = {
  en: {
    noticeMarker: "DRAFT",
    noticeTitle: "This document is not yet in force",
    notice: `${brand.en.name} has not launched and this document is awaiting legal review. Sections marked as settled record decisions already taken about how the service will work. They are published for transparency and do not yet bind anyone.`,
    decidedLabel: "Settled",
    pendingLabel: "Awaiting legal review",
    pendingDetail: `Each will be written and reviewed before ${brand.en.name} opens.`,
    pendingSummary: "{pending} of {total} sections are awaiting legal review.",
    contents: "Contents",
    back: `Return to ${brand.en.name}`,
    documents: {
      terms: {
        metadataTitle: `Terms of service · ${brand.en.name}`,
        metadataDescription: `Draft terms of service for ${brand.en.name}, a live remote observatory in Tbilisi. Not yet in force.`,
        title: "Terms of service",
        sections: [
          {
            heading: `What ${brand.en.name} is`,
            status: "decided",
            body: [
              `${brand.en.name} is a live remote observatory in Tbilisi, Georgia. You reserve an observation slot, choose a target from an operator-approved list, and a real telescope moves to that target while you watch its camera output.`,
              `${brand.en.name} is a live-view service. It uses short exposures and live stacking, the technique usually called electronically assisted astronomy. It is not a long-exposure astrophotography service, and it does not produce results comparable to a research observatory or a space telescope.`,
            ],
          },
          {
            heading: "An observation slot",
            status: "decided",
            body: [
              "A slot is a reserved period of telescope time with an operator-approved target. One observation runs at a time, and one person controls the telescope for the length of their slot.",
              "The sky decides what is visible. A target that has set, has not risen, or sits below the telescope's safe altitude cannot be observed, whatever the booking says.",
            ],
          },
          { heading: "Your account", status: "pending" },
          { heading: "Weather, visibility and a slot we cannot run", status: "pending" },
          { heading: "Acceptable use", status: "pending" },
          { heading: "Availability, liability and limits", status: "pending" },
          {
            heading: "The weekly cards",
            anchor: "card-draw",
            status: "decided",
            body: [
              "A signed-in account with a verified email address is dealt three face-down cards each week, Monday to Sunday in Tbilisi time, and may turn one. Playing is free. Cards are never sold, and nothing is bought to play.",
              "What each card holds is decided when the cards are dealt, before you choose. A card can hold a free observation slot, a free observer seat on a live session, a discount on one booking, or nothing. The chance of each is shown on the cards page, as the service holds it at that moment, and a limited number of free slots can be won each week.",
              "A prize belongs to the account that won it, can be used only at the observatory it was won for, and expires 30 days after it is won. It cannot be exchanged for money or transferred. One account per person.",
            ],
          },
          { heading: "Changes to these terms", status: "pending" },
          { heading: "Governing law and disputes", status: "pending" },
        ],
      },
      privacy: {
        metadataTitle: `Privacy policy · ${brand.en.name}`,
        metadataDescription: `Draft privacy policy for ${brand.en.name}, a live remote observatory in Tbilisi. Not yet in force.`,
        title: "Privacy policy",
        sections: [
          {
            heading: "Staying signed in",
            status: "decided",
            body: [
              "Signing in sets session cookies in your browser. They exist to keep you signed in and to protect the forms you submit against cross-site request forgery. They are not advertising cookies and they do not follow you to other sites.",
            ],
          },
          { heading: `What ${brand.en.name} collects`, status: "pending" },
          { heading: "Your captures and your Collection", status: "pending" },
          { heading: "Payment information", status: "pending" },
          { heading: "Who else processes your data", status: "pending" },
          { heading: "How long data is kept", status: "pending" },
          { heading: "Your rights over your data", status: "pending" },
          { heading: "How to contact us about privacy", status: "pending" },
        ],
      },
      refunds: {
        metadataTitle: `Refund policy · ${brand.en.name}`,
        metadataDescription: `Draft refund and cancellation policy for ${brand.en.name}, a live remote observatory in Tbilisi. Not yet in force.`,
        title: "Refund policy",
        sections: [
          {
            heading: "Bookings paid with minutes or a voucher",
            status: "decided",
            body: [
              "Where a booking is released — because it was cancelled, because a payment failed, or because it was refunded — whatever paid for it comes back in the form it was paid.",
              "A booking paid with subscription minutes returns the minutes. A booking paid with a voucher restores the voucher. Neither returns money.",
            ],
          },
          {
            heading: "Cancelling a subscription",
            status: "decided",
            body: [
              "Cancelling a subscription part-way through a month refunds nothing. The month is already paid for and its minutes have already been granted, so they remain yours until the period ends.",
              "Unspent minutes expire at the end of the period they were granted for. They do not roll over.",
            ],
          },
          {
            heading: "When a subscription payment fails",
            status: "decided",
            body: [
              "A failed renewal is retried up to three times over seven days. If none succeeds, the subscription expires rather than continuing unpaid.",
            ],
          },
          { heading: "Cancelling a single observation", status: "pending" },
          { heading: "Clouds, and a slot that cannot be run", status: "pending" },
          { heading: "Equipment failure during your slot", status: "pending" },
          { heading: "How to ask for a refund", status: "pending" },
        ],
      },
    },
  },
  ka: {
    noticeMarker: "მონახაზი",
    noticeTitle: "ეს დოკუმენტი ჯერ არ მოქმედებს",
    notice: `${brand.ka.nominative} ჯერ არ გაშვებულა და ეს დოკუმენტი იურიდიულ განხილვას ელოდება. გადაწყვეტილად მონიშნული სექციები ასახავს უკვე მიღებულ გადაწყვეტილებებს სერვისის მუშაობის შესახებ. ისინი გამჭვირვალობისთვისაა გამოქვეყნებული და ჯერ არავის ავალდებულებს.`,
    decidedLabel: "გადაწყვეტილია",
    pendingLabel: "ელოდება იურიდიულ განხილვას",
    pendingDetail: `თითოეული დაიწერება და განიხილება ${brand.ka.genitive} გახსნამდე.`,
    pendingSummary: "{total} სექციიდან {pending} იურიდიულ განხილვას ელოდება.",
    contents: "სარჩევი",
    back: `${brand.ka.on} დაბრუნება`,
    documents: {
      terms: {
        metadataTitle: `მომსახურების პირობები · ${brand.ka.nominative}`,
        metadataDescription: `${brand.ka.genitive} მომსახურების პირობების მონახაზი. ჯერ არ მოქმედებს.`,
        title: "მომსახურების პირობები",
        sections: [
          {
            heading: `რა არის ${brand.ka.nominative}`,
            status: "decided",
            body: [
              `${brand.ka.nominative} დისტანციური ობსერვატორიაა თბილისში, რომელსაც პირდაპირ ეთერში უყურებ. შენ ჯავშნი დაკვირვების სეანსს, ირჩევ ობიექტს ოპერატორის მიერ დამტკიცებული სიიდან, და ნამდვილი ტელესკოპი ობიექტისკენ ფიზიკურად ბრუნდება, შენ კი კამერის გამოსახულებას უყურებ.`,
              `${brand.ka.nominative} პირდაპირი დაკვირვების სერვისია. ის იყენებს მოკლე ექსპოზიციებსა და კადრების რეალურ დროში დაჯამებას — მეთოდს, რომელსაც ელექტრონულად დახმარებულ ასტრონომიას (EAA) უწოდებენ. ეს არ არის ხანგრძლივი ექსპოზიციის ასტროფოტოგრაფიის სერვისი და არ იძლევა სამეცნიერო ობსერვატორიის ან კოსმოსური ტელესკოპის დონის შედეგს.`,
            ],
          },
          {
            heading: "დაკვირვების სეანსი",
            status: "decided",
            body: [
              "სეანსი ტელესკოპის დაჯავშნილი დროა ოპერატორის მიერ დამტკიცებულ ობიექტზე. ერთდროულად ერთი დაკვირვება მიმდინარეობს და ტელესკოპს ერთი ადამიანი მართავს საკუთარი სეანსის განმავლობაში.",
              "რა ჩანს, ამას ცა წყვეტს. ობიექტზე, რომელიც ჩავიდა, ჯერ არ ამოსულა ან ტელესკოპის უსაფრთხო სიმაღლეზე დაბლაა, დაკვირვება შეუძლებელია — რასაც არ უნდა ამბობდეს ჯავშანი.",
            ],
          },
          { heading: "შენი ანგარიში", status: "pending" },
          { heading: "ამინდი, ხილვადობა და სეანსი, რომელსაც ვერ ჩავატარებთ", status: "pending" },
          { heading: "გამოყენების წესები", status: "pending" },
          { heading: "ხელმისაწვდომობა და პასუხისმგებლობის ზღვარი", status: "pending" },
          {
            heading: "კვირის ბარათები",
            anchor: "card-draw",
            status: "decided",
            body: [
              "ავტორიზებულ ანგარიშს დადასტურებული ელფოსტით ყოველ კვირას, ორშაბათიდან კვირამდე თბილისის დროით, ურიგდება სამი დაფარული ბარათი და შეუძლია ერთის გადაბრუნება. თამაში უფასოა. ბარათები არასდროს იყიდება და სათამაშოდ არაფრის ყიდვა არ არის საჭირო.",
              "რა არის თითოეულ ბარათში, წყდება დარიგებისას, შენს არჩევამდე. ბარათში შეიძლება იყოს უფასო დაკვირვების სეანსი, დამკვირვებლის უფასო ადგილი პირდაპირ ეთერში, ფასდაკლება ერთ ჯავშანზე, ან არაფერი. თითოეულის შანსი ბარათების გვერდზეა ნაჩვენები, როგორც სერვისს ამ მომენტში აქვს დადგენილი, და კვირაში შეზღუდული რაოდენობის უფასო სეანსი გაიცემა.",
              "პრიზი ეკუთვნის ანგარიშს, რომელმაც ის მოიგო, გამოიყენება მხოლოდ იმ ობსერვატორიაში, რომლისთვისაც მოიგო, და ვადა მოგებიდან 30 დღეში გასდის. ის ფულზე არ იცვლება და სხვას არ გადაეცემა. ერთი ადამიანი — ერთი ანგარიში.",
            ],
          },
          { heading: "ცვლილებები ამ პირობებში", status: "pending" },
          { heading: "მოქმედი სამართალი და დავები", status: "pending" },
        ],
      },
      privacy: {
        metadataTitle: `კონფიდენციალურობის პოლიტიკა · ${brand.ka.nominative}`,
        metadataDescription: `${brand.ka.genitive} კონფიდენციალურობის პოლიტიკის მონახაზი. ჯერ არ მოქმედებს.`,
        title: "კონფიდენციალურობის პოლიტიკა",
        sections: [
          {
            heading: "სისტემაში დარჩენა",
            status: "decided",
            body: [
              "შესვლისას ბრაუზერში იწერება სესიის ქუქი-ფაილები. ისინი საჭიროა იმისთვის, რომ სისტემაში დარჩე და შენ მიერ გაგზავნილი ფორმები დაცული იყოს. ეს არ არის სარეკლამო ქუქი-ფაილები და ისინი სხვა საიტებზე არ მოგყვება.",
            ],
          },
          { heading: `რა მონაცემებს აგროვებს ${brand.ka.nominative}`, status: "pending" },
          { heading: "შენი კადრები და კოლექცია", status: "pending" },
          { heading: "გადახდის მონაცემები", status: "pending" },
          { heading: "ვინ ამუშავებს შენს მონაცემებს", status: "pending" },
          { heading: "რამდენ ხანს ინახება მონაცემები", status: "pending" },
          { heading: "შენი უფლებები მონაცემებზე", status: "pending" },
          { heading: "როგორ დაგვიკავშირდე", status: "pending" },
        ],
      },
      refunds: {
        metadataTitle: `თანხის დაბრუნების პოლიტიკა · ${brand.ka.nominative}`,
        metadataDescription: `${brand.ka.genitive} თანხის დაბრუნებისა და გაუქმების პოლიტიკის მონახაზი. ჯერ არ მოქმედებს.`,
        title: "თანხის დაბრუნების პოლიტიკა",
        sections: [
          {
            heading: "წუთებით ან ვაუჩერით გადახდილი ჯავშანი",
            status: "decided",
            body: [
              "როცა ჯავშანი თავისუფლდება — გაუქმების, გადახდის წარუმატებლობის ან თანხის დაბრუნების გამო — ის, რითაც გადაიხადე, იმავე ფორმით გიბრუნდება.",
              "გამოწერის წუთებით გადახდილი ჯავშანი წუთებს აბრუნებს. ვაუჩერით გადახდილი ჯავშანი ვაუჩერს აღადგენს. არცერთი არ აბრუნებს ფულს.",
            ],
          },
          {
            heading: "გამოწერის გაუქმება",
            status: "decided",
            body: [
              "გამოწერის თვის შუაში გაუქმებისას თანხა არ ბრუნდება. თვე უკვე გადახდილია და მისი წუთები უკვე დარიცხულია, ამიტომ ისინი პერიოდის ბოლომდე შენი რჩება.",
              "დაუხარჯავი წუთები პერიოდის ბოლოს ქრება და შემდეგ თვეზე არ გადადის.",
            ],
          },
          {
            heading: "როცა გამოწერის გადახდა ვერ ხერხდება",
            status: "decided",
            body: [
              "წარუმატებელი განახლება მეორდება მაქსიმუმ სამჯერ, შვიდი დღის განმავლობაში. თუ ვერცერთი გამოვა, გამოწერა წყდება და გადაუხდელად არ გრძელდება.",
            ],
          },
          { heading: "ერთჯერადი დაკვირვების გაუქმება", status: "pending" },
          { heading: "ღრუბლები და სეანსი, რომელიც ვერ ჩატარდება", status: "pending" },
          { heading: "აპარატურის ხარვეზი შენი სეანსის დროს", status: "pending" },
          { heading: "როგორ მოითხოვო თანხის დაბრუნება", status: "pending" },
        ],
      },
    },
  },
};
