import type { Locale } from "@/i18n/config";
import type { TargetKind } from "@/lib/observatory-sim/telescope-targets";

/** Every word the console says, in both languages. Numbers and units stay as the model writes them. */
export type ConsoleCopy = {
  observatory: string;
  utc: string;
  darkLeft: string;
  darkIn: string;
  simulated: string;
  simulatedLong: string;
  live: string;
  nightMode: string;
  menu: string;
  skyLabel: string;
  sky: { night: string; twilight: string; day: string };
  cloud: string;
  seeing: string;
  quick: {
    title: string;
    observe: (name: string | null) => string;
    text: (name: string | null) => string;
    start: (name: string | null) => string;
  };
  telescopes: {
    title: string;
    live: string;
    comingSoon: string;
    darkNow: string;
    twilight: string;
    daylight: string;
    oneOpen: string;
  };
  session: { title: string; parkEnd: string; stop: string; confirmStop: string; booked: string };
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
    aria: string;
  };
  camera: {
    title: string;
    exposure: string;
    frames: string;
    gain: string;
    roi: string;
    auto: string;
    less: string;
    more: string;
    exposing: (done: string, total: string) => string;
    refresh: (seconds: string) => string;
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
    focus: string;
    focusIn: string;
    focusOut: string;
    autofocus: string;
    focusing: string;
    sync: string;
    synced: string;
    settings: string;
    stop: string;
    atLimit: { alt: string; cordwrap: string };
    button: string;
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
    title: string;
    thisSession: (count: number) => string;
    empty: string;
    open: (n: number, name: string) => string;
    captured: string;
    add: string;
  };
  stage: {
    aria: string;
    optics: string;
    train: string;
    roi: string;
    reticle: string;
    fullView: string;
    liveFeed: string;
    simulatedFeed: string;
    standby: string;
    fov: string;
    framesHud: string;
    near: string;
    offset: string;
    centred: string;
    noFeed: string;
  };
  steps: {
    label: string;
    names: [string, string, string, string, string];
    youPick: string;
    of: (step: number, count: number) => string;
    hints: {
      connect: string;
      align: string;
      target: (quick: string | null) => string;
      point: (seconds: number) => string;
      stacking: (done: number, goal: number, exposure: string) => string;
      tracking: string;
      drifting: string;
      platform: { connect: string; running: string; observing: string; stopped: string };
    };
    connecting: string;
    connectTo: (name: string) => string;
    stationDetails: string;
    parking: string;
    aligning: string;
    align: string;
    parkHome: string;
    pointTo: (name: string) => string;
    chooseTarget: string;
    search: string;
    cancelGoto: string;
    stacking: (done: number, goal: number) => string;
    capture: (subs: number, exposure: string) => string;
    stopStack: string;
    recentre: string;
    changeTarget: string;
    startSession: string;
    starting: string;
    waiting: string;
    captureReal: string;
  };
  status: {
    standby: string;
    connecting: string;
    stacking: (done: number, goal: number) => string;
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
    platform: Record<"starting" | "connecting" | "reconnecting" | "connected" | "live" | "ended" | "refused" | "error" | "offline" | "idle", string>;
  };
  idle: {
    text: (quick: string | null) => string;
    ready: string;
    pointTo: (name: string) => string;
    chooseRisen: string;
    platform: (target: string) => string;
  };
  phone: { tracking: string; seeing: string; frames: string };
  details: {
    title: (name: string) => string;
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
  };
  targets: {
    title: string;
    search: string;
    order: string;
    zenith: string;
    brightest: string;
    name: string;
    kind: string;
    all: string;
    solar: string;
    nebula: string;
    galaxy: string;
    cluster: string;
    star: string;
    tonight: string;
    tonightBadge: string;
    now: string;
    notRisen: string;
    point: string;
    foot: (station: string) => string;
    refusedBelow: string;
    kinds: Record<TargetKind, string>;
    mag: string;
    coordinates: string;
    ra: string;
    dec: string;
    goto: string;
    invalid: string;
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
  provenanceSimulated: string;
  close: string;
};

