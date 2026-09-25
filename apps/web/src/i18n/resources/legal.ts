import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

// DV-072. None of these documents is in force. A section is `decided` only where a
// controlling document already settled it -- the sources are listed per section in
// docs/legal-source.md -- and `pending` everywhere else. Nothing here is drafted law:
// a pending section states that it is pending rather than guessing at its content.
export type LegalSection = {
  heading: string;
} & ({ status: "decided"; body: string[] } | { status: "pending" });

export type LegalDocument = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  introduction: string;
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
    noticeTitle: "These terms are not yet in force",
    notice: `${brand.en.name} has not launched and this document is awaiting legal review. Sections marked as settled record decisions already taken about how the service will work. They are published for transparency and do not yet bind anyone.`,
    decidedLabel: "Settled",
    pendingLabel: "Awaiting legal review",
    pendingDetail: `This section will be written and reviewed before ${brand.en.name} opens.`,
    back: `Return to ${brand.en.name}`,
    documents: {
      terms: {
        metadataTitle: `${brand.en.name} · Terms of service`,
        metadataDescription: `Draft terms of service for ${brand.en.name}, a live remote observatory in Tbilisi. Not yet in force.`,
        eyebrow: "LEGAL · DRAFT",
        title: "Terms of service",
        introduction: `What ${brand.en.name} offers, and what it does not. This draft is published early so that the parts already settled can be read and challenged.`,
        sections: [
          {
            heading: `What ${brand.en.name} is`,
            status: "decided",
            body: [
              `${brand.en.name} is a live remote observatory in Tbilisi, Georgia. You reserve an observation slot, choose a target from an operator-approved list, and a real Celestron NexStar 6SE moves to that target while you watch its camera output.`,
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
          { heading: "Weather, visibility and a slot we cannot fly", status: "pending" },
          { heading: "Acceptable use", status: "pending" },
          { heading: "Availability, liability and limits", status: "pending" },
          { heading: "Changes to these terms", status: "pending" },
          { heading: "Governing law and disputes", status: "pending" },
        ],
      },
      privacy: {
        metadataTitle: `${brand.en.name} · Privacy policy`,
        metadataDescription: `Draft privacy policy for ${brand.en.name}, a live remote observatory in Tbilisi. Not yet in force.`,
        eyebrow: "LEGAL · DRAFT",
        title: "Privacy policy",
        introduction: `What ${brand.en.name} records about you and why. This document needs a data inventory and legal review before it can be published properly.`,
        sections: [
          {
            heading: "Staying signed in",
            status: "decided",
            body: [
              "Signing in sets session cookies in your browser. They exist to keep you signed in and to protect the forms you submit against cross-site request forgery. They are not advertising cookies and they do not follow you to other sites.",
            ],
          },
          { heading: `What ${brand.en.name} collects`, status: "pending" },
          { heading: "Your captures and your collection", status: "pending" },
          { heading: "Payment information", status: "pending" },
          { heading: "Who else processes your data", status: "pending" },
          { heading: "How long data is kept", status: "pending" },
          { heading: "Your rights over your data", status: "pending" },
          { heading: "How to contact us about privacy", status: "pending" },
        ],
      },
      refunds: {
        metadataTitle: `${brand.en.name} · Refund policy`,
        metadataDescription: `Draft refund and cancellation policy for ${brand.en.name}, a live remote observatory in Tbilisi. Not yet in force.`,
        eyebrow: "LEGAL · DRAFT",
        title: "Refund policy",
        introduction:
          "When money comes back, when telescope time comes back instead, and when neither does. Weather makes this document matter more than it would for most services.",
        sections: [
          {
            heading: "Bookings paid with credits or a voucher",
            status: "decided",
            body: [
              "Where a booking is released — because it was cancelled, because a payment failed, or because it was refunded — whatever paid for it comes back in the form it was paid.",
              "A booking paid with subscription credits returns the credits. A booking paid with a voucher restores the voucher. Neither returns money.",
            ],
          },
          {
            heading: "Cancelling a subscription",
            status: "decided",
            body: [
              "Cancelling a subscription part-way through a month refunds nothing. The month is already paid for and its credits have already been granted, so they remain yours until the period ends.",
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
          { heading: "Clouds, and a slot that cannot be flown", status: "pending" },
          { heading: "Equipment failure during your slot", status: "pending" },
          { heading: "How to ask for a refund", status: "pending" },
        ],
      },
    },
  },
  ka: {
    noticeMarker: "მონახაზი",
    noticeTitle: "ეს პირობები ჯერ არ მოქმედებს",
    notice: `${brand.ka.nominative} ჯერ არ ამოქმედებულა და ეს დოკუმენტი იურიდიულ განხილვას ელოდება. გადაწყვეტილად მონიშნული სექციები ასახავს უკვე მიღებულ გადაწყვეტილებებს სერვისის მუშაობის შესახებ. ისინი გამჭვირვალობისთვისაა გამოქვეყნებული და ჯერ არავის ავალდებულებს.`,
    decidedLabel: "გადაწყვეტილია",
    pendingLabel: "ელოდება იურიდიულ განხილვას",
    pendingDetail: `ეს სექცია დაიწერება და განიხილება ${brand.ka.genitive} გახსნამდე.`,
    back: `${brand.ka.on} დაბრუნება`,
    documents: {
      terms: {
        metadataTitle: `${brand.ka.nominative} · მომსახურების პირობები`,
        metadataDescription: `${brand.ka.genitive} მომსახურების პირობების მონახაზი. ჯერ არ მოქმედებს.`,
        eyebrow: "იურიდიული · მონახაზი",
        title: "მომსახურების პირობები",
        introduction: `რას გთავაზობთ ${brand.ka.nominative} და რას არა. მონახაზი ადრე ქვეყნდება, რომ უკვე გადაწყვეტილი ნაწილი წაკითხვადი და სადავო იყოს.`,
        sections: [
          {
            heading: `რა არის ${brand.ka.nominative}`,
            status: "decided",
            body: [
              `${brand.ka.nominative} არის ცოცხალი დისტანციური ობსერვატორია თბილისში. თქვენ ჯავშნით სადამკვირვებლო სლოტს, ირჩევთ ობიექტს ოპერატორის დამტკიცებული სიიდან, და ნამდვილი Celestron NexStar 6SE ფიზიკურად ბრუნდება ამ ობიექტისკენ, სანამ თქვენ კამერის გამოსახულებას უყურებთ.`,
              `${brand.ka.nominative} ცოცხალი ხედვის სერვისია. ის იყენებს მოკლე ექსპოზიციებს და ცოცხალ დასტეკვას — მეთოდს, რომელსაც ელექტრონულად დახმარებულ ასტრონომიას უწოდებენ. ეს არ არის ხანგრძლივი ექსპოზიციის ასტროფოტოგრაფიის სერვისი და არ იძლევა სამეცნიერო ობსერვატორიის ან კოსმოსური ტელესკოპის დონის შედეგს.`,
            ],
          },
          {
            heading: "სადამკვირვებლო სლოტი",
            status: "decided",
            body: [
              "სლოტი არის ტელესკოპის დაჯავშნილი დრო ოპერატორის დამტკიცებულ ობიექტზე. ერთდროულად მიმდინარეობს ერთი დაკვირვება და ტელესკოპს ერთი ადამიანი მართავს საკუთარი სლოტის განმავლობაში.",
              "ხილვადობას ცა წყვეტს. ობიექტი, რომელიც ჩავიდა, ჯერ არ ამოსულა ან ტელესკოპის უსაფრთხო სიმაღლის ქვემოთაა, ვერ დაიკვირვება — ჯავშანი რასაც არ უნდა ამბობდეს.",
            ],
          },
          { heading: "თქვენი ანგარიში", status: "pending" },
          { heading: "ამინდი, ხილვადობა და შეუსრულებელი სლოტი", status: "pending" },
          { heading: "გამოყენების წესები", status: "pending" },
          { heading: "ხელმისაწვდომობა და პასუხისმგებლობის ზღვარი", status: "pending" },
          { heading: "ცვლილებები ამ პირობებში", status: "pending" },
          { heading: "მოქმედი სამართალი და დავები", status: "pending" },
        ],
      },
      privacy: {
        metadataTitle: `${brand.ka.nominative} · კონფიდენციალურობის პოლიტიკა`,
        metadataDescription: `${brand.ka.genitive} კონფიდენციალურობის პოლიტიკის მონახაზი. ჯერ არ მოქმედებს.`,
        eyebrow: "იურიდიული · მონახაზი",
        title: "კონფიდენციალურობის პოლიტიკა",
        introduction: `რას ინახავს ${brand.ka.nominative} თქვენ შესახებ და რატომ. დოკუმენტს სჭირდება მონაცემთა აღწერა და იურიდიული განხილვა, სანამ სათანადოდ გამოქვეყნდება.`,
        sections: [
          {
            heading: "სისტემაში დარჩენა",
            status: "decided",
            body: [
              "შესვლისას ბრაუზერში იწერება სესიის ქუქი-ფაილები. ისინი საჭიროა იმისთვის, რომ სისტემაში დარჩეთ და თქვენი გაგზავნილი ფორმები დაცული იყოს. ეს არ არის სარეკლამო ქუქი-ფაილები და ისინი სხვა საიტებზე არ მიგყვებათ.",
            ],
          },
          { heading: `რა მონაცემებს აგროვებს ${brand.ka.nominative}`, status: "pending" },
          { heading: "თქვენი კადრები და კოლექცია", status: "pending" },
          { heading: "გადახდის მონაცემები", status: "pending" },
          { heading: "ვინ ამუშავებს თქვენს მონაცემებს", status: "pending" },
          { heading: "რამდენ ხანს ინახება მონაცემები", status: "pending" },
          { heading: "თქვენი უფლებები მონაცემებზე", status: "pending" },
          { heading: "როგორ დაგვიკავშირდეთ", status: "pending" },
        ],
      },
      refunds: {
        metadataTitle: `${brand.ka.nominative} · თანხის დაბრუნების პოლიტიკა`,
        metadataDescription: `${brand.ka.genitive} თანხის დაბრუნებისა და გაუქმების პოლიტიკის მონახაზი. ჯერ არ მოქმედებს.`,
        eyebrow: "იურიდიული · მონახაზი",
        title: "თანხის დაბრუნების პოლიტიკა",
        introduction:
          "როდის ბრუნდება თანხა, როდის ბრუნდება მის ნაცვლად ტელესკოპის დრო და როდის არცერთი. ამინდის გამო ეს დოკუმენტი აქ უფრო მნიშვნელოვანია, ვიდრე სხვა სერვისებში.",
        sections: [
          {
            heading: "კრედიტით ან ვაუჩერით გადახდილი ჯავშანი",
            status: "decided",
            body: [
              "როცა ჯავშანი თავისუფლდება — გაუქმების, გადახდის წარუმატებლობის ან თანხის დაბრუნების გამო — ის, რითაც გადაიხადეთ, იმავე ფორმით გიბრუნდებათ.",
              "გამოწერის კრედიტით გადახდილი ჯავშანი კრედიტს აბრუნებს. ვაუჩერით გადახდილი ჯავშანი ვაუჩერს აღადგენს. არცერთი არ აბრუნებს ფულს.",
            ],
          },
          {
            heading: "გამოწერის გაუქმება",
            status: "decided",
            body: [
              "გამოწერის თვის შუაში გაუქმებისას თანხა არ ბრუნდება. თვე უკვე გადახდილია და მისი კრედიტები უკვე დარიცხულია, ამიტომ ისინი პერიოდის ბოლომდე თქვენი რჩება.",
              "დაუხარჯავი წუთები პერიოდის ბოლოს ქრება და შემდეგ თვეზე არ გადადის.",
            ],
          },
          {
            heading: "როცა გამოწერის გადახდა ვერ ხერხდება",
            status: "decided",
            body: [
              "წარუმატებელი განახლება მეორდება სამჯერ, შვიდი დღის განმავლობაში. თუ ვერცერთი გამოვა, გამოწერა ვადას კარგავს და გადაუხდელად არ გრძელდება.",
            ],
          },
          { heading: "ერთჯერადი დაკვირვების გაუქმება", status: "pending" },
          { heading: "ღრუბლები და შეუსრულებელი სლოტი", status: "pending" },
          { heading: "აპარატურის ხარვეზი თქვენი სლოტის დროს", status: "pending" },
          { heading: "როგორ მოითხოვოთ თანხის დაბრუნება", status: "pending" },
        ],
      },
    },
  },
};
