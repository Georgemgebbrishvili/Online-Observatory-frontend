import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CommandVerdict } from "@/features/missions/controls";
import { roomControlsCopy } from "@/i18n/resources/room-controls";

import {
  RoomCaptureAction,
  RoomControlsView,
  RoomSessionView,
  useRoomControls,
} from "./room-controls";

/** The hook and its three views, as the room composes them. */
function RoomControls(props: Parameters<typeof useRoomControls>[0]) {
  const state = useRoomControls(props);
  return (
    <>
      <RoomControlsView {...state} copy={copy} />
      <RoomCaptureAction {...state} copy={copy} />
      <RoomSessionView {...state} copy={copy} />
    </>
  );
}

const copy = roomControlsCopy.en;
const missionId = "20000000-0000-4000-8000-000000000001";
const commandId = "70000000-0000-4000-8000-000000000001";

const assign = vi.hoisted(() => vi.fn());
vi.mock("@/lib/platform/browser", async (actual) => ({
  ...(await actual<typeof import("@/lib/platform/browser")>()),
  navigateWithFreshSession: assign,
}));

const fetchMock = vi.fn();

const status = () => document.querySelector(".room-controls-status");

function answer(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function accepted(type = "NUDGE", expiresIn = 30_000) {
  return {
    commandId,
    missionId,
    type,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresIn).toISOString(),
    status: "ACCEPTED",
  };
}

function controls(verdicts: Record<string, CommandVerdict> = {}, state = "OBSERVING") {
  return (
    <RoomControls
      missionId={missionId}
      missionState={state as "OBSERVING"}
      connected
      verdicts={verdicts}
      imagingProfile="GLOBULAR_CLUSTER"
      signInPath="/en/sign-in"
    />
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  assign.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RoomControls", () => {
  it("locks every control from the press until the agent's verdict names the command", async () => {
    fetchMock.mockResolvedValue(answer(202, accepted()));
    const view = render(controls());

    fireEvent.click(screen.getByRole("button", { name: /^Higher/ }));
    expect(await screen.findByText(copy.waiting)).toBeVisible();
    for (const name of [/^Lower/, /^Left/, /^Re-centre/, /^Capture/]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/missions/${missionId}/command`);
    expect(JSON.parse(init.body)).toMatchObject({
      type: "NUDGE",
      nudge: { axis: "ALTITUDE", direction: "POSITIVE" },
    });

    view.rerender(
      controls({ [commandId]: { status: "ACCEPTED", rejectionReason: null } }),
    );
    expect(status()).toHaveTextContent(copy.done.up);
    expect(screen.getByRole("button", { name: /^Lower/ })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("takes a verdict that arrived before the 202", async () => {
    fetchMock.mockResolvedValue(answer(202, accepted("CAPTURE")));
    render(controls({ [commandId]: { status: "ACCEPTED", rejectionReason: null } }));
    fireEvent.click(screen.getByRole("button", { name: copy.labels.capture }));
    await waitFor(() => expect(status()).toHaveTextContent(copy.done.capture));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      type: "CAPTURE",
      capture: { kind: "CAPTURE", imagingProfile: "GLOBULAR_CLUSTER" },
    });
  });

  it("names the agent's refusal, including one the cloud had approved", async () => {
    fetchMock.mockResolvedValue(answer(202, accepted()));
    const view = render(controls());
    fireEvent.click(screen.getByRole("button", { name: /^Right/ }));
    await screen.findByText(copy.waiting);
    view.rerender(
      controls({
        [commandId]: {
          status: "REJECTED",
          rejectionReason: "SAFETY_NUDGE_LIMIT_EXCEEDED",
        },
      }),
    );
    expect(status()).toHaveTextContent(copy.reasons.SAFETY_NUDGE_LIMIT_EXCEEDED);
  });

  it("names the cloud's own safety refusal, and never retries", async () => {
    fetchMock.mockResolvedValue(
      answer(409, {
        code: "SAFETY_REFUSED",
        message: "MAX_ALT_SAFE is UNMEASURED.",
        details: { rejectionReason: "SAFETY_ENVELOPE_UNMEASURED" },
      }),
    );
    render(controls());
    fireEvent.click(screen.getByRole("button", { name: copy.labels.recenter }));
    await waitFor(() =>
      expect(status()).toHaveTextContent(copy.reasons.SAFETY_ENVELOPE_UNMEASURED),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("says there was no answer once the command's envelope expires", async () => {
    // Already past its deadline: the room waits one second more, then gives up on it.
    fetchMock.mockResolvedValue(answer(202, accepted("NUDGE", -1_000)));
    render(controls());
    fireEvent.click(screen.getByRole("button", { name: /^Lower/ }));
    await waitFor(() => expect(status()).toHaveTextContent(copy.noAnswer), {
      timeout: 3_000,
    });
    expect(screen.getByRole("button", { name: /^Lower/ })).toBeEnabled();
  });

  it("asks before stopping, then sends ABORT", async () => {
    fetchMock.mockResolvedValue(answer(202, accepted("ABORT")));
    render(controls());
    fireEvent.click(screen.getByRole("button", { name: copy.labels.stop }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("group", { name: copy.stopQuestion })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: copy.stopKeep }));
    expect(screen.queryByRole("group", { name: copy.stopQuestion })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: copy.labels.stop }));
    fireEvent.click(screen.getByRole("button", { name: copy.stopConfirm }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      type: "ABORT",
      reason: null,
    });
  });

  it("offers only stop until the target is centred, and nothing once the mission is over", () => {
    const view = render(controls({}, "SLEWING"));
    expect(screen.getByText(copy.centring)).toBeVisible();
    expect(screen.queryByRole("button", { name: /^Higher/ })).toBeNull();
    expect(screen.getByRole("button", { name: copy.labels.stop })).toBeEnabled();

    view.rerender(controls({}, "COMPLETE"));
    expect(screen.queryByRole("heading", { name: copy.title })).toBeNull();
    expect(screen.queryByRole("heading", { name: copy.sessionTitle })).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("sends a signed-out customer to sign in", async () => {
    fetchMock.mockResolvedValue(answer(401, { code: "UNAUTHENTICATED", message: "No." }));
    render(controls());
    fireEvent.click(screen.getByRole("button", { name: /^Higher/ }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith("/en/sign-in"));
  });
});
