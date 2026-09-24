import { describe, expect, it, vi } from "vitest";

const platformRequest = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/platform/client", () => ({ platformRequest }));

const { readStatus } = await import("@/features/status/read");

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

const conditions = { observatoryId, date: "2026-09-23", items: [] };

describe("readStatus", () => {
  it("reads the first-party observatory, its status and tonight's conditions", async () => {
    platformRequest.mockImplementation((path: string) => {
      if (path === "/observatories") return Promise.resolve(observatories);
      if (path.endsWith("/state")) return Promise.resolve(status);
      if (path.endsWith("/conditions")) return Promise.resolve(conditions);
      throw new Error(`unexpected path ${path}`);
    });

    const result = await readStatus("en");

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.reading.observatoryName).toBe("Stellar Tbilisi");
    expect(result.reading.timezone).toBe("Asia/Tbilisi");
    expect(result.reading.conditions).not.toBeNull();
  });

  it("keeps the page when only the advisory forecast fails", async () => {
    platformRequest.mockImplementation((path: string) => {
      if (path === "/observatories") return Promise.resolve(observatories);
      if (path.endsWith("/state")) return Promise.resolve(status);
      return Promise.reject(new Error("forecast store unavailable"));
    });

    const result = await readStatus("en");

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    // Conditions are advisory, so losing them must not lose the status itself.
    expect(result.reading.conditions).toBeNull();
    expect(result.reading.status.link).toBe("ONLINE");
  });

  it("reports the platform unreachable rather than showing a stale reading", async () => {
    platformRequest.mockRejectedValue(new Error("connect ECONNREFUSED"));

    expect(await readStatus("en")).toEqual({ kind: "unreachable" });
  });

  it("tells an empty observatory list apart from an unreachable platform", async () => {
    platformRequest.mockImplementation((path: string) =>
      path === "/observatories"
        ? Promise.resolve({ items: [] })
        : Promise.reject(new Error("not called")),
    );

    expect(await readStatus("en")).toEqual({ kind: "no-observatory" });
  });

  it("refuses a status payload that does not match the contract", async () => {
    platformRequest.mockImplementation((path: string) => {
      if (path === "/observatories") return Promise.resolve(observatories);
      // link is not a valid ObservatoryLinkState.
      return Promise.resolve({ ...status, link: "PROBABLY_FINE" });
    });

    expect(await readStatus("en")).toEqual({ kind: "unreachable" });
  });

  it("names the observatory in the reader's language", async () => {
    platformRequest.mockImplementation((path: string) => {
      if (path === "/observatories") return Promise.resolve(observatories);
      if (path.endsWith("/state")) return Promise.resolve(status);
      return Promise.resolve(conditions);
    });

    const result = await readStatus("ka");

    expect(result.kind === "ok" && result.reading.observatoryName).toBe(
      "სტელარი თბილისი",
    );
  });
});
