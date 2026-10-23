/** Clients ADR-070: the observer log on the Collection, counted from captures. */
export const observerLogCopy = {
  en: {
    title: "Your log",
    lede: "What you have captured, by kind, out of what the telescope offers.",
    seen: (seen: number, of: number) => `${seen} of ${of}`,
    simulated: "Counts simulated sessions too; they are marked as such in your captures.",
  },
  ka: {
    title: "შენი ჟურნალი",
    lede: "რა გადაგიღია, სახეობების მიხედვით, ტელესკოპის შეთავაზებიდან.",
    seen: (seen: number, of: number) => `${seen} / ${of}`,
    simulated: "ითვლის სიმულირებულ სეანსებსაც; შენს გადაღებებში ისინი მონიშნულია.",
  },
} as const;
