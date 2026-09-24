/**
 * Loading, empty and error copy, shared by every surface. A separate resource rather
 * than part of the dictionary because the error boundary is a client component: it
 * must not pull the whole dictionary into the browser bundle to say one sentence.
 */
export const feedbackCopy = {
  en: {
    loading: "Loading",
    errorTitle: "This did not load",
    errorDescription:
      "Something failed on our side. Nothing you did caused it, and nothing was lost.",
    errorRetry: "Try again",
    errorHome: "Return to Stellar",
    errorReference: "Reference",
  },
  ka: {
    loading: "იტვირთება",
    errorTitle: "ვერ ჩაიტვირთა",
    errorDescription:
      "შეცდომა ჩვენს მხარესაა. თქვენ არაფერი დაგიშავებიათ და არაფერი დაკარგულა.",
    errorRetry: "ხელახლა ცდა",
    errorHome: "სტელარზე დაბრუნება",
    errorReference: "იდენტიფიკატორი",
  },
} as const;

export type FeedbackCopy = (typeof feedbackCopy)["en"];
