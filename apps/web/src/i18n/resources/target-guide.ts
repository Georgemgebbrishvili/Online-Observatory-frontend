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
        "A small, bright disc that steadies as frames stack: rings, belts, moons or a phase. Detail depends on the air over Tbilisi.",
      DOUBLE_STAR:
        "Two or more stars side by side, often in different colours.",
      GLOBULAR_CLUSTER:
        "A ball of thousands of stars. The glowing core resolves into points as frames stack.",
      PLANETARY_NEBULA:
        "A small ring or disc of glowing gas. Colour builds over minutes. Not a long-exposure photo.",
      BRIGHT_NEBULA:
        "A soft cloud of glowing gas. Shape and some colour build over minutes. Not a long-exposure photo.",
    },
  },
  ka: {
    title: (target) => `${target} — მოკლედ`,
    view: "რას აჩვენებს პირდაპირი გამოსახულება",
    classes: {
      MOON: "მკვეთრი, კაშკაშა ზედაპირი: კრატერები და მთები ყველაზე კარგად დღისა და ღამის საზღვარზე ჩანს.",
      PLANET:
        "პატარა, კაშკაშა დისკო, რომელიც დაჯამებით მკვეთრდება: რგოლები, სარტყლები, თანამგზავრები ან ფაზა. დეტალი თბილისის ჰაერზეა დამოკიდებული.",
      DOUBLE_STAR:
        "ორი ან მეტი ვარსკვლავი გვერდიგვერდ, ხშირად სხვადასხვა ფერის.",
      GLOBULAR_CLUSTER:
        "ათასობით ვარსკვლავის ბურთი. ცენტრი ჯერ ნათებაა, მერე წერტილებად იშლება.",
      PLANETARY_NEBULA:
        "მანათობელი აირის პატარა რგოლი ან დისკო. ფერი წუთებში ჩნდება. ხანგრძლივი ექსპოზიციის ფოტოს არ ჰგავს.",
      BRIGHT_NEBULA:
        "მანათობელი აირის რბილი ღრუბელი. ფორმა და ცოტა ფერი წუთებში ჩნდება. ხანგრძლივი ექსპოზიციის ფოტოს არ ჰგავს.",
    },
  },
};
