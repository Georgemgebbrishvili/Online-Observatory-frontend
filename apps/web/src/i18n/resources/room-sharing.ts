/** Strings only, so the copy can cross into the client component whole. */
export type RoomSharingCopy = {
  title: string;
  private: string;
  open: string;
  seats: string;
  openAction: string;
  copyLink: string;
  copied: string;
  closeAction: string;
  closeQuestion: string;
  closeDetail: string;
  closeConfirm: string;
  closeKeep: string;
  saving: string;
  ended: string;
  failed: string;
};

export const roomSharingCopy: Record<"en" | "ka", RoomSharingCopy> = {
  en: {
    title: "Sharing",
    private: "Only you can see this session.",
    open: "Others can watch.",
    seats: "{count} of {capacity} seats taken.",
    openAction: "Let others watch",
    copyLink: "Copy watch link",
    copied: "Link copied",
    closeAction: "Stop sharing",
    closeQuestion: "Stop sharing?",
    closeDetail:
      "Anyone watching is removed. Paid watchers are refunded for the time they lose.",
    closeConfirm: "Stop sharing",
    closeKeep: "Keep sharing",
    saving: "Saving",
    ended: "This session has ended.",
    failed: "Something went wrong. Try again.",
  },
  ka: {
    title: "გაზიარება",
    private: "ამ ეთერს მხოლოდ შენ ხედავ.",
    open: "სხვებს შეუძლიათ უყურონ.",
    seats: "დაკავებულია {count} ადგილი {capacity}-დან.",
    openAction: "სხვებსაც აყურებინე",
    copyLink: "სანახავი ბმულის კოპირება",
    copied: "ბმული დაკოპირდა",
    closeAction: "გაზიარების შეწყვეტა",
    closeQuestion: "შევწყვიტოთ გაზიარება?",
    closeDetail:
      "ყველა მაყურებელი გაითიშება. ვინც ადგილი იყიდა, დაკარგული დროის თანხა დაუბრუნდება.",
    closeConfirm: "შეწყვეტა",
    closeKeep: "გაგრძელება",
    saving: "ინახება",
    ended: "ეთერი დასრულდა.",
    failed: "რაღაც შეფერხდა. სცადე თავიდან.",
  },
};
