import type { CommandRejectionReason } from "@darkview/contracts";

import type { Control } from "@/features/missions/controls";

/** Strings only, so the copy can cross into the client component whole. */
export type RoomControlsCopy = {
  title: string;
  /** The panel that holds Stop. */
  sessionTitle: string;
  /** Read by a screen reader with each arrow: the step is the client's constant. */
  step: string;
  labels: Record<Control, string>;
  centring: string;
  capturing: string;
  noCapture: string;
  sending: string;
  waiting: string;
  done: Record<Control, string>;
  refused: string;
  noAnswer: string;
  failed: string;
  stopQuestion: string;
  stopDetail: string;
  stopConfirm: string;
  stopKeep: string;
  reasons: Record<CommandRejectionReason, string>;
};

export const roomControlsCopy: Record<"en" | "ka", RoomControlsCopy> = {
  en: {
    title: "Controls",
    sessionTitle: "Session",
    step: "{step} arcminutes",
    labels: {
      up: "Higher",
      down: "Lower",
      left: "Left",
      right: "Right",
      recenter: "Re-centre",
      capture: "Capture",
      stop: "Stop",
    },
    centring: "The controls open once the target is centred.",
    capturing: "Capturing. The controls return when it is done.",
    noCapture: "Capturing is unavailable: this target is no longer in the catalogue.",
    sending: "Sending",
    waiting: "Waiting for the telescope",
    done: {
      up: "Moved higher.",
      down: "Moved lower.",
      left: "Moved left.",
      right: "Moved right.",
      recenter: "Re-centring on the target.",
      capture: "Capture started.",
      stop: "Stopping the observation.",
    },
    refused: "The telescope refused.",
    noAnswer: "No answer from the telescope. Try again.",
    failed: "Something went wrong. Try again.",
    stopQuestion: "Stop the observation?",
    stopDetail: "The telescope parks and your remaining time is not returned.",
    stopConfirm: "Stop",
    stopKeep: "Keep observing",
    reasons: {
      DUPLICATE_COMMAND_ID: "That command was already received.",
      COMMAND_EXPIRED: "That command arrived too late to act on. Try again.",
      WRONG_SESSION: "Another window is controlling this observation.",
      WRONG_USER: "This observation belongs to another account.",
      WRONG_MISSION: "That command was for a different observation.",
      NO_ACTIVE_MISSION: "The observation is not running.",
      MISSION_ALREADY_ACTIVE: "Another observation is running on the telescope.",
      PAYLOAD_TYPE_MISMATCH: "That command was not understood.",
      MALFORMED_PAYLOAD: "That command was not understood.",
      COMMAND_NOT_PERMITTED_FOR_CLIENT: "That control is not available to customers.",
      SAFETY_ENVELOPE_UNMEASURED:
        "The telescope's safe range has not been measured, so it will not move.",
      SAFETY_BELOW_MIN_ALTITUDE: "That would point the telescope too low.",
      SAFETY_ABOVE_MAX_ALTITUDE: "That would point the telescope too high.",
      SAFETY_HORIZON_MASK: "That would point at something blocking the view.",
      SAFETY_FORBIDDEN_AZIMUTH: "That direction is closed to the telescope.",
      SAFETY_SUN_EXCLUSION: "That would point too close to the Sun.",
      SAFETY_DAYLIGHT_LOCK: "The telescope does not move in daylight.",
      SAFETY_NUDGE_LIMIT_EXCEEDED:
        "That would go past how far you can move from the target. Re-centre to continue.",
      SAFETY_SLEW_RATE: "That move was too fast for the telescope.",
      DEVICE_UNAVAILABLE: "The telescope is busy. Wait for it to settle and try again.",
      MODE_NOT_PERMITTED: "The observatory's mode does not allow that.",
      WEATHER_HOLD_ACTIVE: "The observatory is on weather hold.",
      OBSERVATORY_OFFLINE: "The observatory is offline.",
      UNATTENDED_DISARMED: "The observatory is not open for observing right now.",
    },
  },
  ka: {
    title: "მართვა",
    sessionTitle: "სესია",
    step: "{step} რკალური წუთი",
    labels: {
      up: "მაღლა",
      down: "დაბლა",
      left: "მარცხნივ",
      right: "მარჯვნივ",
      recenter: "ცენტრირება",
      capture: "გადაღება",
      stop: "დასრულება",
    },
    centring: "მართვა გაიხსნება, როცა ობიექტი ცენტრში მოექცევა.",
    capturing: "მიმდინარეობს გადაღება. მართვა დასრულების შემდეგ დაბრუნდება.",
    noCapture: "გადაღება მიუწვდომელია: ეს ობიექტი კატალოგში აღარ არის.",
    sending: "იგზავნება",
    waiting: "ველოდებით ტელესკოპს",
    done: {
      up: "აიწია მაღლა.",
      down: "ჩამოიწია დაბლა.",
      left: "გადაიწია მარცხნივ.",
      right: "გადაიწია მარჯვნივ.",
      recenter: "ობიექტზე ცენტრირება მიმდინარეობს.",
      capture: "გადაღება დაიწყო.",
      stop: "დაკვირვება სრულდება.",
    },
    refused: "ტელესკოპმა უარი თქვა.",
    noAnswer: "ტელესკოპმა არ უპასუხა. სცადე თავიდან.",
    failed: "რაღაც შეფერხდა. სცადე თავიდან.",
    stopQuestion: "დავასრულოთ დაკვირვება?",
    stopDetail: "ტელესკოპი პარკირდება და დარჩენილი დრო არ ბრუნდება.",
    stopConfirm: "დასრულება",
    stopKeep: "გაგრძელება",
    reasons: {
      DUPLICATE_COMMAND_ID: "ეს ბრძანება უკვე მიღებულია.",
      COMMAND_EXPIRED: "ბრძანება დაგვიანებით მივიდა. სცადე თავიდან.",
      WRONG_SESSION: "ამ დაკვირვებას სხვა ფანჯარა მართავს.",
      WRONG_USER: "ეს დაკვირვება სხვა ანგარიშს ეკუთვნის.",
      WRONG_MISSION: "ბრძანება სხვა დაკვირვებისთვის იყო.",
      NO_ACTIVE_MISSION: "დაკვირვება არ მიმდინარეობს.",
      MISSION_ALREADY_ACTIVE: "ტელესკოპზე სხვა დაკვირვება მიმდინარეობს.",
      PAYLOAD_TYPE_MISMATCH: "ბრძანება ვერ გაიშიფრა.",
      MALFORMED_PAYLOAD: "ბრძანება ვერ გაიშიფრა.",
      COMMAND_NOT_PERMITTED_FOR_CLIENT: "ეს მართვა მომხმარებლისთვის მიუწვდომელია.",
      SAFETY_ENVELOPE_UNMEASURED:
        "ტელესკოპის უსაფრთხო დიაპაზონი გაზომილი არ არის, ამიტომ ის არ მოძრაობს.",
      SAFETY_BELOW_MIN_ALTITUDE: "ეს ტელესკოპს ძალიან დაბლა მიმართავდა.",
      SAFETY_ABOVE_MAX_ALTITUDE: "ეს ტელესკოპს ძალიან მაღლა მიმართავდა.",
      SAFETY_HORIZON_MASK: "ეს ტელესკოპს ხედის დამფარავ ობიექტს მიმართავდა.",
      SAFETY_FORBIDDEN_AZIMUTH: "ეს მიმართულება ტელესკოპისთვის დახურულია.",
      SAFETY_SUN_EXCLUSION: "ეს ტელესკოპს მზესთან ძალიან ახლოს მიმართავდა.",
      SAFETY_DAYLIGHT_LOCK: "დღის სინათლეზე ტელესკოპი არ მოძრაობს.",
      SAFETY_NUDGE_LIMIT_EXCEEDED:
        "ეს ტელესკოპს ობიექტიდან დასაშვებზე მეტად გადასწევდა. გასაგრძელებლად გამოიყენე ცენტრირება.",
      SAFETY_SLEW_RATE: "მოძრაობა ტელესკოპისთვის ზედმეტად სწრაფი იყო.",
      DEVICE_UNAVAILABLE: "ტელესკოპი დაკავებულია. დაელოდე გაჩერებას და სცადე თავიდან.",
      MODE_NOT_PERMITTED: "ობსერვატორიის რეჟიმი ამას არ იძლევა.",
      WEATHER_HOLD_ACTIVE: "ობსერვატორია ამინდის გამო შეჩერებულია.",
      OBSERVATORY_OFFLINE: "ობსერვატორია კავშირგარეშეა.",
      UNATTENDED_DISARMED: "ობსერვატორია ახლა დაკვირვებისთვის ღია არ არის.",
    },
  },
};
