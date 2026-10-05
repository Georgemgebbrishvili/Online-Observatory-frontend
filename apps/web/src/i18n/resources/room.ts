import type {
  ErrorCode,
  MissionFailureReason,
  MissionEventSource,
  MissionState,
  OpticalConfig,
} from "@darkview/contracts";

import { brand } from "@/brand";
import type { LiveStatus, StoppedState } from "@/features/missions/live";

type StatePresentation = {
  title: string;
  description: string;
  event: string;
};

type StateCopy = { title: string; description: string };

type LiveCopy = {
  status: Record<Exclude<LiveStatus, "not-started" | "refused">, StateCopy>;
  notStarted: { title: string; before: string; open: string };
  /** The booked slot is over and was never started: the platform refuses a start. */
  slotEnded: { title: string; description: string };
  refused: { title: string; reasons: Partial<Record<ErrorCode, string>>; other: string };
  liveReal: string;
  actions: {
    start: string;
    retry: string;
    reopen: string;
    book: string;
    booking: string;
  };
  /** What happens next, under the state's title, when the observation stopped short. */
  stopped: Record<StoppedState, string>;
  simulated: string;
  live: string;
  timeLeft: string;
  streamAlt: string;
  streamAltSimulated: string;
};

type RoomCopy = {
  metadataTitle: string;
  back: string;
  eyebrow: string;
  feed: {
    label: string;
    illustration: string;
    before: string;
    /** The first-party observatory's camera (ADR-001); a partner's is not published. */
    camera: string;
    /** `Target.opticalConfig`, short, for the feed's instrument plate. */
    optics: Record<OpticalConfig, string>;
  };
  steps: {
    title: string;
    names: [string, string, string, string, string];
    stepOf: string;
    now: string;
    stopped: string;
  };
  pointing: {
    title: string;
    dial: string;
    cardinals: [string, string, string, string];
    altitude: string;
    azimuth: string;
    rises: string;
    sets: string;
    none: string;
    below: string;
    unknown: string;
    note: string;
    computedAt: string;
    titleTelescope: string;
    noPosition: string;
    telescopeNote: string;
  };
  readings: { title: string; cloud: string; cloudUnknown: string };
  history: {
    title: string;
    empty: string;
    unreadable: string;
    sources: Record<MissionEventSource, string>;
  };
  captures: { title: string; empty: string; all: string };
  live: LiveCopy;
  states: Record<MissionState, StatePresentation>;
  reasons: Record<MissionFailureReason, string>;
  unreachable: StateCopy;
};

