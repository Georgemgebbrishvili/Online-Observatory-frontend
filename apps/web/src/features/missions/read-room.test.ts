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
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));
vi.mock("@/lib/platform/client", () => ({ platformRequest, PlatformError }));
vi.mock("@/lib/platform/config", () => ({ storageOrigin: null }));

const { readRoom } = await import("@/features/missions/read-room");

const missionId = "20000000-0000-4000-8000-000000000001";
const observatoryId = "10000000-0000-4000-8000-000000000001";
const targetId = "30000000-0000-4000-8000-000000000006";

const mission = {
  id: missionId,
  userId: "40000000-0000-4000-8000-000000000001",
  bookingId: null,
  targetId,
  observatoryId,
  state: "OBSERVING",
  failureReason: null,
  mode: "SIMULATED",
  scheduledStartAt: null,
  requestedAt: "2026-09-23T19:40:00.000Z",
  startedAt: null,
  endedAt: null,
  captureIds: Array.from(
    { length: 10 },
    (_, index) => `60000000-0000-4000-8000-0000000000${String(index).padStart(2, "0")}`,
  ),
  observable: false,
  observerCapacity: 5,
};

function event(index: number) {
  return {
    id: `70000000-0000-4000-8000-0000000000${String(index).padStart(2, "0")}`,
    missionId,
    at: `2026-09-23T19:4${index}:00.000Z`,
    state: "SCHEDULED",
    failureReason: null,
    source: "CLOUD",
    commandId: null,
    detail: null,
  };
}

function platform(overrides: Record<string, (path: string) => unknown> = {}) {
  platformRequest.mockImplementation(async (path: string) => {
    for (const [prefix, answer] of Object.entries(overrides)) {
      if (path.startsWith(prefix)) return answer(path);
    }
    if (path === `/missions/${missionId}`) return mission;
    if (path.startsWith(`/missions/${missionId}/events`)) {
      return path.includes("cursor=")
        ? { items: [event(2)], page: { hasMore: false, nextCursor: null } }
        : {
            items: [event(0), event(1)],
            page: { hasMore: true, nextCursor: event(1).id },
          };
    }
    if (path.startsWith("/captures/")) throw new PlatformError("gone", 404);
    if (path === "/targets") return { items: [] };
    if (path === "/observatories") return { items: [] };
    throw new PlatformError(path, 503);
  });
}

beforeEach(() => {
  platformRequest.mockReset();
});

describe("readRoom", () => {
  it("answers anything that is not a mission id as not found, without asking", async () => {
    expect(await readRoom("DV-SIM-001")).toEqual({ kind: "not-found" });
    expect(platformRequest).not.toHaveBeenCalled();
  });

  it("tells a missing mission from a lost session from a platform that did not answer", async () => {
    platform({
      [`/missions/${missionId}`]: () => {
        throw new PlatformError("", 404);
      },
    });
    expect(await readRoom(missionId)).toEqual({ kind: "not-found" });

    platform({
      [`/missions/${missionId}`]: () => {
        throw new PlatformError("", 401);
      },
    });
    expect(await readRoom(missionId)).toEqual({ kind: "signed-out" });

    platform({
      [`/missions/${missionId}`]: () => {
        throw new PlatformError("", 503);
      },
    });
    expect(await readRoom(missionId)).toEqual({ kind: "unreachable" });
  });

  it("reads every page of the history, oldest first", async () => {
    platform();
    const result = await readRoom(missionId);
    expect(result.kind === "ok" && result.room.events?.map((row) => row.id)).toEqual([
      event(0).id,
      event(1).id,
      event(2).id,
    ]);
  });

  it("keeps the room when everything around the mission is lost, and says so", async () => {
    platform({
      [`/missions/${missionId}/events`]: () => {
        throw new PlatformError("", 503);
      },
    });
    const result = await readRoom(missionId);
    expect(result).toMatchObject({
      kind: "ok",
      room: {
        mission: { id: missionId },
        target: null,
        events: null,
        tonight: "unreadable",
        status: null,
        conditions: null,
        captures: [],
        timezone: "UTC",
      },
    });
  });

  it("reads tonight's sky at the mission's own observatory", async () => {
    platform();
    await readRoom(missionId);
    expect(platformRequest).toHaveBeenCalledWith(
      `/targets/tonight?observatoryId=${mission.observatoryId}`,
    );
  });

  it("asks for the eight newest captures only", async () => {
    platform();
    await readRoom(missionId);
    const asked = platformRequest.mock.calls
      .map(([path]) => String(path))
      .filter((path) => path.startsWith("/captures/"));
    expect(asked).toHaveLength(8);
    expect(asked[0]).toBe(`/captures/${mission.captureIds[9]}`);
  });
});
