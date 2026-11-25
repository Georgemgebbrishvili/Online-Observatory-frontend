import { beforeEach, describe, expect, it, vi } from "vitest";

const readBoard = vi.hoisted(() => vi.fn());
const platformRequest = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/platform/client", () => ({ platformRequest }));
vi.mock("@/features/booking/board", () => ({ readBoard }));
vi.mock("@/components/booking/booking-night", () => ({
  formatPrice: (minor: number) => String(minor),
}));

const { readPricingShared } = await import("@/features/pricing/read");

const board = {
  kind: "ok",
  observatory: { timezone: "Asia/Tbilisi" },
  nights: [],
};

describe("readPricingShared", () => {
  beforeEach(() => {
    readBoard.mockReset();
    platformRequest.mockReset().mockRejectedValue(new Error("no scheme"));
  });

  it("reads the platform once a minute for a language, however many visitors ask", async () => {
    readBoard.mockResolvedValue(board);
    const first = await readPricingShared("en", 1_000_000);
    const second = await readPricingShared("en", 1_030_000);
    expect(first.reachable).toBe(true);
    expect(second).toBe(first);
    expect(readBoard).toHaveBeenCalledTimes(1);

    await readPricingShared("en", 1_061_000);
    expect(readBoard).toHaveBeenCalledTimes(2);
  });

  it("asks an unreachable platform again after ten seconds", async () => {
    readBoard.mockResolvedValue({ kind: "unreachable" });
    const down = await readPricingShared("ka", 2_000_000);
    expect(down.reachable).toBe(false);
    await readPricingShared("ka", 2_005_000);
    expect(readBoard).toHaveBeenCalledTimes(1);

    readBoard.mockResolvedValue(board);
    const up = await readPricingShared("ka", 2_011_000);
    expect(up.reachable).toBe(true);
    expect(readBoard).toHaveBeenCalledTimes(2);
  });
});
