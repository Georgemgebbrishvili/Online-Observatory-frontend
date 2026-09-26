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

const { readObservatoryPanel, readUpcoming } = await import("@/features/home/read");

const observatoryId = "10000000-0000-4000-8000-000000000001";
const saturnId = "30000000-0000-4000-8000-000000000006";
const now = Date.parse("2026-09-26T12:00:00Z");

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

const status = {
  observatoryId,
  mode: "SIMULATED",
  link: "ONLINE",
  weather: {
    status: "CLEAR",
    source: "OPERATOR",
    holdActive: false,
    updatedAt: "2026-09-26T11:59:00Z",
  },
  updatedAt: "2026-09-26T11:59:00Z",
};

const saturn = {
  id: saturnId,
  slug: "saturn",
  type: "PLANET",
  nameEn: "Saturn",
  nameKa: "სატურნი",
  positionSource: "EPHEMERIS",
  solarSystemBody: "SATURN",
  angularSizeArcmin: 0.3,
  magnitude: 0.6,
  opticalConfig: "F20_BARLOW",
  imagingProfile: "PLANETARY",
  minAltitudeDegrees: 20,
  expectedMissionMinutes: 10,
  enabled: true,
};

let serial = 0;
function mission(state: string, scheduledStartAt: string | null, targetId = saturnId) {
  serial += 1;
  return {
    id: `20000000-0000-4000-8000-${String(serial).padStart(12, "0")}`,
    userId: "00000000-0000-4000-8000-000000000001",
    bookingId: null,
    targetId,
    observatoryId,
    state,
    mode: "SIMULATED",
    scheduledStartAt,
    requestedAt: "2026-09-20T12:00:00Z",
  };
}

function answer(routes: Record<string, unknown>) {
  platformRequest.mockImplementation(async (path: string) => {
    const key = Object.keys(routes).find(
      (prefix) =>
        path === prefix || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}&`),
    );
    if (!key) throw new PlatformError(`unexpected ${path}`, 500);
    const value = routes[key];
    if (value instanceof PlatformError) throw value;
    return value;
  });
}

beforeEach(() => {
  platformRequest.mockReset();
});

describe("readUpcoming", () => {
  it("keeps scheduled missions still ahead, soonest first, over every page", async () => {
    const later = mission("SCHEDULED", "2026-10-02T18:00:00Z");
    const past = mission("SCHEDULED", "2026-09-24T18:00:00Z");
    const done = mission("COMPLETE", "2026-10-01T18:00:00Z");
    const sooner = mission(
      "SCHEDULED",
      "2026-09-28T18:00:00Z",
      "30000000-0000-4000-8000-000000000099",
    );
    platformRequest.mockImplementation(async (path: string) => {
      if (path === "/missions?limit=100")
        return { items: [later, past], page: { hasMore: true, nextCursor: past.id } };
      if (path === `/missions?limit=100&cursor=${past.id}`)
        return { items: [done, sooner], page: { hasMore: false, nextCursor: null } };
      if (path.startsWith("/targets"))
        return { items: [saturn], page: { hasMore: false, nextCursor: null } };
      throw new PlatformError(path, 500);
    });

    const result = await readUpcoming(now);

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.items.map((item) => item.mission.id)).toEqual([sooner.id, later.id]);
    // Not in the catalogue: named as retired by the page, never guessed.
    expect(result.items.map((item) => item.target?.slug ?? null)).toEqual([
      null,
      "saturn",
    ]);
  });

  it("is signed-out on a 401 and unreachable otherwise", async () => {
    answer({ "/missions": new PlatformError("no", 401) });
    expect(await readUpcoming(now)).toEqual({ kind: "signed-out" });
    answer({ "/missions": new PlatformError("no", 503) });
    expect(await readUpcoming(now)).toEqual({ kind: "unreachable" });
  });
});

describe("readObservatoryPanel", () => {
  it("reads the first-party observatory and its public status", async () => {
    answer({
      "/observatories": observatories,
      [`/observatories/${observatoryId}/state`]: status,
    });
    expect(await readObservatoryPanel()).toMatchObject({
      kind: "ok",
      observatory: { city: "Tbilisi" },
      status: { link: "ONLINE", mode: "SIMULATED" },
    });
  });

  it("tells no observatory from an unreadable one", async () => {
    answer({ "/observatories": { items: [] } });
    expect(await readObservatoryPanel()).toEqual({ kind: "no-observatory" });
    answer({
      "/observatories": observatories,
      [`/observatories/${observatoryId}/state`]: new PlatformError("down", 503),
    });
    expect(await readObservatoryPanel()).toEqual({ kind: "unreachable" });
  });
});
