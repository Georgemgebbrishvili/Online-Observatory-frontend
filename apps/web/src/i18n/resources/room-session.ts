import type { ImageHealthReason, RecoveryStep } from "@darkview/contracts";

/**
 * A booked session's own words (ADR-079, ADR-080): the objects up now, the dwell lock,
 * and the picture's health. Strings only, so the copy can cross into the client whole.
 */
export type RoomSessionCopy = {
  targets: {
    title: string;
    /** The object on the telescope now. */
    current: string;
    /** The button's text, and "{target}" its full name. */
    switch: string;
    switchTo: string;
    /** "{time}", the dwell lock counting down. */
    lockedIn: string;
    dwellNote: string;
    /** The list waits for OBSERVING: a switch is refused while the telescope moves. */
    waiting: string;
    loading: string;
    empty: string;
    unreadable: string;
  };
  health: {
    /** The region's name for a screen reader. */
    label: string;
    /** RECOVERING: what the telescope is doing now, by the rung of the ladder. */
    steps: Record<RecoveryStep, string>;
    /** RECOVERING with no rung named. */
    recovering: string;
    /** What went wrong with the picture. */
    reasons: Record<ImageHealthReason, string>;
    waiting: { title: string; retry: string; detail: string };
    unrecovered: { title: string; detail: string; retry: string };
  };
};

export const roomSessionCopy: Record<"en" | "ka", RoomSessionCopy> = {
  en: {
    targets: {
      title: "Objects up now",
      current: "On the telescope",
      switch: "Switch",
      switchTo: "Switch to {target}",
      lockedIn: "You can switch in {time}",
      dwellNote:
        "The telescope stays at least 10 minutes on each object, to spare its mount.",
      waiting: "You can switch once the telescope is observing.",
      loading: "Finding what is up now…",
      empty: "Nothing else is high enough to switch to right now.",
      unreadable: "The list of objects could not be loaded. It tries again shortly.",
    },
    health: {
      label: "Picture",
      steps: {
        RE_EXPOSE: "Adjusting the exposure",
        RE_SOLVE: "Checking where the telescope points",
        RE_CENTRE: "Re-centring the object",
        WAIT_FOR_SKY: "Clouds over the telescope — waiting for a gap",
      },
      recovering: "Fixing the picture",
      reasons: {
        BLANK_FRAME: "The picture went blank.",
        NO_STARS: "No stars showed in the picture.",
        OFF_CENTRE: "The object drifted from the centre.",
        CLOUDS: "Clouds are over the telescope.",
        OVEREXPOSED: "The picture was too bright.",
      },
      waiting: {
        title: "Clouds over the telescope — waiting for a gap",
        retry: "The telescope stays on the object and looks again in {time}.",
        detail: "The telescope stays on the object and looks again shortly.",
      },
      unrecovered: {
        title: "Couldn't recover the picture",
        detail:
          "The live view goes on. You can switch to another object now, without waiting.",
        retry: "The telescope checks again in {time}.",
      },
    },
  },
  ka: {
    targets: {
      title: "ახლა ხილული ობიექტები",
      current: "ტელესკოპზეა",
      switch: "გადართვა",
      switchTo: "გადართვა: {target}",
      lockedIn: "გადართვა შეგეძლება {time}-ში",
      dwellNote:
        "მონტირების დასაზოგად ტელესკოპი თითოეულ ობიექტზე სულ მცირე 10 წუთი რჩება.",
      waiting: "გადართვა შეგეძლება, როცა ტელესკოპი დაკვირვებას დაიწყებს.",
      loading: "ვეძებთ, რა ჩანს ახლა…",
      empty: "ახლა სხვა ობიექტი გადასართავად საკმარისად მაღლა არ არის.",
      unreadable: "ობიექტების სია ვერ ჩაიტვირთა. მალე ისევ ვცდით.",
    },
    health: {
      label: "გამოსახულება",
      steps: {
        RE_EXPOSE: "ექსპოზიცია სწორდება",
        RE_SOLVE: "მოწმდება, საით არის მიმართული ტელესკოპი",
        RE_CENTRE: "ობიექტი თავიდან ცენტრდება",
        WAIT_FOR_SKY: "ტელესკოპის თავზე ღრუბლებია — ველოდებით გამოდარებას",
      },
      recovering: "გამოსახულება სწორდება",
      reasons: {
        BLANK_FRAME: "გამოსახულება ჩაქრა.",
        NO_STARS: "გამოსახულებაში ვარსკვლავები არ ჩანს.",
        OFF_CENTRE: "ობიექტი ცენტრიდან გადაიწია.",
        CLOUDS: "ტელესკოპის თავზე ღრუბლებია.",
        OVEREXPOSED: "გამოსახულება ზედმეტად კაშკაშა იყო.",
      },
      waiting: {
        title: "ტელესკოპის თავზე ღრუბლებია — ველოდებით გამოდარებას",
        retry: "ტელესკოპი ობიექტზე რჩება და ისევ შეამოწმებს {time}-ში.",
        detail: "ტელესკოპი ობიექტზე რჩება და მალე ისევ შეამოწმებს.",
      },
      unrecovered: {
        title: "გამოსახულების აღდგენა ვერ მოხერხდა",
        detail:
          "პირდაპირი დაკვირვება გრძელდება. ახლავე შეგიძლია სხვა ობიექტზე გადართვა, ლოდინის გარეშე.",
        retry: "ტელესკოპი ისევ შეამოწმებს {time}-ში.",
      },
    },
  },
};
