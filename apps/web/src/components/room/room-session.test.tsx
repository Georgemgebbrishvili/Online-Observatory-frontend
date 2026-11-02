import type { ImageHealth } from "@darkview/contracts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { commandRequest, waitUntil } from "@/features/missions/controls";
import { roomControlsCopy } from "@/i18n/resources/room-controls";
import { roomSessionCopy } from "@/i18n/resources/room-session";

import { describeOutcome, RoomCaptureAction, useRoomControls } from "./room-controls";
import { healthWords, RoomHealth } from "./room-health";
import { RoomTargetsView, type TargetOption } from "./room-targets";

// ADR-079 and ADR-080: the object picker, the dwell lock, the capture cooldown and the
// picture's health, as the booked session shows them.
const now = Date.parse("2026-11-01T20:00:00.000Z");
const at = (seconds: number) => new Date(now + seconds * 1000).toISOString();
const session = roomSessionCopy.en;
const saturn = "30000000-0000-4000-8000-000000000006";
const albireo = "30000000-0000-4000-8000-000000000021";
const options: TargetOption[] = [
  { id: saturn, name: "Saturn", current: true },
  { id: albireo, name: "Albireo", current: false },
];

function view(overrides: Partial<Parameters<typeof RoomTargetsView>[0]> = {}) {
  return render(
    <RoomTargetsView
      copy={session.targets}
      options={options}
      lockedUntil={null}
      now={now}
      observing
      pendingId={null}
      busy={false}
      message={null}
      {...overrides}
    />,
  );
}

describe("waitUntil", () => {
  it("counts down to a lock, and is nothing once it has passed", () => {
    expect(waitUntil(at(462), now)).toEqual({
      seconds: 462,
      text: "7:42",
      iso: "PT462S",
    });
    expect(waitUntil(at(0.4), now)?.text).toBe("0:01");
    expect(waitUntil(at(0), now)).toBeNull();
    expect(waitUntil(at(-5), now)).toBeNull();
    expect(waitUntil(null, now)).toBeNull();
    expect(waitUntil(at(30), null)).toBeNull();
  });
});

describe("commandRequest", () => {
  it("names a RETARGET's object by id only, never coordinates", () => {
    expect(commandRequest("retarget", null, albireo)).toEqual({
      type: "RETARGET",
      retarget: { targetId: albireo },
    });
    expect(() => commandRequest("retarget", null)).toThrow();
  });
});

