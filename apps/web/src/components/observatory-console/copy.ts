import type { Locale } from "@/i18n/config";
import type { TargetKind } from "@/lib/observatory-sim/telescope-targets";

/** Every word the console says, in both languages. Numbers and units stay as the model writes them. */
export type ConsoleCopy = {
  observatory: string;
  simulated: string;
  simulatedLong: string;
  live: string;
  nightMode: string;
  cloud: string;
  seeing: string;
  dome: {
    title: string;
    aria: string;
    up: (n: number) => string;
    down: (n: number) => string;
    press: string;
    scope: string;
  };
  session: { confirmStop: string; booked: string };
  pointing: {
    title: string;
    altAz: string;
    altitude: string;
    azimuth: string;
    ra: string;
    dec: string;
    hourAngle: string;
    airmass: string;
    rotation: string;
    bestAt: string;
    trackRms: string;
    battery: string;
    sensor: string;
  };
  camera: {
    title: string;
    exposure: string;
    frames: string;
    gain: string;
    less: string;
    more: string;
    histogram: string;
  };
  hand: {
    title: string;
    rate: (rate: number, label: string) => string;
    up: string;
    down: string;
    west: string;
    east: string;
    centre: string;
    recentre: string;
    slewRate: string;
    tracking: string;
    trackingModes: { off: string; sidereal: string; lunar: string; solar: string };
    focusIn: string;
    focusOut: string;
    sync: string;
    synced: string;
    settings: string;
    stop: string;
    atLimit: { alt: string; cordwrap: string };
    step: (arcmin: number) => string;
    operatorOnly: string;
  };
  mount: {
    title: string;
    backlash: string;
    backlashAlt: string;
    backlashAz: string;
    cordwrap: string;
    approach: string;
    approachAlt: string;
    approachAz: string;
    positive: string;
    negative: string;
    on: string;
    off: string;
    limits: string;
    altMin: string;
    altMax: string;
    note: string;
  };
  frames: {
    open: (n: number, name: string) => string;
  };
  stage: {
    aria: string;
    train: string;
    roi: string;
    liveFeed: string;
    simulatedFeed: string;
    standby: string;
    fov: string;
    framesHud: string;
    near: string;
    offset: string;
    centred: string;
    noFeed: string;
    conditions: string;
  };
  steps: {
    hints: {
      belowHorizon: string;
    };
    capture: (subs: number, exposure: string) => string;
    stopStack: string;
    startSession: string;
    starting: string;
    waiting: string;
    captureReal: string;
  };
  status: {
    standby: string;
    connecting: string;
    stacking: (done: number, goal: number) => string;
    liveStack: (done: number, goal: number) => string;
    slewing: string;
    slewingLong: string;
    solving: string;
    centring: string;
    tracking: string;
    drifting: string;
    lunar: string;
    parking: string;
    parked: string;
    aligning: string;
    ready: string;
    connected: string;
    platform: Record<
      | "starting"
      | "connecting"
      | "reconnecting"
      | "connected"
      | "ended"
      | "refused"
      | "error"
      | "offline"
      | "idle",
      string
    >;
  };
  idle: {
    text: (quick: string | null) => string;
    ready: string;
    pointTo: (name: string) => string;
    chooseRisen: string;
    platform: (target: string) => string;
  };
  details: {
    site: string;
    elevation: string;
    sky: string;
    bortle: (n: number) => string;
    optics: string;
    aperture: string;
    focalLength: string;
    resolution: string;
    mount: string;
    camera: string;
    sensor: string;
    session: string;
    hours: (n: number) => string;
    cameraKind: string;
  };
  targets: {
    kinds: Record<TargetKind, string>;
  };
  refused: {
    head: string;
    notRisen: (name: string) => string;
    refused: (name: string) => string;
    below: (station: string) => string;
    reason: (reason: string) => string;
    rises: string;
    best: string;
    notUpTonight: string;
    cancel: string;
    chooseAnother: string;
  };
  capture: {
    head: string;
    stack: string;
    complete: (n: number) => string;
    histogram: string;
    captured: string;
    exposure: string;
    integration: string;
    gain: string;
    optics: string;
    seeing: string;
    scale: string;
    provenance: string;
    download: string;
    copyHash: string;
    copied: string;
    keepObserving: string;
    frameAlt: (name: string, n: number) => string;
    hud: (n: number, subs: number, exposure: string) => string;
  };
  commands: {
    relayed: string;
    done: string;
    refused: string;
    noAnswer: string;
    failed: string;
  };
  /** What the field is going through right now, over the view. */
  alerts: {
    belowHorizon: string;
    low: (limitDeg: number) => string;
    cloud: string;
    dew: (humidity: number) => string;
  };
  /** The Observatory Hub's cockpit (ADR-083): its panels, in its words. */
  hub: {
    brand: string;
    devices: {
      mount: string;
      camera: string;
      focuser: string;
      online: string;
      offline: string;
      aligned: string;
      parked: string;
      slewing: string;
      pos: (n: number) => string;
      fps: (n: number) => string;
    };
    lst: string;
    park: string;
    stopAll: string;
    night: string;
    tonight: {
      title: string;
      sunset: string;
      sunrise: string;
      darkFrom: string;
      darkUntil: string;
      moon: string;
      moonRiseSet: string;
      waxing: string;
      waning: string;
      darkIn: (t: string) => string;
      darkNow: (t: string) => string;
      daytime: string;
    };
    targets: {
      title: string;
      up: (n: number) => string;
      best: string;
      search: string;
      filters: { planet: string; star: string; deep: string; custom: string; all: string };
      customForm: string;
      ra: string;
      dec: string;
      add: string;
      invalid: string;
      none: string;
      below: string;
      booked: string;
    };
    view: string;
    reticle: string;
    grid: string;
    invert: string;
    mirror: string;
    flip: string;
    autoExp: string;
    focusRun: string;
    png: string;
    full: string;
    controls: string;
    slew: string;
    rate: string;
    capture: string;
    daytime: string;
    daytimeHint: string;
    daytimeNote: string;
    tabs: { mount: string; align: string; focus: string; setup: string; log: string };
    autopilot: {
      title: string;
      pick: string;
      go: string;
      cancel: string;
      recentre: string;
      busy: string;
      pipe: [string, string, string, string, string];
      offTarget: string;
      pass: string;
      solveTime: string;
      whereAmI: string;
      gotoOnly: string;
      sync: string;
      after: string;
      afterExposure: string;
      afterFocus: string;
      keepCentred: string;
      booked: string;
    };
    align: { steps: [string, string, string, string]; points: string; none: string; clear: string };
    focuser: {
      title: string;
      position: string;
      state: string;
      idle: string;
      moving: string;
      speed: string;
      stepsPerS: string;
      run: string;
      stop: string;
      curve: string;
      chartEmpty: string;
      method: string;
      methods: { auto: string; hfr: string; contrast: string };
      contrast: string;
      running: (pass: number, points: number) => string;
      result: (best: number, measure: string, before: number | null, after: number | null) => string;
      failed: string;
    };
    ae: {
      auto: string;
      stop: string;
      scene: string;
      scenes: { daylight: string; moon: string; planet: string; star: string; deepsky: string; dark: string };
      keep: string;
      idle: string;
      metering: (pass: number) => string;
      locked: (passes: number) => string;
      limit: string;
      failed: string;
      level: (percent: number, clipped: number) => string;
    };
    camera: { size: string; depth: string; rate: string; noFrames: string; idle: string; running: (done: number, goal: number) => string };
    setup: { telescope: string; site: string; mountSettings: string };
    log: { empty: string };
    phoneTabs: { track: string; move: string; camera: string; targets: string; more: string };
  };
  provenanceSimulated: string;
  close: string;
};

