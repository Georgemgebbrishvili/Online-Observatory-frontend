import type { MissionWatchView } from "@darkview/contracts";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { roomCopy } from "@/i18n/resources/room";
import { watchCopy } from "@/i18n/resources/watch";

import { MissionWatch, WatchView, settleEveryMs, settleTries } from "./mission-watch";

const copy = watchCopy.en;
const room = roomCopy.en;
const missionId = "23000000-0000-4000-8000-000000000004";
const checkoutKey = "stellar:watch-checkout";

const assign = vi.hoisted(() => vi.fn());
vi.mock("@/lib/platform/browser", async (actual) => ({
  ...(await actual<typeof import("@/lib/platform/browser")>()),
  navigateWithFreshSession: assign,
}));

function view(overrides: Partial<MissionWatchView> = {}): MissionWatchView {
  return {
    mission: {
      id: missionId,
      userId: "00000000-0000-4000-8000-000000000003",
      bookingId: null,
      targetId: "30000000-0000-4000-8000-000000000006",
      observatoryId: "10000000-0000-4000-8000-000000000001",
      state: "OBSERVING",
      failureReason: null,
      mode: "SIMULATED",
      requestedAt: "2026-09-23T19:40:00.000Z",
      observable: true,
      observerCapacity: 5,
      observerCount: 2,
    },
    target: {
      id: "30000000-0000-4000-8000-000000000006",
      slug: "saturn",
      nameEn: "Saturn",
      nameKa: "სატურნი",
    } as MissionWatchView["target"],
    observatory: {
      id: "10000000-0000-4000-8000-000000000001",
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
    ownerDisplayName: "Nino",
    observerCount: 2,
    myObserverSeat: null,
    myObserverPack: null,
    ...overrides,
  };
}

/** The caller's own pack, paid, with what a close gave back (ADR-045). */
function paidPack(refund: { refundedMinor?: number; refundOwedMinor?: number } = {}) {
  return {
    id: "81000000-0000-4000-8000-000000000001",
    missionId,
    userId: "00000000-0000-4000-8000-000000000004",
    status: "PAID" as const,
    priceMinor: 1500,
    currency: "GEL" as const,
    paymentId: "82000000-0000-4000-8000-000000000001",
    holdExpiresAt: null,
    refundedMinor: refund.refundedMinor ?? null,
    refundOwedMinor: refund.refundOwedMinor ?? null,
    createdAt: "2026-10-02T12:00:00.000Z",
  };
}

const seat = {
  id: "80000000-0000-4000-8000-000000000001",
  missionId,
  userId: "00000000-0000-4000-8000-000000000004",
  joinedAt: "2026-10-02T12:00:00.000Z",
  leftAt: null,
};

function pack(status: "PENDING_PAYMENT" | "PAID", redirectUrl: string | null) {
  return {
    observerPack: {
      id: "90000000-0000-4000-8000-000000000001",
      missionId,
      userId: seat.userId,
      status,
      priceMinor: 1500,
      currency: "GEL",
      paymentId: "91000000-0000-4000-8000-000000000001",
      holdExpiresAt: null,
      createdAt: "2026-10-02T12:00:00.000Z",
    },
    paymentIntent: {
      paymentId: "91000000-0000-4000-8000-000000000001",
      provider: "SANDBOX",
      status: status === "PAID" ? "CAPTURED" : "PENDING",
      redirectUrl,
    },
  };
}

function answer(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const refusal = (code: string) => ({ code, message: code });

class FakeSocket {
  static all: FakeSocket[] = [];
  sent: unknown[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  constructor(readonly url: string) {
    FakeSocket.all.push(this);
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {}
  receive(body: Record<string, unknown>) {
    act(() =>
      this.onmessage?.({
        data: JSON.stringify({
          messageId: crypto.randomUUID(),
          sentAt: new Date().toISOString(),
          missionId,
          ...body,
        }),
      }),
    );
  }
}

async function openChannel() {
  await waitFor(() => expect(FakeSocket.all.length).toBeGreaterThan(0));
  const socket = FakeSocket.all.at(-1)!;
  act(() => socket.onopen?.());
  return socket;
}

const stream = {
  type: "MISSION_STREAM",
  streamUrl: `http://localhost:3100/stream/mission/${missionId}?t=signed`,
  encoding: "JPEG",
  mode: "SIMULATED",
  expiresAt: new Date(Date.now() + 300_000).toISOString(),
};

const fetchMock = vi.fn();
const calls = () =>
  fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? "GET"} ${url}`);

beforeEach(() => {
  fetchMock.mockReset();
  assign.mockReset();
  FakeSocket.all = [];
  window.sessionStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("WebSocket", FakeSocket);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("MissionWatch", () => {
  it("offers a seat, and buying one follows the checkout and notes the mission", async () => {
    const checkout = "http://localhost:3000/api/payments/91/sandbox-checkout";
    fetchMock.mockResolvedValueOnce(answer(201, pack("PENDING_PAYMENT", checkout)));
    render(<MissionWatch view={view()} locale="en" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Nino is observing Saturn." }),
    ).toBeVisible();
    expect(screen.getByText("2 of 5 seats taken.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: copy.buy }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith(checkout));
    expect(calls()).toEqual([`POST /api/missions/${missionId}/observer-pack`]);
    expect(window.sessionStorage.getItem(checkoutKey)).toBe(missionId);
    expect(FakeSocket.all).toHaveLength(0);
  });

  it("names an owner without a display name as a Stellar observer", () => {
    render(<MissionWatch view={view({ ownerDisplayName: null })} locale="en" />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A Stellar observer is observing Saturn.",
      }),
    ).toBeVisible();
  });

  it("joins at once when the pack comes back already paid, as after leaving", async () => {
    fetchMock
      .mockResolvedValueOnce(answer(201, pack("PAID", null)))
      .mockResolvedValueOnce(answer(201, seat));
    render(<MissionWatch view={view()} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: copy.buy }));

    expect(await screen.findByText(copy.watching)).toBeVisible();
    expect(calls()).toEqual([
      `POST /api/missions/${missionId}/observer-pack`,
      `POST /api/missions/${missionId}/observers`,
    ]);
    expect(assign).not.toHaveBeenCalled();
  });

  it("says every seat is taken when the purchase is refused for capacity", async () => {
    fetchMock.mockResolvedValueOnce(answer(409, refusal("OBSERVER_CAPACITY_REACHED")));
    render(<MissionWatch view={view()} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: copy.buy }));

    expect(await screen.findByText(copy.full)).toBeVisible();
    expect(screen.queryByRole("button", { name: copy.buy })).toBeNull();
  });

  it("is full from the read when the seats taken reach the capacity", () => {
    render(
      <MissionWatch
        view={view({
          observerCount: 5,
          mission: { ...view().mission, observerCount: 5 },
        })}
        locale="en"
      />,
    );
    expect(screen.getByText(copy.full)).toBeVisible();
  });

  it("says seats cannot be paid for when the intent names no checkout", async () => {
    fetchMock.mockResolvedValueOnce(answer(201, pack("PENDING_PAYMENT", null)));
    render(<MissionWatch view={view()} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: copy.buy }));

    expect(await screen.findByRole("alert")).toHaveTextContent(copy.checkoutUnavailable);
    expect(assign).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: copy.buy })).toBeEnabled();
  });

  it("signs in again on a 401, and fails plainly on anything unexpected", async () => {
    fetchMock.mockResolvedValueOnce(answer(401, refusal("UNAUTHENTICATED")));
    const first = render(<MissionWatch view={view()} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: copy.buy }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith("/en/sign-in"));
    first.unmount();

    fetchMock.mockResolvedValueOnce(answer(500, refusal("INTERNAL")));
    render(<MissionWatch view={view()} locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: copy.buy }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.failed);
  });

  it("back from the checkout, asks again while the payment settles, then watches", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.sessionStorage.setItem(checkoutKey, missionId);
    fetchMock
      .mockResolvedValueOnce(answer(402, refusal("PAYMENT_REQUIRED")))
      .mockResolvedValueOnce(answer(402, refusal("PAYMENT_REQUIRED")))
      .mockResolvedValueOnce(answer(201, seat));
    render(<MissionWatch view={view()} locale="en" />);

    expect(await screen.findByText(copy.paying)).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(settleEveryMs * 2));
    expect(await screen.findByText(copy.watching)).toBeVisible();
    expect(screen.getByText("3 of 5 seats taken.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(window.sessionStorage.getItem(checkoutKey)).toBeNull();
  });

  it("back from the checkout with the seat already paid, takes it at once (ADR-045)", async () => {
    window.sessionStorage.setItem(checkoutKey, missionId);
    fetchMock.mockResolvedValueOnce(answer(201, seat));
    render(<MissionWatch view={view({ myObserverPack: paidPack() })} locale="en" />);

    expect(await screen.findByText(copy.watching)).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(checkoutKey)).toBeNull();
  });

  it("stops asking after a bounded number of 402s and offers to check again", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.sessionStorage.setItem(checkoutKey, missionId);
    fetchMock.mockImplementation(async () => answer(402, refusal("PAYMENT_REQUIRED")));
    render(<MissionWatch view={view()} locale="en" />);

    await act(() => vi.advanceTimersByTimeAsync(settleEveryMs * settleTries));
    const again = await screen.findByRole("button", { name: copy.checkAgain });
    await waitFor(() => expect(again).toBeEnabled());
    expect(fetchMock).toHaveBeenCalledTimes(settleTries);
    expect(screen.getByText(copy.paying)).toBeVisible();

    fetchMock.mockReset();
    fetchMock.mockResolvedValueOnce(answer(201, seat));
    fireEvent.click(again);
    expect(await screen.findByText(copy.watching)).toBeVisible();
  });

  it("watches the channel as an observer: no session, no controls, the simulated feed", async () => {
    render(<MissionWatch view={view({ myObserverSeat: seat })} locale="en" />);
    const socket = await openChannel();

    expect(socket.url).toBe(`ws://localhost:3000/ws/mission/${missionId}`);
    expect(socket.sent[0]).toMatchObject({
      type: "CLIENT_SUBSCRIBE",
      missionId,
      sessionId: null,
    });
    socket.receive({
      type: "MISSION_STATE",
      state: "OBSERVING",
      failureReason: null,
      remainingSeconds: null,
    });
    socket.receive(stream);

    const feed = document.querySelector(".live-feed")!;
    expect(feed).toHaveAttribute("data-live-status", "live");
    expect(feed.querySelector(".live-feed-badge")).toHaveTextContent(room.live.simulated);
    expect(screen.getByRole("note")).toHaveTextContent(copy.simulated);
    expect(screen.getByText(copy.watching)).toBeVisible();
    // View only (ADR-007): Leave is the one thing an observer can press.
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      copy.leave,
    ]);
  });

  it("says the observatory is offline when the channel says so", async () => {
    render(<MissionWatch view={view({ myObserverSeat: seat })} locale="en" />);
    const socket = await openChannel();
    socket.receive({
      type: "MISSION_TELEMETRY",
      mode: "SIMULATED",
      link: "OFFLINE",
      tracking: false,
      centeringIteration: null,
      residualArcminutes: null,
      nudgeUsedDegrees: null,
      ambientTemperatureC: null,
      pointing: null,
    });
    expect(document.querySelector(".live-feed")).toHaveAttribute(
      "data-live-status",
      "offline",
    );
    expect(screen.getByText(copy.offline)).toBeVisible();
  });

  it("leaves, and keeps the seat to watch again", async () => {
    fetchMock.mockResolvedValueOnce(answer(204)).mockResolvedValueOnce(answer(201, seat));
    render(
      <MissionWatch
        view={view({ myObserverSeat: seat, observerCount: 3 })}
        locale="en"
      />,
    );
    await openChannel();

    fireEvent.click(screen.getByRole("button", { name: copy.leave }));
    expect(await screen.findByText(copy.left)).toBeVisible();
    expect(screen.getByText("2 of 5 seats taken.")).toBeVisible();
    expect(document.querySelector(".live-feed")).toBeNull();
    expect(calls()).toEqual([`DELETE /api/missions/${missionId}/observers`]);

    fireEvent.click(screen.getByRole("button", { name: copy.watchAgain }));
    expect(await screen.findByText(copy.watching)).toBeVisible();
  });

  it("says the owner closed the session when the channel closes and the read answers 404", async () => {
    fetchMock.mockResolvedValueOnce(answer(404, refusal("NOT_FOUND")));
    render(<MissionWatch view={view({ myObserverSeat: seat })} locale="en" />);
    const socket = await openChannel();

    act(() => socket.onclose?.());
    expect(
      await screen.findByRole("heading", { level: 1, name: copy.closed }),
    ).toBeVisible();
    expect(calls()).toEqual([`GET /api/missions/${missionId}/watch`]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("opens the channel again when it dropped and the seat is still held", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock.mockResolvedValueOnce(answer(200, view({ myObserverSeat: seat })));
    render(<MissionWatch view={view({ myObserverSeat: seat })} locale="en" />);
    const socket = await openChannel();

    act(() => socket.onclose?.());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(() => vi.advanceTimersByTimeAsync(1_000));
    await waitFor(() => expect(FakeSocket.all).toHaveLength(2));
    expect(screen.getByText(copy.watching)).toBeVisible();
  });

  it("says the session has ended when the mission leaves its live states", async () => {
    render(<MissionWatch view={view({ myObserverSeat: seat })} locale="en" />);
    const socket = await openChannel();
    socket.receive({
      type: "MISSION_STATE",
      state: "COMPLETE",
      failureReason: null,
      remainingSeconds: null,
    });
    expect(screen.getByRole("heading", { level: 1, name: copy.over })).toBeVisible();
  });
});

