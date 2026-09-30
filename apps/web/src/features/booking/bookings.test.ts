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

const { bookingCursorOf, readBooking, readBookings } =
  await import("@/features/booking/bookings");

const observatoryId = "10000000-0000-4000-8000-000000000001";
const bookingId = "40000000-0000-4000-8000-000000000001";
const targetId = "30000000-0000-4000-8000-000000000013";

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

const target = {
  id: targetId,
  slug: "m13-hercules-cluster",
  type: "GLOBULAR_CLUSTER",
  catalogId: "M13",
  nameEn: "Hercules Cluster",
  nameKa: "ჰერკულესის გროვა",
  positionSource: "FIXED",
  coordinates: { raHours: 16.695, decDegrees: 36.46, epoch: "J2000" },
  solarSystemBody: null,
  angularSizeArcmin: 20,
  magnitude: 5.8,
  opticalConfig: "F6_3_REDUCER",
  imagingProfile: "GLOBULAR_CLUSTER",
  minAltitudeDegrees: 25,
  expectedMissionMinutes: 10,
  enabled: true,
};

function booking(overrides: Record<string, unknown> = {}) {
  return {
    id: bookingId,
    userId: "00000000-0000-4000-8000-000000000101",
    observatoryId,
    targetId,
    slotStartAt: "2026-09-30T14:00:00.000Z",
    durationMinutes: 30,
    status: "CONFIRMED",
    priceMinor: 4500,
    currency: "GEL",
    paymentId: null,
    missionId: null,
    createdAt: "2026-09-29T10:00:00.000Z",
    ...overrides,
  };
}

function platform(routes: Record<string, unknown>) {
  platformRequest.mockImplementation(async (path: string) => {
    const route = Object.keys(routes).find((prefix) => path.startsWith(prefix));
    if (!route) throw new PlatformError("not found", 404);
    const answer = routes[route];
    if (answer instanceof Error) throw answer;
    return answer;
  });
}

const page = (items: unknown[], nextCursor: string | null = null) => ({
  items,
  page: { hasMore: nextCursor !== null, nextCursor },
});

beforeEach(() => {
  platformRequest.mockReset();
});

describe("bookingCursorOf", () => {
  it("keeps a booking id and ignores anything else", () => {
    expect(bookingCursorOf(bookingId)).toBe(bookingId);
    expect(bookingCursorOf("not-an-id")).toBeNull();
    expect(bookingCursorOf([bookingId])).toBeNull();
    expect(bookingCursorOf(undefined)).toBeNull();
  });
});

describe("readBookings", () => {
  it("names each booking's target and observatory, with the observatory's zone", async () => {
    platform({
      "/bookings": page([booking()], bookingId),
      "/targets": page([target]),
      "/observatories": observatories,
    });

    const result = await readBookings(null);

    expect(result).toMatchObject({ kind: "ok", nextCursor: bookingId });
    if (result.kind !== "ok") throw new Error();
    expect(result.entries[0]).toMatchObject({
      target: { nameEn: "Hercules Cluster" },
      retired: false,
      observatory: { id: observatoryId },
      timezone: "Asia/Tbilisi",
    });
    expect(platformRequest).toHaveBeenCalledWith("/bookings?limit=20");
  });

  it("passes the cursor on", async () => {
    platform({
      "/bookings": page([]),
      "/targets": page([target]),
      "/observatories": observatories,
    });

    await readBookings(bookingId);

    expect(platformRequest).toHaveBeenCalledWith(
      `/bookings?limit=20&cursor=${bookingId}`,
    );
  });

  it("marks a target the catalogue no longer lists as retired", async () => {
    platform({
      "/bookings": page([booking()]),
      "/targets": page([]),
      "/observatories": observatories,
    });

    const result = await readBookings(null);

    if (result.kind !== "ok") throw new Error();
    expect(result.entries[0]).toMatchObject({ target: null, retired: true });
  });

  it("keeps the bookings, in UTC, when the observatories cannot be read", async () => {
    platform({
      "/bookings": page([booking()]),
      "/targets": page([target]),
      "/observatories": new PlatformError("down", 500),
    });

    const result = await readBookings(null);

    if (result.kind !== "ok") throw new Error();
    expect(result.entries[0]).toMatchObject({ observatory: null, timezone: "UTC" });
  });

  it("is signed out on a 401 and unreachable otherwise", async () => {
    platform({ "/bookings": new PlatformError("no", 401) });
    expect(await readBookings(null)).toEqual({ kind: "signed-out" });

    platform({ "/bookings": new PlatformError("down", 503) });
    expect(await readBookings(null)).toEqual({ kind: "unreachable" });
  });

  it("refuses a body the contract does not allow", async () => {
    platform({
      "/bookings": page([booking({ status: "HELD" })]),
      "/targets": page([target]),
      "/observatories": observatories,
    });

    expect(await readBookings(null)).toEqual({ kind: "unreachable" });
  });
});

describe("readBooking", () => {
  it("is not found for an id that is not a uuid, without asking the platform", async () => {
    expect(await readBooking("CAP-1")).toEqual({ kind: "not-found" });
    expect(platformRequest).not.toHaveBeenCalled();
  });

  it("is not found on the platform's 404", async () => {
    platform({});
    expect(await readBooking(bookingId)).toEqual({ kind: "not-found" });
  });

  it("reads the booking with the observatory's mode", async () => {
    platform({
      [`/bookings/${bookingId}`]: booking({ status: "PENDING_PAYMENT" }),
      "/targets": page([target]),
      [`/observatories/${observatoryId}/state`]: {
        mode: "SIMULATED",
      },
      "/observatories": observatories,
    });

    const result = await readBooking(bookingId);

    expect(result).toMatchObject({
      kind: "ok",
      entry: { booking: { status: "PENDING_PAYMENT" }, timezone: "Asia/Tbilisi" },
    });
  });

  it("keeps the booking when the observatory's state cannot be read", async () => {
    platform({
      [`/bookings/${bookingId}`]: booking(),
      "/targets": page([target]),
      [`/observatories/${observatoryId}/state`]: new PlatformError("down", 500),
      "/observatories": observatories,
    });

    expect(await readBooking(bookingId)).toMatchObject({ kind: "ok", mode: null });
  });
});
