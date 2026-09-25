import type { TargetType, VisibilityBlockReason } from "@darkview/contracts";

/**
 * Words for the platform's target and visibility vocabulary, shared by the homepage
 * and the missions pages. Keyed by the contract's enums, so a new value upstream is
 * a type error here rather than a blank label.
 */
type TargetCopy = {
  types: Record<TargetType, string>;
  typesPlural: Record<TargetType, string>;
  reasons: Record<VisibilityBlockReason, string>;
  observable: string;
  window: { between: string; from: string; until: string; none: string };
  simulated: { label: string; detail: string };
  unreachable: { title: string; description: string };
  noObservatory: { title: string; description: string };
  noneObservable: { title: string; reason: string };
};

export const targetCopy: Record<"en" | "ka", TargetCopy> = {
  en: {
    types: {
      MOON: "Moon",
      PLANET: "Planet",
      DOUBLE_STAR: "Double star",
      GLOBULAR_CLUSTER: "Globular cluster",
      PLANETARY_NEBULA: "Planetary nebula",
      BRIGHT_NEBULA: "Bright nebula",
    },
    typesPlural: {
      MOON: "Moon",
      PLANET: "Planets",
      DOUBLE_STAR: "Double stars",
      GLOBULAR_CLUSTER: "Globular clusters",
      PLANETARY_NEBULA: "Planetary nebulae",
      BRIGHT_NEBULA: "Bright nebulae",
    },
    reasons: {
      SAFETY_ENVELOPE_UNMEASURED: "The telescope's safety limits are not measured yet",
      TARGET_DISABLED: "Not offered right now",
      OBSERVATORY_OFFLINE: "The observatory is offline",
      WEATHER_HOLD: "Paused for the weather",
      BELOW_HORIZON: "Below the horizon",
      BELOW_MIN_ALTITUDE: "Too low in the sky",
      ABOVE_MAX_ALTITUDE: "Too high for the telescope",
      BEHIND_HORIZON_MASK: "Hidden behind the local horizon",
      IN_FORBIDDEN_AZIMUTH: "In a direction the telescope does not point",
      SUN_TOO_HIGH: "The sky is not dark enough yet",
      TOO_CLOSE_TO_SUN: "Too close to the Sun",
      TOO_CLOSE_TO_MOON: "Too close to the Moon",
      DOES_NOT_FIT_FIELD: "Larger than the telescope's field of view",
    },
    observable: "Observable now",
    window: {
      between: "{rises} – {sets}",
      from: "From {rises}",
      until: "Until {sets}",
      none: "—",
    },
    simulated: {
      label: "SIMULATED OBSERVATORY",
      detail: "Visibility is computed for the simulator. No real telescope is moving.",
    },
    unreachable: {
      title: "Tonight's sky could not be read",
      description:
        "The platform did not answer. Nothing is shown rather than an old or invented list.",
    },
    noObservatory: {
      title: "No observatory is taking missions",
      description:
        "When the observatory opens for missions, tonight's targets appear here.",
    },
    noneObservable: {
      title: "No target can be observed right now",
      reason: "Reason: {reason}.",
    },
  },
  ka: {
    types: {
      MOON: "მთვარე",
      PLANET: "პლანეტა",
      DOUBLE_STAR: "ორმაგი ვარსკვლავი",
      GLOBULAR_CLUSTER: "სფერული გროვა",
      PLANETARY_NEBULA: "პლანეტარული ნისლეული",
      BRIGHT_NEBULA: "ნათელი ნისლეული",
    },
    typesPlural: {
      MOON: "მთვარე",
      PLANET: "პლანეტები",
      DOUBLE_STAR: "ორმაგი ვარსკვლავები",
      GLOBULAR_CLUSTER: "სფერული გროვები",
      PLANETARY_NEBULA: "პლანეტარული ნისლეულები",
      BRIGHT_NEBULA: "ნათელი ნისლეულები",
    },
    reasons: {
      SAFETY_ENVELOPE_UNMEASURED: "ტელესკოპის უსაფრთხოების ზღვრები ჯერ არ არის გაზომილი",
      TARGET_DISABLED: "ამჟამად არ არის ხელმისაწვდომი",
      OBSERVATORY_OFFLINE: "ობსერვატორია კავშირგარეშეა",
      WEATHER_HOLD: "შეჩერებულია ამინდის გამო",
      BELOW_HORIZON: "ჰორიზონტს ქვემოთაა",
      BELOW_MIN_ALTITUDE: "ცაში ძალიან დაბლაა",
      ABOVE_MAX_ALTITUDE: "ტელესკოპისთვის ძალიან მაღლაა",
      BEHIND_HORIZON_MASK: "ადგილობრივი ჰორიზონტის მიღმაა",
      IN_FORBIDDEN_AZIMUTH: "ტელესკოპი ამ მიმართულებით არ მიიმართება",
      SUN_TOO_HIGH: "ცა ჯერ საკმარისად ბნელი არ არის",
      TOO_CLOSE_TO_SUN: "მზესთან ძალიან ახლოსაა",
      TOO_CLOSE_TO_MOON: "მთვარესთან ძალიან ახლოსაა",
      DOES_NOT_FIT_FIELD: "ტელესკოპის ხედვის არეზე დიდია",
    },
    observable: "ახლა დაკვირვებადია",
    window: {
      between: "{rises} – {sets}",
      from: "{rises}-დან",
      until: "{sets}-მდე",
      none: "—",
    },
    simulated: {
      label: "SIMULATED OBSERVATORY",
      detail: "ხილვადობა სიმულატორისთვის ითვლება. ნამდვილი ტელესკოპი არ მოძრაობს.",
    },
    unreachable: {
      title: "დღევანდელი ცის მონაცემები ვერ მივიღეთ",
      description: "პლატფორმამ არ უპასუხა. ძველ ან გამოგონილ სიას არ ვაჩვენებთ.",
    },
    noObservatory: {
      title: "ამჟამად არც ერთი ობსერვატორია არ იღებს მისიებს",
      description:
        "როცა ობსერვატორია მისიებისთვის გაიხსნება, დღევანდელი ობიექტები აქ გამოჩნდება.",
    },
    noneObservable: {
      title: "ამჟამად ვერც ერთ ობიექტს ვერ დავაკვირდებით",
      reason: "მიზეზი: {reason}.",
    },
  },
};
