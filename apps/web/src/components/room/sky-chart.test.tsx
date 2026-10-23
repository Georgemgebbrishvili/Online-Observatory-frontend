import type { ObservatoryHorizon } from "@darkview/contracts";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { horizonAt, SkyChart } from "./sky-chart";

const horizon: ObservatoryHorizon = {
  observatoryId: "00000000-0000-4000-8000-000000000010",
  latitudeDegrees: 41.7,
  longitudeDegrees: 44.8,
  minAltitudeDegrees: 20,
  mask: [
    { azimuthDegrees: 0, minAltitudeDegrees: 25 },
    { azimuthDegrees: 90, minAltitudeDegrees: 35 },
    { azimuthDegrees: 270, minAltitudeDegrees: 21 },
  ],
};

describe("horizonAt", () => {
  it("interpolates between surveyed bearings and across north, never below the floor", () => {
    expect(horizonAt(0, horizon)).toBe(25);
    expect(horizonAt(45, horizon)).toBe(30);
    // 270 -> 360(0): 21 -> 25, so 315 is 23.
    expect(horizonAt(315, horizon)).toBe(23);
    // 90 -> 270: 35 -> 21, so 180 is 28.
    expect(horizonAt(180, horizon)).toBe(28);
    expect(horizonAt(10, { ...horizon, mask: [] })).toBe(20);
    expect(horizonAt(10, { ...horizon, minAltitudeDegrees: null, mask: [] })).toBe(0);
  });
});

describe("SkyChart", () => {
  const props = {
    // 22:00 in Tbilisi on 23 October: Vega, Deneb and Altair are up.
    at: Date.parse("2026-10-23T18:00:00.000Z"),
    horizon,
    target: { altitudeDegrees: 50, azimuthDegrees: 200 },
    label: "Sky chart",
    caption: "Illustration — not telescope output",
    cardinals: ["N", "E", "S", "W"] as [string, string, string, string],
  };

  it("draws stars above the horizon, the horizon, the target, and says it is an illustration", () => {
    const { container, getByText } = render(<SkyChart {...props} />);

    expect(container.querySelectorAll(".sky-chart-star").length).toBeGreaterThan(10);
    expect(container.querySelector("[data-sky-horizon]")).not.toBeNull();
    expect(container.querySelector("[data-sky-target]")).not.toBeNull();
    expect(getByText("Illustration — not telescope output")).toBeTruthy();
  });

  it("draws the telescope only when the channel gives a position", () => {
    const silent = render(<SkyChart {...props} />);
    expect(silent.container.querySelector("[data-sky-telescope]")).toBeNull();

    const none = render(<SkyChart {...props} telescope={null} />);
    expect(none.container.querySelector("[data-sky-telescope]")).toBeNull();

    const pointed = render(
      <SkyChart {...props} telescope={{ altitudeDegrees: 40, azimuthDegrees: 180 }} />,
    );
    expect(pointed.container.querySelector("[data-sky-telescope]")).not.toBeNull();
  });
});
