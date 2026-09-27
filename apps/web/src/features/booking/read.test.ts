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

const { localDate, nightsFrom, readNight } = await import("@/features/booking/read");

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

// 22:30 UTC on the 26th is 02:30 on the 27th in Tbilisi.
const now = Date.parse("2026-09-26T22:30:00Z");

// One slot per night, 18:00 Tbilisi that evening unless `startAt` says otherwise.
function slots(date: string, startAt = `${date}T14:00:00Z`) {
  return {
    observatoryId,
    date,
    items: [
      {
        observatoryId,
        startAt,
        endAt: new Date(Date.parse(startAt) + 30 * 60_000).toISOString(),
        durationMinutes: 30,
        available: true,
        priceMinor: 4500,
        currency: "GEL",
        unavailableReason: null,
      },
    ],
  };
}

function dateOf(path: string) {
  return new URL(path, "http://platform").searchParams.get("date") ?? "";
}

beforeEach(() => {
  platformRequest.mockReset();
});

describe("the observatory's calendar", () => {
  it("reads today in the observatory's zone, not the server's", () => {
    expect(localDate(now, "Asia/Tbilisi")).toBe("2026-09-27");
    expect(localDate(now, "UTC")).toBe("2026-09-26");
  });

  it("counts nights by date, across a month end", () => {
    expect(nightsFrom("2026-09-28", 4)).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
    ]);
  });
});

describe("readNight", () => {
  it("asks for the requested night when it is one of the seven shown", async () => {
    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/observatories") return observatories;
      if (path.startsWith("/slots")) return slots(dateOf(path));
      if (path.endsWith("/state")) throw new PlatformError("down", 503);
      throw new PlatformError(path, 500);
    });

    const result = await readNight("2026-09-29", now);

    expect(platformRequest).toHaveBeenCalledWith(
      `/slots?observatoryId=${observatoryId}&date=2026-09-29`,
    );
    expect(result).toMatchObject({ kind: "ok", date: "2026-09-29", mode: null });
    expect(result.kind === "ok" && result.nights[0]).toBe("2026-09-27");
    expect(result.kind === "ok" && result.nights).toHaveLength(7);
  });

  it("ignores a date outside the seven nights and anything that is not a date", async () => {
    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/observatories") return observatories;
      if (path.startsWith("/slots")) return slots(dateOf(path));
      return { mode: "SIMULATED" };
    });

    for (const requested of ["2026-09-26", "2027-01-01", "../me", undefined]) {
      platformRequest.mockClear();
      await readNight(requested, now);
      expect(platformRequest).toHaveBeenCalledWith(
        `/slots?observatoryId=${observatoryId}&date=2026-09-27`,
      );
    }
  });

  it("opens on the night in progress while it still has a slot to come", async () => {
    // 03:00 Tbilisi on the 27th is still the night of the 26th.
    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/observatories") return observatories;
      if (path.startsWith("/slots")) {
        const date = dateOf(path);
        return date === "2026-09-26" ? slots(date, "2026-09-26T23:00:00Z") : slots(date);
      }
      return { mode: "SIMULATED" };
    });

    const result = await readNight(undefined, now);

    expect(result).toMatchObject({ kind: "ok", date: "2026-09-26" });
    expect(result.kind === "ok" && result.nights[0]).toBe("2026-09-26");
    expect(result.kind === "ok" && result.slots[0].startAt).toBe("2026-09-26T23:00:00Z");
    // The night in progress is read once, not again for the page.
    expect(
      platformRequest.mock.calls.filter(([path]) => String(path).includes("date=2026-09-26")),
    ).toHaveLength(1);
  });

  it("moves on to tonight once last night has nothing left to start", async () => {
    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/observatories") return observatories;
      if (path.startsWith("/slots")) return slots(dateOf(path));
      return { mode: "SIMULATED" };
    });

    const result = await readNight(undefined, now);

    expect(result).toMatchObject({ kind: "ok", date: "2026-09-27" });
    expect(result.kind === "ok" && result.nights[0]).toBe("2026-09-27");
  });

  it("asks only for tonight after noon", async () => {
    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/observatories") return observatories;
      if (path.startsWith("/slots")) return slots(dateOf(path));
      return { mode: "SIMULATED" };
    });

    // 13:00 Tbilisi on the 27th.
    await readNight(undefined, Date.parse("2026-09-27T09:00:00Z"));

    expect(
      platformRequest.mock.calls.filter(([path]) => String(path).startsWith("/slots")),
    ).toEqual([[`/slots?observatoryId=${observatoryId}&date=2026-09-27`]]);
  });

  it("tells no observatory from an unreachable platform", async () => {
    platformRequest.mockResolvedValueOnce({ items: [] });
    expect(await readNight(undefined, now)).toEqual({ kind: "no-observatory" });

    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/observatories") return observatories;
      throw new PlatformError("down", 503);
    });
    expect(await readNight(undefined, now)).toEqual({ kind: "unreachable" });
  });
});
