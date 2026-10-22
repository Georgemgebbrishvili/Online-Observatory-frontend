import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cardsCopy } from "@/i18n/resources/cards";

import { CardDraw } from "./card-draw";

const copy = cardsCopy.en;
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const observatoryId = "10000000-0000-4000-8000-000000000001";
const unturned = (position: number) => ({ position, turned: false, rarity: null, targetSlug: null, prize: null });
const odds = {
  cards: [
    { rarity: "LEGENDARY", prizeKind: "FREE_SLOT", chance: 0.01 },
    { rarity: "EPIC", prizeKind: "OBSERVER_SEAT", chance: 0.1 },
    { rarity: "RARE", prizeKind: "DISCOUNT", chance: 0.25 },
    { rarity: "COMMON", prizeKind: null, chance: 0.64 },
  ],
  freeSlotsPerWeek: 2,
  freeSlotDurationMinutes: 40,
  discountPercentOff: 20,
  prizeValidDays: 30,
} as const;
const draw = {
  id: "c1000000-0000-4000-8000-000000000001",
  observatoryId,
  week: "2026-10-19",
  dealtAt: "2026-10-22T08:00:00.000Z",
  opensNextAt: "2026-10-25T20:00:00.000Z",
  picked: null,
  pickedAt: null,
  cards: [unturned(0), unturned(1), unturned(2)],
  odds,
};
const seat = {
  id: "d1000000-0000-4000-8000-000000000001",
  kind: "OBSERVER_SEAT",
  status: "ACTIVE",
  observatoryId,
  voucherCode: "STLRSEAT0001",
  codeLast4: "0001",
  durationMinutes: null,
  percentOff: null,
  expiresAt: "2026-11-21T08:00:00.000Z",
  redeemedBookingId: null,
  redeemedObserverPackId: null,
  createdAt: "2026-10-22T08:00:00.000Z",
};
const picked = {
  ...draw,
  picked: 1,
  pickedAt: "2026-10-22T08:01:00.000Z",
  cards: [
    { position: 0, turned: true, rarity: "COMMON", targetSlug: "saturn", prize: null },
    { position: 1, turned: true, rarity: "EPIC", targetSlug: "albireo", prize: seat },
    { position: 2, turned: true, rarity: "RARE", targetSlug: null, prize: null },
  ],
};
const targets = {
  saturn: { name: "Saturn", kind: "Planet" },
  albireo: { name: "Albireo", kind: "Double star" },
};

function answer(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  refresh.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

function renderDraw(deal: unknown = draw) {
  return render(
    <CardDraw
      locale="en"
      draw={deal as never}
      targets={targets}
      timezone="Asia/Tbilisi"
      signInPath="/en/sign-in"
      now="2026-10-22T09:00:00.000Z"
    />,
  );
}

describe("CardDraw", () => {
  it("shows three face-down cards and nothing of what they hold", () => {
    renderDraw();
    expect(screen.getAllByRole("button", { name: /Turn card/ })).toHaveLength(3);
    expect(screen.queryByText(copy.illustration)).toBeNull();
  });

  it("turns the chosen card with the platform's answer, then the other two", async () => {
    fetchMock.mockResolvedValue(answer(200, picked));
    renderDraw();
    fireEvent.click(screen.getByRole("button", { name: copy.turn(1) }));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/card-draws/${draw.id}/pick`);
    expect(JSON.parse(init.body)).toEqual({ position: 1 });
    expect(init.headers["Idempotency-Key"]).toBe(`pick-${draw.id}`);

    expect(await screen.findByRole("heading", { name: "Epic: A free observer seat." })).toBeTruthy();
    expect(screen.getByText("STLRSEAT0001")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Turn card/ })).toBeNull();
    // The other two turn after the picked one, and the prize list is read again.
    await waitFor(() => expect(screen.getAllByText(copy.illustration)).toHaveLength(3), { timeout: 2000 });
    expect(refresh).toHaveBeenCalled();
  });

  it("says when the week's cards have closed", async () => {
    fetchMock.mockResolvedValue(answer(409, { code: "CARD_DRAW_CLOSED", message: "Closed." }));
    renderDraw();
    fireEvent.click(screen.getByRole("button", { name: copy.turn(0) }));
    expect(await screen.findByText(copy.refused.closed)).toBeTruthy();
  });

  it("shows a deal already picked, turned, with no way to turn again", () => {
    renderDraw(picked);
    expect(screen.queryByRole("button", { name: /Turn card/ })).toBeNull();
    expect(screen.getAllByText(copy.illustration)).toHaveLength(3);
    expect(screen.getByText(/New cards on Monday 26 October, 00:00/)).toBeTruthy();
  });
});
