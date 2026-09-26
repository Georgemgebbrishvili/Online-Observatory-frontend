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
vi.mock("@/lib/platform/config", () => ({ storageOrigin: "http://storage.test" }));

const { cursorOf, readCapture, readCollection } =
  await import("@/features/collection/read");

const observatoryId = "10000000-0000-4000-8000-000000000001";
const saturnId = "30000000-0000-4000-8000-000000000006";
const retiredId = "30000000-0000-4000-8000-000000000099";
const missionId = "20000000-0000-4000-8000-000000000001";

function capture(id: string, targetId: string, thumbnailUrl: string | null) {
  return {
    id,
    missionId,
    userId: "00000000-0000-4000-8000-000000000001",
    targetId,
    capturedAt: "2026-09-25T18:40:00Z",
    imagingProfile: "PLANETARY",
    opticalConfig: "F20_BARLOW",
    exposureMilliseconds: 12,
    gain: 300,
    framesStacked: 400,
    integrationSeconds: 4.8,
    fitsAvailable: false,
    visibility: "PRIVATE",
    mode: "SIMULATED",
    thumbnailUrl,
  };
}

const first = capture(
  "40000000-0000-4000-8000-000000000001",
  saturnId,
  "http://storage.test/thumb/1?X-Amz-Signature=a",
);
const retired = capture("40000000-0000-4000-8000-000000000002", retiredId, null);
const elsewhere = capture(
  "40000000-0000-4000-8000-000000000003",
  saturnId,
  "http://other.test/thumb/3",
);

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

const mission = {
  id: missionId,
  userId: first.userId,
  bookingId: null,
  targetId: saturnId,
  observatoryId,
  state: "COMPLETE",
  mode: "SIMULATED",
  requestedAt: "2026-09-25T18:00:00Z",
};

type Responses = Record<string, unknown | (() => never)>;

function answer(responses: Responses) {
  platformRequest.mockImplementation(async (path: string) => {
    const key = Object.keys(responses).find((prefix) => path.startsWith(prefix));
    if (!key) throw new PlatformError(`unexpected ${path}`, 500);
    const value = responses[key];
    return typeof value === "function" ? (value as () => never)() : value;
  });
}

function fails(status: number) {
  return () => {
    throw new PlatformError("failed", status);
  };
}

const catalogue = { items: [saturn], page: { hasMore: false, nextCursor: null } };

beforeEach(() => {
  platformRequest.mockReset();
});

describe("readCollection", () => {
  it("names each capture from the catalogue and keeps only loadable thumbnails", async () => {
    answer({
      "/captures": {
        items: [first, retired, elsewhere],
        page: { hasMore: true, nextCursor: elsewhere.id },
      },
      "/targets": catalogue,
      "/observatories": observatories,
    });

    const result = await readCollection(null);

    expect(result).toMatchObject({
      kind: "ok",
      nextCursor: elsewhere.id,
      timezone: "Asia/Tbilisi",
    });
    if (result.kind !== "ok") return;
    expect(result.entries.map((entry) => entry.target?.slug ?? null)).toEqual([
      "saturn",
      null,
      "saturn",
    ]);
    expect(result.entries.map((entry) => entry.retired)).toEqual([false, true, false]);
    // Only the bucket's origin is in img-src; anything else would be a broken image.
    expect(result.entries.map((entry) => entry.thumbnail)).toEqual([
      first.thumbnailUrl,
      null,
      null,
    ]);
    expect(platformRequest).toHaveBeenCalledWith("/captures?limit=24");
  });

  it("passes the cursor on", async () => {
    answer({
      "/captures": { items: [], page: { hasMore: false, nextCursor: null } },
      "/targets": catalogue,
      "/observatories": observatories,
    });
    await readCollection(first.id);
    expect(platformRequest).toHaveBeenCalledWith(`/captures?limit=24&cursor=${first.id}`);
  });

  it("pages through the whole catalogue", async () => {
    const venusId = "30000000-0000-4000-8000-000000000032";
    platformRequest.mockImplementation(async (path: string) => {
      if (path.startsWith("/captures"))
        return {
          items: [capture(first.id, venusId, null)],
          page: { hasMore: false, nextCursor: null },
        };
      if (path === "/targets?limit=100")
        return { items: [saturn], page: { hasMore: true, nextCursor: saturnId } };
      if (path === `/targets?limit=100&cursor=${saturnId}`)
        return {
          items: [{ ...saturn, id: venusId, slug: "venus" }],
          page: { hasMore: false, nextCursor: null },
        };
      if (path === "/observatories") return observatories;
      throw new PlatformError(path, 500);
    });

    const result = await readCollection(null);
    expect(result.kind === "ok" && result.entries[0].target?.slug).toBe("venus");
  });

  it("keeps the captures when the catalogue and observatories cannot be read", async () => {
    answer({
      "/captures": { items: [first], page: { hasMore: false, nextCursor: null } },
      "/targets": fails(503),
      "/observatories": fails(503),
    });
    const result = await readCollection(null);
    expect(result).toMatchObject({ kind: "ok", timezone: "UTC" });
    expect(result.kind === "ok" && result.entries[0].target).toBeNull();
    // A catalogue that could not be read says nothing about whether the target retired.
    expect(result.kind === "ok" && result.entries[0].retired).toBe(false);
  });

  it("is signed-out on a 401 and unreachable on anything else", async () => {
    answer({
      "/captures": fails(401),
      "/targets": catalogue,
      "/observatories": observatories,
    });
    expect(await readCollection(null)).toEqual({ kind: "signed-out" });

    answer({
      "/captures": fails(500),
      "/targets": catalogue,
      "/observatories": observatories,
    });
    expect(await readCollection(null)).toEqual({ kind: "unreachable" });

    answer({
      "/captures": { items: [{ ...first, mode: "PRETEND" }], page: { hasMore: false } },
      "/targets": catalogue,
      "/observatories": observatories,
    });
    expect(await readCollection(null)).toEqual({ kind: "unreachable" });
  });
});