const en: ConsoleCopy = {
  observatory: "Observatory",
  utc: "UTC",
  darkLeft: "Dark left",
  darkIn: "Dark in",
  simulated: "Simulated",
  simulatedLong: "sky model",
  live: "Live",
  nightMode: "Night mode",
  menu: "Menu",
  skyLabel: "Sky",
  sky: { night: "Dark", twilight: "Twilight", day: "Day" },
  cloud: "Cloud",
  seeing: "Seeing",
  quick: {
    title: "Quick start",
    observe: (name) => (name ? `Observe ${name}` : "Observe"),
    text: (name) =>
      name
        ? `Connect, align and point the telescope at ${name} in one go. The mount moves at its own pace: about a minute.`
        : "Nothing in the catalogue is up right now.",
    start: (name) => (name ? `Start · ${name}` : "Start"),
  },
  telescopes: {
    title: "Telescopes",
    live: "Live",
    comingSoon: "Coming soon",
    darkNow: "Dark now",
    twilight: "Twilight",
    daylight: "Daylight",
    oneOpen: "One telescope, in Tbilisi. More join as partners come online.",
  },
  session: { title: "Session", parkEnd: "Park & end", stop: "Stop observation", confirmStop: "Confirm stop", booked: "Booked target" },
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
    aria: "Pointing: altitude and azimuth",
  },
  camera: {
    title: "Camera",
    exposure: "Exposure",
    frames: "Frames to stack",
    gain: "Gain",
    roi: "Read-out",
    auto: "Auto for target",
    less: "less",
    more: "more",
    exposing: (done, total) => `Exposing · ${done} / ${total}`,
    refresh: (seconds) => `The view refreshes every ${seconds}. Use a short exposure to centre.`,
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
    focus: "Focus",
    focusIn: "Focus in",
    focusOut: "Focus out",
    autofocus: "Autofocus",
    focusing: "Focusing…",
    sync: "Sync",
    synced: "Synced here",
    settings: "Mount settings",
    stop: "Stop",
    atLimit: { alt: "Altitude limit", cordwrap: "Cordwrap limit" },
    button: "Hand control",
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
    note: "The hand control's Scope Setup, as the manual lists it. The safety envelope (20°–85°, Sun avoidance) is the platform's and sits above these.",
  },
  frames: {
    title: "Frames",
    thisSession: (count) => `${count} this session`,
    empty: "Capture opens once the mount is tracking a target.",
    open: (n, name) => `Open frame ${n}, ${name}`,
    captured: "Captured",
    add: "Capture a new frame",
  },
  stage: {
    aria: "Telescope view",
    optics: "Optics",
    train: "Optical train",
    roi: "Read-out region",
    reticle: "Reticle",
    fullView: "Full view (F)",
    liveFeed: "Live feed",
    simulatedFeed: "Simulated feed",
    standby: "Standby",
    fov: "Field",
    framesHud: "FRAMES",
    near: "Near",
    offset: "Off target",
    centred: "Centred",
    noFeed: "No stream yet",
  },
  steps: {
    label: "Steps",
    names: ["Connect", "Align", "Target", "Point", "Capture"],
    youPick: "you pick",
    of: (step, count) => `Step ${step} of ${count}`,
    hints: {
      connect: "Connect to the telescope to start.",
      align: "Align: the mount leaves home, solves a field and syncs. Then the feed starts.",
      target: (quick) =>
        `Select a target that has risen.${quick ? ` Quick start points at ${quick}.` : ""}`,
      point: (seconds) => `GoTo at 5°/s, plate-solve and centre. About ${seconds} seconds.`,
      stacking: (done, goal, exposure) => `Stacking ${done} of ${goal} frames of ${exposure}.`,
      tracking: "On target and tracking the sky. Nudge with the pad: the object stays where it is on the sky.",
      drifting: "Tracking is off: the sky drifts through the field at sidereal rate.",
      platform: {
        connect: "Start your session to take the real instrument's controls.",
        running: "The observatory is slewing to your booked target. Nudges open once it is centred.",
        observing: "On your booked target. Nudge in bounded steps, re-centre, or capture.",
        stopped: "The observation has ended.",
      },
    },
    connecting: "Connecting…",
    connectTo: (name) => `Connect to ${name}`,
    stationDetails: "Station details",
    parking: "Parking…",
    aligning: "Aligning…",
    align: "Align",
    parkHome: "Park at home",
    pointTo: (name) => `Point to ${name}`,
    chooseTarget: "Choose a target",
    search: "Search",
    cancelGoto: "Cancel GoTo",
    stacking: (done, goal) => `Stacking ${done} / ${goal}`,
    capture: (subs, exposure) => `Capture ${subs} × ${exposure}`,
    stopStack: "Stop stack",
    recentre: "Re-centre",
    changeTarget: "Change target",
    startSession: "Start session",
    starting: "Starting…",
    waiting: "Waiting for the observatory…",
    captureReal: "Capture",
  },
  status: {
    standby: "Standby",
    connecting: "Connecting",
    stacking: (done, goal) => `Stacking · ${done} / ${goal}`,
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
      live: "Live",
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
        ? `Connect and align to start the feed, or use Quick start to go straight to ${quick}.`
        : "Connect and align to start the feed.",
    ready: "Ready to point",
    pointTo: (name) => `Point to ${name} to begin.`,
    chooseRisen: "Choose a target that has risen.",
    platform: (target) => `Your booked observation of ${target}. Start the session to take the controls.`,
  },
  phone: { tracking: "Tracking", seeing: "Seeing", frames: "Frames" },
  details: {
    title: (name) => `${name} · details`,
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
  },
  targets: {
    title: "Choose a target",
    search: "Search the catalogue",
    order: "Order",
    zenith: "Highest",
    brightest: "Brightest",
    name: "Name",
    kind: "Kind",
    all: "All",
    solar: "Planets & Moon",
    nebula: "Nebulae",
    galaxy: "Galaxies",
    cluster: "Clusters",
    star: "Stars",
    tonight: "Tonight",
    tonightBadge: "TONIGHT",
    now: "Now",
    notRisen: "Not risen",
    point: "Point",
    foot: (station) => `Curves: altitude dusk → dawn for ${station} · orange line: now`,
    refusedBelow: "Below the horizon is refused",
    kinds: {
      planet: "planet",
      moon: "moon",
      galaxy: "galaxy",
      nebula: "nebula",
      cluster: "cluster",
      star: "star",
    },
    mag: "mag",
    coordinates: "Go to coordinates",
    ra: "RA (hh:mm:ss)",
    dec: "Dec (±dd:mm:ss)",
    goto: "GoTo",
    invalid: "Enter a right ascension from 0 to 24 h and a declination from −90° to +90°.",
  },
  refused: {
    head: "Refused · safety envelope",
    notRisen: (name) => `${name} has not risen`,
    refused: (name) => `${name} is refused`,
    below: (station) =>
      `It sits below the horizon for ${station}. The mount refuses what it would refuse in the dome, so nothing moved.`,
    reason: (reason) =>
      `${reason}. The mount refuses what it would refuse in the dome, so nothing moved.`,
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
  provenanceSimulated: "Simulated · sky model",
  close: "Close",
};

