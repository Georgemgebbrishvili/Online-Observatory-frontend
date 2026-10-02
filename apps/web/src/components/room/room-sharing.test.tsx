import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { roomSharingCopy } from "@/i18n/resources/room-sharing";

import { RoomSharing } from "./room-sharing";

const copy = roomSharingCopy.en;
const missionId = "20000000-0000-4000-8000-000000000001";

const assign = vi.hoisted(() => vi.fn());
vi.mock("@/lib/platform/browser", async (actual) => ({
  ...(await actual<typeof import("@/lib/platform/browser")>()),
  navigateWithFreshSession: assign,
}));

const fetchMock = vi.fn();
const status = () => document.querySelector(".room-sharing-status");

function answer(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function mission(observable: boolean, observerCount: number) {
  return {
    id: missionId,
    userId: "00000000-0000-4000-8000-000000000101",
    bookingId: null,
    targetId: "30000000-0000-4000-8000-000000000013",
    observatoryId: "10000000-0000-4000-8000-000000000001",
    state: "OBSERVING",
    mode: "SIMULATED",
    requestedAt: "2026-09-25T17:00:00.000Z",
    observable,
    observerCapacity: 5,
    observerCount,
  };
}

function sharing(observable = false, count = 0, state = "OBSERVING") {
  return (
    <RoomSharing
      missionId={missionId}
      missionState={state as "OBSERVING"}
      observable={observable}
      observerCount={count}
      observerCapacity={5}
      watchPath={`/en/app/missions/${missionId}/watch`}
      signInPath="/en/sign-in"
      copy={copy}
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

describe("RoomSharing", () => {
  it("opens a private session and shows the seats the platform answers", async () => {
    fetchMock.mockResolvedValue(answer(200, mission(true, 0)));
    render(sharing());
    expect(screen.getByText(copy.private)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: copy.openAction }));
    expect(await screen.findByText(/0 of 5 seats taken/)).toBeVisible();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/missions/${missionId}/observation`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ observable: true });
  });

  it("always asks before closing, since the count it read may be stale", async () => {
    fetchMock.mockResolvedValue(answer(200, mission(false, 0)));
    const view = render(sharing(true, 2));
    fireEvent.click(screen.getByRole("button", { name: copy.closeAction }));
    const confirm = screen.getByRole("group", { name: copy.closeQuestion });
    expect(confirm).toHaveTextContent(copy.closeDetail);
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: copy.closeConfirm }));
    expect(await screen.findByText(copy.private)).toBeVisible();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ observable: false });

    view.unmount();
    fetchMock.mockClear();
    render(sharing(true, 0));
    fireEvent.click(screen.getByRole("button", { name: copy.closeAction }));
    expect(screen.getByRole("group", { name: copy.closeQuestion })).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("copies the absolute watch link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(sharing(true, 1));
    fireEvent.click(screen.getByRole("button", { name: copy.copyLink }));
    await waitFor(() => expect(status()).toHaveTextContent(copy.copied));
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/en/app/missions/${missionId}/watch`,
    );
  });

  it("says the session has ended when the platform says so, and offers nothing more", async () => {
    fetchMock.mockResolvedValueOnce(
      answer(409, { code: "MISSION_NOT_ACTIVE", message: "No session to open." }),
    );
    render(sharing());
    fireEvent.click(screen.getByRole("button", { name: copy.openAction }));
    await waitFor(() => expect(status()).toHaveTextContent(copy.ended));
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("fails plainly on any other refusal and lets the owner try again", async () => {
    fetchMock.mockResolvedValueOnce(answer(500, { code: "INTERNAL", message: "Down." }));
    render(sharing());
    fireEvent.click(screen.getByRole("button", { name: copy.openAction }));
    await waitFor(() => expect(status()).toHaveTextContent(copy.failed));
    expect(screen.getByRole("button", { name: copy.openAction })).toBeEnabled();
  });

  it("is not offered outside a live session", () => {
    render(sharing(false, 0, "SCHEDULED"));
    expect(screen.queryByRole("heading", { name: copy.title })).toBeNull();
  });
});
