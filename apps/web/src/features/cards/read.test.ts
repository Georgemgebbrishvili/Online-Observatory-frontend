import { beforeEach, describe, expect, it, vi } from "vitest";

const platformRequest = vi.hoisted(() => vi.fn());

class PlatformError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

vi.mock("server-only", () => ({}));
vi.mock("@/lib/platform/client", () => ({ platformRequest, PlatformError }));

const { readCardDraw, readPrizes } = await import("@/features/cards/read");
const { dayMonth, longDate, weekdayTime } = await import("@/features/cards/dates");

const observatoryId = "10000000-0000-4000-8000-000000000001";
const unturned = (position: number) => ({ position, turned: false, rarity: null, targetSlug: null, prize: null });
const draw = {
  id: "c1000000-0000-4000-8000-000000000001",
  observatoryId,
  week: "2026-10-19",
  dealtAt: "2026-10-22T08:00:00.000Z",
  opensNextAt: "2026-10-25T20:00:00.000Z",
  picked: null,
  pickedAt: null,
  cards: [unturned(0), unturned(1), unturned(2)],
  odds: {
    cards: [
      { rarity: "LEGENDARY", prizeKind: "FREE_SLOT", chance: 0.01 },
      { rarity: "COMMON", prizeKind: null, chance: 0.99 },
    ],
    freeSlotsPerWeek: 2,
    freeSlotDurationMinutes: 40,
    discountPercentOff: 20,
    prizeValidDays: 30,
  },
};

beforeEach(() => {
  platformRequest.mockReset();
});

describe("readCardDraw", () => {
  it("reads the week's deal for the observatory", async () => {
    platformRequest.mockResolvedValue(draw);
    await expect(readCardDraw(observatoryId)).resolves.toEqual({ kind: "ok", draw });
    expect(platformRequest).toHaveBeenCalledWith(`/card-draws/current?observatoryId=${observatoryId}`);
  });

  it.each([
    [401, "signed-out"],
    [404, "no-observatory"],
    [503, "not-configured"],
    [500, "unreachable"],
  ])("answers %i as %s", async (status, kind) => {
    platformRequest.mockImplementation(async () => {
      throw new PlatformError("no", status);
    });
    await expect(readCardDraw(observatoryId)).resolves.toEqual({ kind });
  });

  it("refuses a deal that is not the contract's shape", async () => {
    platformRequest.mockResolvedValue({ ...draw, cards: [] });
    await expect(readCardDraw(observatoryId)).resolves.toEqual({ kind: "unreachable" });
  });
});

describe("readPrizes", () => {
  it("is null when the prizes cannot be read", async () => {
    platformRequest.mockImplementation(async () => {
      throw new PlatformError("down", 503);
    });
    await expect(readPrizes()).resolves.toBeNull();
  });
});

describe("card dates", () => {
  it("names months and weekdays in Georgian without the browser's locale data", () => {
    const at = new Date("2026-10-25T20:00:00.000Z"); // Monday 26 October, 00:00 in Tbilisi
    expect(weekdayTime(at, "ka", "Asia/Tbilisi")).toBe("ორშაბათი 26 ოქტომბერი, 00:00");
    expect(weekdayTime(at, "en", "Asia/Tbilisi")).toBe("Monday 26 October, 00:00");
    expect(dayMonth(new Date("2026-10-19T00:00:00Z"), "ka")).toBe("19 ოქტომბერი");
    expect(longDate(new Date("2026-11-21T06:00:00Z"), "en")).toBe("21 November 2026");
  });
});
