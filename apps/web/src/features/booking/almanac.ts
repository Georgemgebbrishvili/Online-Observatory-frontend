import { Observer } from "astronomy-engine";

/** The observatory's site; the contract carries no coordinates, so Tbilisi's. */
export const tbilisi = new Observer(41.7151, 44.8271, 490);

const pad = (n: number) => String(n).padStart(2, "0");

/** An hour of a calendar date on the observatory's clock, as an instant. */
export function localHour(date: string, hour: number, timezone: string) {
  const guess = new Date(`${date}T${pad(hour)}:00:00Z`);
  const offset =
    new Date(guess.toLocaleString("en-US", { timeZone: timezone })).getTime() -
    new Date(guess.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(guess.getTime() - offset);
}
