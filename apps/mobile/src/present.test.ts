import type { PublicObservatoryStatus, Slot, ViewingConditionsHour } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { copy } from "./i18n/copy";
import {
  clock,
  cloudSummary,
  hasSlotAhead,
  localDate,
  nightDates,
  nextOpenSlot,
  nightLabel,
  observatoryName,
  price,
  statusHeadline,
} from "./present";

const tbilisi = "Asia/Tbilisi";

function status(overrides: Partial<PublicObservatoryStatus> = {}): PublicObservatoryStatus {
  return {
    observatoryId: "obs",
    mode: "SIMULATED",
    link: "ONLINE",
    weather: { status: "CLEAR", source: "OPERATOR", holdActive: false, updatedAt: "2026-10-22T16:00:00Z" },
    updatedAt: "2026-10-22T16:00:00Z",
    ...overrides,
  };
}

function hour(cloudCoverPercent: number | null): ViewingConditionsHour {
  return {
    at: "2026-10-22T16:00:00Z",
    status: cloudCoverPercent === null ? "UNKNOWN" : "KNOWN",
    source: null,
    fetchedAt: null,
    cloudCoverPercent,
    cloudCoverLowPercent: null,
    cloudCoverMidPercent: null,
    cloudCoverHighPercent: null,
    precipitationProbabilityPercent: null,
    relativeHumidityPercent: null,
    windSpeedMetresPerSecond: null,
    seeingArcseconds: null,
  };
}

describe("nights", () => {
  it("names the date in the observatory's zone, not the device's", () => {
    // 21:30 UTC is 01:30 the next day in Tbilisi (UTC+4).
    expect(localDate(Date.parse("2026-10-22T21:30:00Z"), tbilisi)).toBe("2026-10-23");
  });

  it("asks for last night first before local noon, and tonight only after it", () => {
    expect(nightDates(Date.parse("2026-10-22T22:00:00Z"), tbilisi)).toEqual(["2026-10-22", "2026-10-23"]);
    expect(nightDates(Date.parse("2026-10-23T10:00:00Z"), tbilisi)).toEqual(["2026-10-23"]);
  });

  it("knows when a night has nothing left to start", () => {
    const slot = { startAt: "2026-10-22T20:00:00Z" } as Slot;
    expect(hasSlotAhead([slot], Date.parse("2026-10-22T19:59:00Z"))).toBe(true);
    expect(hasSlotAhead([slot], Date.parse("2026-10-22T20:00:00Z"))).toBe(false);
  });
});

describe("formats", () => {
  it("shows a slot in observatory time, 24-hour", () => {
    expect(clock("2026-10-22T18:30:00Z", tbilisi)).toBe("22:30");
  });

  it("spells a night's date in Georgian without Intl's Georgian data", () => {
    expect(nightLabel("2026-10-22", "ka")).toBe("ხუთშაბათი, 22 ოქტომბერი");
    expect(nightLabel("2026-10-22", "en")).toBe("Thursday 22 October");
  });

  it("turns tetri into lari without a float sum", () => {
    expect(price(4500, "en")).toBe("GEL 45.00");
    expect(price(4505, "ka")).toBe("45,05 ₾");
  });
});

describe("statusHeadline", () => {
  it("puts offline above a hold, and a hold above the weather", () => {
    const held = { status: "CLEAR", source: "OPERATOR", holdActive: true, updatedAt: "x" } as const;
    expect(statusHeadline(status({ link: "OFFLINE", weather: held })).kind).toBe("offline");
    expect(statusHeadline(status({ weather: held })).kind).toBe("hold");
    expect(statusHeadline(status({ link: "DEGRADED" })).kind).toBe("degraded");
    expect(statusHeadline(status())).toEqual({ kind: "weather", tone: "live", weather: "CLEAR" });
  });
});

describe("cloudSummary", () => {
  it("is the median of the known hours, and null when none is known", () => {
    expect(cloudSummary([hour(10), hour(null), hour(30), hour(90)])).toEqual({
      median: 30,
      knownHours: 3,
      hours: 4,
    });
    expect(cloudSummary([hour(null)])).toBeNull();
  });
});

describe("copy", () => {
  it("has every English key in Georgian", () => {
    const keys = (value: object): string[] =>
      Object.entries(value).flatMap(([key, child]) =>
        child && typeof child === "object" ? keys(child).map((sub) => `${key}.${sub}`) : [key],
      );
    expect(keys(copy.ka).sort()).toEqual(keys(copy.en).sort());
  });
});

describe("tonight", () => {
  const at = (startAt: string, available: boolean) => ({ startAt, available }) as Slot;

  it("offers the first open slot that has not started", () => {
    const slots = [at("2026-10-22T17:00:00Z", true), at("2026-10-22T18:00:00Z", false), at("2026-10-22T19:00:00Z", true)];
    expect(nextOpenSlot(slots, Date.parse("2026-10-22T17:30:00Z"))?.startAt).toBe("2026-10-22T19:00:00Z");
    expect(nextOpenSlot(slots, Date.parse("2026-10-22T19:30:00Z"))).toBeNull();
  });

  it("shows a demo prefix as a badge, keeping the name", () => {
    expect(observatoryName("[DEMO] Stellar Tbilisi Observatory")).toEqual({ demo: true, name: "Stellar Tbilisi Observatory" });
    expect(observatoryName("[დემო] სტელარი")).toEqual({ demo: true, name: "სტელარი" });
    expect(observatoryName("Stellar Tbilisi Observatory")).toEqual({ demo: false, name: "Stellar Tbilisi Observatory" });
  });
});
