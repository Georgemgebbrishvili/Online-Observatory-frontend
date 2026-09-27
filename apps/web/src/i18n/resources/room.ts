import type {
  MissionFailureReason,
  MissionEventSource,
  MissionState,
} from "@darkview/contracts";

import { brand } from "@/brand";

type StatePresentation = {
  title: string;
  description: string;
  event: string;
};

type StateCopy = { title: string; description: string };

type RoomCopy = {
  metadataTitle: string;
  back: string;
  eyebrow: string;
  feed: {
    label: string;
    illustration: string;
    before: string;
    during: string;
    ended: string;
  };
  steps: {
    title: string;
    names: [string, string, string, string, string];
    stepOf: string;
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
  };
  readings: { title: string; cloud: string; cloudUnknown: string };
  history: {
    title: string;
    empty: string;
    unreadable: string;
    sources: Record<MissionEventSource, string>;
  };
  captures: { title: string; empty: string; all: string };
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
    during: "The live view is not connected on this page yet.",
    ended: "This observation has ended.",
  },
  steps: {
    title: "Progress",
    names: ["Prepare", "Slew", "Centre", "Observe", "Capture"],
    stepOf: "Step {step} of 5",
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
    note: "The target's position, not the telescope's. The telescope's own position is not published yet.",
    computedAt: "Computed at {time}.",
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
    sources: { CLOUD: "Platform", AGENT: "Observatory", OPERATOR: "Operator" },
  },
  captures: {
    title: "Captures from this mission",
    empty: "No captures yet.",
    all: "Your Collection",
  },
  states: {
    REQUESTED: {
      title: "Mission requested",
      description: "Your observation request has entered the mission queue.",
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
      description: "The camera is collecting the planned exposure sequence.",
      event: "Image capture started",
    },
    PROCESSING: {
      title: "Processing your image",
      description: "Captured frames are being calibrated and assembled.",
      event: "Image processing started",
    },
    COMPLETE: {
      title: "Observation complete",
      description: "Your finished observation is ready for the collection.",
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
    description: "The platform did not answer. Try again shortly.",
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
    during: "პირდაპირი ხედი ამ გვერდზე ჯერ არ არის დაკავშირებული.",
    ended: "ეს დაკვირვება დასრულდა.",
  },
  steps: {
    title: "მიმდინარეობა",
    names: ["მომზადება", "მიმართვა", "ცენტრირება", "დაკვირვება", "გადაღება"],
    stepOf: "ნაბიჯი {step} 5-დან",
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
    note: "ეს ობიექტის მდებარეობაა და არა ტელესკოპის. ტელესკოპის საკუთარი მდებარეობა ჯერ არ ქვეყნდება.",
    computedAt: "გამოთვლილია {time}-ზე.",
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
    sources: { CLOUD: "პლატფორმა", AGENT: "ობსერვატორია", OPERATOR: "ოპერატორი" },
  },
  captures: {
    title: "ამ მისიის კადრები",
    empty: "კადრები ჯერ არ არის.",
    all: "თქვენი კოლექცია",
  },
  states: {
    REQUESTED: {
      title: "მისია მოთხოვნილია",
      description: "თქვენი დაკვირვების მოთხოვნა მისიების რიგში დაემატა.",
      event: "მისიის მოთხოვნა შეიქმნა",
    },
    SCHEDULED: {
      title: "დაკვირვება დაგეგმილია",
      description: "ობსერვატორიამ ამ ობიექტისთვის დრო გამოყო.",
      event: "დაკვირვების დრო დაჯავშნილია",
    },
    PREPARING: {
      title: "თქვენი დაკვირვება მზადდება",
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
      description: "კამერა დაგეგმილი ექსპოზიციების სერიას იღებს.",
      event: "გამოსახულების გადაღება დაიწყო",
    },
    PROCESSING: {
      title: "გამოსახულება მუშავდება",
      description: "გადაღებული კადრები კალიბრირდება და ერთიანდება.",
      event: "გამოსახულების დამუშავება დაიწყო",
    },
    COMPLETE: {
      title: "დაკვირვება დასრულებულია",
      description: "დასრულებული დაკვირვება მზადაა კოლექციაში დასამატებლად.",
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
    CUSTOMER_CANCELLED: "თქვენ გააუქმეთ მისია.",
    PAYMENT_FAILED: "გადახდა ვერ შესრულდა.",
  },
  unreachable: {
    title: "ამ მისიის ჩატვირთვა ვერ მოხერხდა.",
    description: "პლატფორმამ არ უპასუხა. სცადეთ ცოტა ხანში.",
  },
};

export const roomCopy = { en, ka };