describe("WatchView", () => {
  it("sends the owner to the live room", () => {
    render(<WatchView phase="owner" copy={copy} target="Saturn" roomPath="/en/room" />);
    expect(screen.getByRole("heading", { level: 1, name: copy.owner })).toBeVisible();
    expect(screen.getByRole("link", { name: copy.ownerAction })).toHaveAttribute(
      "href",
      "/en/room",
    );
  });

  it("says plainly when a session is not open, or the read failed", () => {
    const view = render(<WatchView phase="not-open" copy={copy} />);
    expect(screen.getByRole("heading", { name: copy.notOpen })).toBeVisible();
    expect(screen.queryByRole("button")).toBeNull();
    view.unmount();

    render(<WatchView phase="error" copy={watchCopy.ka} />);
    expect(screen.getByRole("heading", { name: watchCopy.ka.failed })).toBeVisible();
  });

  it("is busy while the read is in flight", () => {
    render(<WatchView phase="loading" copy={copy} />);
    expect(screen.getByRole("heading", { name: copy.loading })).toBeVisible();
    expect(document.querySelector(".watch")).toHaveAttribute("aria-busy", "true");
  });

  it("titles specimens with h2 for the design system", () => {
    render(
      <WatchView
        phase="sale"
        copy={copy}
        headingLevel={2}
        label="WatchView 1"
        headline="Nino is observing Saturn."
      />,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Nino is observing Saturn.",
    );
    expect(screen.getByRole("region", { name: "WatchView 1" })).toBeVisible();
  });
});

