import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { brand } from "@/brand";
import { currentLiveObservation } from "@/features/live/live-data";

import { LiveObservationView } from "./live-observation";

describe("LiveObservationView", () => {
  it("shows the live instrument readouts and public owner", () => {
    render(
      <LiveObservationView
        locale="en"
        observation={currentLiveObservation}
        safeNudgeEnabled={false}
        canControl={false}
        sharedMissionUrl="/en/app/missions/demo/watch"
      />,
    );

    expect(screen.getByText(`${brand.en.name.toUpperCase()} LIVE`)).toBeVisible();
    expect(screen.getByText("Tbilisi Observatory")).toBeVisible();
    expect(screen.getAllByText("Saturn").length).toBeGreaterThan(1);
    expect(screen.getByText("Observer · Public mission")).toBeVisible();
    expect(screen.getByRole("link", { name: "Watch Mission" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Capture/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Safe Nudge" })).not.toBeInTheDocument();
  });

  it("selects consumer processing presets and starts a capture", () => {
    render(
      <LiveObservationView
        locale="en"
        observation={currentLiveObservation}
        safeNudgeEnabled={false}
        canControl
        sharedMissionUrl="/en/app/missions/demo/watch"
      />,
    );

    const bright = screen.getByRole("button", { name: /Bright/ });
    fireEvent.click(bright);
    expect(bright).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /Capture/ }));
    expect(screen.getAllByText("Collecting light").length).toBeGreaterThan(0);
  });

  it("reveals safe nudge only when its feature flag is enabled", async () => {
    render(
      <LiveObservationView
        locale="en"
        observation={currentLiveObservation}
        safeNudgeEnabled
        canControl
        sharedMissionUrl="/en/app/missions/demo/watch"
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Nudge left" }));
    expect(screen.getByText("Request awaiting server validation")).toBeVisible();
    expect(screen.getByText("LEFT · 5″")).toBeVisible();
  });

  it("never exposes telescope-affecting controls to a viewer", () => {
    render(
      <LiveObservationView
        locale="en"
        observation={currentLiveObservation}
        safeNudgeEnabled
        canControl={false}
        sharedMissionUrl="/en/app/missions/demo/watch"
      />,
    );

    expect(screen.queryByRole("button", { name: /Capture/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Safe Nudge" })).not.toBeInTheDocument();
  });
});