describe("RoomTargetsView", () => {
  it("marks the object on the telescope and offers the others", () => {
    view();
    const current = screen.getByText("Saturn").closest("li");
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveTextContent("On the telescope");
    expect(screen.getByRole("button", { name: "Switch to Albireo" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Switch to Saturn" })).toBeNull();
  });

  it("counts the dwell lock down, and leaves the press to the platform's refusal", () => {
    const onSwitch = vi.fn();
    view({ lockedUntil: at(462), onSwitch });
    expect(document.querySelector(".room-targets-lock")).toHaveTextContent(
      "You can switch in 7:42",
    );
    expect(screen.getByText(session.targets.dwellNote)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Switch to Albireo" }));
    expect(onSwitch).toHaveBeenCalledWith(albireo);
  });

  it("waits for observing, and for a command in flight", () => {
    const onSwitch = vi.fn();
    const { unmount } = view({ observing: false, onSwitch });
    expect(screen.getByText(session.targets.waiting)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Switch to Albireo" }));
    unmount();
    view({ busy: true, pendingId: albireo, onSwitch });
    expect(screen.getByRole("button", { name: "Switch to Albireo" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(onSwitch).not.toHaveBeenCalled();
  });

  it("says when the list is loading, unreadable, or holds nothing else", () => {
    const { unmount } = view({ options: "loading" });
    expect(screen.getByText(session.targets.loading)).toBeVisible();
    unmount();
    const second = view({ options: "unreadable" });
    expect(screen.getByText(session.targets.unreadable)).toBeVisible();
    second.unmount();
    view({ options: [options[0]] });
    expect(screen.getByText(session.targets.empty)).toBeVisible();
  });

  it("speaks in Georgian", () => {
    render(
      <RoomTargetsView
        copy={roomSessionCopy.ka.targets}
        options={options}
        lockedUntil={at(90)}
        now={now}
        observing
        pendingId={null}
        busy={false}
        message={null}
      />,
    );
    expect(document.querySelector(".room-targets-lock")).toHaveTextContent(
      "გადართვა შეგეძლება 1:30-ში",
    );
    expect(screen.getByRole("button", { name: "გადართვა: Albireo" })).toBeVisible();
  });
});

describe("the picture's health", () => {
  const health = (overrides: Partial<ImageHealth>): ImageHealth => ({
    status: "RECOVERING",
    reason: "BLANK_FRAME",
    step: "RE_EXPOSE",
    attempt: 1,
    since: at(-20),
    nextRetryAt: null,
    ...overrides,
  });

  it("says what the telescope is doing about it, in plain words", () => {
    expect(healthWords(health({}), session.health, now)).toEqual({
      title: "Adjusting the exposure",
      detail: "The picture went blank.",
    });
    expect(
      healthWords(
        health({ step: "RE_CENTRE", reason: "OFF_CENTRE" }),
        session.health,
        now,
      )?.title,
    ).toBe("Re-centring the object");
    expect(
      healthWords(
        health({
          status: "WAITING",
          reason: "CLOUDS",
          step: "WAIT_FOR_SKY",
          nextRetryAt: at(95),
        }),
        session.health,
        now,
      ),
    ).toEqual({
      title: "Clouds over the telescope — waiting for a gap",
      detail: "The telescope stays on the object and looks again in 1:35.",
    });
    expect(
      healthWords(
        health({
          status: "UNRECOVERED",
          reason: "NO_STARS",
          step: null,
          nextRetryAt: at(300),
        }),
        session.health,
        now,
      ),
    ).toEqual({
      title: "Couldn't recover the picture",
      detail:
        "The live view goes on. You can switch to another object now, without waiting. The telescope checks again in 5:00.",
    });
    expect(
      healthWords(
        health({ status: "OK", reason: null, step: null }),
        session.health,
        now,
      ),
    ).toBeNull();
  });

  it("shows only while the picture is not OK", () => {
    const { rerender } = render(
      <RoomHealth copy={session.health} health={null} now={now} />,
    );
    const region = screen.getByRole("group", { name: "Picture" });
    expect(region).not.toHaveAttribute("data-health");
    rerender(<RoomHealth copy={session.health} health={health({})} now={now} />);
    expect(region).toHaveAttribute("data-health", "RECOVERING");
    expect(region).toHaveTextContent("Adjusting the exposure");
    rerender(
      <RoomHealth
        copy={roomSessionCopy.ka.health}
        health={health({ step: "RE_CENTRE" })}
        now={now}
      />,
    );
    expect(region).toHaveTextContent("ობიექტი თავიდან ცენტრდება");
  });
});

describe("the capture cooldown", () => {
  const offered = { move: true, capture: true, stop: true, waiting: null };

  it("waits out captureAllowedAt, then offers Capture again", () => {
    const { rerender } = render(
      <RoomCaptureAction
        offered={offered}
        pending={null}
        copy={roomControlsCopy.en}
        allowedAt={at(24)}
        now={now}
      />,
    );
    expect(screen.getByRole("button", { name: "Capture again in 0:24" })).toBeDisabled();
    rerender(
      <RoomCaptureAction
        offered={offered}
        pending={null}
        copy={roomControlsCopy.en}
        allowedAt={at(24)}
        now={now + 24_000}
      />,
    );
    expect(screen.getByRole("button", { name: "Capture" })).toBeEnabled();
  });
});

describe("a switch the platform refuses", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  function Probe() {
    const state = useRoomControls({
      missionId: "20000000-0000-4000-8000-000000000001",
      missionState: "OBSERVING",
      connected: true,
      verdicts: {},
      imagingProfile: "PLANETARY",
      signInPath: "/en/sign-in",
    });
    return (
      <>
        <button type="button" onClick={() => state.onRetarget?.(albireo)}>
          go
        </button>
        <p data-testid="said">{describeOutcome(roomControlsCopy.en, state.outcome)}</p>
        <p data-testid="allowed">
          {state.outcome?.outcome.kind === "refused"
            ? state.outcome.outcome.allowedAt
            : ""}
        </p>
      </>
    );
  }

  const refusal = (code: string, details?: Record<string, unknown>) =>
    new Response(JSON.stringify({ code, message: "No.", ...(details && { details }) }), {
      status: 409,
    });

  it("says why, in plain words, with when the dwell lock lifts", async () => {
    fetchMock.mockResolvedValue(
      refusal("DWELL_LOCKED", { rejectionReason: "DWELL_LOCKED", allowedAt: at(300) }),
    );
    render(<Probe />);
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    await waitFor(() =>
      expect(screen.getByTestId("said")).toHaveTextContent(
        "The telescope stays at least 10 minutes on each object, to spare its mount.",
      ),
    );
    expect(screen.getByTestId("allowed")).toHaveTextContent(at(300));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      type: "RETARGET",
      retarget: { targetId: albireo },
    });
  });

  it("names an object that is not up, and one already on the telescope", async () => {
    fetchMock.mockResolvedValueOnce(
      refusal("TARGET_NOT_OBSERVABLE", { rejectionReason: "TARGET_NOT_VISIBLE_NOW" }),
    );
    const { unmount } = render(<Probe />);
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    await waitFor(() =>
      expect(screen.getByTestId("said")).toHaveTextContent(/not up long enough/),
    );
    unmount();

    fetchMock.mockResolvedValueOnce(refusal("CONFLICT"));
    render(<Probe />);
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    await waitFor(() =>
      expect(screen.getByTestId("said")).toHaveTextContent(
        "The telescope is already on that object.",
      ),
    );
  });
});