describe("a buyer whose seat a close ended (ADR-045)", () => {
  it("is told the owner closed it, and what was refunded, with no seat for sale", () => {
    render(
      <MissionWatch
        locale="en"
        view={view({
          mission: { ...view().mission, observable: false },
          myObserverPack: paidPack({ refundedMinor: 750 }),
        })}
      />,
    );

    expect(screen.getByRole("heading", { name: copy.closed })).toBeVisible();
    expect(
      screen.getByText("GEL 7.50 was refunded to you for the time the close took."),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: copy.buy })).toBeNull();
  });

  it("says a refund the provider cannot issue yet will be refunded, never that it was", () => {
    render(
      <MissionWatch
        locale="en"
        view={view({
          mission: { ...view().mission, state: "COMPLETE" },
          myObserverPack: paidPack({ refundOwedMinor: 750 }),
        })}
      />,
    );

    expect(screen.getByRole("heading", { name: copy.over })).toBeVisible();
    expect(
      screen.getByText("GEL 7.50 will be refunded to you for the time the close took."),
    ).toBeVisible();
    expect(screen.queryByText(/was refunded/)).toBeNull();
  });

  it("offers a paid seat back, not for sale, while the session is open", () => {
    render(<MissionWatch locale="en" view={view({ myObserverPack: paidPack() })} />);

    expect(screen.getByRole("button", { name: copy.watchAgain })).toBeVisible();
    expect(screen.queryByRole("button", { name: copy.buy })).toBeNull();
  });
});
