import type { OperatorObservatoryState } from "@darkview/contracts";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { operatorCopy } from "@/i18n/resources/operator";

import { OperatorConsoleProvider } from "./console-provider";
import { EmergencyPark } from "./emergency-park";
import { ModeBanner } from "./mode-banner";
import { ModeSwitch } from "./mode-switch";

const api = vi.hoisted(() => ({
  fetchObservatoryState: vi.fn(),
  sendOverride: vi.fn(),
  setObservatoryMode: vi.fn(),
}));
vi.mock("@/features/operator/api", () => api);

const copy = operatorCopy.en;
const observatoryId = "11111111-1111-4111-8111-111111111111";
const missionId = "22222222-2222-4222-8222-222222222222";

function observatoryState(overrides: {
  mode?: "SIMULATED" | "REAL";
  activeMissionId?: string | null;
  parked?: boolean | null;
}): OperatorObservatoryState {
  const now = new Date().toISOString();
  const device = { health: "OK" as const };
  return {
    observatoryId,
    activeMissionId: overrides.activeMissionId ?? null,
    activeSessionId: null,
    linkLatencyMs: null,
    lastHeartbeatAt: now,
    updatedAt: now,
    telemetry: {
      mode: overrides.mode ?? "SIMULATED",
      link: "ONLINE",
      mount: device,
      camera: device,
      focuser: device,
      weather: { status: "CLEAR", source: "OPERATOR", holdActive: false, updatedAt: now },
      parked: overrides.parked ?? false,
      reportedAt: now,
    },
    safetyEnvelope: {
      observatoryId,
      minAltitudeDegrees: 20,
      maxAltitudeDegrees: null,
      horizonMask: [],
      forbiddenAzimuthSectors: [],
      sunExclusionDegrees: 30,
      daylightLockSunAltitudeDegrees: -6,
      nudgeMaxDegrees: 1,
      nudgeRateDegreesPerSecond: 0.5,
      slewTimeoutSeconds: 120,
      heartbeatLossSeconds: 15,
      linkDeadSeconds: 60,
      refocusTemperatureDeltaC: 2,
      updatedAt: now,
    },
  } as OperatorObservatoryState;
}

async function renderConsole(children: React.ReactNode) {
  render(
    <OperatorConsoleProvider locale="en" observatoryId={observatoryId}>
      {children}
    </OperatorConsoleProvider>,
  );
  await act(async () => {});
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("Emergency Park", () => {
  it("parks the live mission in one click, with no confirmation step", async () => {
    api.fetchObservatoryState.mockResolvedValue(
      observatoryState({ activeMissionId: missionId }),
    );
    api.sendOverride.mockResolvedValue({
      commandId: "33333333-3333-4333-8333-333333333333",
      missionId,
      type: "PARK",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: "ACCEPTED",
    });
    await renderConsole(<EmergencyPark copy={copy.park} />);

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: copy.park.label })),
    );

    expect(api.sendOverride).toHaveBeenCalledWith({
      missionId,
      type: "PARK",
      payload: { kind: "PARK", reason: copy.park.reason },
      reason: copy.park.reason,
    });
    expect(screen.getByRole("status")).toHaveTextContent(copy.park.sent);
  });

  it("says why it cannot act when no mission is live, instead of sending an override the platform refuses", async () => {
    api.fetchObservatoryState.mockResolvedValue(observatoryState({ parked: true }));
    await renderConsole(<EmergencyPark copy={copy.park} />);

    expect(screen.getByRole("button", { name: copy.park.label })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(copy.park.noMission);
    expect(api.sendOverride).not.toHaveBeenCalled();
  });

  it("raises an unparked mount outside any mission", async () => {
    api.fetchObservatoryState.mockResolvedValue(observatoryState({ parked: false }));
    await renderConsole(<EmergencyPark copy={copy.park} />);

    expect(screen.getByRole("status")).toHaveTextContent(copy.park.unparkedNoMission);
  });

  it("shows the observatory's refusal verbatim", async () => {
    api.fetchObservatoryState.mockResolvedValue(
      observatoryState({ activeMissionId: missionId }),
    );
    api.sendOverride.mockResolvedValue({
      commandId: "33333333-3333-4333-8333-333333333333",
      missionId,
      type: "PARK",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      status: "REJECTED",
      rejectionReason: "OBSERVATORY_OFFLINE",
    });
    await renderConsole(<EmergencyPark copy={copy.park} />);

    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: copy.park.label })),
    );
    expect(screen.getByRole("status")).toHaveTextContent("OBSERVATORY_OFFLINE");
  });
});

describe("hardware mode", () => {
  it("labels a simulated observatory unmistakably", async () => {
    api.fetchObservatoryState.mockResolvedValue(observatoryState({ mode: "SIMULATED" }));
    await renderConsole(<ModeBanner copy={copy.mode} />);
    expect(screen.getByRole("status")).toHaveTextContent("SIMULATED OBSERVATORY");
  });

  it("will not switch to REAL until presence is affirmed and a reason is typed", async () => {
    api.fetchObservatoryState.mockResolvedValue(observatoryState({ mode: "SIMULATED" }));
    api.setObservatoryMode.mockResolvedValue(observatoryState({ mode: "REAL" }));
    await renderConsole(<ModeSwitch copy={copy.switcher} />);

    const submit = screen.getByRole("button", {
      name: copy.switcher.submitReal,
      hidden: true,
    });
    expect(
      screen.getByText(copy.switcher.realWarning, { selector: "p" }),
    ).toBeInTheDocument();
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(copy.switcher.reason), {
      target: { value: "Supervised first light" },
    });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(copy.switcher.attended));
    expect(submit).toBeEnabled();

    await act(async () => fireEvent.submit(submit.closest("form")!));
    expect(api.setObservatoryMode).toHaveBeenCalledWith(observatoryId, {
      mode: "REAL",
      reason: "Supervised first light",
      attendedOperatorPresent: true,
    });
  });
});