const en: ConsoleCopy = {
  observatory: "Observatory",
  simulated: "Simulated",
  simulatedLong: "sky model",
  live: "Live",
  nightMode: "Night mode",
  cloud: "Cloud",
  seeing: "Seeing",
  dome: {
    title: "Sky tonight",
    aria: "Tonight's sky over the telescope, twenty showpieces",
    up: (n) => `${n} up`,
    down: (n) => `${n} below the horizon`,
    press:
      "Press an object: the mount slews, solves and centres it, then the live stack settles.",
    scope: "Telescope",
  },
  session: { confirmStop: "Confirm stop", booked: "Booked target" },
  pointing: {
    title: "Pointing",
    altAz: "Alt · Az",
    altitude: "Altitude",
    azimuth: "Azimuth",
    ra: "RA",
    dec: "Dec",
    hourAngle: "Hour angle",
    airmass: "Airmass",
    rotation: "Field rotation",
    bestAt: "Best at",
    trackRms: "Track RMS",
    battery: "Battery",
    sensor: "Sensor",
  },
  camera: {
    title: "Camera",
    exposure: "Exposure",
    frames: "Frames to stack",
    gain: "Gain",
    less: "less",
    more: "more",
    histogram: "Histogram",
  },
  hand: {
    title: "Hand control",
    rate: (rate, label) => `Rate ${rate} · ${label}`,
    up: "Slew up",
    down: "Slew down",
    west: "Slew west",
    east: "Slew east",
    centre: "Centre",
    recentre: "Re-centre the target",
    slewRate: "Slew rate",
    tracking: "Tracking",
    trackingModes: { off: "Off", sidereal: "Sidereal", lunar: "Lunar", solar: "Solar" },
    focusIn: "Focus in",
    focusOut: "Focus out",
    sync: "Sync",
    synced: "Synced here",
    settings: "Mount settings",
    stop: "Stop",
    atLimit: { alt: "Altitude limit", cordwrap: "Cordwrap limit" },
    step: (arcmin) => `${arcmin}′ steps`,
    operatorOnly: "Operator-only on the real instrument",
  },
  mount: {
    title: "Mount settings",
    backlash: "Anti-backlash",
    backlashAlt: "Altitude",
    backlashAz: "Azimuth",
    cordwrap: "Cordwrap",
    approach: "GoTo approach",
    approachAlt: "Altitude",
    approachAz: "Azimuth",
    positive: "Positive",
    negative: "Negative",
    on: "On",
    off: "Off",
    limits: "Slew limits",
    altMin: "Altitude min",
    altMax: "Altitude max",
    note: "The hand control's Scope Setup. The platform's safety limits (20°–85°, Sun avoidance) override these.",
  },
  frames: {
    open: (n, name) => `Open frame ${n}, ${name}`,
  },
  stage: {
    aria: "Telescope view",
    train: "Optical train",
    roi: "Read-out region",
    liveFeed: "Live feed",
    simulatedFeed: "Simulated feed",
    standby: "Standby",
    fov: "Field",
    framesHud: "FRAMES",
    near: "Near",
    offset: "Off target",
    centred: "Centred",
    noFeed: "No stream yet",
    conditions: "Conditions",
  },
  steps: {
    hints: {
      belowHorizon: "The target has set below the horizon. Choose another.",
    },
    capture: (subs, exposure) => `Capture ${subs} × ${exposure}`,
    stopStack: "Stop stack",
    startSession: "Start session",
    starting: "Starting…",
    waiting: "Waiting for the observatory…",
    captureReal: "Capture",
  },
  status: {
    standby: "Standby",
    connecting: "Connecting",
    stacking: (done, goal) => `Stacking · ${done} / ${goal}`,
    liveStack: (done, goal) => `Live stack · ${done} / ${goal}`,
    slewing: "Slewing",
    slewingLong: "Slewing · long way round",
    solving: "Plate-solving",
    centring: "Centring",
    tracking: "On target · tracking",
    drifting: "On target · drifting",
    lunar: "On target · lunar rate",
    parking: "Parking",
    parked: "Connected · parked",
    aligning: "Aligning",
    ready: "Aligned · ready",
    connected: "Connected",
    platform: {
      starting: "Starting session",
      connecting: "Connecting",
      reconnecting: "Reconnecting",
      connected: "Session open",
      ended: "Ended",
      refused: "Refused",
      error: "Error",
      offline: "Observatory offline",
      idle: "Booked",
    },
  },
  idle: {
    text: (quick) =>
      quick
        ? `Press Find & Track: the telescope aligns itself, finds ${quick} and tracks it.`
        : "Pick a target, then press Find & Track.",
    ready: "Ready to point",
    pointTo: (name) => `Press Find & Track to point at ${name}.`,
    chooseRisen: "Choose a target that has risen.",
    platform: (target) =>
      `Your booked observation: ${target}. Start the session to take control.`,
  },
  details: {
    site: "Site",
    elevation: "Elevation",
    sky: "Sky",
    bortle: (n) => `Bortle ${n}`,
    optics: "Optics",
    aperture: "Aperture",
    focalLength: "Focal length",
    resolution: "Resolution (Dawes)",
    mount: "Mount",
    camera: "Camera",
    sensor: "Sensor",
    session: "Session",
    hours: (n) => `${n} hours`,
    cameraKind: "Colour CMOS camera",
  },
  targets: {
    kinds: {
      planet: "planet",
      moon: "moon",
      galaxy: "galaxy",
      nebula: "nebula",
      cluster: "cluster",
      star: "star",
    },
  },
  refused: {
    head: "Refused · safety envelope",
    notRisen: (name) => `${name} has not risen`,
    refused: (name) => `${name} is refused`,
    below: (station) => `Below the horizon for ${station}. Nothing moved.`,
    reason: (reason) => `${reason}. Nothing moved.`,
    rises: "RISES",
    best: "BEST",
    notUpTonight: "— NOT UP TONIGHT",
    cancel: "Cancel",
    chooseAnother: "Choose another",
  },
  capture: {
    head: "Frame captured · stacked",
    stack: "Stack",
    complete: (n) => `${n} / ${n} FRAMES · COMPLETE`,
    histogram: "Histogram of the frame",
    captured: "Captured",
    exposure: "Exposure",
    integration: "Integration",
    gain: "Gain",
    optics: "Optics",
    seeing: "Seeing",
    scale: "Scale",
    provenance: "Provenance",
    download: "Download PNG",
    copyHash: "Copy hash",
    copied: "Copied",
    keepObserving: "Keep observing",
    frameAlt: (name, n) => `${name}, frame ${n}`,
    hud: (n, subs, exposure) => `#${n} · stack ${subs} × ${exposure}`,
  },
  commands: {
    relayed: "Relayed to the observatory…",
    done: "Done",
    refused: "Refused by the observatory",
    noAnswer: "No answer from the observatory",
    failed: "Could not be sent",
  },
  alerts: {
    belowHorizon: "Below the horizon",
    low: (limitDeg) => `Low · under ${limitDeg}°`,
    cloud: "Cloud passing",
    dew: (humidity) => `Dew on the optics · ${humidity}%`,
  },
  hub: {
    brand: "ONLINE OBSERVATORY",
    devices: {
      mount: "Mount",
      camera: "Camera",
      focuser: "Focuser",
      online: "Online",
      offline: "Offline",
      aligned: "Aligned",
      parked: "Parked",
      slewing: "Slewing",
      pos: (n) => `Pos ${n}`,
      fps: (n) => `${n} fps`,
    },
    lst: "LST",
    park: "Park",
    stopAll: "STOP",
    night: "Night",
    tonight: {
      title: "Tonight",
      sunset: "Sunset",
      sunrise: "Sunrise",
      darkFrom: "Dark from",
      darkUntil: "Dark until",
      moon: "Moon",
      moonRiseSet: "Moon rise / set",
      waxing: "wax.",
      waning: "wan.",
      darkIn: (t) => `dark in ${t}`,
      darkNow: (t) => `dark for ${t}`,
      daytime: "daytime",
    },
    targets: {
      title: "Targets",
      up: (n) => `${n} up now`,
      best: "Best right now",
      search: "Search M42, Jupiter, Vega…",
      filters: { planet: "Solar sys", star: "Stars", deep: "Deep sky", custom: "Custom", all: "All" },
      customForm: "Add a target by coordinates",
      ra: "RA (hh:mm:ss)",
      dec: "Dec (±dd:mm:ss)",
      add: "Add target",
      invalid: "RA runs 0–24 h and Dec −90° to +90°, as hh:mm:ss and ±dd:mm:ss.",
      none: "Nothing matches",
      below: "below",
      booked: "Booked",
    },
    view: "View",
    reticle: "Reticle",
    grid: "Grid",
    invert: "Invert",
    mirror: "Mirror",
    flip: "Flip",
    autoExp: "Auto exposure",
    focusRun: "Autofocus",
    png: "Save PNG",
    full: "Full screen",
    controls: "Controls",
    slew: "Mount slew",
    rate: "Rate",
    capture: "Capture",
    daytime: "Day",
    daytimeHint: "Observe the sky as it is now, daylight included: the Moon, Venus, Jupiter and bright stars. The telescope still never points within 30° of the Sun.",
    daytimeNote: "Daytime observing: the telescope keeps 30° away from the Sun.",
    tabs: { mount: "Mount", align: "Align", focus: "Focus", setup: "Setup", log: "Log" },
    autopilot: {
      title: "Autopilot",
      pick: "Pick a target",
      go: "FIND & TRACK",
      cancel: "CANCEL GOTO",
      recentre: "RE-CENTRE",
      busy: "WORKING…",
      pipe: ["Align", "Slew", "Solve", "Center", "Track"],
      offTarget: "Off target",
      pass: "Pass",
      solveTime: "Solve time",
      whereAmI: "Where am I?",
      gotoOnly: "GoTo only",
      sync: "Sync",
      after: "After it locks on",
      afterExposure: "Auto exposure for the scene",
      afterFocus: "Autofocus",
      keepCentred: "Tracking keeps it centred",
      booked: "Your booked target: the platform runs the GoTo.",
    },
    align: {
      steps: [
        "The mount starts level at home, switched on: no hand-controller alignment needed.",
        "Easiest: press Where am I? or just Find & Track. The camera recognises the stars and aligns by itself.",
        "Manual way: centre a bright object on the reticle and press Sync.",
        "Every successful plate solve adds a point and improves GoTo accuracy.",
      ],
      points: "Alignment points",
      none: "none yet",
      clear: "Clear alignment",
    },
    focuser: {
      title: "Focuser",
      position: "Position",
      state: "Motor",
      idle: "still",
      moving: "moving",
      speed: "Focus speed",
      stepsPerS: "steps/s",
      run: "Autofocus",
      stop: "Stop autofocus",
      curve: "Autofocus curve",
      chartEmpty: "Run autofocus: every sample and the fitted curve are drawn here.",
      method: "Measure",
      methods: { auto: "Auto", hfr: "Stars (HFR)", contrast: "Contrast" },
      contrast: "contrast",
      running: (pass, n) => `Pass ${pass} · ${n} samples`,
      result: (best, m, before, after) => `Best ${best} · ${m}${before !== null && after !== null ? ` ${before.toFixed(2)} → ${after.toFixed(2)}` : ""}`,
      failed: "Autofocus found no curve: try a brighter target.",
    },
    ae: {
      auto: "Auto",
      stop: "Stop",
      scene: "Scene",
      scenes: { daylight: "Daylight", moon: "Moon", planet: "Planet", star: "Star", deepsky: "Deep sky", dark: "Finder" },
      keep: "Keep adjusting",
      idle: "Reads the picture and sets exposure and gain",
      metering: (n) => ` · metering, pass ${n}`,
      locked: (n) => ` · locked in ${n}`,
      limit: " · at the camera's limit",
      failed: " · no picture to read",
      level: (p, c) => `level ${p}% · clipped ${c < 0.1 ? 0 : c.toFixed(1)}%`,
    },
    camera: {
      size: "Size",
      depth: "Depth",
      rate: "Rate",
      noFrames: "Captured frames appear here",
      idle: "No capture running",
      running: (d, g) => `Stacking ${d} / ${g}`,
    },
    setup: { telescope: "Telescope", site: "Observing site", mountSettings: "Mount settings" },
    log: { empty: "Nothing yet. Every step the telescope takes is written here." },
    phoneTabs: { track: "Track", move: "Move", camera: "Camera", targets: "Targets", more: "More" },
  },
  provenanceSimulated: "Simulated · sky model",
  close: "Close",
};

