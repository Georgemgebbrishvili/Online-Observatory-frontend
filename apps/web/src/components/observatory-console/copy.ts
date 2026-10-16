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
  session: { title: string; parkEnd: string };
  pointing: {
    title: string;
    altAz: string;
    altitude: string;
    azimuth: string;
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
    less: string;
    more: string;
  };
  hand: {
    title: string;
    rate: (rate: number) => string;
    up: string;
    down: string;
    west: string;
    east: string;
    centre: string;
    recentre: string;
    slewRate: string;
    tracking: string;
    focus: string;
    focusIn: string;
    focusOut: string;
    button: string;
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
    reticle: string;
    fullView: string;
    liveFeed: string;
    simulatedFeed: string;
    standby: string;
    fov: string;
    framesHud: string;
  };
  steps: {
    label: string;
    names: [string, string, string, string, string];
    youPick: string;
    of: (step: number, count: number) => string;
    hints: {
      connect: string;
      calibrate: string;
      target: (quick: string | null) => string;
      point: (seconds: number) => string;
      stacking: (done: number, goal: number, exposure: number) => string;
      tracking: string;
      drifting: string;
    };
    connecting: string;
    connectTo: (name: string) => string;
    stationDetails: string;
    parking: string;
    calibrating: string;
    calibrate: string;
    parkAndCalibrate: string;
    parkAtZenith: string;
    pointTo: (name: string) => string;
    chooseTarget: string;
    search: string;
    cancelGoto: string;
    stacking: (done: number, goal: number) => string;
    capture: (subs: number, exposure: number) => string;
    stopStack: string;
    recentre: string;
    changeTarget: string;
  };
  status: {
    standby: string;
    connecting: string;
    stacking: (done: number, goal: number) => string;
    slewing: string;
    solving: string;
    centring: string;
    tracking: string;
    drifting: string;
    parking: string;
    calibrating: string;
    ready: string;
    parked: string;
    connected: string;
  };
  idle: {
    text: (quick: string | null) => string;
    ready: string;
    pointTo: (name: string) => string;
    chooseRisen: string;
  };
  phone: { tracking: string; seeing: string; frames: string; thisSession: string };
  details: {
    title: (name: string) => string;
    site: string;
    elevation: string;
    sky: string;
    bortle: (n: number) => string;
    optics: string;
    aperture: string;
    focalLength: string;
    mount: string;
    camera: string;
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
    hud: (n: number, subs: number, exposure: number) => string;
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
  skyLabel: "Sky",
  sky: { night: "Dark", twilight: "Twilight", day: "Day" },
  cloud: "Cloud",
  seeing: "Seeing",
  quick: {
    title: "Quick start",
    observe: (name) => (name ? `Observe ${name}` : "Observe"),
    text: (name) =>
      name
        ? `Connect, calibrate and point the telescope at ${name} in one go. About a minute.`
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
    oneOpen: "One telescope is open; the rest come after first light",
  },
  session: { title: "Session", parkEnd: "Park & end" },
  pointing: {
    title: "Pointing",
    altAz: "Alt · Az",
    altitude: "Altitude",
    azimuth: "Azimuth",
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
    less: "less",
    more: "more",
  },
  hand: {
    title: "Hand control",
    rate: (rate) => `Rate ${rate} / 9`,
    up: "Slew up",
    down: "Slew down",
    west: "Slew west",
    east: "Slew east",
    centre: "Centre",
    recentre: "Re-centre the target",
    slewRate: "Slew rate",
    tracking: "Tracking",
    focus: "Focus",
    focusIn: "Focus in",
    focusOut: "Focus out",
    button: "Hand control",
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
    reticle: "Reticle",
    fullView: "Full view (F)",
    liveFeed: "Live feed",
    simulatedFeed: "Simulated feed",
    standby: "Standby",
    fov: "FOV",
    framesHud: "FRAMES",
  },
  steps: {
    label: "Steps",
    names: ["Connect", "Calibrate", "Target", "Point", "Capture"],
    youPick: "you pick",
    of: (step, count) => `Step ${step} of ${count}`,
    hints: {
      connect: "Connect to the telescope to start.",
      calibrate: "Park at zenith, then calibrate to start the feed.",
      target: (quick) =>
        `Select a target that has risen.${quick ? ` Quick start points at ${quick}.` : ""}`,
      point: (seconds) => `GoTo, plate-solve and centre. About ${seconds} seconds.`,
      stacking: (done, goal, exposure) =>
        `Stacking ${done} of ${goal} frames of ${exposure} s.`,
      tracking: "On target and tracking. Frames stack into one image.",
      drifting: "Tracking is off: the sky drifts through the field.",
    },
    connecting: "Connecting…",
    connectTo: (name) => `Connect to ${name}`,
    stationDetails: "Station details",
    parking: "Parking…",
    calibrating: "Calibrating…",
    calibrate: "Calibrate",
    parkAndCalibrate: "Park & calibrate",
    parkAtZenith: "Park at zenith",
    pointTo: (name) => `Point to ${name}`,
    chooseTarget: "Choose a target",
    search: "Search",
    cancelGoto: "Cancel GoTo",
    stacking: (done, goal) => `Stacking ${done} / ${goal}`,
    capture: (subs, exposure) => `Capture ${subs} × ${exposure} s`,
    stopStack: "Stop stack",
    recentre: "Re-centre",
    changeTarget: "Change target",
  },
  status: {
    standby: "Standby",
    connecting: "Connecting",
    stacking: (done, goal) => `Stacking · ${done} / ${goal}`,
    slewing: "Slewing · plate-solving",
    solving: "Plate-solving",
    centring: "Centring",
    tracking: "On target · tracking",
    drifting: "On target · drifting",
    parking: "Parking",
    calibrating: "Calibrating",
    ready: "Calibrated · ready",
    parked: "Connected · parked",
    connected: "Connected",
  },
  idle: {
    text: (quick) =>
      quick
        ? `Connect and calibrate to start the feed, or use Quick start to go straight to ${quick}.`
        : "Connect and calibrate to start the feed.",
    ready: "Ready to point",
    pointTo: (name) => `Point to ${name} to begin.`,
    chooseRisen: "Choose a target that has risen.",
  },
  phone: { tracking: "Tracking", seeing: "Seeing", frames: "Frames", thisSession: "THIS SESSION" },
  details: {
    title: (name) => `${name} · details`,
    site: "Site",
    elevation: "Elevation",
    sky: "Sky",
    bortle: (n) => `Bortle ${n}`,
    optics: "Optics",
    aperture: "Aperture",
    focalLength: "Focal length",
    mount: "Mount",
    camera: "Camera",
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
    hud: (n, subs, exposure) => `#${n} · stack ${subs} × ${exposure} s`,
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
  skyLabel: "ცა",
  sky: { night: "ბნელა", twilight: "ბინდი", day: "დღეა" },
  cloud: "ღრუბელი",
  seeing: "სიინგი",
  quick: {
    title: "სწრაფი დაწყება",
    observe: (name) => name ?? "დაკვირვება",
    text: (name) =>
      name
        ? `დაუკავშირდი, დააკალიბრე და მიმართე ტელესკოპი ობიექტისკენ (${name}) ერთი ნაბიჯით. დაახლოებით ერთი წუთი.`
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
    oneOpen: "ერთი ტელესკოპი ღიაა; დანარჩენი პირველი სინათლის შემდეგ მოდის",
  },
  session: { title: "სესია", parkEnd: "პარკირება და დასრულება" },
  pointing: {
    title: "მიმართულება",
    altAz: "სიმ · აზ",
    altitude: "სიმაღლე",
    azimuth: "აზიმუტი",
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
    less: "ნაკლები",
    more: "მეტი",
  },
  hand: {
    title: "ხელის პულტი",
    rate: (rate) => `სიჩქარე ${rate} / 9`,
    up: "ზემოთ",
    down: "ქვემოთ",
    west: "დასავლეთით",
    east: "აღმოსავლეთით",
    centre: "ცენტრი",
    recentre: "ობიექტის ხელახლა დაცენტრება",
    slewRate: "მოძრაობის სიჩქარე",
    tracking: "ტრეკინგი",
    focus: "ფოკუსი",
    focusIn: "ფოკუსი შიგნით",
    focusOut: "ფოკუსი გარეთ",
    button: "ხელის პულტი",
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
    reticle: "ბადე",
    fullView: "სრული ხედი (F)",
    liveFeed: "პირდაპირი ნაკადი",
    simulatedFeed: "სიმულირებული ნაკადი",
    standby: "მოლოდინი",
    fov: "FOV",
    framesHud: "კადრი",
  },
  steps: {
    label: "ნაბიჯები",
    names: ["დაკავშირება", "კალიბრება", "ობიექტი", "მიმართვა", "გადაღება"],
    youPick: "შენ ირჩევ",
    of: (step, count) => `ნაბიჯი ${step} / ${count}`,
    hints: {
      connect: "დასაწყებად დაუკავშირდი ტელესკოპს.",
      calibrate: "დააპარკე ზენიტში, შემდეგ დააკალიბრე ნაკადის დასაწყებად.",
      target: (quick) =>
        `აირჩიე ამოსული ობიექტი.${quick ? ` სწრაფი დაწყება მიმართავს: ${quick}.` : ""}`,
      point: (seconds) => `GoTo, კადრის ამოცნობა და დაცენტრება. დაახლოებით ${seconds} წამი.`,
      stacking: (done, goal, exposure) =>
        `იდგმება ${done} / ${goal} კადრი, თითო ${exposure} წმ.`,
      tracking: "ობიექტზეა და მიჰყვება. კადრები ერთ გამოსახულებად იდგმება.",
      drifting: "ტრეკინგი გამორთულია: ცა ველში სრიალებს.",
    },
    connecting: "უკავშირდება…",
    connectTo: (name) => `დაუკავშირდი: ${name}`,
    stationDetails: "სადგურის დეტალები",
    parking: "პარკირება…",
    calibrating: "კალიბრება…",
    calibrate: "კალიბრება",
    parkAndCalibrate: "პარკირება და კალიბრება",
    parkAtZenith: "პარკირება ზენიტში",
    pointTo: (name) => `მიმართე: ${name}`,
    chooseTarget: "აირჩიე ობიექტი",
    search: "ძიება",
    cancelGoto: "GoTo-ს გაუქმება",
    stacking: (done, goal) => `იდგმება ${done} / ${goal}`,
    capture: (subs, exposure) => `გადაიღე ${subs} × ${exposure} წმ`,
    stopStack: "დასტის შეჩერება",
    recentre: "ხელახლა დაცენტრება",
    changeTarget: "ობიექტის შეცვლა",
  },
  status: {
    standby: "მოლოდინი",
    connecting: "უკავშირდება",
    stacking: (done, goal) => `იდგმება · ${done} / ${goal}`,
    slewing: "მოძრაობს · კადრის ამოცნობა",
    solving: "კადრის ამოცნობა",
    centring: "დაცენტრება",
    tracking: "ობიექტზე · მიჰყვება",
    drifting: "ობიექტზე · სრიალებს",
    parking: "პარკირება",
    calibrating: "კალიბრება",
    ready: "დაკალიბრებული · მზადაა",
    parked: "დაკავშირებული · დაპარკული",
    connected: "დაკავშირებული",
  },
  idle: {
    text: (quick) =>
      quick
        ? `დაუკავშირდი და დააკალიბრე ნაკადის დასაწყებად, ან სწრაფი დაწყებით პირდაპირ გადადი: ${quick}.`
        : "დაუკავშირდი და დააკალიბრე ნაკადის დასაწყებად.",
    ready: "მზადაა მიმართვისთვის",
    pointTo: (name) => `დასაწყებად მიმართე: ${name}.`,
    chooseRisen: "აირჩიე ამოსული ობიექტი.",
  },
  phone: { tracking: "ტრეკინგი", seeing: "სიინგი", frames: "კადრები", thisSession: "ამ სესიაში" },
  details: {
    title: (name) => `${name} · დეტალები`,
    site: "ადგილი",
    elevation: "სიმაღლე ზღვის დონიდან",
    sky: "ცა",
    bortle: (n) => `ბორტლი ${n}`,
    optics: "ოპტიკა",
    aperture: "აპერტურა",
    focalLength: "ფოკუსური მანძილი",
    mount: "მონტირება",
    camera: "კამერა",
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
    hud: (n, subs, exposure) => `#${n} · დასტა ${subs} × ${exposure} წმ`,
  },
  provenanceSimulated: "სიმულირებული · ცის მოდელი",
  close: "დახურვა",
};

export const consoleCopy: Record<Locale, ConsoleCopy> = { en, ka };
