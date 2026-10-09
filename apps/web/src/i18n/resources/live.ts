import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

/** /app/live with no live or imminent mission (ADR-051): the next night, and the way to book. */
const en = {
  metadataTitle: `Live · ${brand.en.name}`,
  eyebrow: "Live",
  title: "Nothing is live right now.",
  description:
    "Your room opens here an hour before your night and stays open through it. Until then, this is where things stand.",
  next: "Your next night",
  open: "Open the mission",
  none: {
    title: "No night booked yet.",
    description: "Pick a night and a target, and your room will open from here.",
    action: "Book a night",
  },
  unavailable: {
    title: "Your nights could not be loaded.",
    description: "The observatory did not answer. Try again in a moment.",
  },
  simulated: "Simulated",
  retiredTarget: "A target no longer offered",
};

export const liveCopy = {
  en,
  ka: {
    metadataTitle: `პირდაპირი · ${brand.ka.nominative}`,
    eyebrow: "პირდაპირი",
    title: "ახლა პირდაპირი დაკვირვება არ მიმდინარეობს.",
    description:
      "შენი ოთახი აქ გაიხსნება შენს ღამემდე ერთი საათით ადრე და ღამის ბოლომდე ღია იქნება. მანამდე აქ ჩანს, სად ვართ.",
    next: "შენი შემდეგი ღამე",
    open: "მისიის გახსნა",
    none: {
      title: "ღამე ჯერ არ გაქვს დაჯავშნული.",
      description: "აირჩიე ღამე და ობიექტი — შენი ოთახი აქედან გაიხსნება.",
      action: "ღამის დაჯავშნა",
    },
    unavailable: {
      title: "შენი ღამეების ჩატვირთვა ვერ მოხერხდა.",
      description: "ობსერვატორიამ არ უპასუხა. სცადე ცოტა ხანში.",
    },
    simulated: "სიმულირებული",
    retiredTarget: "ობიექტი, რომელიც აღარ არის შეთავაზებაში",
  },
} as const satisfies Record<Locale, typeof en>;
