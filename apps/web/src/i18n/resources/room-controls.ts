import type { Control, Refusal } from "@/features/missions/controls";

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
  /** The capture button while it waits out the cooldown (ADR-079 §3): "{time}". */
  captureAgain: string;
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
  reasons: Record<Refusal, string>;
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
      retarget: "Switch",
    },
    centring: "The controls open once the target is centred.",
    capturing: "Capturing. The controls return when it is done.",
    noCapture: "Capturing is unavailable: this target is no longer in the catalogue.",
    captureAgain: "Capture again in {time}",
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
      retarget: "Switching objects. The telescope is on its way.",
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
      MISSION_BUSY:
        "The telescope is busy moving or saving a capture. Try again once it is observing.",
      DWELL_LOCKED:
        "The telescope stays at least 10 minutes on each object, to spare its mount.",
      TARGET_NOT_VISIBLE_NOW:
        "That object is not up long enough right now, or is too close to something the telescope must avoid.",
      CAPTURE_IN_PROGRESS: "A capture is already being saved. Wait for it to finish.",
      CAPTURE_COOLDOWN: "Captures are at least 30 seconds apart. Try again in a moment.",
      CAPTURE_LIMIT_REACHED: "This session already holds the most captures it can: 50.",
      SESSION_ENDING: "Your slot is about to end, so the telescope stays where it is.",
      ALREADY_ON_TARGET: "The telescope is already on that object.",
    },
  },
  ka: {
    title: "მართვა",
    sessionTitle: "სეანსი",
    step: "{step} რკალური წუთი",
    labels: {
      up: "მაღლა",
      down: "დაბლა",
      left: "მარცხნივ",
      right: "მარჯვნივ",
      recenter: "ცენტრირება",
      capture: "გადაღება",
      stop: "დასრულება",
      retarget: "გადართვა",
    },
    centring: "მართვა გაიხსნება, როცა ობიექტი ცენტრში მოექცევა.",
    capturing: "მიმდინარეობს გადაღება. მართვა დასრულების შემდეგ დაბრუნდება.",
    noCapture: "გადაღება მიუწვდომელია: ეს ობიექტი კატალოგში აღარ არის.",
    captureAgain: "კვლავ გადაღება {time}-ში",
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
      retarget: "ობიექტი იცვლება. ტელესკოპი ახალი ობიექტისკენ ბრუნდება.",
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
      COMMAND_NOT_PERMITTED_FOR_CLIENT: "ეს ბრძანება მომხმარებლებისთვის მიუწვდომელია.",
      SAFETY_ENVELOPE_UNMEASURED:
        "ტელესკოპის უსაფრთხო დიაპაზონი გაზომილი არ არის, ამიტომ ის არ მოძრაობს.",
      SAFETY_BELOW_MIN_ALTITUDE: "ეს ტელესკოპს ძალიან დაბლა მიმართავდა.",
      SAFETY_ABOVE_MAX_ALTITUDE: "ეს ტელესკოპს ძალიან მაღლა მიმართავდა.",
      SAFETY_HORIZON_MASK: "ეს ტელესკოპს იქით მიმართავდა, სადაც ხედი დაფარულია.",
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
      MISSION_BUSY:
        "ტელესკოპი ახლა მოძრაობს ან კადრს ინახავს. სცადე, როცა დაკვირვებას განაახლებს.",
      DWELL_LOCKED:
        "მონტირების დასაზოგად ტელესკოპი თითოეულ ობიექტზე სულ მცირე 10 წუთი რჩება.",
      TARGET_NOT_VISIBLE_NOW:
        "ეს ობიექტი ახლა საკმარისად დიდხანს არ ჩანს, ან იმასთან ახლოსაა, რასაც ტელესკოპი უნდა მოერიდოს.",
      CAPTURE_IN_PROGRESS: "კადრი უკვე ინახება. დაელოდე დასრულებას.",
      CAPTURE_COOLDOWN: "კადრებს შორის სულ მცირე 30 წამია. სცადე ცოტა ხანში.",
      CAPTURE_LIMIT_REACHED: "ამ სეანსს უკვე აქვს კადრების მაქსიმალური რაოდენობა: 50.",
      SESSION_ENDING: "შენი სეანსი მალე სრულდება, ამიტომ ტელესკოპი ადგილზე რჩება.",
      ALREADY_ON_TARGET: "ტელესკოპი უკვე ამ ობიექტზეა.",
    },
  },
};
