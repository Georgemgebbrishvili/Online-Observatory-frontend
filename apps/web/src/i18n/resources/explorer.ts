import { brand } from "@/brand";

/** Where the game lives: Skychaser's Voyage, played on its own site (ADR-057). */
export const explorerGameUrl = "https://skychaser.io/voyage";

const [enFirst, enSecond] = brand.en.game.split(" ");
const [kaFirst, kaSecond] = brand.ka.game.split(" ");

export const explorerCopy = {
  en: {
    metadataTitle: `${brand.en.game} · ${brand.en.siteName}`,
    metadataDescription:
      `${brand.en.game}: fly the solar system, orbit its worlds and land on the Moon. A free game in your browser.`,
    kicker: "A free game in your browser",
    title: enFirst,
    titleAccent: enSecond,
    lede: "Fly the solar system between your nights at the telescope. Orbit the planets, cross to their moons and set down on the surface.",
    launch: "Launch the game",
    launching: "Launching",
    note: "Plays at skychaser.io. Nothing to install.",
    features: [
      { title: "Fly", text: "Pilot between the Sun's worlds at your own pace." },
      { title: "Land", text: "Descend to the Moon and walk out on the surface." },
      { title: "Anywhere", text: "A computer, a tablet or a phone." },
    ],
    caption: "Game image — not telescope output",
  },
  ka: {
    metadataTitle: `${brand.ka.game} · ${brand.ka.nominative}`,
    metadataDescription:
      `${brand.ka.game}: იმოგზაურე მზის სისტემაში, შემოუარე პლანეტებს და დაეშვი მთვარეზე. უფასო თამაში ბრაუზერში.`,
    kicker: "უფასო თამაში ბრაუზერში",
    title: kaFirst,
    titleAccent: kaSecond,
    lede: "ტელესკოპთან ღამეებს შორის იმოგზაურე მზის სისტემაში. შემოუარე პლანეტებს, გადაფრინდი მათ თანამგზავრებზე და დაეშვი ზედაპირზე.",
    launch: "თამაშის დაწყება",
    launching: "იწყება",
    note: "თამაში იხსნება skychaser.io-ზე. არაფრის დაყენება არ გჭირდება.",
    features: [
      { title: "იფრინე", text: "იმოგზაურე მზის სისტემის სამყაროებს შორის შენი ტემპით." },
      { title: "დაეშვი", text: "დაეშვი მთვარეზე და გაისეირნე მის ზედაპირზე." },
      { title: "ყველგან", text: "კომპიუტერზე, პლანშეტზე ან ტელეფონზე." },
    ],
    caption: "თამაშის კადრი — არა ტელესკოპის გამოსახულება",
  },
} as const;