const en: RoomCopy = {
  metadataTitle: `{target} · Mission · ${brand.en.name}`,
  back: "Back to {target}",
  eyebrow: "Mission · {target}",
  feed: {
    label: "Live view",
    illustration: "Illustration — not telescope output",
    before: "The live view opens here when the telescope reaches {target}.",
    camera: "ZWO ASI585MC",
    optics: {
      F20_BARLOW: "3000 mm · f/20",
      F10_NATIVE: "1500 mm · f/10",
      F6_3_REDUCER: "945 mm · f/6.3",
    },
  },
  steps: {
    title: "Progress",
    names: ["Prepare", "Slew", "Centre", "Observe", "Capture"],
    stepOf: "Step {step} of 5",
    now: "Now",
    stopped: "Stopped here",
  },
  pointing: {
    title: "Where {target} is",
    dial: "Sky dial: the horizon at the rim, overhead at the centre, north at the top.",
    cardinals: ["N", "E", "S", "W"],
    altitude: "Altitude",
    azimuth: "Azimuth",
    rises: "Rises",
    sets: "Sets",
    none: "—",
    below: "Below the horizon now.",
    unknown: "Tonight's sky could not be read.",
    note: "The target's position, not the telescope's. The telescope's own appears here during the observation.",
    computedAt: "Computed at {time}.",
    titleTelescope: "Where the telescope points",
    noPosition: "The telescope has not reported a position.",
    telescopeNote:
      "The telescope's position as the observatory reports it, to a tenth of a degree. The dashed ring is {target}.",
  },
  readings: {
    title: "Observatory",
    cloud: "Cloud cover, forecast",
    cloudUnknown: "No forecast",
  },
  history: {
    title: "Mission history",
    empty: "Nothing has happened on this mission yet.",
    unreadable: "The history could not be loaded.",
    sources: { CLOUD: brand.en.name, AGENT: "Observatory", OPERATOR: "Operator" },
  },
  captures: {
    title: "Captures from this mission",
    empty: "No captures yet.",
    all: "Your Collection",
  },
  live: {
    status: {
      starting: {
        title: "Starting",
        description: "Opening your session with the observatory.",
      },
      connecting: {
        title: "Connecting",
        description: "Waiting for the first picture from the camera.",
      },
      live: {
        title: "Live",
        description: "Simulator output, not telescope output.",
      },
      reconnecting: {
        title: "Reconnecting",
        description: "The connection to the observatory dropped. Trying again.",
      },
      offline: {
        title: "Observatory offline",
        description:
          "The observatory is not connected. The live view comes back when it reconnects.",
      },
      hold: {
        title: "Weather hold",
        description:
          "The sky is not safe for observing. The mission waits for it to clear.",
      },
      expired: {
        title: "Your time is up",
        description:
          "Your observing session has ended. Your captures stay in your Collection.",
      },
      ended: {
        title: "Live view closed",
        description: "This mission's live view has closed.",
      },
      stopped: {
        title: "Observation stopped",
        description:
          "The telescope is safe. Your captures so far stay in your Collection.",
      },
      error: {
        title: "Something went wrong",
        description: "Our servers did not answer. Try again in a moment.",
      },
    },
    notStarted: {
      title: "Not started",
      before: "Your slot opens at {time}. You can start the observation from then.",
      open: "Your slot is open. Starting turns the telescope to {target}.",
    },
    slotEnded: {
      title: "This slot has ended",
      description: "The observation was not started before its slot closed.",
    },
    refused: {
      title: "The live view could not open",
      reasons: {
        MISSION_NOT_ACTIVE:
          "This mission cannot be started now: its slot has not opened, or has ended.",
        SAFETY_REFUSED:
          "The observatory's safety checks refused the target at this moment. Try again in a few minutes.",
        SAFETY_NOT_CONFIGURED:
          "The telescope's safe limits have not been measured yet, so it may not move.",
        CONFLICT: "Another observation is running at this observatory.",
        SESSION_NOT_OWNER: "Another session holds this mission.",
        FORBIDDEN: "This observation is open in another window or tab.",
        NOT_FOUND: "This mission is no longer available.",
      },
      other: "Our servers refused to open the live view.",
    },
    liveReal: "The camera's picture, as it arrives.",
    actions: {
      start: "Start observation",
      retry: "Try again",
      reopen: "Watch here",
      book: "Book another night",
      booking: "See your booking",
    },
    stopped: {
      NOT_VISIBLE:
        "The telescope does not point at {target} outside its safe window. Book a night when it stands higher.",
      HARDWARE_ERROR:
        "The telescope stopped before moving further. It observes again once an operator clears the fault.",
      CANCELLED:
        "Nothing more is sent to the telescope. Your captures stay in your Collection.",
      FAILED:
        "The telescope is in a safe state. Your captures so far stay in your Collection.",
    },
    simulated: "Simulated",
    live: "Live",
    timeLeft: "Time left",
    streamAlt: "Live view of {target}",
    streamAltSimulated: "Simulated live view of {target}",
  },
  states: {
    REQUESTED: {
      title: "Mission requested",
      description: "Your observation has been requested.",
      event: "Mission request created",
    },
    SCHEDULED: {
      title: "Observation scheduled",
      description: "The observatory has reserved a window for this target.",
      event: "Observing window reserved",
    },
    PREPARING: {
      title: "Preparing your observation",
      description: "The observatory is checking the sky, hardware, and safety limits.",
      event: "Pre-observation checks started",
    },
    SLEWING: {
      title: "Moving telescope to {target}",
      description: "The mount is moving through a controlled path toward the target.",
      event: "Telescope slew started",
    },
    VERIFYING: {
      title: "Verifying position",
      description: "A reference exposure is being matched against the night sky.",
      event: "Position verification started",
    },
    CENTERING: {
      title: "Centring the target",
      description: "Fine corrections are placing the target at the optical centre.",
      event: "Target centring started",
    },
    OBSERVING: {
      title: "Observing {target}",
      description: "The telescope is tracking {target} in real time.",
      event: "Live observation started",
    },
    CAPTURING: {
      title: "Capturing your observation",
      description: "The camera is saving the current live stack.",
      event: "Image capture started",
    },
    PROCESSING: {
      title: "Processing your image",
      description: "Your capture is being saved.",
      event: "Image processing started",
    },
    COMPLETE: {
      title: "Observation complete",
      description: "Your finished observation is ready for your Collection.",
      event: "Mission completed",
    },
    WEATHER_HOLD: {
      title: "Weather hold",
      description: "The mission is paused because safe sky conditions are not available.",
      event: "Mission placed on weather hold",
    },
    NOT_VISIBLE: {
      title: "Target not visible",
      description: "{target} is outside the verified safe observing window.",
      event: "Visibility check failed",
    },
    HARDWARE_ERROR: {
      title: "Observatory hardware error",
      description: "The mission stopped before further hardware movement.",
      event: "Hardware safety stop triggered",
    },
    CANCELLED: {
      title: "Mission cancelled",
      description: "The observation ended without sending further commands.",
      event: "Mission cancelled",
    },
    FAILED: {
      title: "Mission failed",
      description:
        "The mission could not continue and has entered a safe terminal state.",
      event: "Mission failed",
    },
  },
  reasons: {
    PLATE_SOLVE_FAILED:
      "The telescope's position could not be confirmed against the sky.",
    SLEW_TIMEOUT: "The telescope took too long to reach the target.",
    CENTERING_ITERATIONS_EXHAUSTED: "The target could not be centred in three attempts.",
    TRACKING_LOST: "The telescope stopped following the target.",
    MOUNT_FAULT: "The mount reported a fault.",
    CAMERA_FAULT: "The camera reported a fault.",
    FOCUSER_FAULT: "The focuser reported a fault.",
    AGENT_LINK_LOST: "The observatory lost its connection.",
    HEARTBEAT_LOST: "The observatory stopped answering.",
    SAFETY_REFUSED: "The observatory refused a command that failed its safety checks.",
    SAFETY_ENVELOPE_UNMEASURED: "The telescope's safe limits have not been measured yet.",
    TARGET_SET_BELOW_LIMIT: "The target sank below the telescope's safe altitude.",
    WEATHER_UNSAFE: "The weather is not safe for observing.",
    SESSION_EXPIRED: "The observing time ran out.",
    OPERATOR_ABORT: "The observatory's operator stopped the mission.",
    CUSTOMER_CANCELLED: "You cancelled the mission.",
    PAYMENT_FAILED: "The payment did not go through.",
  },
  unreachable: {
    title: "This mission could not be loaded.",
    description: "Our servers did not answer. Try again shortly.",
  },
};

