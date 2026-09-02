import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SharedMissionView } from "@/features/shared-observations/data";

import { SharedMission } from "./shared-mission";

const actions = vi.hoisted(() => ({
  join: vi.fn(),
  leavePresence: vi.fn(),
  leave: vi.fn(),
  presence: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@/features/shared-observations/actions", () => ({
  joinSharedMissionAction: actions.join,
  leaveMissionPresenceAction: actions.leavePresence,
  leaveSharedMissionAction: actions.leave,
  recordMissionPresenceAction: actions.presence,
  saveSharedCaptureAction: actions.save,
}));

const mission: SharedMissionView = {
  id: "00000000-0000-4000-8000-000000000205",
  state: "OBSERVING",
  target: {
    commonName: "Saturn",
    georgianName: "სატურნი",
    catalogId: "DEMO-SATURN",
  },
  observatory: {
    nameEn: "Tbilisi Observatory",
    nameKa: "თბილისის ობსერვატორია",
  },
  telescope: "Main Telescope",
  ownerName: "Mission Owner",
  initialElapsedSeconds: 60,
  viewerCount: 2,
  participantStatus: null,
  canJoin: true,
  canControl: false,
  allowSharedCaptures: true,
  simulated: true,
  captures: [
    {
      id: "CAP-DEMO-LIVE-0001",
      thumbnailUrl: "/captures/saturn-dv-0001.svg",
      processingPreset: "NATURAL",
      capturedAt: "2026-08-26T18:44:00.000Z",
      canSave: false,
    },
  ],
};

describe("SharedMission", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows a read-only live mission and records presence", async () => {
    actions.presence.mockResolvedValue({ viewerCount: 3 });
    const { unmount } = render(
      <SharedMission csrfToken="csrf" locale="en" mission={mission} />,
    );

    expect(screen.getByText("Watching without joining")).toBeVisible();
    expect(screen.getByText(/cannot move or command the telescope/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Capture/ })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("3")).toBeVisible());
    expect(actions.presence).toHaveBeenCalled();

    unmount();
    expect(actions.leavePresence).toHaveBeenCalled();
  });

  it("joins and saves only the capture IDs granted by the server", async () => {
    actions.presence.mockResolvedValue({ viewerCount: 3 });
    actions.join.mockResolvedValue({
      joined: true,
      saveableCaptureIds: ["CAP-DEMO-LIVE-0001"],
    });
    actions.save.mockResolvedValue({
      saved: true,
      captureId: "CAP-DEMO-LIVE-0001",
    });
    render(<SharedMission csrfToken="csrf" locale="en" mission={mission} />);

    fireEvent.click(screen.getByRole("button", { name: "Join Mission" }));
    await screen.findByRole("button", { name: "Leave Mission" });

    const save = screen.getByRole("button", { name: "Save to collection" });
    fireEvent.click(save);
    await waitFor(() => expect(actions.save).toHaveBeenCalled());
    await screen.findByRole("button", { name: "Saved to your collection" });
    expect(actions.save).toHaveBeenCalledWith(
      expect.objectContaining({ captureId: "CAP-DEMO-LIVE-0001" }),
    );
  });
});