const ka: ConsoleCopy = {
  observatory: "ობსერვატორია",
  simulated: "სიმულირებული",
  simulatedLong: "ცის მოდელი",
  live: "პირდაპირი",
  nightMode: "ღამის რეჟიმი",
  cloud: "ღრუბლიანობა",
  seeing: "სიინგი",
  dome: {
    title: "ამაღამ ცაზე",
    aria: "ამაღამდელი ცა ტელესკოპის თავზე, ოცი გამორჩეული ობიექტი",
    up: (n) => `${n} ამოსული`,
    down: (n) => `ჰორიზონტს ქვემოთ: ${n}`,
    press:
      "დააჭირე ობიექტს: მონტირება მიტრიალდება, კადრს ამოიცნობს და დააცენტრებს, მერე დაჯამება სურათს გაასუფთავებს.",
    scope: "ტელესკოპი",
  },
  session: { confirmStop: "შეწყვეტის დადასტურება", booked: "დაჯავშნილი ობიექტი" },
  pointing: {
    title: "მიმართულება",
    altAz: "სიმ · აზ",
    altitude: "სიმაღლე",
    azimuth: "აზიმუტი",
    ra: "RA",
    dec: "Dec",
    hourAngle: "საათური კუთხე",
    airmass: "ატმოსფერული მასა",
    rotation: "ველის ბრუნვა",
    bestAt: "საუკეთესო დრო",
    trackRms: "ტრეკინგის RMS",
    battery: "ბატარეა",
    sensor: "სენსორი",
  },
  camera: {
    title: "კამერა",
    exposure: "ექსპოზიცია",
    frames: "დასაჯამებელი კადრები",
    gain: "გაძლიერება",
    less: "ნაკლები",
    more: "მეტი",
    histogram: "ჰისტოგრამა",
  },
  hand: {
    title: "ხელის პულტი",
    rate: (rate, label) => `სიჩქარე ${rate} · ${label}`,
    up: "ზემოთ",
    down: "ქვემოთ",
    west: "დასავლეთით",
    east: "აღმოსავლეთით",
    centre: "ცენტრი",
    recentre: "ობიექტის ხელახლა დაცენტრება",
    slewRate: "მოძრაობის სიჩქარე",
    tracking: "ტრეკინგი",
    trackingModes: {
      off: "გამორთ.",
      sidereal: "ვარსკვლავური",
      lunar: "მთვარის",
      solar: "მზის",
    },
    focusIn: "ფოკუსი შიგნით",
    focusOut: "ფოკუსი გარეთ",
    sync: "სინქრონიზაცია",
    synced: "სინქრონიზებულია აქ",
    settings: "მონტირების პარამეტრები",
    stop: "გაჩერება",
    atLimit: { alt: "სიმაღლის ზღვარი", cordwrap: "კაბელის ზღვარი" },
    step: (arcmin) => `ნაბიჯი ${arcmin}′`,
    operatorOnly: "ნამდვილ ინსტრუმენტზე მხოლოდ ოპერატორისთვის",
  },
  mount: {
    title: "მონტირების პარამეტრები",
    backlash: "უკუსვლის კომპენსაცია",
    backlashAlt: "სიმაღლე",
    backlashAz: "აზიმუტი",
    cordwrap: "კაბელის დაცვა",
    approach: "GoTo-ს მიახლოება",
    approachAlt: "სიმაღლე",
    approachAz: "აზიმუტი",
    positive: "დადებითი",
    negative: "უარყოფითი",
    on: "ჩართ.",
    off: "გამორთ.",
    limits: "მოძრაობის ზღვრები",
    altMin: "მინ. სიმაღლე",
    altMax: "მაქს. სიმაღლე",
    note: "ხელის პულტის Scope Setup. პლატფორმის უსაფრთხოების ზღვრები (20°–85°, მზისგან დაცვა) ამ პარამეტრებზე მაღლა დგას.",
  },
  frames: {
    open: (n, name) => `გახსენი კადრი ${n}: ${name}`,
  },
  stage: {
    aria: "ტელესკოპის ხედი",
    train: "ოპტიკური სქემა",
    roi: "წაკითხვის არე",
    liveFeed: "პირდაპირი ეთერი",
    simulatedFeed: "სიმულირებული ეთერი",
    standby: "მოლოდინი",
    fov: "ხედვის ველი",
    framesHud: "კადრები",
    near: "ახლოს",
    offset: "აცდენილია",
    centred: "დაცენტრებულია",
    noFeed: "ეთერი ჯერ არ არის",
    conditions: "პირობები",
  },
  steps: {
    hints: {
      belowHorizon: "ობიექტი ჰორიზონტს ქვემოთ ჩავიდა. აირჩიე სხვა.",
    },
    capture: (subs, exposure) => `გადაიღე ${subs} × ${exposure}`,
    stopStack: "დაჯამების შეჩერება",
    startSession: "სეანსის დაწყება",
    starting: "იწყება…",
    waiting: "ობსერვატორიის მოლოდინი…",
    captureReal: "გადაღება",
  },
  status: {
    standby: "მოლოდინი",
    connecting: "უკავშირდება",
    stacking: (done, goal) => `ჯამდება · ${done} / ${goal}`,
    liveStack: (done, goal) => `პირდაპირი დაჯამება · ${done} / ${goal}`,
    slewing: "მოძრაობს",
    slewingLong: "მოძრაობს · გრძელი გზით",
    solving: "კადრის ამოცნობა",
    centring: "დაცენტრება",
    tracking: "ობიექტზე · მიჰყვება",
    drifting: "ობიექტზე · მიცურავს",
    lunar: "ობიექტზე · მთვარის სიჩქარე",
    parking: "პარკირება",
    parked: "დაკავშირებული · პარკირებული",
    aligning: "სწორდება",
    ready: "გასწორებული · მზადაა",
    connected: "დაკავშირებული",
    platform: {
      starting: "სეანსი იწყება",
      connecting: "უკავშირდება",
      reconnecting: "ხელახლა უკავშირდება",
      connected: "სეანსი ღიაა",
      ended: "დასრულდა",
      refused: "უარყოფილია",
      error: "შეცდომა",
      offline: "ობსერვატორია კავშირგარეშეა",
      idle: "დაჯავშნილი",
    },
  },
  idle: {
    text: (quick) =>
      quick
        ? `დააჭირე „პოვნა და მიყოლას“: ტელესკოპი თვითონ სწორდება, პოულობს ობიექტს (${quick}) და მიჰყვება.`
        : "აირჩიე ობიექტი და დააჭირე „პოვნა და მიყოლას“.",
    ready: "მზადაა მიმართვისთვის",
    pointTo: (name) => `დააჭირე „პოვნა და მიყოლას“, რომ მიმართო: ${name}.`,
    chooseRisen: "აირჩიე ამოსული ობიექტი.",
    platform: (target) =>
      `შენი დაჯავშნილი დაკვირვება: ${target}. დაიწყე სეანსი სამართავად.`,
  },
  details: {
    site: "ადგილი",
    elevation: "სიმაღლე ზღვის დონიდან",
    sky: "ცა",
    bortle: (n) => `ბორტლი ${n}`,
    optics: "ოპტიკა",
    aperture: "აპერტურა",
    focalLength: "ფოკუსური მანძილი",
    resolution: "გარჩევისუნარიანობა (დოუზი)",
    mount: "მონტირება",
    camera: "კამერა",
    sensor: "სენსორი",
    session: "სეანსი",
    hours: (n) => `${n} საათი`,
    cameraKind: "ფერადი CMOS კამერა",
  },
  targets: {
    kinds: {
      planet: "პლანეტა",
      moon: "მთვარე",
      galaxy: "გალაქტიკა",
      nebula: "ნისლეული",
      cluster: "გროვა",
      star: "ვარსკვლავი",
    },
  },
  refused: {
    head: "უარყოფილია · უსაფრთხოების ზღვარი",
    notRisen: (name) => `${name} არ ამოსულა`,
    refused: (name) => `${name} უარყოფილია`,
    below: (station) => `ამ სადგურიდან (${station}) ჰორიზონტს ქვემოთაა. არაფერი გაინძრა.`,
    reason: (reason) => `${reason}. არაფერი გაინძრა.`,
    rises: "ამოდის",
    best: "საუკეთესო",
    notUpTonight: "— ამაღამ არ ჩანს",
    cancel: "გაუქმება",
    chooseAnother: "აირჩიე სხვა",
  },
  capture: {
    head: "კადრი გადაღებულია · დაჯამებული",
    stack: "დაჯამება",
    complete: (n) => `${n} / ${n} კადრი · დასრულდა`,
    histogram: "კადრის ჰისტოგრამა",
    captured: "გადაღებულია",
    exposure: "ექსპოზიცია",
    integration: "ჯამური ექსპოზიცია",
    gain: "გაძლიერება",
    optics: "ოპტიკა",
    seeing: "სიინგი",
    scale: "მასშტაბი",
    provenance: "წარმომავლობა",
    download: "PNG-ის ჩამოტვირთვა",
    copyHash: "ჰეშის კოპირება",
    copied: "დაკოპირდა",
    keepObserving: "დაკვირვების გაგრძელება",
    frameAlt: (name, n) => `${name}, კადრი ${n}`,
    hud: (n, subs, exposure) => `#${n} · ${subs} × ${exposure}`,
  },
  commands: {
    relayed: "გადაეცა ობსერვატორიას…",
    done: "შესრულდა",
    refused: "ობსერვატორიამ უარყო",
    noAnswer: "ობსერვატორიისგან პასუხი არ არის",
    failed: "ვერ გაიგზავნა",
  },
  alerts: {
    belowHorizon: "ჰორიზონტს ქვემოთ",
    low: (limitDeg) => `დაბლაა · ${limitDeg}°-ზე ქვემოთ`,
    cloud: "ღრუბელი გადადის",
    dew: (humidity) => `ნამი ოპტიკაზე · ${humidity}%`,
  },
  hub: {
    brand: "ონლაინ ობსერვატორია",
    devices: {
      mount: "მონტირება",
      camera: "კამერა",
      focuser: "ფოკუსერი",
      online: "ჩართულია",
      offline: "გამორთულია",
      aligned: "სწორებულია",
      parked: "პარკირებულია",
      slewing: "ბრუნავს",
      pos: (n) => `პოზ. ${n}`,
      fps: (n) => `${n} კადრი/წმ`,
    },
    lst: "LST",
    park: "პარკირება",
    stopAll: "გაჩერება",
    night: "ღამე",
    tonight: {
      title: "ამაღამ",
      sunset: "მზის ჩასვლა",
      sunrise: "მზის ამოსვლა",
      darkFrom: "სიბნელე იწყება",
      darkUntil: "სიბნელე მთავრდება",
      moon: "მთვარე",
      moonRiseSet: "მთვარე ამოდის / ჩადის",
      waxing: "მზარდი",
      waning: "კლებადი",
      darkIn: (t) => `დაბნელდება ${t}-ში`,
      darkNow: (t) => `ბნელა კიდევ ${t}`,
      daytime: "დღეა",
    },
    targets: {
      title: "ობიექტები",
      up: (n) => `${n} ჩანს ახლა`,
      best: "საუკეთესო ახლა",
      search: "ძებნა: M42, იუპიტერი, ვეგა…",
      filters: { planet: "მზის სისტ.", star: "ვარსკვ.", deep: "ღრმა ცა", custom: "საკუთარი", all: "ყველა" },
      customForm: "ობიექტის დამატება კოორდინატებით",
      ra: "RA (სთ:წთ:წმ)",
      dec: "Dec (±გრ:წთ:წმ)",
      add: "ობიექტის დამატება",
      invalid: "RA 0–24 სთ-ია, Dec კი −90°-დან +90°-მდე, ფორმატით სთ:წთ:წმ და ±გრ:წთ:წმ.",
      none: "ვერაფერი მოიძებნა",
      below: "ქვემოთ",
      booked: "დაჯავშნილი",
    },
    view: "ხედი",
    reticle: "სამიზნე",
    grid: "ბადე",
    invert: "ინვერსია",
    mirror: "სარკე",
    flip: "ამოტრიალება",
    autoExp: "ავტო ექსპოზიცია",
    focusRun: "ავტოფოკუსი",
    png: "PNG-ის შენახვა",
    full: "სრული ეკრანი",
    controls: "მართვა",
    slew: "მონტირების მოძრაობა",
    rate: "სიჩქ.",
    capture: "გადაღება",
    daytime: "დღე",
    daytimeHint: "დააკვირდი ცას ისე, როგორც ახლაა, დღის სინათლის ჩათვლით: მთვარე, ვენერა, იუპიტერი და კაშკაშა ვარსკვლავები. ტელესკოპი მზიდან 30°-ზე ახლოს მაინც არასდროს მიმართება.",
    daytimeNote: "დღის დაკვირვება: ტელესკოპი მზიდან 30°-ით შორს რჩება.",
    tabs: { mount: "მონტირება", align: "სწორება", focus: "ფოკუსი", setup: "პარამეტრები", log: "ჟურნალი" },
    autopilot: {
      title: "ავტოპილოტი",
      pick: "აირჩიეთ ობიექტი",
      go: "პოვნა და მიყოლა",
      cancel: "GOTO-ს გაუქმება",
      recentre: "ხელახლა ცენტრში",
      busy: "მიმდინარეობს…",
      pipe: ["სწორება", "მობრუნება", "ამოცნობა", "ცენტრი", "მიყოლა"],
      offTarget: "აცდენა",
      pass: "ცდა",
      solveTime: "ამოცნობის დრო",
      whereAmI: "სად ვარ?",
      gotoOnly: "მხოლოდ GoTo",
      sync: "სინქრონი",
      after: "დამიზნების შემდეგ",
      afterExposure: "ავტო ექსპოზიცია სცენისთვის",
      afterFocus: "ავტოფოკუსი",
      keepCentred: "მიყოლა ობიექტს ცენტრში ინახავს",
      booked: "თქვენი დაჯავშნილი ობიექტი: GoTo-ს პლატფორმა ასრულებს.",
    },
    align: {
      steps: [
        "მონტირება სახლის პოზიციაში, ჩართული იწყებს: პულტით სწორება საჭირო არ არის.",
        "უმარტივესი: დააჭირეთ „სად ვარ?“ ან უბრალოდ „პოვნა და მიყოლა“. კამერა ვარსკვლავებს ცნობს და თვითონ სწორდება.",
        "ხელით: კაშკაშა ობიექტი სამიზნის ცენტრში მოიყვანეთ და დააჭირეთ „სინქრონს“.",
        "ყოველი წარმატებული ამოცნობა წერტილს ამატებს და GoTo-ს სიზუსტეს აუმჯობესებს.",
      ],
      points: "სწორების წერტილები",
      none: "ჯერ არცერთი",
      clear: "სწორების წაშლა",
    },
    focuser: {
      title: "ფოკუსერი",
      position: "პოზიცია",
      state: "ძრავი",
      idle: "გაჩერებულია",
      moving: "მოძრაობს",
      speed: "ფოკუსის სიჩქარე",
      stepsPerS: "ბიჯი/წმ",
      run: "ავტოფოკუსი",
      stop: "ავტოფოკუსის გაჩერება",
      curve: "ავტოფოკუსის მრუდი",
      chartEmpty: "გაუშვით ავტოფოკუსი: ყოველი გაზომვა და მორგებული მრუდი აქ გამოჩნდება.",
      method: "საზომი",
      methods: { auto: "ავტო", hfr: "ვარსკვლავები (HFR)", contrast: "კონტრასტი" },
      contrast: "კონტრასტი",
      running: (pass, n) => `ცდა ${pass} · ${n} გაზომვა`,
      result: (best, m, before, after) => `საუკეთესო ${best} · ${m}${before !== null && after !== null ? ` ${before.toFixed(2)} → ${after.toFixed(2)}` : ""}`,
      failed: "ავტოფოკუსმა მრუდი ვერ იპოვა: სცადეთ უფრო კაშკაშა ობიექტი.",
    },
    ae: {
      auto: "ავტო",
      stop: "გაჩერება",
      scene: "სცენა",
      scenes: { daylight: "დღის შუქი", moon: "მთვარე", planet: "პლანეტა", star: "ვარსკვლავი", deepsky: "ღრმა ცა", dark: "მაძიებელი" },
      keep: "მუდმივი მორგება",
      idle: "კითხულობს სურათს და აყენებს ექსპოზიციას და გაძლიერებას",
      metering: (n) => ` · იზომება, ცდა ${n}`,
      locked: (n) => ` · დაფიქსირდა ${n} ცდაში`,
      limit: " · კამერის ზღვარზეა",
      failed: " · წასაკითხი სურათი არ არის",
      level: (p, c) => `დონე ${p}% · გადაჭარბებული ${c < 0.1 ? 0 : c.toFixed(1)}%`,
    },
    camera: {
      size: "ზომა",
      depth: "სიღრმე",
      rate: "სიხშირე",
      noFrames: "გადაღებული კადრები აქ გამოჩნდება",
      idle: "გადაღება არ მიმდინარეობს",
      running: (d, g) => `დაჯამება ${d} / ${g}`,
    },
    setup: { telescope: "ტელესკოპი", site: "დაკვირვების ადგილი", mountSettings: "მონტირების პარამეტრები" },
    log: { empty: "ჯერ ცარიელია. ტელესკოპის ყოველი ნაბიჯი აქ ჩაიწერება." },
    phoneTabs: { track: "მიყოლა", move: "მოძრაობა", camera: "კამერა", targets: "ობიექტები", more: "მეტი" },
  },
  provenanceSimulated: "სიმულირებული · ცის მოდელი",
  close: "დახურვა",
};

export const consoleCopy: Record<Locale, ConsoleCopy> = { en, ka };