describe("readCapture", () => {
  it("mints the full image and names the mission's observatory", async () => {
    answer({
      [`/captures/${first.id}/download`]: {
        kind: "IMAGE",
        url: "http://storage.test/image/1?X-Amz-Signature=b",
        expiresAt: "2026-09-25T18:45:00Z",
      },
      [`/captures/${first.id}`]: first,
      [`/missions/${missionId}`]: mission,
      "/targets": catalogue,
      "/observatories": observatories,
    });

    const result = await readCapture(first.id);

    expect(result).toMatchObject({
      kind: "ok",
      image: { kind: "ok", url: "http://storage.test/image/1?X-Amz-Signature=b" },
      observatory: { nameEn: "Stellar Tbilisi" },
      timezone: "Asia/Tbilisi",
    });
    expect(platformRequest).toHaveBeenCalledWith(
      `/captures/${first.id}/download?kind=IMAGE`,
    );
  });

  it("tells a missing image from a failed one, and survives losing the mission", async () => {
    answer({
      [`/captures/${retired.id}/download`]: fails(404),
      [`/captures/${retired.id}`]: retired,
      [`/missions/${missionId}`]: fails(503),
      "/targets": catalogue,
      "/observatories": observatories,
    });
    expect(await readCapture(retired.id)).toMatchObject({
      kind: "ok",
      image: { kind: "none" },
      observatory: null,
      timezone: "UTC",
    });

    answer({
      [`/captures/${first.id}/download`]: fails(502),
      [`/captures/${first.id}`]: first,
      [`/missions/${missionId}`]: mission,
      "/targets": catalogue,
      "/observatories": observatories,
    });
    expect(await readCapture(first.id)).toMatchObject({ image: { kind: "failed" } });
  });

  it("is not-found for a 404 and for an id that is not a capture id, without asking", async () => {
    answer({ [`/captures/${first.id}`]: fails(404) });
    expect(await readCapture(first.id)).toEqual({ kind: "not-found" });

    platformRequest.mockReset();
    expect(await readCapture("CAP-DV-0001")).toEqual({ kind: "not-found" });
    expect(platformRequest).not.toHaveBeenCalled();
  });
});

describe("cursorOf", () => {
  it("accepts one capture id and nothing else", () => {
    expect(cursorOf(first.id)).toBe(first.id);
    expect(cursorOf("../me")).toBeNull();
    expect(cursorOf([first.id, first.id])).toBeNull();
    expect(cursorOf(undefined)).toBeNull();
  });
});
