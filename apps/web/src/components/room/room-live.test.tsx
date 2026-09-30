import type { Mission, TargetVisibility } from "@darkview/contracts";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatCapturedAt } from "@/features/collection/present";

import { RoomLive } from "./room-live";

// As MissionRoom does on the server.
function opensAt({ scheduledStartAt }: Mission, locale: "en" | "ka") {
  return scheduledStartAt ? formatCapturedAt(scheduledStartAt, "Asia/Tbilisi", locale) : null;
}

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const missionId = "20000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000001";

const mission: Mission = {
  id: missionId,
  userId,
  bookingId: null,
  targetId: "30000000-0000-4000-8000-000000000013",
  observatoryId: "10000000-0000-4000-8000-000000000001",
  state: "OBSERVING",
  failureReason: null,
  mode: "SIMULATED",
  scheduledStartAt: "2026-09-23T20:00:00.000Z",
  requestedAt: "2026-09-23T19:40:00.000Z",
  startedAt: "2026-09-23T20:00:00.000Z",
  endedAt: null,
  captureIds: [],
  observable: false,
  observerCapacity: 5,
};

function session(expiresInMs = 30 * 60_000) {
  const now = Date.now();
  return {
    sessionId: "70000000-0000-4000-8000-000000000001",
    missionId,
    userId,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + expiresInMs).toISOString(),
    missionChannelUrl: `/ws/mission/${missionId}`,
    allowedCommands: ["NUDGE", "CAPTURE", "RECENTER", "ABORT"],
  };
}

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

