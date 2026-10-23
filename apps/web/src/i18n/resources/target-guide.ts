import type { TargetType } from "@darkview/contracts";

/**
 * Clients ADR-069: what the live view will and will not show, per class. Authored here,
 * checked by the maintainer; nothing in it is generated.
 */
export const targetGuideCopy: Record<
  "en" | "ka",
  { title: (target: string) => string; view: string; classes: Record<TargetType, string> }
> = {
  en: {
    title: (target) => `About ${target}`,
    view: "What the live view shows",
    classes: {
      MOON: "A sharp, bright surface: craters and mountains are clearest along the line between day and night.",
      PLANET:
        "A small, bright disc that steadies as frames stack: rings, cloud belts, moons or a phase. It stays small, and the detail depends on the air over Tbilisi.",
      DOUBLE_STAR:
        "Two or more stars side by side, often in different colours. They stay points of light.",
      GLOBULAR_CLUSTER:
        "A ball of many thousands of stars. The core starts as a glow and resolves into points as frames stack.",
      PLANETARY_NEBULA:
        "A small ring or disc of glowing gas. Its colour builds slowly over minutes; it will not look like a long-exposure photograph.",
      BRIGHT_NEBULA:
        "A soft cloud of glowing gas. Its shape and some colour build over minutes; it will not look like a long-exposure photograph.",
    },
  },
  ka: {
    title: (target) => `${target} — მოკლედ`,
    view: "რას აჩვენებს პირდაპირი გამოსახულება",
    classes: {
      MOON: "მკვეთრი, კაშკაშა ზედაპირი: კრატერები და მთები ყველაზე კარგად დღისა და ღამის საზღვარზე ჩანს.",
      PLANET:
        "პატარა, კაშკაშა დისკო, რომელიც კადრების დაჯამებასთან ერთად მყარდება: რგოლები, ღრუბლის სარტყლები, თანამგზავრები ან ფაზა. ის პატარა რჩება, დეტალი კი თბილისის თავზე ჰაერზეა დამოკიდებული.",
      DOUBLE_STAR:
        "ორი ან მეტი ვარსკვლავი გვერდიგვერდ, ხშირად სხვადასხვა ფერის. ისინი სინათლის წერტილებად რჩება.",
      GLOBULAR_CLUSTER:
        "ათასობით ვარსკვლავის ბურთი. ბირთვი ჯერ ნათებად ჩანს, კადრების დაჯამებით კი წერტილებად იშლება.",
      PLANETARY_NEBULA:
        "მანათობელი აირის პატარა რგოლი ან დისკო. ფერი წუთების განმავლობაში ნელა ჩნდება; ხანგრძლივი ექსპოზიციის ფოტოს არ დაემსგავსება.",
      BRIGHT_NEBULA:
        "მანათობელი აირის რბილი ღრუბელი. ფორმა და ცოტა ფერი წუთების განმავლობაში ჩნდება; ხანგრძლივი ექსპოზიციის ფოტოს არ დაემსგავსება.",
    },
  },
};