const ka: ConsoleCopy = {
  observatory: "ობსერვატორია",
  utc: "UTC",
  darkLeft: "დარჩა სიბნელე",
  darkIn: "სიბნელე",
  simulated: "სიმულირებული",
  simulatedLong: "ცის მოდელი",
  live: "პირდაპირი",
  nightMode: "ღამის რეჟიმი",
  menu: "მენიუ",
  skyLabel: "ცა",
  sky: { night: "ბნელა", twilight: "ბინდი", day: "დღეა" },
  cloud: "ღრუბელი",
  seeing: "სიინგი",
  quick: {
    title: "სწრაფი დაწყება",
    observe: (name) => name ?? "დაკვირვება",
    text: (name) =>
      name
        ? `დაუკავშირდი, გაასწორე და მიმართე ტელესკოპი ობიექტისკენ (${name}) ერთი ნაბიჯით. მონტირება თავისი ტემპით მოძრაობს: დაახლოებით ერთი წუთი.`
        : "კატალოგიდან ამჟამად არაფერია ამოსული.",
    start: (name) => (name ? `დაწყება · ${name}` : "დაწყება"),
  },
  telescopes: {
    title: "ტელესკოპები",
    live: "პირდაპირი",
    comingSoon: "მალე",
    darkNow: "ახლა ბნელა",
    twilight: "ბინდი",
    daylight: "დღეა",
    oneOpen: "ერთი ტელესკოპი, თბილისში. სხვები პარტნიორებთან ერთად შემოუერთდებიან.",
  },
  session: { title: "სესია", parkEnd: "პარკირება და დასრულება", stop: "დაკვირვების შეჩერება", confirmStop: "შეჩერების დადასტურება", booked: "დაჯავშნილი ობიექტი" },
  pointing: {
    title: "მიმართულება",
    altAz: "სიმ · აზ",
    altitude: "სიმაღლე",
    azimuth: "აზიმუტი",
    ra: "RA",
    dec: "Dec",
    hourAngle: "საათური კუთხე",
    airmass: "ჰაერის მასა",
    rotation: "ველის ბრუნვა",
    bestAt: "საუკეთესო დრო",
    trackRms: "ტრეკინგი RMS",
    battery: "ბატარეა",
    sensor: "სენსორი",
    aria: "მიმართულება: სიმაღლე და აზიმუტი",
  },
  camera: {
    title: "კამერა",
    exposure: "ექსპოზიცია",
    frames: "კადრები დასტაში",
    gain: "გაძლიერება",
    roi: "წაკითხვის არე",
    auto: "ავტომატურად ობიექტისთვის",
    less: "ნაკლები",
    more: "მეტი",
    exposing: (done, total) => `ექსპოზიცია · ${done} / ${total}`,
    refresh: (seconds) => `ხედი განახლდება ყოველ ${seconds}. დასაცენტრებლად გამოიყენე მოკლე ექსპოზიცია.`,
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
    trackingModes: { off: "გამორთ.", sidereal: "ვარსკვლავური", lunar: "მთვარის", solar: "მზის" },
    focus: "ფოკუსი",
    focusIn: "ფოკუსი შიგნით",
    focusOut: "ფოკუსი გარეთ",
    autofocus: "ავტოფოკუსი",
    focusing: "ფოკუსირდება…",
    sync: "სინქრონი",
    synced: "სინქრონიზებულია აქ",
    settings: "მონტირების პარამეტრები",
    stop: "გაჩერება",
    atLimit: { alt: "სიმაღლის ზღვარი", cordwrap: "კაბელის ზღვარი" },
    button: "ხელის პულტი",
    step: (arcmin) => `${arcmin}′ ნაბიჯები`,
    operatorOnly: "ნამდვილ ინსტრუმენტზე მხოლოდ ოპერატორისთვის",
  },
  mount: {
    title: "მონტირების პარამეტრები",
    backlash: "უკუსვლის კომპენსაცია",
    backlashAlt: "სიმაღლე",
    backlashAz: "აზიმუტი",
    cordwrap: "კაბელის დაცვა",
    approach: "GoTo მიახლოება",
    approachAlt: "სიმაღლე",
    approachAz: "აზიმუტი",
    positive: "დადებითი",
    negative: "უარყოფითი",
    on: "ჩართ.",
    off: "გამორთ.",
    limits: "მოძრაობის ზღვრები",
    altMin: "სიმაღლე მინ",
    altMax: "სიმაღლე მაქს",
    note: "ხელის პულტის Scope Setup, როგორც სახელმძღვანელოშია. უსაფრთხოების ზღვარი (20°–85°, მზის არიდება) პლატფორმისაა და ამათზე მაღლა დგას.",
  },
  frames: {
    title: "კადრები",
    thisSession: (count) => `ამ სესიაში ${count}`,
    empty: "გადაღება იხსნება, როცა მონტირება ობიექტს მიჰყვება.",
    open: (n, name) => `კადრის გახსნა ${n}, ${name}`,
    captured: "გადაღებული",
    add: "ახალი კადრის გადაღება",
  },
  stage: {
    aria: "ტელესკოპის ხედი",
    optics: "ოპტიკა",
    train: "ოპტიკური სქემა",
    roi: "წაკითხვის არე",
    reticle: "ბადე",
    fullView: "სრული ხედი (F)",
    liveFeed: "პირდაპირი ნაკადი",
    simulatedFeed: "სიმულირებული ნაკადი",
    standby: "მოლოდინი",
    fov: "ველი",
    framesHud: "კადრი",
    near: "ახლოს",
    offset: "ობიექტიდან",
    centred: "დაცენტრებულია",
    noFeed: "ნაკადი ჯერ არ არის",
  },
  steps: {
    label: "ნაბიჯები",
    names: ["დაკავშირება", "გასწორება", "ობიექტი", "მიმართვა", "გადაღება"],
    youPick: "შენ ირჩევ",
    of: (step, count) => `ნაბიჯი ${step} / ${count}`,
    hints: {
      connect: "დასაწყებად დაუკავშირდი ტელესკოპს.",
      align: "გასწორება: მონტირება ტოვებს საწყის პოზიციას, ამოიცნობს ველს და სინქრონდება. შემდეგ ნაკადი იწყება.",
      target: (quick) =>
        `აირჩიე ამოსული ობიექტი.${quick ? ` სწრაფი დაწყება მიმართავს: ${quick}.` : ""}`,
      point: (seconds) => `GoTo 5°/წმ სიჩქარით, კადრის ამოცნობა და დაცენტრება. დაახლოებით ${seconds} წამი.`,
      stacking: (done, goal, exposure) => `იდგმება ${done} / ${goal} კადრი, თითო ${exposure}.`,
      tracking: "ობიექტზეა და ცას მიჰყვება. პულტით გადაწიე: ობიექტი ცაზე თავის ადგილას რჩება.",
      drifting: "ტრეკინგი გამორთულია: ცა ველში ვარსკვლავური სიჩქარით სრიალებს.",
      platform: {
        connect: "დაიწყე სესია, რომ ნამდვილი ინსტრუმენტის მართვა აიღო.",
        running: "ობსერვატორია შენი დაჯავშნილი ობიექტისკენ მოძრაობს. გადაწევა დაცენტრების შემდეგ იხსნება.",
        observing: "შენს დაჯავშნილ ობიექტზეა. გადაწიე შეზღუდული ნაბიჯებით, ხელახლა დააცენტრე ან გადაიღე.",
        stopped: "დაკვირვება დასრულდა.",
      },
    },
    connecting: "უკავშირდება…",
    connectTo: (name) => `დაუკავშირდი: ${name}`,
    stationDetails: "სადგურის დეტალები",
    parking: "პარკირება…",
    aligning: "სწორდება…",
    align: "გასწორება",
    parkHome: "პარკირება საწყისზე",
    pointTo: (name) => `მიმართე: ${name}`,
    chooseTarget: "აირჩიე ობიექტი",
    search: "ძიება",
    cancelGoto: "GoTo-ს გაუქმება",
    stacking: (done, goal) => `იდგმება ${done} / ${goal}`,
    capture: (subs, exposure) => `გადაიღე ${subs} × ${exposure}`,
    stopStack: "დასტის შეჩერება",
    recentre: "ხელახლა დაცენტრება",
    changeTarget: "ობიექტის შეცვლა",
    startSession: "სესიის დაწყება",
    starting: "იწყება…",
    waiting: "ობსერვატორიის მოლოდინი…",
    captureReal: "გადაღება",
  },
  status: {
    standby: "მოლოდინი",
    connecting: "უკავშირდება",
    stacking: (done, goal) => `იდგმება · ${done} / ${goal}`,
    slewing: "მოძრაობს",
    slewingLong: "მოძრაობს · გრძელი გზით",
    solving: "კადრის ამოცნობა",
    centring: "დაცენტრება",
    tracking: "ობიექტზე · მიჰყვება",
    drifting: "ობიექტზე · სრიალებს",
    lunar: "ობიექტზე · მთვარის სიჩქარე",
    parking: "პარკირება",
    parked: "დაკავშირებული · დაპარკული",
    aligning: "სწორდება",
    ready: "გასწორებული · მზადაა",
    connected: "დაკავშირებული",
    platform: {
      starting: "სესია იწყება",
      connecting: "უკავშირდება",
      reconnecting: "ხელახლა უკავშირდება",
      connected: "სესია ღიაა",
      live: "პირდაპირი",
      ended: "დასრულდა",
      refused: "უარყოფილია",
      error: "შეცდომა",
      offline: "ობსერვატორია ხაზგარეშეა",
      idle: "დაჯავშნილი",
    },
  },
  idle: {
    text: (quick) =>
      quick
        ? `დაუკავშირდი და გაასწორე ნაკადის დასაწყებად, ან სწრაფი დაწყებით პირდაპირ გადადი: ${quick}.`
        : "დაუკავშირდი და გაასწორე ნაკადის დასაწყებად.",
    ready: "მზადაა მიმართვისთვის",
    pointTo: (name) => `დასაწყებად მიმართე: ${name}.`,
    chooseRisen: "აირჩიე ამოსული ობიექტი.",
    platform: (target) => `შენი დაჯავშნილი დაკვირვება: ${target}. დაიწყე სესია მართვის ასაღებად.`,
  },
  phone: { tracking: "ტრეკინგი", seeing: "სიინგი", frames: "კადრები" },
  details: {
    title: (name) => `${name} · დეტალები`,
    site: "ადგილი",
    elevation: "სიმაღლე ზღვის დონიდან",
    sky: "ცა",
    bortle: (n) => `ბორტლი ${n}`,
    optics: "ოპტიკა",
    aperture: "აპერტურა",
    focalLength: "ფოკუსური მანძილი",
    resolution: "გარჩევადობა (დოუზი)",
    mount: "მონტირება",
    camera: "კამერა",
    sensor: "სენსორი",
    session: "სესია",
    hours: (n) => `${n} საათი`,
  },
  targets: {
    title: "აირჩიე ობიექტი",
    search: "კატალოგში ძიება",
    order: "დალაგება",
    zenith: "უმაღლესი",
    brightest: "უკაშკაშესი",
    name: "სახელი",
    kind: "ტიპი",
    all: "ყველა",
    solar: "პლანეტები და მთვარე",
    nebula: "ნისლეულები",
    galaxy: "გალაქტიკები",
    cluster: "გროვები",
    star: "ვარსკვლავები",
    tonight: "დღეს ღამით",
    tonightBadge: "დღეს ღამით",
    now: "ახლა",
    notRisen: "არ ამოსულა",
    point: "მიმართე",
    foot: (station) => `მრუდები: სიმაღლე ბინდიდან განთიადამდე (${station}) · ნარინჯისფერი ხაზი: ახლა`,
    refusedBelow: "ჰორიზონტის ქვემოთ უარყოფილია",
    kinds: {
      planet: "პლანეტა",
      moon: "მთვარე",
      galaxy: "გალაქტიკა",
      nebula: "ნისლეული",
      cluster: "გროვა",
      star: "ვარსკვლავი",
    },
    mag: "სიდიდე",
    coordinates: "კოორდინატებზე გადასვლა",
    ra: "RA (სს:წწ:წწ)",
    dec: "Dec (±გგ:წწ:წწ)",
    goto: "GoTo",
    invalid: "შეიყვანე პირდაპირი ასვლა 0-დან 24 სთ-მდე და დახრილობა −90°-დან +90°-მდე.",
  },
  refused: {
    head: "უარყოფილია · უსაფრთხოების ზღვარი",
    notRisen: (name) => `${name} არ ამოსულა`,
    refused: (name) => `${name} უარყოფილია`,
    below: (station) =>
      `ის ${station}-სთვის ჰორიზონტის ქვემოთაა. მონტირება უარყოფს იმას, რასაც გუმბათშიც უარყოფდა, ამიტომ არაფერი გაინძრა.`,
    reason: (reason) =>
      `${reason}. მონტირება უარყოფს იმას, რასაც გუმბათშიც უარყოფდა, ამიტომ არაფერი გაინძრა.`,
    rises: "ამოდის",
    best: "საუკეთესო",
    notUpTonight: "— დღეს ღამით არ არის",
    cancel: "გაუქმება",
    chooseAnother: "აირჩიე სხვა",
  },
  capture: {
    head: "კადრი გადაღებულია · დადგმული",
    stack: "დასტა",
    complete: (n) => `${n} / ${n} კადრი · დასრულდა`,
    histogram: "კადრის ჰისტოგრამა",
    captured: "გადაღებულია",
    exposure: "ექსპოზიცია",
    optics: "ოპტიკა",
    seeing: "სიინგი",
    scale: "მასშტაბი",
    provenance: "წარმომავლობა",
    download: "PNG-ის ჩამოტვირთვა",
    copyHash: "ჰეშის კოპირება",
    copied: "დაკოპირდა",
    keepObserving: "დაკვირვების გაგრძელება",
    frameAlt: (name, n) => `${name}, კადრი ${n}`,
    hud: (n, subs, exposure) => `#${n} · დასტა ${subs} × ${exposure}`,
  },
  commands: {
    relayed: "გადაეცა ობსერვატორიას…",
    done: "შესრულდა",
    refused: "ობსერვატორიამ უარყო",
    noAnswer: "ობსერვატორიისგან პასუხი არ არის",
    failed: "ვერ გაიგზავნა",
  },
  provenanceSimulated: "სიმულირებული · ცის მოდელი",
  close: "დახურვა",
};

export const consoleCopy: Record<Locale, ConsoleCopy> = { en, ka };