function answer(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

// M13 tonight, as listTonightTargets reports it: the dial's target.
const visibility: TargetVisibility = {
  observable: true,
  evaluatedAt: "2026-09-23T20:00:00.000Z",
  horizontal: { altitudeDegrees: 41, azimuthDegrees: 280 },
  sunAltitudeDegrees: -30,
  moonSeparationDegrees: 80,
  risesAt: null,
  setsAt: "2026-09-23T23:00:00.000Z",
  blockReasons: [],
};

function renderRoom(overrides: Partial<Mission> = {}, locale: "en" | "ka" = "en") {
  return render(
    <RoomLive
      locale={locale}
      mission={{ ...mission, ...overrides }}
      events={[]}
      targetName={locale === "ka" ? "ჰერკულესის გროვა" : "Hercules Cluster"}
      targetSlug="m13-hercules-cluster"
      plate={null}
      timezone="Asia/Tbilisi"
      opensAtText={opensAt({ ...mission, ...overrides }, locale)}
      visibility={visibility}
      readings={<aside>readings</aside>}
    >
      <aside>captures</aside>
    </RoomLive>,
  );
}

async function openChannel() {
  await waitFor(() => expect(FakeSocket.all).toHaveLength(1));
  const socket = FakeSocket.all[0];
  act(() => socket.onopen?.());
  return socket;
}

const stream = {
  type: "MISSION_STREAM",
  streamUrl: `http://localhost:3000/stream/mission/${missionId}?t=signed`,
  encoding: "JPEG",
  mode: "SIMULATED",
  expiresAt: new Date(Date.now() + 300_000).toISOString(),
};

beforeEach(() => {
  FakeSocket.all = [];
  vi.stubGlobal("WebSocket", FakeSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
  refresh.mockClear();
});

describe("RoomLive", () => {
  it("reopens a live mission's session, subscribes, and shows the simulated stream", async () => {
    const fetch = answer(200, session());
    vi.stubGlobal("fetch", fetch);
    renderRoom();

    expect(screen.getByRole("status")).toHaveTextContent("Starting");
    const socket = await openChannel();
    expect(fetch).toHaveBeenCalledWith(
      `/api/missions/${missionId}/start`,
      expect.objectContaining({ method: "POST" }),
    );
    expect(socket.url).toBe(`ws://localhost:3000/ws/mission/${missionId}`);
    expect(socket.sent[0]).toMatchObject({
      type: "CLIENT_SUBSCRIBE",
      missionId,
      sessionId: "70000000-0000-4000-8000-000000000001",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Connecting");

    socket.receive({
      type: "MISSION_STATE",
      state: "OBSERVING",
      failureReason: null,
      remainingSeconds: null,
    });
    socket.receive(stream);

    const image = screen.getByRole("img", {
      name: "Simulated live view of Hercules Cluster",
    });
    expect(image).toHaveAttribute("src", stream.streamUrl);
    expect(screen.getByText("Simulated")).toBeVisible();
    // The LIVE dot is a real camera's only.
    expect(document.querySelector(".live-indicator-active")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Simulator output, not telescope output.",
    );
    // Time left comes from the session's expiresAt.
    await waitFor(() => expect(screen.getByText(/Time left/)).toBeVisible());
    expect(
      document.querySelector(".live-feed-time time")?.getAttribute("dateTime"),
    ).toMatch(/^PT1[78]\d\dS$/);
  });

  it("says it is reconnecting when the channel drops, and reopens it", async () => {
    vi.stubGlobal("fetch", answer(200, session()));
    renderRoom();
    const socket = await openChannel();
    socket.receive(stream);

    act(() => socket.onclose?.());
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting");
    await waitFor(() => expect(FakeSocket.all).toHaveLength(2), { timeout: 2500 });
    act(() => FakeSocket.all[1].onopen?.());
    expect(FakeSocket.all[1].sent[0]).toMatchObject({ type: "CLIENT_SUBSCRIBE" });
    expect(screen.getByRole("status")).toHaveTextContent("Live");
  });

  it("moves the dial's marker to where the channel says the telescope points", async () => {
    vi.stubGlobal("fetch", answer(200, session()));
    renderRoom();
    const altitude = () => document.querySelector('[data-pointing="altitude"]');
    const marker = () => document.querySelector<SVGGElement>(".pointing-dial-telescope");

    // Before the channel says anything: the target's position, stated as the target's.
    expect(screen.getByRole("heading", { level: 2, name: "Where Hercules Cluster is" }));
    expect(altitude()).toHaveTextContent("41.0°");
    expect(marker()).toBeNull();
    expect(document.querySelector(".pointing-dial-target")).not.toBeNull();

    const socket = await openChannel();
    const telemetry = (pointing: unknown) =>
      socket.receive({
        type: "MISSION_TELEMETRY",
        mode: "SIMULATED",
        link: "ONLINE",
        pointing,
      });

    telemetry(null);
    expect(screen.getByRole("heading", { level: 2, name: "Where the telescope points" }));
    expect(screen.getByText("The telescope has not reported a position.")).toBeVisible();
    expect(altitude()).toHaveTextContent("—");
    expect(marker()).toBeNull();
    // The target stays on the dial, as the ring the telescope travels to.
    expect(document.querySelector(".pointing-dial-reference")).not.toBeNull();

    telemetry({ altitudeDegrees: 12.3, azimuthDegrees: 200.1 });
    expect(altitude()).toHaveTextContent("12.3°");
    const slewing = marker()?.style.transform;
    expect(slewing).toMatch(/^translate\(/);

    telemetry({ altitudeDegrees: 41, azimuthDegrees: 280 });
    expect(altitude()).toHaveTextContent("41.0°");
    expect(document.querySelector('[data-pointing="azimuth"]')).toHaveTextContent(
      "280.0°",
    );
    expect(marker()?.style.transform).not.toBe(slewing);
    expect(screen.queryByText("The telescope has not reported a position.")).toBeNull();

    // A dropped channel cannot vouch for the last position.
    act(() => socket.onclose?.());
    expect(marker()).toBeNull();
    expect(screen.getByText("The telescope has not reported a position.")).toBeVisible();
  });

  it("states an offline agent and a weather hold from the channel", async () => {
    vi.stubGlobal("fetch", answer(200, session()));
    renderRoom();
    const socket = await openChannel();

    socket.receive({ type: "MISSION_TELEMETRY", mode: "SIMULATED", link: "OFFLINE" });
    expect(screen.getByRole("status")).toHaveTextContent("Observatory offline");

    socket.receive({
      type: "MISSION_STATE",
      state: "WEATHER_HOLD",
      failureReason: "WEATHER_UNSAFE",
      remainingSeconds: null,
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Weather hold");
    expect(screen.getByText("The weather is not safe for observing.")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "The sky is not safe for observing.",
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("ends the view when the session expires", async () => {
    vi.stubGlobal("fetch", answer(200, session(50)));
    renderRoom();
    const socket = await openChannel();
    socket.receive(stream);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Your time is up"),
    );
    expect(screen.queryByRole("img", { name: /live view/ })).toBeNull();
  });

  it("waits for a scheduled mission's slot, then starts it on the customer's word", async () => {
    const fetch = answer(409, {
      code: "OBSERVATORY_OFFLINE",
      message: "The observatory is offline.",
    });
    vi.stubGlobal("fetch", fetch);
    const { unmount } = renderRoom({
      state: "SCHEDULED",
      scheduledStartAt: "2099-01-15T18:00:00.000Z",
    });

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        /Your slot opens at 15 January 2099/,
      ),
    );
    expect(screen.getByRole("button", { name: "Start observation" })).toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();
    unmount();

    renderRoom({ state: "SCHEDULED", scheduledStartAt: "2020-01-15T18:00:00.000Z" });
    const start = await screen.findByRole("button", { name: "Start observation" });
    await waitFor(() => expect(start).toBeEnabled());
    fireEvent.click(start);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Observatory offline"),
    );
    // Never retried by itself: the start moves the telescope.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Start observation" })).toBeEnabled();
  });

  it("does not reopen a session the customer has just opened when the room is re-read", async () => {
    const fetch = answer(200, session());
    vi.stubGlobal("fetch", fetch);
    const props = {
      state: "SCHEDULED",
      scheduledStartAt: "2020-01-15T18:00:00.000Z",
    } as const;
    const { rerender } = renderRoom(props);
    const start = await screen.findByRole("button", { name: "Start observation" });
    await waitFor(() => expect(start).toBeEnabled());
    fireEvent.click(start);
    await openChannel();

    // router.refresh() brings the platform's new state down as a prop.
    rerender(
      <RoomLive
        locale="en"
        mission={{ ...mission, ...props, state: "PREPARING" }}
        events={[]}
        targetName="Hercules Cluster"
        targetSlug="m13-hercules-cluster"
        plate={null}
        timezone="Asia/Tbilisi"
        opensAtText={null}
        visibility={visibility}
        readings={<aside>readings</aside>}
      >
        <aside>captures</aside>
      </RoomLive>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(FakeSocket.all).toHaveLength(1);
  });

  it("says so when the platform does not answer, and offers to try again", async () => {
    vi.stubGlobal("fetch", answer(500, { code: "INTERNAL", message: "Down." }));
    renderRoom({}, "ka");
    expect(await screen.findByRole("alert")).toHaveTextContent("რაღაც შეფერხდა");
    expect(screen.getByRole("button", { name: "სცადე თავიდან" })).toBeVisible();
    expect(FakeSocket.all).toHaveLength(0);
  });

  it("drops a channel message the contract does not describe", async () => {
    vi.stubGlobal("fetch", answer(200, session()));
    renderRoom();
    const socket = await openChannel();
    socket.receive({ type: "MISSION_POINTING", altitudeDegrees: 40 });
    expect(screen.getByRole("status")).toHaveTextContent("Connecting");
  });
});
