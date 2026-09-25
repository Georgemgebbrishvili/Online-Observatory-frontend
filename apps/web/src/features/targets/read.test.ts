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

const { readTarget, readTonight } = await import("@/features/targets/read");

const observatoryId = "10000000-0000-4000-8000-000000000001";

const observatories = {
  items: [
    {
      id: observatoryId,
      slug: "tbilisi",
      kind: "FIRST_PARTY",
      nameEn: "Tbilisi Observatory",
      nameKa: "თბილისის ობსერვატორია",
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

function target(slug: string, id: string) {
  return {
    id,
    slug,
    type: "PLANET",
    nameEn: slug,
    nameKa: slug,
    positionSource: "EPHEMERIS",
    angularSizeArcmin: 0.3,
    magnitude: 0.6,
    opticalConfig: "F20_BARLOW",
    imagingProfile: "PLANETARY",
    minAltitudeDegrees: 25,
    expectedMissionMinutes: 15,
    enabled: true,
  };
}

const saturn = target("saturn", "30000000-0000-4000-8000-000000000006");
const venus = target("venus", "30000000-0000-4000-8000-000000000032");

function line(value: object, observable: boolean, altitude: number) {
  return {
    target: value,
    visibility: {
      observable,
      evaluatedAt: "2026-09-25T18:00:00Z",
      horizontal: { altitudeDegrees: altitude, azimuthDegrees: 180 },
      sunAltitudeDegrees: -24,
      moonSeparationDegrees: 70,
      risesAt: null,
      setsAt: null,
      blockReasons: observable ? [] : ["BELOW_HORIZON"],
    },
  };
}

const tonight = {
  observatoryId,
  evaluatedAt: "2026-09-25T18:00:00Z",
  items: [line(venus, false, -12), line(saturn, true, 38)],
};

const status = {
  observatoryId,
  mode: "SIMULATED",
  link: "ONLINE",
  weather: {
    status: "CLEAR",
    source: "OPERATOR",
    holdActive: false,
    note: null,
    updatedAt: "2026-09-25T18:00:00.000Z",
  },
  updatedAt: "2026-09-25T18:00:00.000Z",
};

function platform(overrides: Record<string, () => Promise<unknown>> = {}) {
  platformRequest.mockImplementation((path: string) => {
    for (const [prefix, answer] of Object.entries(overrides)) {
      if (path.startsWith(prefix)) return answer();
    }
    if (path === "/observatories") return Promise.resolve(observatories);
    if (path.startsWith("/targets/tonight")) return Promise.resolve(tonight);
    if (path.endsWith("/state")) return Promise.resolve(status);
    if (path === "/targets/saturn") return Promise.resolve(saturn);
    throw new Error(`unexpected path ${path}`);
  });
}

beforeEach(() => {
  platformRequest.mockReset();
});

describe("readTonight", () => {
  it("asks for the first-party observatory's sky and sorts it observable-first", async () => {
    platform();
    const result = await readTonight("ka");

    expect(platformRequest).toHaveBeenCalledWith(
      `/targets/tonight?observatoryId=${observatoryId}`,
    );
    expect(result).toMatchObject({
      kind: "ok",
      observatory: {
        name: "თბილისის ობსერვატორია",
        timezone: "Asia/Tbilisi",
        mode: "SIMULATED",
      },
    });
    if (result.kind !== "ok") throw new Error("expected ok");
    expect(result.items.map((item) => item.target.slug)).toEqual(["saturn", "venus"]);
  });

  it("keeps the list when only the observatory's mode cannot be read", async () => {
    platform({
      [`/observatories/${observatoryId}/state`]: () => Promise.reject(new Error("down")),
    });
    const result = await readTonight("en");
    expect(result).toMatchObject({ kind: "ok", observatory: { mode: null } });
  });

  it("says there is no observatory rather than inventing one", async () => {
    platform({ "/observatories": () => Promise.resolve({ items: [] }) });
    expect(await readTonight("en")).toEqual({ kind: "no-observatory" });
  });

  it("is unreachable, not empty, when the platform does not answer or answers wrongly", async () => {
    platform({ "/targets/tonight": () => Promise.reject(new Error("down")) });
    expect(await readTonight("en")).toEqual({ kind: "unreachable" });

    platform({ "/targets/tonight": () => Promise.resolve({ items: "nope" }) });
    expect(await readTonight("en")).toEqual({ kind: "unreachable" });
  });
});

describe("readTarget", () => {
  it("joins the target to its line in tonight's list", async () => {
    platform();
    const result = await readTarget("saturn", "en");
    expect(result).toMatchObject({
      kind: "ok",
      target: { slug: "saturn" },
      tonight: { item: { visibility: { observable: true } } },
    });
  });

  it("answers not-found on the platform's 404, and unreachable on anything else", async () => {
    platform({
      "/targets/nope": () => Promise.reject(new PlatformError("No such target.", 404)),
    });
    expect(await readTarget("nope", "en")).toEqual({ kind: "not-found" });

    platform({ "/targets/saturn": () => Promise.reject(new PlatformError("boom", 500)) });
    expect(await readTarget("saturn", "en")).toEqual({ kind: "unreachable" });
  });

  it("still shows the target when tonight's list cannot be read", async () => {
    platform({ "/targets/tonight": () => Promise.reject(new Error("down")) });
    expect(await readTarget("saturn", "en")).toMatchObject({ kind: "ok", tonight: null });
  });
});
