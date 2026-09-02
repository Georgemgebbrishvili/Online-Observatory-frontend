import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { developmentMissions } from "@/features/missions/simulator";
import { getMissionTarget } from "@/features/missions/targets";

import { MissionSessionView } from "./mission-session";

const definition = developmentMissions[0];
const target = getMissionTarget(definition.targetSlug)!;

describe("MissionSessionView", () => {
  it("clearly identifies simulator mode and preparation checks", () => {
    render(<MissionSessionView definition={definition} locale="en" target={target} />);

    expect(screen.getAllByText("SIMULATED OBSERVATORY").length).toBeGreaterThan(1);
    expect(
      screen.getByRole("heading", { name: "Preparing your observation" }),
    ).toBeVisible();
    expect(screen.getByText("Observatory online")).toBeVisible();
    expect(screen.getByText("Saturn visible")).toBeVisible();
    expect(screen.getByText("Safety check passed")).toBeVisible();
  });

  it("advances through a valid transition and records the event", () => {
    render(<MissionSessionView definition={definition} locale="en" target={target} />);

    fireEvent.click(screen.getByRole("button", { name: "Advance state" }));

    expect(
      screen.getByRole("heading", { name: "Moving telescope to Saturn" }),
    ).toBeVisible();
    expect(screen.getByText("Telescope slew started")).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: "Observation progress: Moving telescope to Saturn",
      }),
    ).toHaveAttribute("data-state", "SLEWING");
  });

  it("shows injected simulator failures as distinct mission states", () => {
    render(<MissionSessionView definition={definition} locale="en" target={target} />);

    fireEvent.change(screen.getByLabelText("Test a failure state"), {
      target: { value: "WEATHER_HOLD" },
    });

    expect(screen.getByRole("heading", { name: "Weather hold" })).toBeVisible();
    expect(screen.getByText("Mission placed on weather hold")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Observation progress: Weather hold" }),
    ).toHaveAttribute("data-state", "WEATHER_HOLD");
  });
});
