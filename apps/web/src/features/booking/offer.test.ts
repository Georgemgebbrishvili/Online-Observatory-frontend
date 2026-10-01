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
vi.mock("@/lib/platform/config", () => ({ storageOrigin: null }));

const { bookable, readOffer } = await import("@/features/booking/offer");

const observatoryId = "10000000-0000-4000-8000-000000000001";
const observatories = {
  items: [
    {
      id: observatoryId,
      slug: "tbilisi",
      kind: "FIRST_PARTY",
      nameEn: "Stellar Tbilisi",
      nameKa: "სტელარი თბილისი",
      city: "Tbilisi",
      countryCode: "GE",
      timezone: "Asia/Tbilisi",
      telescope: {
        manufacturer: "Celestron",
        model: "NexStar 6SE",
        apertureMm: 150,
        focalLengthMm: 1500,
      },
    },
  ],
};

function slot(startAt: string, available = true) {
  return {
    observatoryId,
    startAt,
    endAt: new Date(Date.parse(startAt) + 30 * 60_000).toISOString(),
    durationMinutes: 30,
    available,
    priceMinor: 4500,
    currency: "GEL",
    unavailableReason: available ? null : "ALREADY_BOOKED",
  };
}

function target(id: string, expectedMissionMinutes = 10) {
  return {
    id,
    slug: `target-${id.slice(-2)}`,
    type: "PLANET",
    catalogId: null,
    nameEn: "Saturn",
    nameKa: "სატურნი",
    positionSource: "EPHEMERIS",
    coordinates: null,
    solarSystemBody: "SATURN",
    angularSizeArcmin: 0.3,
    magnitude: 0.6,
    opticalConfig: "F20_BARLOW",
    imagingProfile: "PLANETARY",
    minAltitudeDegrees: 20,
    expectedMissionMinutes,
    enabled: true,
  };
}

function judged(id: string, observable: boolean, expectedMissionMinutes = 10) {
  return {
    target: target(id, expectedMissionMinutes),
    visibility: {
      observable,
      blockReasons: observable ? [] : ["BELOW_HORIZON"],
      atStart: {
        observable,
        evaluatedAt: "2030-01-15T14:00:00.000Z",
        horizontal: { altitudeDegrees: observable ? 40 : -5, azimuthDegrees: 180 },
        sunAltitudeDegrees: -24,
        moonSeparationDegrees: 70,
        risesAt: null,
        setsAt: null,
        blockReasons: observable ? [] : ["BELOW_HORIZON"],
      },
    },
  };
}

const up = "30000000-0000-4000-8000-000000000001";
const down = "30000000-0000-4000-8000-000000000002";
const long = "30000000-0000-4000-8000-000000000003";

function platform(slots: unknown[], visibility?: unknown) {
  platformRequest.mockImplementation(async (path: string) => {
    if (path === "/observatories") return observatories;
    if (path.startsWith("/slots")) {
      const date = new URL(path, "http://platform").searchParams.get("date");
      return { observatoryId, date, items: slots };
    }
    if (path.startsWith("/targets/visibility")) {
      if (!visibility) throw new PlatformError("down", 500);
      return visibility;
    }
    if (path.endsWith("/state")) throw new PlatformError("down", 500);
    throw new PlatformError("not found", 404);
  });
}

beforeEach(() => {
  platformRequest.mockReset();
});

describe("bookable", () => {
  it("needs the target up for the whole slot and short enough for it", () => {
    expect(bookable(judged(up, true) as never, 30)).toBe(true);
    expect(bookable(judged(down, false) as never, 30)).toBe(false);
    expect(bookable(judged(long, true, 45) as never, 30)).toBe(false);
  });
});

describe("readOffer", () => {
  it("splits the slot's targets into offered and withheld", async () => {
    const startAt = "2030-01-15T14:00:00.000Z";
    platform([slot(startAt)], {
      observatoryId,
      startAt,
      durationMinutes: 30,
      items: [judged(up, true), judged(down, false), judged(long, true, 45)],
    });

    const result = await readOffer(startAt);

    if (result.kind !== "ok") throw new Error(result.kind);
    expect(result.offer.offered.map(({ target }) => target.id)).toEqual([up]);
    expect(result.offer.withheld.map(({ target }) => target.id)).toEqual([down, long]);
    expect(result.offer.date).toBe("2030-01-15");
    expect(result.offer.mode).toBeNull();
    expect(platformRequest).toHaveBeenCalledWith(
      `/targets/visibility?observatoryId=${observatoryId}&startAt=${encodeURIComponent(
        startAt,
      )}&durationMinutes=30`,
    );
  });

  it("reads a slot after midnight from the night it belongs to", async () => {
    // 01:00 on the 16th in Tbilisi is the night of the 15th.
    const startAt = "2030-01-15T21:00:00.000Z";
    platform([slot(startAt)], { observatoryId, startAt, durationMinutes: 30, items: [] });

    const result = await readOffer(startAt);

    expect(result).toMatchObject({ kind: "ok", offer: { date: "2030-01-15" } });
    expect(platformRequest).toHaveBeenCalledWith(
      `/slots?observatoryId=${observatoryId}&date=2030-01-15`,
    );
  });

  it("does not offer a slot the platform does not list, or lists as taken", async () => {
    platform([slot("2030-01-15T14:00:00.000Z", false)]);
    expect(await readOffer("2030-01-15T14:00:00.000Z")).toEqual({
      kind: "not-offered",
      date: "2030-01-15",
    });
    expect(await readOffer("2030-01-15T14:10:00.000Z")).toEqual({
      kind: "not-offered",
      date: "2030-01-15",
    });
  });

  it("does not ask the platform about a time that is not one", async () => {
    expect(await readOffer("not-a-time")).toEqual({ kind: "not-offered", date: null });
    expect(await readOffer(undefined)).toEqual({ kind: "not-offered", date: null });
    expect(platformRequest).not.toHaveBeenCalled();
  });

  it("is unreachable when the slot's targets cannot be read", async () => {
    platform([slot("2030-01-15T14:00:00.000Z")]);
    expect(await readOffer("2030-01-15T14:00:00.000Z")).toEqual({ kind: "unreachable" });
  });
});
