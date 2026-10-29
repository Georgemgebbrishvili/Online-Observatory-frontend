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
    lede: "Fly the solar system. Orbit the planets, visit their moons, land on the surface.",
    launch: "Launch the game",
    launching: "Launching",
    note: "Plays at skychaser.io. No install.",
    features: [
      { title: "Fly", text: "Fly between the planets at your own pace." },
      { title: "Land", text: "Land on the Moon and walk the surface." },
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
    lede: "იმოგზაურე მზის სისტემაში. შემოუარე პლანეტებს, ეწვიე მათ თანამგზავრებს და დაეშვი ზედაპირზე.",
    launch: "თამაშის დაწყება",
    launching: "იწყება",
    note: "იხსნება skychaser.io-ზე. დაყენება არ სჭირდება.",
    features: [
      { title: "იფრინე", text: "იფრინე პლანეტებს შორის შენი ტემპით." },
      { title: "დაეშვი", text: "დაეშვი მთვარეზე და გაისეირნე." },
      { title: "ყველგან", text: "კომპიუტერზე, პლანშეტზე ან ტელეფონზე." },
    ],
    caption: "თამაშის კადრი — არა ტელესკოპის გამოსახულება",
  },
} as const;