const ka: RoomCopy = {
  metadataTitle: `{target} · მისია · ${brand.ka.nominative}`,
  back: "უკან: {target}",
  eyebrow: "მისია · {target}",
  feed: {
    label: "პირდაპირი ხედი",
    illustration: "ილუსტრაცია — არა ტელესკოპის კადრი",
    before: "პირდაპირი ხედი აქ გაიხსნება, როცა ტელესკოპი ობიექტს მიაღწევს: {target}.",
    camera: "ZWO ASI585MC",
    optics: {
      F20_BARLOW: "3000 mm · f/20",
      F10_NATIVE: "1500 mm · f/10",
      F6_3_REDUCER: "945 mm · f/6.3",
    },
  },
  steps: {
    title: "მიმდინარეობა",
    names: ["მომზადება", "მიმართვა", "ცენტრირება", "დაკვირვება", "გადაღება"],
    stepOf: "ნაბიჯი {step} 5-დან",
    now: "ახლა",
    stopped: "აქ შეჩერდა",
  },
  pointing: {
    title: "სად არის {target}",
    dial: "ცის ციფერბლატი: ჰორიზონტი კიდეზეა, ზენიტი — ცენტრში, ჩრდილოეთი — ზემოთ.",
    cardinals: ["ჩ", "ა", "ს", "დ"],
    altitude: "სიმაღლე",
    azimuth: "აზიმუტი",
    rises: "ამოდის",
    sets: "ჩადის",
    none: "—",
    below: "ახლა ჰორიზონტს ქვემოთაა.",
    unknown: "ამაღამინდელი ცის წაკითხვა ვერ მოხერხდა.",
    note: "ეს ობიექტის მდებარეობაა და არა ტელესკოპის. ტელესკოპის მდებარეობა აქ დაკვირვების დროს გამოჩნდება.",
    computedAt: "გამოთვლილია {time}-ზე.",
    titleTelescope: "სად იყურება ტელესკოპი",
    noPosition: "ტელესკოპს მდებარეობა ჯერ არ გადმოუცია.",
    telescopeNote:
      "ტელესკოპის მდებარეობა, როგორც ობსერვატორია აცნობებს, გრადუსის მეათედამდე. წყვეტილი რგოლი ობიექტია: {target}.",
  },
  readings: {
    title: "ობსერვატორია",
    cloud: "ღრუბლიანობა, პროგნოზი",
    cloudUnknown: "პროგნოზი არ არის",
  },
  history: {
    title: "მისიის ისტორია",
    empty: "ამ მისიაზე ჯერ არაფერი მომხდარა.",
    unreadable: "ისტორიის ჩატვირთვა ვერ მოხერხდა.",
    sources: { CLOUD: brand.ka.nominative, AGENT: "ობსერვატორია", OPERATOR: "ოპერატორი" },
  },
  captures: {
    title: "ამ მისიის კადრები",
    empty: "კადრები ჯერ არ არის.",
    all: "შენი კოლექცია",
  },
  live: {
    status: {
      starting: {
        title: "იწყება",
        description: "ობსერვატორიასთან შენი სესია იხსნება.",
      },
      connecting: {
        title: "კავშირი მყარდება",
        description: "ველოდებით კამერის პირველ კადრს.",
      },
      live: {
        title: "პირდაპირი ხედი",
        description: "სიმულატორის გამოსახულება და არა ტელესკოპის კადრი.",
      },
      reconnecting: {
        title: "კავშირი აღდგება",
        description: "ობსერვატორიასთან კავშირი გაწყდა. ვცდილობთ თავიდან.",
      },
      offline: {
        title: "ობსერვატორია კავშირგარეშეა",
        description:
          "ობსერვატორია არ არის დაკავშირებული. პირდაპირი ხედი კავშირის აღდგენისთანავე დაბრუნდება.",
      },
      hold: {
        title: "მისია ამინდის გამო შეჩერდა",
        description: "ცა დაკვირვებისთვის უსაფრთხო არ არის. მისია გამოდარებას ელოდება.",
      },
      expired: {
        title: "დრო ამოიწურა",
        description: "შენი დაკვირვების სესია დასრულდა. კადრები შენს კოლექციაში რჩება.",
      },
      ended: {
        title: "პირდაპირი ხედი დაიხურა",
        description: "ამ მისიის პირდაპირი ხედი დაიხურა.",
      },
      stopped: {
        title: "დაკვირვება შეწყდა",
        description: "ტელესკოპი უსაფრთხოდაა. აქამდე გადაღებული კადრები კოლექციაში რჩება.",
      },
      error: {
        title: "რაღაც შეფერხდა",
        description: "ჩვენმა სერვერებმა არ უპასუხეს. სცადე ცოტა ხანში.",
      },
    },
    notStarted: {
      title: "ჯერ არ დაწყებულა",
      before: "შენი დრო {time}-ზე იწყება. დაკვირვებას მაშინ დაიწყებ.",
      open: "შენი დრო დაიწყო. დაწყებისას ტელესკოპი ობიექტისკენ შებრუნდება: {target}.",
    },
    slotEnded: {
      title: "ეს დრო დასრულდა",
      description: "დაკვირვება მისი დროის დასრულებამდე არ დაწყებულა.",
    },
    refused: {
      title: "პირდაპირი ხედი ვერ გაიხსნა",
      reasons: {
        MISSION_NOT_ACTIVE:
          "ამ მისიის ახლა დაწყება შეუძლებელია: მისი დრო ჯერ არ დაწყებულა ან უკვე დასრულდა.",
        SAFETY_REFUSED:
          "ობსერვატორიის უსაფრთხოების შემოწმებამ ობიექტი ამ წუთას უარყო. სცადე რამდენიმე წუთში.",
        SAFETY_NOT_CONFIGURED:
          "ტელესკოპის უსაფრთხო ზღვრები ჯერ არ არის გაზომილი, ამიტომ ის ვერ იმოძრავებს.",
        CONFLICT: "ამ ობსერვატორიაში სხვა დაკვირვება მიმდინარეობს.",
        SESSION_NOT_OWNER: "ეს მისია სხვა სესიას უკავია.",
        FORBIDDEN: "ეს დაკვირვება სხვა ფანჯარაში ან ჩანართშია გახსნილი.",
        NOT_FOUND: "ეს მისია აღარ არის ხელმისაწვდომი.",
      },
      other: "ჩვენმა სერვერებმა პირდაპირი ხედის გახსნაზე უარი თქვეს.",
    },
    liveReal: "კამერის გამოსახულება, როგორც მოდის.",
    actions: {
      start: "დაიწყე დაკვირვება",
      retry: "სცადე თავიდან",
      reopen: "აქ ნახვა",
      book: "დაჯავშნე სხვა ღამე",
      booking: "ჯავშნის ნახვა",
    },
    stopped: {
      NOT_VISIBLE:
        "უსაფრთხო ფანჯრის გარეთ ტელესკოპი ობიექტისკენ არ შებრუნდება: {target}. დაჯავშნე ღამე, როცა ის უფრო მაღლა იქნება.",
      HARDWARE_ERROR:
        "ტელესკოპი შემდგომ მოძრაობამდე გაჩერდა. დაკვირვებას მაშინ განაახლებს, როცა ოპერატორი შეცდომას გამოასწორებს.",
      CANCELLED: "ტელესკოპს მეტი ბრძანება აღარ ეგზავნება. კადრები შენს კოლექციაში რჩება.",
      FAILED:
        "ტელესკოპი უსაფრთხო მდგომარეობაშია. აქამდე გადაღებული კადრები კოლექციაში რჩება.",
    },
    simulated: "სიმულირებული",
    live: "პირდაპირი",
    timeLeft: "დარჩენილი დრო",
    streamAlt: "პირდაპირი ხედი: {target}",
    streamAltSimulated: "სიმულირებული პირდაპირი ხედი: {target}",
  },
  states: {
    REQUESTED: {
      title: "მისია მოთხოვნილია",
      description: "შენი დაკვირვების მოთხოვნა მიღებულია.",
      event: "მისიის მოთხოვნა შეიქმნა",
    },
    SCHEDULED: {
      title: "დაკვირვება დაგეგმილია",
      description: "ობსერვატორიამ ამ ობიექტისთვის დრო გამოყო.",
      event: "დაკვირვების დრო დაჯავშნილია",
    },
    PREPARING: {
      title: "შენი დაკვირვება მზადდება",
      description: "ობსერვატორია ამოწმებს ცას, აპარატურასა და უსაფრთხოების პირობებს.",
      event: "დაკვირვებამდე შემოწმება დაიწყო",
    },
    SLEWING: {
      title: "ტელესკოპი ობიექტისკენ მოძრაობს",
      description: "ტელესკოპის სამაგრი უსაფრთხო მარშრუტით ობიექტისკენ მოძრაობს.",
      event: "ტელესკოპის მოძრაობა დაიწყო",
    },
    VERIFYING: {
      title: "მდებარეობა მოწმდება",
      description: "საცნობარო კადრი ღამის ცის რუკას ედარება.",
      event: "მდებარეობის გადამოწმება დაიწყო",
    },
    CENTERING: {
      title: "ობიექტი ცენტრდება",
      description: "ზუსტი შესწორებები ობიექტს ოპტიკურ ცენტრში ათავსებს.",
      event: "ობიექტის ცენტრირება დაიწყო",
    },
    OBSERVING: {
      title: "დაკვირვება მიმდინარეობს",
      description: "ტელესკოპი ობიექტს რეალურ დროში მიჰყვება: {target}.",
      event: "პირდაპირი დაკვირვება დაიწყო",
    },
    CAPTURING: {
      title: "მიმდინარეობს გადაღება",
      description: "კამერა მიმდინარე დასტეკილ გამოსახულებას ინახავს.",
      event: "გამოსახულების გადაღება დაიწყო",
    },
    PROCESSING: {
      title: "გამოსახულება მუშავდება",
      description: "შენი კადრი ინახება.",
      event: "გამოსახულების დამუშავება დაიწყო",
    },
    COMPLETE: {
      title: "დაკვირვება დასრულებულია",
      description: "დასრულებული დაკვირვება მზადაა შენს კოლექციაში დასამატებლად.",
      event: "მისია დასრულდა",
    },
    WEATHER_HOLD: {
      title: "მისია ამინდის გამო შეჩერდა",
      description: "უსაფრთხო პირობების აღდგენამდე მისია დროებით შეჩერებულია.",
      event: "მისია ამინდის გამო შეჩერდა",
    },
    NOT_VISIBLE: {
      title: "ობიექტი არ ჩანს",
      description: "{target} უსაფრთხო დაკვირვების დროის ფარგლებს გარეთაა.",
      event: "ხილვადობის შემოწმება ვერ გაიარა",
    },
    HARDWARE_ERROR: {
      title: "ობსერვატორიის აპარატურის შეცდომა",
      description: "აპარატურის შემდგომ მოძრაობამდე მისია უსაფრთხოდ შეჩერდა.",
      event: "აპარატურის უსაფრთხო გაჩერება ჩაირთო",
    },
    CANCELLED: {
      title: "მისია გაუქმებულია",
      description: "დაკვირვება დამატებითი ბრძანებების გარეშე დასრულდა.",
      event: "მისია გაუქმდა",
    },
    FAILED: {
      title: "მისია ვერ შესრულდა",
      description: "მისია უსაფრთხო საბოლოო მდგომარეობაში გადავიდა.",
      event: "მისია ვერ შესრულდა",
    },
  },
  reasons: {
    PLATE_SOLVE_FAILED: "ტელესკოპის მდებარეობა ცასთან შედარებით ვერ დადასტურდა.",
    SLEW_TIMEOUT: "ტელესკოპმა ობიექტამდე მისვლას ზედმეტად დიდი დრო მოანდომა.",
    CENTERING_ITERATIONS_EXHAUSTED: "ობიექტის ცენტრირება სამი მცდელობით ვერ მოხერხდა.",
    TRACKING_LOST: "ტელესკოპმა ობიექტს თვალყურის დევნება შეწყვიტა.",
    MOUNT_FAULT: "სამაგრმა შეცდომა დააფიქსირა.",
    CAMERA_FAULT: "კამერამ შეცდომა დააფიქსირა.",
    FOCUSER_FAULT: "ფოკუსერმა შეცდომა დააფიქსირა.",
    AGENT_LINK_LOST: "ობსერვატორიამ კავშირი დაკარგა.",
    HEARTBEAT_LOST: "ობსერვატორიამ პასუხის გაცემა შეწყვიტა.",
    SAFETY_REFUSED:
      "ობსერვატორიამ უარყო ბრძანება, რომელმაც უსაფრთხოების შემოწმება ვერ გაიარა.",
    SAFETY_ENVELOPE_UNMEASURED: "ტელესკოპის უსაფრთხო ზღვრები ჯერ არ არის გაზომილი.",
    TARGET_SET_BELOW_LIMIT: "ობიექტი ტელესკოპის უსაფრთხო სიმაღლეს ქვემოთ ჩავიდა.",
    WEATHER_UNSAFE: "ამინდი დაკვირვებისთვის უსაფრთხო არ არის.",
    SESSION_EXPIRED: "დაკვირვების დრო ამოიწურა.",
    OPERATOR_ABORT: "ობსერვატორიის ოპერატორმა მისია შეაჩერა.",
    CUSTOMER_CANCELLED: "შენ გააუქმე მისია.",
    PAYMENT_FAILED: "გადახდა ვერ შესრულდა.",
  },
  unreachable: {
    title: "ამ მისიის ჩატვირთვა ვერ მოხერხდა.",
    description: "ჩვენმა სერვერებმა არ უპასუხეს. სცადე ცოტა ხანში.",
  },
};

export const roomCopy = { en, ka };
