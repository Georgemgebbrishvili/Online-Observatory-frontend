import { describe, expect, it, vi } from "vitest";

const platformRequest = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/platform/client", () => ({ platformRequest }));

const { readTonight } = await import("@/features/tonight/read");

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
        model: "NexStar 8SE",
        apertureMm: 203,
        focalLengthMm: 2032,
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
    note: null,
    updatedAt: "2026-09-23T19:00:00.000Z",
  },
  missionInProgress: false,
  currentTargetName: null,
  lastSuccessfulMissionAt: null,
  updatedAt: "2026-09-23T19:00:00.000Z",
};

const live = {
  missionId: "20000000-0000-4000-8000-000000000001",
  observatoryId,
  target: { slug: "saturn", nameEn: "Saturn", nameKa: "სატურნი", type: "PLANET" },
  state: "OBSERVING",
  mode: "SIMULATED",
  endsAt: null,
  spectatorCapacity: 20,
  streamPath: "/stream/mission/20000000-0000-4000-8000-000000000001/spectate",
};

function answer(routes: Record<string, unknown>) {
  platformRequest.mockImplementation(async (path: string) => {
    if (!(path in routes)) throw new Error(`unexpected ${path}`);
    const value = routes[path];
    if (value instanceof Error) throw value;
    return value;
  });
}

describe("readTonight (ADR-066)", () => {
  it("is unreachable when /tonight fails or answers out of contract", async () => {
    answer({ "/tonight": new Error("down") });
    expect(await readTonight()).toEqual({ kind: "unreachable" });
    answer({ "/tonight": { live: { missionId: 1 } } });
    expect(await readTonight()).toEqual({ kind: "unreachable" });
  });

  it("reads the live session's observatory status", async () => {
    answer({
      "/tonight": { live },
      "/observatories": observatories,
      [`/observatories/${observatoryId}/state`]: status,
    });
    const result = await readTonight();
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.tonight.live?.target.slug).toBe("saturn");
      expect(result.status?.link).toBe("ONLINE");
    }
  });

  it("with nothing live, reads the first-party observatory, so offline can be said", async () => {
    answer({
      "/tonight": { live: null },
      "/observatories": observatories,
      [`/observatories/${observatoryId}/state`]: { ...status, link: "OFFLINE" },
    });
    const result = await readTonight();
    expect(result.kind === "ok" && result.status?.link).toBe("OFFLINE");
  });

  it("keeps the page when the status cannot be read", async () => {
    answer({ "/tonight": { live: null }, "/observatories": new Error("down") });
    expect(await readTonight()).toEqual({
      kind: "ok",
      tonight: { live: null },
      status: null,
    });
  });
});
